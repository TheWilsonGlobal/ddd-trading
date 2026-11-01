// Package config holds the settings that are the same in every environment.
// Secrets and per-environment endpoints stay in environment variables. Each
// value here is the default for a variable that can still override it.
package config

import (
	"os"
	"strings"
)

const (
	// DefaultPort is the gateway HTTP/WS port when PORT is unset.
	DefaultPort = "5470"
	// DefaultWebPort is the web dev server port (WEB_PORT). It builds the
	// default CORS origins when CORS_ALLOWED_ORIGINS is unset.
	DefaultWebPort = "5471"
	// DefaultRateReadPerSec and DefaultRateWritePerSec are the per-client-IP
	// limits per second on /v1 (RATE_LIMIT_RPS, RATE_LIMIT_WRITE_RPS).
	DefaultRateReadPerSec  = 100
	DefaultRateWritePerSec = 50
	// DefaultWSMaxClients caps concurrent /ws/market clients (WS_MAX_CLIENTS).
	DefaultWSMaxClients = 1000
	// DefaultAccountClaim is the token claim holding the trading account id
	// (AUTH_ACCOUNT_CLAIM). There is deliberately no fallback to "sub": a
	// Supabase "sub" is a user UUID, not a trading account, so silently using
	// it would mask a misconfiguration. A dotted path (for example
	// app_metadata.account_id) selects a nested claim.
	DefaultAccountClaim = "account_id"
)

// LoadDotEnv searches for .env in current and parent directories and loads variables into the environment if not already set.
func LoadDotEnv() {
	candidates := []string{".env", "../.env", "../../.env"}
	for _, path := range candidates {
		data, err := os.ReadFile(path)
		if err != nil {
			continue
		}
		lines := strings.Split(string(data), "\n")
		for _, line := range lines {
			line = strings.TrimSpace(line)
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			parts := strings.SplitN(line, "=", 2)
			if len(parts) == 2 {
				key := strings.TrimSpace(parts[0])
				val := strings.TrimSpace(parts[1])
				val = strings.Trim(val, `"'`)
				if os.Getenv(key) == "" {
					os.Setenv(key, val)
				}
			}
		}
		return
	}
}
