# ==============================================================================
# scripts/dev.ps1: Start all backend services and frontend web terminal
# ==============================================================================

param(
    [switch]$ServicesOnly,
    [switch]$Down,
    [switch]$Admin,
    [switch]$All
)

$RootDir = Split-Path -Parent $PSScriptRoot

if ($Down) {
    Write-Host "Stopping all Docker Compose backend containers..." -ForegroundColor Yellow
    docker compose --env-file "$RootDir\.env" -f "$RootDir\deployments\docker-compose.yml" down
    docker compose --env-file "$RootDir\.env" -f "$RootDir\deployments\docker-compose.services.yml" down
    exit 0
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Domain-Driven Trading Platform (Backend + Web)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if ($ServicesOnly) {
    Write-Host "[1/2] Launching backend services (Engine, Gateway, Settlement)..." -ForegroundColor Green
    docker compose --env-file "$RootDir\.env" -f "$RootDir\deployments\docker-compose.services.yml" up -d
} else {
    Write-Host "[1/2] Launching full backend stack (Redpanda, Redis, Postgres, Services)..." -ForegroundColor Green
    docker compose --env-file "$RootDir\.env" -f "$RootDir\deployments\docker-compose.yml" up -d
}

Set-Location "$RootDir\web"

if ($Admin) {
    Write-Host "[2/2] Launching Admin Control Center at http://localhost:5472..." -ForegroundColor Green
    pnpm dev:admin
} elseif ($All) {
    Write-Host "[2/2] Launching Web Client (:5471) and Admin Center (:5472)..." -ForegroundColor Green
    pnpm dev:all
} else {
    Write-Host "[2/2] Launching interactive web terminal at http://localhost:5471..." -ForegroundColor Green
    pnpm dev:client
}
