import logging

try:
    import google.generativeai as genai
    from google.generativeai import GenerativeModel
except ImportError:
    genai = None
    GenerativeModel = None

from config.settings import settings

MODEL_CANDIDATES = [
    "gemini-1.5-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash",
    "models/gemini-flash-latest",
    "models/gemini-2.5-flash",
]

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.model = None
        if not genai or not GenerativeModel or not settings.GOOGLE_API_KEY:
            return

        genai.configure(api_key=settings.GOOGLE_API_KEY)
        for model_name in MODEL_CANDIDATES:
            try:
                self.model = GenerativeModel(model_name)
                break
            except Exception as exc:
                logger.warning("Gemini model %s unavailable: %s", model_name, exc)
                self.model = None

    @property
    def is_configured(self):
        return self.model is not None

    async def get_chat_response(self, prompt: str, history: list = None):
        if not self.model:
            raise RuntimeError("Gemini API key is not configured.")

        formatted_history = []
        if history:
            for msg in history:
                role = "user" if msg["role"] == "user" else "model"
                formatted_history.append({"role": role, "parts": [msg["content"]]})

        chat = self.model.start_chat(history=formatted_history)
        system_instruction = (
            "You are Agrow AI, an expert agriculture assistant helping farmers. "
            "Provide practical, accurate, and helpful advice on crops, soil, weather, and farming techniques. "
            "Keep responses concise and professional."
        )

        response = chat.send_message(f"{system_instruction}\n\nUser: {prompt}")
        return response.text

    async def get_crop_explanation(self, crop: str, soil: str, location: str):
        if not self.model:
            raise RuntimeError("Gemini API key is not configured.")

        prompt = f"Explain why {crop} is recommended for {soil} soil in {location}. Briefly mention care tips."
        response = self.model.generate_content(prompt)
        return response.text

ai_service = AIService()
