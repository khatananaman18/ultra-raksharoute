#!/bin/bash
# RakshaRoute 1-Click Platform Launcher
echo "🚀 Starting RakshaRoute Platform..."
cd "$(dirname "$0")"
node start-daemon.js
echo "✅ Both Frontend (http://localhost:3000) and Backend (http://localhost:5050) are running!"
