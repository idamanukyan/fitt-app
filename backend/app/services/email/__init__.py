"""
Email Services Module

Production-ready email delivery with multiple provider support.
"""
from .service import EmailService, get_email_service
from .templates import EmailTemplates

__all__ = [
    "EmailService",
    "get_email_service",
    "EmailTemplates",
]
