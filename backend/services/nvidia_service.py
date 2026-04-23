import logging
import time
import httpx
import asyncio
from typing import Optional, Dict
from config.settings import settings

logger = logging.getLogger(__name__)

NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
MODEL_NAME = "meta/llama-4-maverick-17b-128e-instruct"

async def generate_ai_response(prompt: str, history: list = None) -> str:
    """
    Generates a response using NVIDIA AI API with session memory.
    """
    if not settings.NVIDIA_API_KEY:
        logger.error("NVIDIA_API_KEY is not configured.")
        return "AI service is temporarily unavailable. Please try again later."

    system_prompt = (
        "You are AGROW AI, a precise agricultural assistant. "
        "Rules: \n"
        "- Responses must be short, practical, and actionable (no long paragraphs).\n"
        "- Default location: Tamil Nadu (if not specified).\n"
        "- Recommend crops based on temperature, season (Kharif/Rabi), and water availability.\n"
        "- Use current weather context if provided.\n"
        "- Avoid generic phrases like 'I am your assistant'.\n"
        "- If data is missing, ask for it instead of assuming.\n"
        "- Never hallucinate facts. Warn if uncertain."
    )

    messages = [{"role": "system", "content": system_prompt}]
    
    # Add history (last 5-10 messages)
    if history:
        # Filter and limit history
        formatted_history = []
        for msg in history[-10:]:
            formatted_history.append({
                "role": "user" if msg.get("role") == "user" else "assistant",
                "content": msg.get("content")
            })
        messages.extend(formatted_history)

    # Add current prompt
    messages.append({"role": "user", "content": prompt})

    headers = {
        "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": 0.4, # Lower temperature for more precise agricultural advice
        "max_tokens": 512
    }

    timeout = httpx.Timeout(10.0, connect=5.0)
    max_retries = 1
    attempt = 0

    while attempt <= max_retries:
        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(NVIDIA_API_URL, headers=headers, json=payload)
                
                response_time = time.time() - start_time
                request_id = response.headers.get("x-request-id", "N/A")

                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    
                    logger.info(
                        f"NVIDIA AI response generated | Model: {MODEL_NAME} | "
                        f"Request ID: {request_id} | Response Time: {response_time:.2f}s"
                    )
                    return content.strip()
                
                elif response.status_code in [401, 429]:
                    logger.error(f"NVIDIA API Error: {response.status_code} | {response.text}")
                    if attempt == max_retries:
                        return "AI service is temporarily unavailable. Please try again later."
                
                else:
                    logger.error(f"NVIDIA API Unexpected Error: {response.status_code} | {response.text}")
                    if attempt == max_retries:
                        return "AI service is temporarily unavailable. Please try again later."

        except (httpx.NetworkError, httpx.TimeoutException) as e:
            response_time = time.time() - start_time
            logger.error(f"NVIDIA API Network/Timeout Error: {str(e)} | Attempt: {attempt+1}")
            if attempt == max_retries:
                return "AI service is temporarily unavailable. Please try again later."
        
        except Exception as e:
            logger.error(f"Unexpected error in NVIDIA service: {str(e)}")
            return "AI service is temporarily unavailable. Please try again later."

        attempt += 1
        if attempt <= max_retries:
            await asyncio.sleep(1) # Small delay before retry

    return "AI service is temporarily unavailable. Please try again later."
