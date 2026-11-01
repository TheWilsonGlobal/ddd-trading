# ==============================================================================
# scripts/dev.ps1: Start Domain-Driven Trading Platform (Cloud / Local)
# ==============================================================================

param(
    [switch]$Docker,
    [switch]$Down,
    [switch]$Admin,
    [switch]$Client,
    [switch]$Backend
)

$RootDir = Split-Path -Parent $PSScriptRoot

if ($Down) {
    Write-Host "Stopping all Docker Compose backend containers..." -ForegroundColor Yellow
    docker compose --env-file "$RootDir\.env" -f "$RootDir\deployments\docker-compose.yml" down
    docker compose --env-file "$RootDir\.env" -f "$RootDir\deployments\docker-compose.services.yml" down
    exit 0
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Domain-Driven Trading Platform" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if ($Docker) {
    Write-Host "[1/2] Launching local backend Docker containers..." -ForegroundColor Green
    docker compose --env-file "$RootDir\.env" -f "$RootDir\deployments\docker-compose.yml" up -d
} else {
    Write-Host "[1/2] Using Cloud Services (Supabase PG, Upstash Redis, Redpanda Kafka)..." -ForegroundColor Green
}

Set-Location "$RootDir\web"

if ($Admin) {
    Write-Host "[2/2] Launching Admin Control Center at http://localhost:5472..." -ForegroundColor Green
    pnpm dev:admin
} elseif ($Client) {
    Write-Host "[2/2] Launching interactive web terminal at http://localhost:5471..." -ForegroundColor Green
    pnpm dev:client
} elseif ($Backend) {
    Write-Host "[2/2] Launching Go Gateway at http://localhost:5470..." -ForegroundColor Green
    pnpm dev:backend
} else {
    Write-Host "[2/2] Launching Backend (:5470), Client (:5471), and Admin (:5472)..." -ForegroundColor Green
    pnpm dev:all
}
