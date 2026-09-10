@echo off
title Sahyog / CoGig - Frontend Server
color 0B
cd /d "%~dp0\frontend"

echo ===================================================
echo   Starting Sahyog / CoGig Frontend Web Server...
echo ===================================================
echo.

if not exist "node_modules\" (
  echo [Info] Installing frontend dependencies...
  call npm install
)

echo [Info] Starting Vite development server...
echo.
echo Frontend running at:
echo http://localhost:5173
echo.
echo Keep this window open while using the application.
echo ===================================================
echo.

call npm run dev
pause
