# PowerShell Launcher for Real-Time Delivery Optimization Platform
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "Real-Time Last-Mile Delivery Optimization - Master Launcher" -ForegroundColor Cyan
Write-Host "=========================================================================" -ForegroundColor Cyan

# 1. Check MySQL
Write-Host "`n[1/4] Checking MySQL Service..." -ForegroundColor Yellow
$mysql = Get-Service -Name MySQL80 -ErrorAction SilentlyContinue
if ($mysql -and $mysql.Status -eq "Running") {
    Write-Host "[OK] MySQL80 is active and running on port 3306." -ForegroundColor Green
} else {
    Write-Host "[WARNING] MySQL80 is not running. Attempting to start service..." -ForegroundColor Red
    Start-Service -Name MySQL80 -ErrorAction SilentlyContinue
}

# 2. Check and free ports 8080 & 5173 if held by stale processes
Write-Host "`n[2/4] Checking port availability..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 8080, 5173 -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "[INFO] Freeing port $($_.LocalPort) held by process ID $($_.OwningProcess)..." -ForegroundColor Yellow
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Write-Host "[OK] Ports 8080 and 5173 are ready." -ForegroundColor Green

# 3. Launch Spring Boot Backend
Write-Host "`n[3/4] Launching Spring Boot Backend on http://localhost:8080..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$PSScriptRoot\backend`" && mvn spring-boot:run" -WindowStyle Normal

# 4. Launch React Frontend
Write-Host "`n[4/4] Launching React Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$PSScriptRoot\frontend`" && npm run dev" -WindowStyle Normal

Write-Host "`n=========================================================================" -ForegroundColor Green
Write-Host "Application is launching in separate dedicated console windows!" -ForegroundColor Green
Write-Host "Frontend Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host "Backend API:        http://localhost:8080" -ForegroundColor White
Write-Host "Swagger OpenAPI:    http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host "Default Login:      admin@delivery.com / admin123" -ForegroundColor White
Write-Host "=========================================================================" -ForegroundColor Green

Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"
