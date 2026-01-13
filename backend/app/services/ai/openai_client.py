"""
OpenAI Provider

GPT-4/GPT-4o integration for HyperFit AI assistant.
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


class OpenAIProvider(AIProvider):
    """OpenAI GPT provider implementation"""

    API_BASE = "https://api.openai.com/v1"
    DEFAULT_MODEL = "gpt-4o-mini"  # Cost-effective, fast model
    PREMIUM_MODEL = "gpt-4o"  # High-quality model for complex queries

    def __init__(self, api_key: str):
        super().__init__(api_key)
        self._client = None

    @property
    def provider_type(self) -> AIProviderType:
        return AIProviderType.OPENAI

    @property
    def default_model(self) -> str:
        return self.DEFAULT_MODEL

    async def check_availability(self) -> bool:
        """Verify API key and service availability"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.API_BASE}/models",
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )
                self._is_available = response.status_code == 200
                return self._is_available
        except Exception as e:
            print(f"OpenAI availability check failed: {e}")
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
        """Generate response using OpenAI API"""
        start_time = time.time()
        model = model or self.default_model

        try:
            # Build messages array with system prompt
            api_messages = []

            # Add system message with fitness context
            system_prompt = self.build_system_prompt(user_context)
            api_messages.append({
                "role": "system",
                "content": system_prompt
            })

            # Add conversation messages
            for msg in messages:
                api_messages.append({
                    "role": msg.role.value,
                    "content": msg.content
                })

            # Make API request
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.API_BASE}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": model,
                        "messages": api_messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                        "presence_penalty": 0.1,
                        "frequency_penalty": 0.1,
                    }
                )

                latency_ms = int((time.time() - start_time) * 1000)

                if response.status_code != 200:
                    error_data = response.json()
                    return AIResponse(
                        content="",
                        provider=self.provider_type,
                        model=model,
                        latency_ms=latency_ms,
                        error=error_data.get("error", {}).get("message", "Unknown error")
                    )

                data = response.json()
                choice = data["choices"][0]
                usage = data.get("usage", {})

                return AIResponse(
                    content=choice["message"]["content"],
                    provider=self.provider_type,
                    model=model,
                    tokens_used=usage.get("total_tokens", 0),
                    latency_ms=latency_ms,
                    confidence=0.9 if choice.get("finish_reason") == "stop" else 0.7,
                    metadata={
                        "finish_reason": choice.get("finish_reason"),
                        "prompt_tokens": usage.get("prompt_tokens", 0),
                        "completion_tokens": usage.get("completion_tokens", 0),
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

    async def generate_workout(
        self,
        user_context: UserContext,
        workout_type: str,
        duration_minutes: int,
        equipment: List[str],
    ) -> AIResponse:
        """Generate a custom workout plan"""
        prompt = f"""Create a {duration_minutes}-minute {workout_type} workout.

Available equipment: {', '.join(equipment) if equipment else 'Bodyweight only'}

Format the workout as:
1. Warm-up (5 min)
2. Main workout with sets, reps, and rest periods
3. Cool-down (5 min)

Include form tips for key exercises."""

        messages = [Message(role=MessageRole.USER, content=prompt)]
        return await self.generate(messages, user_context, temperature=0.8)

    async def analyze_progress(
        self,
        user_context: UserContext,
        metrics: dict,
    ) -> AIResponse:
        """Analyze user's fitness progress"""
        prompt = f"""Analyze this fitness progress data and provide insights:

{metrics}

Provide:
1. Progress summary
2. What's working well
3. Areas for improvement
4. Specific recommendations"""

        messages = [Message(role=MessageRole.USER, content=prompt)]
        return await self.generate(messages, user_context, temperature=0.5)
