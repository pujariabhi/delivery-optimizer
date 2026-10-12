@echo off
title Stop Delivery Optimizer
echo ==============================================================
echo Stopping Delivery Optimizer Services...
echo ==============================================================

echo [1/2] Stopping Backend on port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Terminating process %%a...
    taskkill /f /pid %%a >nul 2>&1
)

echo [2/2] Stopping Frontend on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo Terminating process %%a...
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo All Delivery Optimizer services have been stopped.
echo ==============================================================
pause
