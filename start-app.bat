@echo off
title Sahyog / CoGig - Platform Launcher
color 0A
cd /d "%~dp0"

echo =======================================================================
echo          Sahyog (CoGig) -- Cooperative Gig Services Platform
echo          100%% Worker-Owned and Federated Digital Marketplace
echo =======================================================================
echo.
echo [1/3] Checking environment and dependencies...

if not exist "backend\node_modules\" (
  echo [Backend] Installing dependencies...
  cd backend && call npm install && cd ..
)

if not exist "frontend\node_modules\" (
  echo [Frontend] Installing dependencies...
  cd frontend && call npm install && cd ..
)

echo [2/3] Launching Backend (port 3000) and Frontend (port 5173)...
echo.
echo URLs:
echo   - Frontend Web App : http://localhost:5173
echo   - Backend REST API : http://localhost:3000/api
echo.
echo Demo Accounts (Password: Demo@123):
echo   - Customer : customer@demo.com
echo   - Worker   : worker@demo.com
echo   - Admin    : admin@demo.com
echo.
echo [3/3] Starting services (Keep this window open while using the app)...
echo =======================================================================
echo.

node start.js
pause
