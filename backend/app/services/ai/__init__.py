"""
AI Services Module

Multi-provider AI integration for HyperFit fitness assistant.
Supports OpenAI (GPT-4) and Google Gemini with auto-selection.
"""

from .base import AIProvider, AIResponse, AIProviderType
from .openai_client import OpenAIProvider
from .gemini_client import GeminiProvider
from .manager import AIManager

__all__ = [
    "AIProvider",
    "AIResponse",
    "AIProviderType",
    "OpenAIProvider",
    "GeminiProvider",
    "AIManager",
]
