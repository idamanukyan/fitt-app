"""
Email Service

Production-ready email delivery using Resend.
Includes fallback handling and detailed logging.
"""
import os
from typing import Optional, List
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class EmailProvider(str, Enum):
    """Supported email providers"""
    RESEND = "resend"
    CONSOLE = "console"  # Development fallback


@dataclass
class EmailResult:
    """Result of email send operation"""
    success: bool
    provider: EmailProvider
    message_id: Optional[str] = None
    error: Optional[str] = None

    @property
    def is_success(self) -> bool:
        return self.success


class EmailService:
    """
    Production email service with Resend integration.

    Features:
    - Real email delivery via Resend API
    - HTML and plain text support
    - Detailed error handling
    - Development fallback (console logging)

    Usage:
        service = get_email_service()
        result = await service.send_email(
            to="user@example.com",
            subject="Welcome!",
            html="<h1>Hello</h1>",
            text="Hello"
        )
    """

    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY")
        self.from_email = os.getenv("EMAIL_FROM", "HyperFit <noreply@hyperfit.app>")
        self.app_url = os.getenv("APP_URL", "https://app.hyperfit.com")

        # Determine provider
        if self.api_key:
            self.provider = EmailProvider.RESEND
            logger.info("Email service initialized with Resend provider")
        else:
            self.provider = EmailProvider.CONSOLE
            logger.warning("RESEND_API_KEY not set - using console fallback (emails will not be delivered)")

    @property
    def is_production_ready(self) -> bool:
        """Check if service can send real emails."""
        return self.provider == EmailProvider.RESEND

    async def send_email(
        self,
        to: str | List[str],
        subject: str,
        html: str,
        text: Optional[str] = None,
        reply_to: Optional[str] = None,
        tags: Optional[List[dict]] = None
    ) -> EmailResult:
        """
        Send an email.

        Args:
            to: Recipient email(s)
            subject: Email subject
            html: HTML content
            text: Plain text content (optional)
            reply_to: Reply-to address (optional)
            tags: Resend tags for tracking (optional)

        Returns:
            EmailResult with success status and details
        """
        # Normalize recipient
        recipients = [to] if isinstance(to, str) else to

        if self.provider == EmailProvider.CONSOLE:
            return self._send_console(recipients, subject, html, text)

        return await self._send_resend(recipients, subject, html, text, reply_to, tags)

    async def _send_resend(
        self,
        to: List[str],
        subject: str,
        html: str,
        text: Optional[str],
        reply_to: Optional[str],
        tags: Optional[List[dict]]
    ) -> EmailResult:
        """Send email via Resend API."""
        try:
            import resend

            resend.api_key = self.api_key

            params = {
                "from": self.from_email,
                "to": to,
                "subject": subject,
                "html": html,
            }

            if text:
                params["text"] = text
            if reply_to:
                params["reply_to"] = reply_to
            if tags:
                params["tags"] = tags

            # Send email
            response = resend.Emails.send(params)

            if response and response.get("id"):
                logger.info(f"Email sent successfully via Resend: {response['id']} to {to}")
                return EmailResult(
                    success=True,
                    provider=EmailProvider.RESEND,
                    message_id=response["id"]
                )
            else:
                error_msg = "No message ID returned from Resend"
                logger.error(f"Resend send failed: {error_msg}")
                return EmailResult(
                    success=False,
                    provider=EmailProvider.RESEND,
                    error=error_msg
                )

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Resend API error: {error_msg}")
            return EmailResult(
                success=False,
                provider=EmailProvider.RESEND,
                error=error_msg
            )

    def _send_console(
        self,
        to: List[str],
        subject: str,
        html: str,
        text: Optional[str]
    ) -> EmailResult:
        """Development fallback - log email to console."""
        logger.info("=" * 60)
        logger.info("📧 EMAIL (CONSOLE MODE - NOT ACTUALLY SENT)")
        logger.info("=" * 60)
        logger.info(f"To: {', '.join(to)}")
        logger.info(f"Subject: {subject}")
        logger.info("-" * 60)
        logger.info("Content (plain text):")
        logger.info(text or "(no plain text version)")
        logger.info("=" * 60)

        # Also print to stdout for visibility in development
        print("\n" + "=" * 60)
        print("📧 EMAIL (CONSOLE MODE - NOT ACTUALLY SENT)")
        print("=" * 60)
        print(f"To: {', '.join(to)}")
        print(f"Subject: {subject}")
        print("-" * 60)
        print("Content preview (plain text):")
        if text:
            # Print first 500 chars
            preview = text[:500] + "..." if len(text) > 500 else text
            print(preview)
        print("=" * 60 + "\n")

        return EmailResult(
            success=True,
            provider=EmailProvider.CONSOLE,
            message_id="console-" + str(hash(f"{to}{subject}"))[:8]
        )

    async def send_client_invitation(
        self,
        to_email: str,
        coach_name: str,
        client_name: Optional[str],
        personal_message: Optional[str],
        invite_token: str,
        expiry_days: int = 7
    ) -> EmailResult:
        """
        Send client invitation email.

        Args:
            to_email: Recipient email
            coach_name: Name of the coach sending invitation
            client_name: Optional name of invitee
            personal_message: Optional personal message from coach
            invite_token: Secure invitation token
            expiry_days: Days until invitation expires

        Returns:
            EmailResult
        """
        from .templates import EmailTemplates

        # Build invitation URL
        invite_link = f"{self.app_url}/invite/accept?token={invite_token}"

        # Generate email content
        html, text = EmailTemplates.client_invitation(
            coach_name=coach_name,
            client_name=client_name,
            personal_message=personal_message,
            invite_link=invite_link,
            expiry_days=expiry_days
        )

        subject = f"🎯 {coach_name} invited you to join HyperFit"

        return await self.send_email(
            to=to_email,
            subject=subject,
            html=html,
            text=text,
            tags=[
                {"name": "category", "value": "invitation"},
                {"name": "type", "value": "client_invite"}
            ]
        )

    async def send_invitation_accepted_notification(
        self,
        coach_email: str,
        coach_name: str,
        client_name: str,
        client_email: str
    ) -> EmailResult:
        """
        Notify coach when a client accepts their invitation.

        Args:
            coach_email: Coach's email address
            coach_name: Coach's name
            client_name: Client's name
            client_email: Client's email

        Returns:
            EmailResult
        """
        from .templates import EmailTemplates

        html, text = EmailTemplates.invitation_accepted(
            coach_name=coach_name,
            client_name=client_name,
            client_email=client_email
        )

        subject = f"🎉 {client_name} accepted your invitation!"

        return await self.send_email(
            to=coach_email,
            subject=subject,
            html=html,
            text=text,
            tags=[
                {"name": "category", "value": "notification"},
                {"name": "type", "value": "invite_accepted"}
            ]
        )


# Singleton instance
_email_service: Optional[EmailService] = None


def get_email_service() -> EmailService:
    """Get or create email service singleton."""
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service
