# AGROW AI 🌱

An AI-powered agricultural assistant that provides weather-based crop recommendations and smart farming insights. AGROW AI helps farmers make informed decisions through real-time weather integration and intelligent conversation.

## Features

*   🌦️ **Real-time Weather Integration**: Live weather monitoring with fallback mechanisms for data reliability.
*   🤖 **AI Crop Recommendation**: Powered by **NVIDIA LLaMA model** for precise, context-aware agricultural advice.
*   💬 **Smart Assistant with Memory**: Persistent chat history and session-level conversation memory for a ChatGPT-like experience.
*   📊 **Premium Dashboard UI**: A modern, dark-themed interface built with glassmorphism and smooth animations.
*   ☁️ **Supabase Backend**: Secure authentication and persistent data storage for user profiles and chat history.

## Tech Stack

**Frontend:**
*   React (Vite)
*   Tailwind CSS
*   Lucide Icons & Framer Motion

**Backend:**
*   FastAPI (Python)
*   NVIDIA NIM API (LLaMA model)
*   OpenWeatherMap API

**Database:**
*   Supabase (PostgreSQL + Auth)

## Setup Instructions

### Backend

1.  **Navigate to backend directory**:
    ```bash
    cd backend
    ```
2.  **Create virtual environment**:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  **Install requirements**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure environment**:
    Create a `.env` file with:
    ```env
    NVIDIA_API_KEY=your_key
    WEATHER_API_KEY=your_key
    SUPABASE_URL=your_url
    SUPABASE_KEY=your_key
    ```
5.  **Run backend**:
    ```bash
    uvicorn main:app --reload
    ```

### Frontend

1.  **Navigate to frontend directory**:
    ```bash
    cd frontend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run development server**:
    ```bash
    npm run dev
    ```

## Future Improvements

*   🚜 **Soil-based Recommendations**: Integration of soil sensor data for even more precise advice.
*   🌐 **Multi-language Support**: Localizing the interface for regional languages in India.
*   👤 **Farmer Personalization**: Customized profiles based on land size and irrigation type.
*   📡 **Offline Mode**: Local caching for areas with limited connectivity.

---

Built for sustainable and smart agriculture. 🌱
