# 🌱 AGROW AI – Smart Agriculture Assistant

AGROW AI is a production-ready, AI-powered agricultural platform designed for farmers. It provides real-time weather-based insights and an intelligent RAG chat assistant using local infrastructure.

## 🚀 Key Features

- **Weather-Driven Insights**: Real-time analysis of temperature, humidity, and precipitation.
- **Gemini AI Expert**: Personalized crop recommendations, irrigation schedules, and risk alerts.
- **RAG-Enabled Chat**: Interactive local knowledge base querying via Endee Vector DB.
- **Premium Dark UI**: Nature-inspired, high-fidelity agriculture dashboard with glassmorphism.
- **Secure Auth**: Full user management via Supabase.

## ⚙️ Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion
- **Backend**: FastAPI (Python) + Supabase
- **Intelligence**: Google Gemini 1.5 Flash
- **Vector Search**: Endee (Local Docker Instance)
- **Data**: OpenWeatherMap API

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Docker (installed and running)

### 2. Environment Variables
Create a `.env` file in the root (or specific folders as required):

**Frontend (`frontend/.env`):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GEMINI_API_KEY=your_gemini_key
VITE_WEATHER_API_KEY=your_openweathermap_key
VITE_ENDEE_URL=http://localhost:8080
```

**Backend (`backend/.env`):**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_key
OPENWEATHER_API_KEY=your_openweathermap_key
ENDEE_URL=http://localhost:8080/api/v1
```

### 3. Running the Application
We've provided a unified startup script:

```bash
./scripts/run.sh
```

This script will:
1. Start/Restart the **Endee Vector DB** in Docker.
2. Wait for Endee to be healthy.
3. Install and start the **FastAPI Backend**.
4. Install and start the **React Frontend**.

## 📁 Project Structure

- `/frontend`: React source code, components, and services.
- `/backend`: FastAPI routes, services, and configurations.
- `/scripts`: Automation and startup scripts.
- `/docs`: Documentation and architecture specs.

## 🚨 Local Infrastructure Note
This application **strictly enforces** the use of a local Endee Vector DB. Ensure Docker is granted the necessary permissions to run and mount volumes.

---
Built with ❤️ for sustainable farming.
