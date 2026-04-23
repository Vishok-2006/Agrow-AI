#!/bin/bash

echo "🚀 Starting AGROW AI..."

echo "🔄 Cleaning old processes..."

fuser -k 8000/tcp 2>/dev/null
pkill -f uvicorn 2>/dev/null
pkill -f "npm run dev" 2>/dev/null

# ===============================
# ⚙️ BACKEND (LOCAL RUN)
# ===============================
echo "⚙️ Launching backend..."

gnome-terminal -- bash -c "
echo '📂 Moving to backend...';
cd backend || exit;

echo '🐍 Checking virtual environment...';
if [ ! -d 'venv' ]; then
    echo '📦 Creating venv...';
    python3 -m venv venv;
fi

echo '⚡ Activating venv...';
source venv/bin/activate;

echo '📦 Installing dependencies...';


echo '🚀 Starting FastAPI server...';
echo '👉 URL: http://127.0.0.1:8000';
echo '👉 Docs: http://127.0.0.1:8000/docs';

uvicorn main:app --reload;

exec bash
" &

# ===============================
# 🌐 FRONTEND
# ===============================
echo "🌐 Launching frontend..."

gnome-terminal -- bash -c "
echo '📂 Moving to frontend...';
cd frontend || exit;

echo '📦 Installing dependencies...';


echo '🚀 Starting Vite dev server...';
npm run dev;

exec bash
" &

echo "🎉 AGROW AI launched!"