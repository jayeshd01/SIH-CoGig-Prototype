#!/usr/bin/env node
const { spawn, exec } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = __dirname;
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');

console.log('\x1b[32m%s\x1b[0m', '=======================================================================');
console.log('\x1b[32m%s\x1b[0m', '         CoGig -- Cooperative Gig Services Platform                    ');
console.log('\x1b[32m%s\x1b[0m', '         100% Worker-Owned & Federated Digital Marketplace            ');
console.log('\x1b[32m%s\x1b[0m', '=======================================================================\n');

// 1. Ensure dev.db exists in backend or backend/prisma
const prismaDb = path.join(BACKEND_DIR, 'prisma', 'dev.db');
const backendDb = path.join(BACKEND_DIR, 'dev.db');
if (fs.existsSync(prismaDb) && !fs.existsSync(backendDb)) {
  try {
    fs.copyFileSync(prismaDb, backendDb);
    console.log('[Setup] Synced SQLite database to backend/dev.db');
  } catch (e) {
    // ignore
  }
}

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('[1/3] Starting CoGig Backend API (NestJS on port 3000)...');
// Use compiled dist if available for instant launch, otherwise nest start
const distMain = path.join(BACKEND_DIR, 'dist', 'main.js');
let backendProcess;

if (fs.existsSync(distMain)) {
  backendProcess = spawn('node', ['dist/main.js'], {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: '3000' }
  });
} else {
  backendProcess = spawn(npmCmd, ['run', 'start:dev'], {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: '3000' }
  });
}

console.log('[2/3] Starting CoGig Frontend Web App (Vite on port 5173)...');
const frontendProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: FRONTEND_DIR,
  stdio: 'inherit',
  shell: true,
});

let browserOpened = false;

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForFrontend() {
  const maxAttempts = 60; // 30 seconds
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const isUp = await checkUrl('http://localhost:5173');
    if (isUp) {
      if (!browserOpened) {
        browserOpened = true;
        console.log('\n\x1b[32m%s\x1b[0m', '=======================================================================');
        console.log('\x1b[32m%s\x1b[0m', ' CoGig Platform is LIVE & READY!                                      ');
        console.log('\x1b[36m%s\x1b[0m', ' - Frontend Web App : http://localhost:5173                          ');
        console.log('\x1b[36m%s\x1b[0m', ' - Backend REST API : http://localhost:3000/api                      ');
        console.log('\x1b[33m%s\x1b[0m', ' Demo Logins (Password: Demo@123):                                   ');
        console.log('    * Customer : customer@demo.com');
        console.log('    * Worker   : worker@demo.com');
        console.log('    * Admin    : admin@demo.com');
        console.log('\x1b[32m%s\x1b[0m', '=======================================================================\n');
        console.log('[3/3] Opening CoGig in your browser...');
        
        const openCmd = isWin ? 'start http://localhost:5173' : (process.platform === 'darwin' ? 'open http://localhost:5173' : 'xdg-open http://localhost:5173');
        exec(openCmd);
      }
      return;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log('[Notice] Frontend is taking longer than usual to respond. You can open http://localhost:5173 manually.');
}

waitForFrontend();

function cleanup() {
  console.log('\n[Shutting down CoGig servers]...');
  if (isWin) {
    if (backendProcess && backendProcess.pid) {
      exec(`taskkill /pid ${backendProcess.pid} /T /F`, () => {});
    }
    if (frontendProcess && frontendProcess.pid) {
      exec(`taskkill /pid ${frontendProcess.pid} /T /F`, () => {});
    }
  } else {
    if (backendProcess) backendProcess.kill();
    if (frontendProcess) frontendProcess.kill();
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
