import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting RakshaRoute Full-Stack Emergency Platform...');

const nodeBinary = process.execPath; // current node binary

// 1. Start Server on port 5050
const serverProcess = spawn(
  nodeBinary,
  [path.join(__dirname, 'server', 'src', 'index.js')],
  {
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit',
    env: { ...process.env, PORT: '5050' },
  }
);

// 2. Start Vite Dev Server on port 3000
const viteBin = path.join(__dirname, 'client', 'node_modules', 'vite', 'bin', 'vite.js');
const clientProcess = spawn(
  nodeBinary,
  [viteBin, '--port', '3000', '--host'],
  {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
    env: { ...process.env },
  }
);

function cleanup() {
  console.log('\n🛑 Shutting down RakshaRoute platform processes...');
  serverProcess.kill('SIGINT');
  clientProcess.kill('SIGINT');
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
