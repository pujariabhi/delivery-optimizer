@echo off
title Delivery Optimizer - Spring Boot Backend
echo ==============================================================
echo Starting Spring Boot Backend (Port 8080)...
echo ==============================================================

REM Clean up stale process on port 8080 if present
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo [INFO] Detected existing process %%a on port 8080. Freeing port...
    taskkill /f /pid %%a >nul 2>&1
)

cd /d "%~dp0backend"
call mvn spring-boot:run
pause
