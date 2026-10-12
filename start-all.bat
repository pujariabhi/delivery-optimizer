@echo off
title Delivery Optimizer - Master Launcher
echo =========================================================================
echo Real-Time Last-Mile Delivery Optimization - Application Launcher
echo =========================================================================
echo.

REM 1. Check if MySQL is running
echo [1/3] Checking MySQL status...
sc query MySQL80 | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo [WARNING] MySQL80 service is not running. Attempting to start...
    net start MySQL80
) else (
    echo [OK] MySQL80 service is active and running on port 3306.
)
echo.

REM 2. Start Backend
echo [2/3] Launching Spring Boot Backend on http://localhost:8080...
start "Delivery Optimizer Backend" "%~dp0start-backend.bat"

REM 3. Start Frontend
echo [3/3] Launching React Vite Frontend on http://localhost:5173...
start "Delivery Optimizer Frontend" "%~dp0start-frontend.bat"

echo.
echo =========================================================================
echo Both services are launching in separate windows!
echo - Frontend Dashboard: http://localhost:5173
echo - Backend Swagger UI: http://localhost:8080/swagger-ui.html
echo - Default Login:      admin@delivery.com / admin123
echo =========================================================================
echo.
ping -n 6 127.0.0.1 >nul
start http://localhost:5173
