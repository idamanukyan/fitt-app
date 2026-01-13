"""
Google Gemini Provider

Gemini Pro/Flash integration for HyperFit AI assistant.
"""

import time
from typing import List, Optional
import httpx

from .base import (
    AIProvider,
    AIProviderType,
    AIResponse,
    Message,
    MessageRole,
    UserContext,
)


class GeminiProvider(AIProvider):
    """Google Gemini provider implementation"""

    API_BASE = "https://generativelanguage.googleapis.com/v1beta"
    DEFAULT_MODEL = "gemini-1.5-flash"  # Fast, cost-effective
    PREMIUM_MODEL = "gemini-1.5-pro"  # High-quality for complex queries

    def __init__(self, api_key: str):
        super().__init__(api_key)

    @property
    def provider_type(self) -> AIProviderType:
        return AIProviderType.GEMINI

    @property
    def default_model(self) -> str:
        return self.DEFAULT_MODEL

    async def check_availability(self) -> bool:
        """Verify API key and service availability"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.API_BASE}/models?key={self.api_key}"
                )
                self._is_available = response.status_code == 200
                return self._is_available
        except Exception as e:
            print(f"Gemini availability check failed: {e}")
            self._is_available = False
            return False

    async def generate(
        self,
        messages: List[Message],
        user_context: Optional[UserContext] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> AIResponse:
        """Generate response using Gemini API"""
        start_time = time.time()
        model = model or self.default_model

        try:
            # Build system instruction
            system_prompt = self.build_system_prompt(user_context)

            # Convert messages to Gemini format
            contents = []
            for msg in messages:
                role = "user" if msg.role == MessageRole.USER else "model"
                contents.append({
                    "role": role,
                    "parts": [{"text": msg.content}]
                })

            # Build request payload
            payload = {
                "contents": contents,
                "systemInstruction": {
                    "parts": [{"text": system_prompt}]
                },
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": max_tokens,
                    "topP": 0.95,
                    "topK": 40,
                },
                "safetySettings": [
                    {
                        "category": "HARM_CATEGORY_HARASSMENT",
                        "threshold": "BLOCK_ONLY_HIGH"
                    },
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": "BLOCK_ONLY_HIGH"
                    },
                    {
                        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        "threshold": "BLOCK_ONLY_HIGH"
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": "BLOCK_ONLY_HIGH"
                    },
                ]
            }

            # Make API request
            url = f"{self.API_BASE}/models/{model}:generateContent?key={self.api_key}"

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    url,
                    headers={"Content-Type": "application/json"},
                    json=payload
                )

                latency_ms = int((time.time() - start_time) * 1000)

                if response.status_code != 200:
                    error_data = response.json()
                    error_msg = error_data.get("error", {}).get("message", "Unknown error")
                    return AIResponse(
                        content="",
                        provider=self.provider_type,
                        model=model,
                        latency_ms=latency_ms,
                        error=error_msg
                    )

                data = response.json()

                # Extract response content
                candidates = data.get("candidates", [])
                if not candidates:
                    return AIResponse(
                        content="",
                        provider=self.provider_type,
                        model=model,
                        latency_ms=latency_ms,
                        error="No response generated"
                    )

                candidate = candidates[0]
                content_parts = candidate.get("content", {}).get("parts", [])
                content = "".join(part.get("text", "") for part in content_parts)

                # Extract usage metadata
                usage = data.get("usageMetadata", {})
                total_tokens = (
                    usage.get("promptTokenCount", 0) +
                    usage.get("candidatesTokenCount", 0)
                )

                # Determine confidence based on finish reason
                finish_reason = candidate.get("finishReason", "")
                confidence = 0.9 if finish_reason == "STOP" else 0.7

                return AIResponse(
                    content=content,
                    provider=self.provider_type,
                    model=model,
                    tokens_used=total_tokens,
                    latency_ms=latency_ms,
                    confidence=confidence,
                    metadata={
                        "finish_reason": finish_reason,
                        "prompt_tokens": usage.get("promptTokenCount", 0),
                        "completion_tokens": usage.get("candidatesTokenCount", 0),
                        "safety_ratings": candidate.get("safetyRatings", []),
                    }
                )

        except httpx.TimeoutException:
            return AIResponse(
                content="",
                provider=self.provider_type,
                model=model,
                latency_ms=int((time.time() - start_time) * 1000),
                error="Request timed out"
            )
        except Exception as e:
            return AIResponse(
                content="",
                provider=self.provider_type,
                model=model,
                latency_ms=int((time.time() - start_time) * 1000),
                error=str(e)
            )

    async def generate_meal_plan(
        self,
        user_context: UserContext,
        calories: int,
        meals_per_day: int,
        dietary_restrictions: List[str],
    ) -> AIResponse:
        """Generate a meal plan using Gemini"""
        restrictions = ", ".join(dietary_restrictions) if dietary_restrictions else "None"

        prompt = f"""Create a one-day meal plan with the following requirements:

Target calories: {calories}
Number of meals: {meals_per_day}
Dietary restrictions: {restrictions}

For each meal, provide:
- Meal name and description
- Approximate calories
- Protein, carbs, and fat in grams
- Simple preparation instructions

Also include:
- 2 healthy snack options
- Hydration recommendations"""

        messages = [Message(role=MessageRole.USER, content=prompt)]
        return await self.generate(messages, user_context, temperature=0.8)

    async def explain_exercise(
        self,
        exercise_name: str,
        user_context: Optional[UserContext] = None,
    ) -> AIResponse:
        """Get detailed exercise explanation"""
        prompt = f"""Explain how to perform "{exercise_name}" properly.

Include:
1. Target muscles (primary and secondary)
2. Step-by-step form instructions
3. Common mistakes to avoid
4. Breathing pattern
5. Beginner modifications
6. Advanced progressions
7. Safety considerations"""

        messages = [Message(role=MessageRole.USER, content=prompt)]
        return await self.generate(messages, user_context, temperature=0.5)
