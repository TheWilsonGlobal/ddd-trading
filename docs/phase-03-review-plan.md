# Phase 03 — Fix plan

Repo: `C:\Git\JOBs\fin\domain-driven-trading` · Date: 2026-10-28
Sources (in `analysis/`): [review-report](analysis/review-report.md) (C/H/M/L ids) · [security-report](analysis/security-report.md) (SEC ids) · [test-report](analysis/test-report.md) (T ids = its numbered failures) · [k6-load-test-report](analysis/k6-load-test-report.md) (K ids) · [summary](analysis/README.md)

Goal: every confirmed defect fixed, each fix proven by a test that failed before the fix. Findings reported by several reports are merged into one work item below.

## Ground rules

- **Test first.** For each work item, write the failing test, then the fix. Today only `internal/domain/order` has tests; most bugs live in `account`, `command`, `query`, `http` and `postgres`, which have none.
- **Commands** (Go is installed; use `./...`, not bare `go test`): `go test -race -count=1 ./...`, `go vet ./...`. Race detection on Windows needs a C compiler; otherwise run it in Docker with `docker cp` (see `analysis/README.md`).
- **Do not commit** until reviewed (standing preference). Leave changes in the working tree, one phase at a time.
- **Gate between phases:** `go vet` clean, `go test -race -count=1 ./...` green, and the phase's acceptance checks below pass.
- Restart the gateway between manual or k6 runs; accounts created in an earlier gateway process have no starter shares (K-bug, fixed in phase 5).

## Decisions needed before phase 4 and 5

| # | Decision | Recommendation |
|---|---|---|
| D1 | Authentication: Supabase JWT (JWKS already in `.env`), or an API-key/shared-secret stub for the PoC | Supabase JWT, `account_id` from the token claim |
| D2 | Account creation: remove auto-create entirely, or keep it only behind an admin/seed path | Remove from read paths; seed through migrations or an admin command |
| D3 | Market BUY: reject, or reserve at a protection price (best ask × 1.1)? | Reserve at protection price, release the unused part after matching |
| D4 | Order book scope: single APX book, or one book per symbol | Keep one book, **reject** other symbols now; per-symbol books later |
| D5 | Event transport: real Kafka (Watermill-Kafka) now, or keep in-process bus and merge binaries | Real Kafka; the compose stack already has Redpanda |
| D6 | Rewrite git history to remove the leaked DB password, or only rotate it | Rotate always; purge history only if the repo is or will be shared |

## Phase 0 — Contain exposure (do first, mostly config)

| Item | Fixes | Action | Done when |
|---|---|---|---|
| 0.1 | SEC-05, SEC-16 | Rotate the Supabase DB password and the secret key. Remove the literal password from `scripts/migrate_to_supabase.go:16` and `.py:17,27`; read `SUPABASE_DB_PASSWORD` from the environment and exit if unset. Decide D6. | `grep -rn` finds no literal password; scripts fail fast without the env var |
| 0.2 | SEC-09 | `deployments/docker-compose*.yml`: bind Postgres, Redis, Redpanda, 9644 to `127.0.0.1`; passwords from required env vars (`${VAR:?}`); `--requirepass` for Redis. | `docker ps` shows `127.0.0.1:` bindings; Redis rejects unauthenticated `PING` |
| 0.3 | SEC-16 | `web/vite.config.ts`: replace `loadEnv(mode,'..','')` with an explicit read of `WEB_PORT` and `PORT`. Confirm `.env` stays untracked. | No secret reachable by the Vite bundle |
| 0.4 | — | Keep the gateway on localhost only until phase 4 lands. | — |

## Phase 1 — Make the order book thread-safe (K, C1)

Highest priority: it crashes the whole gateway when two requests overlap (reproduced at 5, 20, 50 VUs; stack at `orderbook.go:217` ← `place_order.go:139`).

| Item | Fixes | Action |
|---|---|---|
| 1.1 | C1, K | Add a failing test: concurrent place + cancel + depth + best-bid/ask under `-race`. |
| 1.2 | C1 | Lock inside the public `OrderBook` methods: `CancelOrder`, `GetL2Depth` (write lock, it mutates `depthSeq`), `BestBid`, `BestAsk`. Split `ProcessOrder` into a locked wrapper and unlocked internals so matching does not re-enter the lock. |
| 1.3 | C1 root cause | Stop exposing the raw book through `Matcher.Book()`; give the app layer matcher methods (`Cancel`, `Depth`, `Get`) instead. |
| 1.4 | M3 | Return snapshots/DTOs, never live `*Order` / `*Account` pointers, from handlers (`handler.go:109-112`, `:168`). Take `a.mu` when reading an account. |
| 1.5 | SEC-07 (hub) | `MarketHub.Run`: take `Lock`, not `RLock`, when deleting from `clients`. |

Acceptance: `go test -race` concurrent test green; `k6 run --vus 50 --duration 15s` leaves the gateway `Up` with no `fatal error` in `docker logs ddt-gateway`.

## Phase 2 — Validate every input before any state change (C3, SEC-01/02/14, H1, L3, M4, M7, M8)

| Item | Fixes | Action |
|---|---|---|
| 2.1 | C3, SEC-01/02, L3, T8 | Add `PlaceOrderCommand.Validate()` called first in `Handle`, before the idempotency check and the reservation. Check: side ∈ {BUY, SELL}; type ∈ {LIMIT, MARKET}; `0 < qty ≤ MaxQty`; LIMIT price `0 < p ≤ MaxPrice`; tick size (use the defined `ErrInvalidTickSize`); account id and client order id format and length. Add `ErrInvalidSide` / `ErrInvalidOrderType`. |
| 2.2 | SEC-02 | Checked arithmetic for `price × qty × (10000 + feeBps)`; reject on overflow. Choose `MaxPrice`/`MaxQty` so the product fits `int64`. |
| 2.3 | C3, SEC-01, T9 (D3) | MARKET BUY: reserve at a protection price, or reject. Never reserve 0. |
| 2.4 | H1, SEC-14, T6 (D4) | Reject any symbol that is not the book's symbol (whitelist plus regex). Propagate the `AddLimitOrder` error in `matcher.go:47` instead of `_ =`. |
| 2.5 | M4, SEC-18b | Full UUID for order ids; reject duplicates (`ErrOrderAlreadyExists` exists and is unused). |
| 2.6 | M7, SEC-13 | Clamp `levels` to 1–50; honour the `symbol` query parameter or reject unknown symbols. |
| 2.7 | M8 | Replace the `uint32` subtraction in `ReserveSellHolding` with a checked comparison; make `SettleSellTrade` return an error on mismatch instead of silently skipping. |
| 2.8 | SEC-12 | `http.MaxBytesReader` (4 KiB), `DisallowUnknownFields`, require `Content-Type: application/json` (415 otherwise). |

Acceptance: table-driven tests for each bad input return the right error and leave account `LockedCash`, `Holdings` and the book unchanged; a broke account cannot go negative via MARKET; an order for `ZZZ` returns 4xx and locks nothing.

## Phase 3 — Reservation, settlement and cancel correctness (C2, H2/H3/H5, M5, M6, SEC-04/06, T1/T2/T3/T10)

Model change first: **track the reservation per order** (reserved amount and remaining reserved on the `Order`), so every release is proportional.

| Item | Fixes | Action |
|---|---|---|
| 3.1 | C2, SEC-06 | `SettleBuyTrade` releases only the per-fill share of that order's reservation and debits the actual cost (price × qty + fee). Release price-improvement and fee-rounding differences on final fill. |
| 3.2 | T3, SEC-06 | Settle **both** sides of every `OrderMatchedEvent`: maker cash/shares and unlock, taker cash/shares. Apply under one per-symbol engine lock (phase 1 lock widened to reserve → match → settle). |
| 3.3 | M5 | Credit `FEE_COLLECTOR` with both fees; use `fee = ceil(notional × bps / 10000)` consistently in reserve and settle. |
| 3.4 | H5 | After matching, release the unfilled reservation of a MARKET order and set a terminal status (CANCELED/REJECTED). |
| 3.5 | H2, SEC-04, T1, T2 | Cancel: look up the order first; require `order.AccountID == caller`; release against `order.AccountID`; return 404 on not-found or not-owner. |
| 3.6 | H3 | Cancel atomically: resolve the account first, return repository errors, compensate if the release fails; never silently skip. |
| 3.7 | M6, T10 | Self-trade prevention (cancel-newest or reject when maker account == taker account). |
| 3.8 | H6 | Decrement `OrderQueue.TotalQuantity` on every fill via a queue method; test on both bid and ask sides, including cancel of a partially filled maker. |

Acceptance: conservation test — across all accounts, total cash (including `FEE_COLLECTOR`) and total shares are identical before and after any sequence of place, partial fill, cancel and market orders; after cancel of an owner's BUY, `locked_cash` returns to its prior value; the tester's cases T1, T2, T3, T10 now pass.

## Phase 4 — Identity and authorization (SEC-03, SEC-04, T7, M1; needs D1, D2)

| Item | Fixes | Action |
|---|---|---|
| 4.1 | SEC-03 | JWT middleware on `/v1` (verify signature via JWKS; fixed algorithm list; check `exp`, `aud`, `iss`). `/health` stays public. |
| 4.2 | SEC-03 | `account_id` comes from the token claim only; ignore the body and query parameter. |
| 4.3 | SEC-03, T7, M1 (D2) | Remove create-on-read in `GetByID`; unknown account → 404. Distinguish `pgx.ErrNoRows` from other DB errors; return errors instead of creating a fresh starter account. |
| 4.4 | SEC-14 | Move starter balances, seed accounts and the fee collector out of the Postgres adapter into the composition root or migration fixtures. |

Acceptance: unauthenticated and wrong-account requests get 401/404; `GET /v1/balance/NOPE` is 404 and inserts no row; a simulated DB error returns 5xx and does not reset a balance.

## Phase 5 — Persistence and recovery (M2, K, T4, SEC-07)

| Item | Fixes | Action |
|---|---|---|
| 5.1 | M2, T4 | Call `accountRepo.Save` after reserve, settle and release, **including holdings**; replace pointer-swapping with an update-in-place. Use an atomic conditional `UPDATE accounts SET locked_cash = locked_cash + $1 WHERE account_id = $2 AND cash_balance - locked_cash >= $1`. |
| 5.2 | K new bug | Persist starter holdings when seeding an account (insert `account_holdings` rows), so a restart does not leave accounts with empty holdings. |
| 5.3 | T4, ledger gap | Build the double-entry journal per `OrderMatchedEvent` (`CreateTradeSettlementJournal`) and write it with the trade in one DB transaction; credit `FEE_COLLECTOR`. Add the `OrderRepository` implementation; persist orders. |
| 5.4 | Recovery | On start, rebuild the book and locks from open orders. |
| 5.5 | M2 | Add a domain `Restore` factory so the adapter stops writing into `LockedCash` / `LockedStocks` directly (hexagonal leak). |

Acceptance: after fills, `trades` and `ledger_entries` have rows and Σ debits = Σ credits per transaction; restart the gateway and balances, locks and open orders are unchanged.

## Phase 6 — Messaging, idempotency, settlement worker (H4, H7, SEC-08/17, T4, T5; needs D5)

| Item | Fixes | Action |
|---|---|---|
| 6.1 | T4 (D5) | Real Watermill Kafka publisher/subscriber chosen by `KAFKA_BROKERS`; keep gochannel as test/fallback only. |
| 6.2 | SEC-08 | Real Redis client from `REDIS_ADDR` (with password); cap or drop the in-memory fallback; do not mask Redis errors. |
| 6.3 | H4, SEC-08 | Idempotency: key `idem:{account}:{clientOrderId}`; claim after validation or delete on failure; store the response and return it on replay; require the key; honour `X-Idempotency-Key` or stop advertising it. |
| 6.4 | T5 | Feed the WebSocket hub: gateway subscribes to `market.depth` / `orders.events` and calls `BroadcastDepth` / `BroadcastTrade`. |
| 6.5 | H7 | Settlement consumer: `Ack` only after `SaveBatch` succeeds; do not clear the batch before success; flush on shutdown with a fresh timeout context; dead-letter unparseable payloads. |
| 6.6 | SEC-17 | Validate event amounts; enable SASL/TLS on Redpanda outside local compose. |
| 6.7 | M3 | Publish errors are no longer discarded: log, retry, or outbox. |

Acceptance: an order through the gateway produces a row in `trades` via the settlement worker; `/ws/market` delivers a message within 1 s of a crossing order; replaying a `client_order_id` returns the original result; kill the worker mid-batch and no trade is lost.

## Phase 7 — HTTP hardening (SEC-10/11/12/13, L1, L2)

| Item | Fixes | Action |
|---|---|---|
| 7.1 | SEC-13 | Rate limiting: `go-chi/httprate` per IP on `/v1`, stricter on `POST`/`DELETE`. Remove `middleware.RealIP` unless behind a trusted proxy. |
| 7.2 | SEC-10, L2 | CORS: exact origin allowlist from env; `AllowCredentials: false` for a bearer-token API. |
| 7.3 | SEC-11 | WebSocket: Origin allowlist, per-client buffered send channel (drop on full) or write deadlines, client cap, ping ticker. |
| 7.4 | SEC-12, L1 | Server: `ReadHeaderTimeout`, `IdleTimeout`, `MaxHeaderBytes`. Map domain errors to 404 / 409 / 422 / 500; return fixed messages, log raw errors server-side (no Go struct names in responses). |
| 7.5 | L-sec | Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`). |
| 7.6 | — | Vite dev server `host: true` → localhost unless needed. |

Acceptance: 429 after the limit; cross-origin request without an allowed Origin is refused; oversized body → 413; unknown order → 404.

## Phase 8 — Build, supply chain, CI (SEC-15, L4, L5)

| Item | Action |
|---|---|
| 8.1 | Dockerfile: non-root `USER`, pin base images by digest, compose `read_only`, `cap_drop: [ALL]`, `no-new-privileges`; tag `ddt-postgres` explicitly. |
| 8.2 | Upgrade Go (1.22 is end-of-life) and `golang.org/x/crypto`; bump `go.mod` and Dockerfile together; run `govulncheck ./...`. |
| 8.3 | CI workflow: `go vet`, `go test -race -count=1 ./...`, `govulncheck`, `pnpm audit --prod`. Add `test-race` to the pipeline. |
| 8.4 | Makefile: make the `go` fallback work on this Docker daemon (use `docker cp`, not a bind mount) or drop it now that Go is installed. |
| 8.5 | L4: remove the idempotency fallback map's unbounded growth if it is kept. |

## Phase 9 — Tests, architecture cleanup, re-verification

| Item | Action |
|---|---|
| 9.1 | Test coverage target: `account` (reserve/settle/release, partial fill, cancel), `command` handlers with fakes, `query`, HTTP handlers (status codes, ownership), settlement consumer, plus the conservation test from phase 3. |
| 9.2 | Hexagonal cleanup: read-model DTOs instead of returning domain aggregates (`get_balance.go:24`); app layer owns request parsing; remove `Matcher.Book()` leak (done in 1.3). |
| 9.3 | L6: share the wiring between `cmd/engine` and `cmd/gateway` (or merge them); handle every `Handle` error at seed time. |
| 9.4 | Re-run the QA suite: the tester's API cases, then `analysis/test-report.md` items T1–T10 all pass. |
| 9.5 | Re-run k6: fixed `scripts/k6_benchmark.js` smoke (50 VUs), then full ramp to 6,500 orders/s; record p95/p99, success rate, achieved rate in a new `k6-load-test-report` revision. Expect new limits (single book mutex, `GetL2Depth` per order, synchronous JSON). |
| 9.6 | Update `README.md` "Implementation Status" table and `docs/architecture.md` §9 gaps as items close. |

## Traceability — every finding mapped to a phase

| Source | Items | Phase |
|---|---|---|
| review C1 / k6 crash | book locking | 1 |
| review C2 | per-fill release | 3 |
| review C3, SEC-01, SEC-02, T9 | validation, MARKET BUY, overflow | 2 |
| review H1, SEC-14, T6 | symbol check, propagate error | 2 |
| review H2, SEC-04, T1, T2 | cancel ownership and release | 3 |
| review H3 | atomic cancel | 3 |
| review H4, SEC-08 | idempotency | 6 |
| review H5 | MARKET remainder | 3 |
| review H6 | `TotalQuantity` | 3 |
| review H7, SEC-17 | settlement consumer | 6 |
| review M1, SEC-03, T7 | auto-create accounts, DB error shadowing | 4 |
| review M2, K new bug, T4 | `Save`, holdings, ledger, orders | 5 |
| review M3 | live pointers in JSON | 1 |
| review M4 | order ids | 2 |
| review M5, SEC-06 | fees, maker settlement, T3 | 3 |
| review M6, T10 | self-trade | 3 |
| review M7, SEC-13 | `levels` clamp, symbol param | 2, 7 |
| review M8 | `uint32` underflow | 2 |
| review L1, SEC-12 | status codes, body limit, errors | 7 |
| review L2, SEC-10 | CORS | 7 |
| review L3, T8 | invalid side | 2 |
| review L4 | idempotency fallback | 6, 8 |
| review L5 | test gaps | 9 |
| review L6 | duplicated wiring | 9 |
| review hexagonal notes | policy in adapter, domain restore, DTOs | 4, 5, 9 |
| SEC-05, SEC-16 | secrets | 0 |
| SEC-07 | races, hub map | 1, 5 |
| SEC-09 | compose exposure | 0 |
| SEC-11 | WebSocket | 7 |
| SEC-15, Go EOL, CI | containers, upgrade | 8 |
| T5 | WS emits nothing | 6 |
| T11, SEC-18 | status codes, headers | 7 |
| K | rate target 5,000/s | 9.5 |

## Order of work and sizing

1. Phase 0 (hours, config) → 2. Phase 1 (small, unblocks all testing under load) → 3. Phase 2 and 3 (largest; core correctness) → 4. Phase 4 (after D1, D2) → 5. Phase 5 → 6. Phase 6 (after D5) → 7. Phase 7 → 8. Phase 8 → 9. Phase 9 closes the loop.
Phases 2 and 3 can run in parallel only if the per-order reservation model (phase 3) is agreed first, because validation and reservation share `PlaceOrderHandler.Handle`.

## Definition of done

- All items above checked off, `go vet` clean, `go test -race -count=1 ./...` green with new coverage for account, command, HTTP and settlement packages.
- `analysis/test-report.md` T1–T11 re-run and passing; no `fatal error` under the 50-VU k6 smoke.
- k6 full ramp run and documented, with the achieved rate reported honestly against the 5,000 orders/s target.
- Secrets rotated; compose bound to localhost; no literal credentials in the repo.
