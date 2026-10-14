import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeBinary = process.execPath;

const logFile = path.join(__dirname, 'raksharoute.log');
const outLog = fs.openSync(logFile, 'a');

console.log('🚀 Spawning independent background daemon processes for RakshaRoute...');

// 1. Start Express Server on port 5050 detached
const serverProcess = spawn(
  nodeBinary,
  [path.join(__dirname, 'server', 'src', 'index.js')],
  {
    cwd: path.join(__dirname, 'server'),
    detached: true,
    stdio: ['ignore', outLog, outLog],
    env: { ...process.env, PORT: '5050' },
  }
);
serverProcess.unref();

// 2. Start Vite Dev Server on port 3000 detached
const viteBin = path.join(__dirname, 'client', 'node_modules', 'vite', 'bin', 'vite.js');
const clientProcess = spawn(
  nodeBinary,
  [viteBin, '--port', '3000', '--host'],
  {
    cwd: path.join(__dirname, 'client'),
    detached: true,
    stdio: ['ignore', outLog, outLog],
    env: { ...process.env },
  }
);
clientProcess.unref();

console.log(`✅ Server started (PID: ${serverProcess.pid}) on http://localhost:5050`);
console.log(`✅ Client started (PID: ${clientProcess.pid}) on http://localhost:3000`);
console.log(`📄 Logs streaming to ${logFile}`);
