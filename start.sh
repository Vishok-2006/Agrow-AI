#!/bin/bash

echo "🚀 Starting AGROW AI..."

echo "🔄 Cleaning old processes..."

fuser -k 8000/tcp 2>/dev/null
pkill -f uvicorn 2>/dev/null





# ===============================
# 🐳 DOCKER (Endee)
# ===============================
if docker ps -q -f name=endee-server | grep -q .; then
    echo "✅ Endee already running"
else
    echo "📦 Starting Endee..."

    docker run -d \
    --ulimit nofile=100000:100000 \
    -p 8080:8080 \
    -v $(pwd)/endee-data:/data \
    --name endee-server \
    --restart unless-stopped \
    endeeio/endee-server:latest

    echo "✅ Endee started"
fi

# ===============================
# ⚙️ BACKEND (VISIBLE LOGS)
# ===============================
echo "⚙️ Launching backend..."

konsole --hold -e bash -c "
echo '📂 Moving to backend...';
cd backend || exit;

echo '🐍 Checking virtual environment...';
if [ ! -d 'venv' ]; then
    echo '📦 Creating venv...';
    python3 -m venv venv;
fi

echo '⚡ Activating venv...';
source venv/bin/activate;

echo '📦 Installing dependencies if needed...';
pip install fastapi uvicorn pydantic-settings httpx;

echo '🚀 Starting FastAPI server...';
echo '👉 URL: http://127.0.0.1:8000';
echo '👉 Docs: http://127.0.0.1:8000/docs';

uvicorn main:app --reload
" &

# ===============================
# 🌐 FRONTEND (VISIBLE LOGS)
# ===============================
echo "🌐 Launching frontend..."

konsole --hold -e bash -c "
echo '📂 Moving to frontend...';
cd frontend || exit;

echo '📦 Installing dependencies...';
npm install;

echo '🚀 Starting Vite dev server...';

npm run dev
" &

echo "🎉 AGROW AI launched!"