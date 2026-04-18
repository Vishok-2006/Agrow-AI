import logging
import os
import google.generativeai as genai
from google.generativeai import GenerativeModel
from dotenv import load_dotenv

load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

logger = logging.getLogger(__name__)
MODEL_CANDIDATES = [
    "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "models/gemini-flash-latest",
    "models/gemini-2.5-flash",
]

def _get_chat_response(message, formatted_history):
    last_error = None
    for model_name in MODEL_CANDIDATES:
        try:
            model = GenerativeModel(model_name)
            chat = model.start_chat(history=formatted_history)
            return chat.send_message(message, request_options={"timeout": 10})
        except Exception as exc:
            last_error = exc
            error_text = str(exc).lower()
            if "not found" in error_text or "not supported" in error_text or "unsupported" in error_text:
                logger.warning("Gemini model %s unavailable: %s", model_name, exc)
                continue
            logger.error("Gemini model %s failed with unexpected error", model_name, exc_info=True)
            raise

    if last_error:
        raise last_error


def generate_ai_response(message, history=None):
    if history is None:
        history = []

    if not gemini_api_key:
        logger.error("GEMINI_API_KEY not configured")
        return "AI service temporarily unavailable. Please try again."

    try:
        formatted_history = []
        for h in history:
            role = "user" if h["role"] == "user" else "model"
            formatted_history.append({
                "role": role,
                "parts": [h["content"]]
            })

        # Add system prompt if history is empty
        if not formatted_history:
            system_prompt = "You are AGROW AI, a smart agriculture assistant. Give clear, practical farming advice."
            formatted_history.append({
                "role": "user",
                "parts": [system_prompt]
            })

        response = _get_chat_response(message, formatted_history)
        return response.text

    except Exception as e:
        logger.error("Gemini Error: %s", str(e), exc_info=True)
        return "AI service temporarily unavailable. Please try again."
