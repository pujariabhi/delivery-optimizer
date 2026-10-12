@echo off
title Delivery Optimizer - React Frontend
echo ==============================================================
echo Starting React Vite Frontend (Port 5173)...
echo ==============================================================

REM Clean up stale process on port 5173 if present
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo [INFO] Detected existing process %%a on port 5173. Freeing port...
    taskkill /f /pid %%a >nul 2>&1
)

cd /d "%~dp0frontend"
call npm run dev
pause
