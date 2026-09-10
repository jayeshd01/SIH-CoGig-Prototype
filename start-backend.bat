@echo off
title Sahyog / CoGig - Backend API Server
color 0A
cd /d "%~dp0\backend"

echo ===================================================
echo   Starting Sahyog / CoGig Backend API Server...
echo ===================================================
echo.

if not exist "node_modules\" (
  echo [Info] Installing backend dependencies...
  call npm install
)

echo [Info] Starting NestJS API server...
echo.
echo Backend API running at:
echo http://localhost:3000/api
echo.
echo Keep this window open while using the application.
echo ===================================================
echo.

call npm run start:dev
pause
