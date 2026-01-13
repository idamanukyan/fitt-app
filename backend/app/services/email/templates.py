"""
Email Templates

Branded HTML email templates for HyperFit communications.
"""
from typing import Optional
from datetime import datetime


class EmailTemplates:
    """Production email templates with branding."""

    # Brand colors
    PRIMARY_GREEN = "#10B981"
    DARK_BG = "#1A1A1A"
    CARD_BG = "#262626"
    TEXT_PRIMARY = "#FFFFFF"
    TEXT_SECONDARY = "#A3A3A3"
    TEXT_MUTED = "#737373"

    @classmethod
    def _base_template(cls, content: str, preview_text: str = "") -> str:
        """Base HTML email template with responsive design."""
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>HyperFit</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        body {{
            margin: 0;
            padding: 0;
            background-color: {cls.DARK_BG};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            -webkit-font-smoothing: antialiased;
        }}
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }}
        .email-card {{
            background-color: {cls.CARD_BG};
            border-radius: 16px;
            padding: 40px;
            border: 1px solid #333;
        }}
        .logo {{
            text-align: center;
            margin-bottom: 32px;
        }}
        .logo-text {{
            font-size: 28px;
            font-weight: 700;
            color: {cls.PRIMARY_GREEN};
            letter-spacing: -0.5px;
        }}
        h1 {{
            color: {cls.TEXT_PRIMARY};
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 16px 0;
            line-height: 1.3;
        }}
        p {{
            color: {cls.TEXT_SECONDARY};
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 16px 0;
        }}
        .highlight {{
            color: {cls.TEXT_PRIMARY};
            font-weight: 500;
        }}
        .cta-button {{
            display: inline-block;
            background-color: {cls.PRIMARY_GREEN};
            color: {cls.DARK_BG} !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            text-align: center;
        }}
        .cta-button:hover {{
            background-color: #0D9668;
        }}
        .message-box {{
            background-color: {cls.DARK_BG};
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid {cls.PRIMARY_GREEN};
        }}
        .message-box p {{
            margin: 0;
            font-style: italic;
        }}
        .footer {{
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #333;
        }}
        .footer p {{
            color: {cls.TEXT_MUTED};
            font-size: 13px;
            margin: 8px 0;
        }}
        .footer a {{
            color: {cls.PRIMARY_GREEN};
            text-decoration: none;
        }}
        .expiry-notice {{
            background-color: rgba(251, 191, 36, 0.1);
            border: 1px solid rgba(251, 191, 36, 0.3);
            border-radius: 8px;
            padding: 12px 16px;
            margin: 20px 0;
        }}
        .expiry-notice p {{
            color: #FCD34D;
            font-size: 14px;
            margin: 0;
        }}
        @media only screen and (max-width: 600px) {{
            .email-card {{
                padding: 24px;
            }}
            h1 {{
                font-size: 20px;
            }}
            .cta-button {{
                display: block;
                width: 100%;
                box-sizing: border-box;
            }}
        }}
    </style>
</head>
<body>
    <div style="display:none;max-height:0;overflow:hidden;">{preview_text}</div>
    <div class="email-container">
        {content}
    </div>
</body>
</html>
"""

    @classmethod
    def client_invitation(
        cls,
        coach_name: str,
        client_name: Optional[str],
        personal_message: Optional[str],
        invite_link: str,
        expiry_days: int
    ) -> tuple[str, str]:
        """
        Generate client invitation email.

        Returns:
            Tuple of (html_content, plain_text_content)
        """
        greeting = f"Hi {client_name}," if client_name else "Hi there,"

        message_section = ""
        if personal_message:
            message_section = f"""
            <div class="message-box">
                <p>"{personal_message}"</p>
            </div>
            """

        html_content = f"""
        <div class="email-card">
            <div class="logo">
                <span class="logo-text">HyperFit</span>
            </div>

            <h1>You're Invited to Train with {coach_name}!</h1>

            <p>{greeting}</p>

            <p>
                <span class="highlight">{coach_name}</span> has invited you to join their fitness coaching program on HyperFit.
                Accept this invitation to start your personalized fitness journey!
            </p>

            {message_section}

            <p>With HyperFit, you'll get:</p>
            <ul style="color: {cls.TEXT_SECONDARY}; padding-left: 20px; margin: 16px 0;">
                <li style="margin-bottom: 8px;">Personalized workout plans tailored to your goals</li>
                <li style="margin-bottom: 8px;">Direct communication with your coach</li>
                <li style="margin-bottom: 8px;">Progress tracking and analytics</li>
                <li style="margin-bottom: 8px;">Nutrition guidance and meal planning</li>
            </ul>

            <div style="text-align: center;">
                <a href="{invite_link}" class="cta-button">Accept Invitation</a>
            </div>

            <div class="expiry-notice">
                <p>⏰ This invitation expires in {expiry_days} days.</p>
            </div>

            <div class="footer">
                <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
                <p>Having trouble with the button? Copy and paste this link into your browser:</p>
                <p style="word-break: break-all;"><a href="{invite_link}">{invite_link}</a></p>
                <p style="margin-top: 24px;">
                    © {datetime.now().year} HyperFit. All rights reserved.<br>
                    <a href="https://hyperfit.app/privacy">Privacy Policy</a> ·
                    <a href="https://hyperfit.app/support">Support</a>
                </p>
            </div>
        </div>
        """

        preview_text = f"{coach_name} has invited you to join their fitness coaching program on HyperFit!"
        html = cls._base_template(html_content, preview_text)

        # Plain text version
        plain_text = f"""
You're Invited to Train with {coach_name}!

{greeting}

{coach_name} has invited you to join their fitness coaching program on HyperFit.

{f'Message from {coach_name}: "{personal_message}"' if personal_message else ''}

Accept this invitation to start your personalized fitness journey!

Click here to accept: {invite_link}

With HyperFit, you'll get:
- Personalized workout plans tailored to your goals
- Direct communication with your coach
- Progress tracking and analytics
- Nutrition guidance and meal planning

⏰ This invitation expires in {expiry_days} days.

---
If you weren't expecting this invitation, you can safely ignore this email.

© {datetime.now().year} HyperFit. All rights reserved.
        """.strip()

        return html, plain_text

    @classmethod
    def invitation_accepted(
        cls,
        coach_name: str,
        client_name: str,
        client_email: str
    ) -> tuple[str, str]:
        """
        Notification to coach when client accepts invitation.

        Returns:
            Tuple of (html_content, plain_text_content)
        """
        html_content = f"""
        <div class="email-card">
            <div class="logo">
                <span class="logo-text">HyperFit</span>
            </div>

            <h1>Great News! 🎉</h1>

            <p>Hi {coach_name},</p>

            <p>
                <span class="highlight">{client_name}</span> ({client_email}) has accepted your invitation
                and is now part of your client roster on HyperFit!
            </p>

            <p>You can now:</p>
            <ul style="color: {cls.TEXT_SECONDARY}; padding-left: 20px; margin: 16px 0;">
                <li style="margin-bottom: 8px;">View their profile and fitness goals</li>
                <li style="margin-bottom: 8px;">Create personalized workout plans</li>
                <li style="margin-bottom: 8px;">Track their progress</li>
                <li style="margin-bottom: 8px;">Communicate directly through the app</li>
            </ul>

            <div style="text-align: center;">
                <a href="https://app.hyperfit.com/coach/clients" class="cta-button">View Your Clients</a>
            </div>

            <div class="footer">
                <p>
                    © {datetime.now().year} HyperFit. All rights reserved.
                </p>
            </div>
        </div>
        """

        preview_text = f"Great news! {client_name} has accepted your invitation to join HyperFit!"
        html = cls._base_template(html_content, preview_text)

        plain_text = f"""
Great News! 🎉

Hi {coach_name},

{client_name} ({client_email}) has accepted your invitation and is now part of your client roster on HyperFit!

You can now:
- View their profile and fitness goals
- Create personalized workout plans
- Track their progress
- Communicate directly through the app

Visit your dashboard: https://app.hyperfit.com/coach/clients

---
© {datetime.now().year} HyperFit. All rights reserved.
        """.strip()

        return html, plain_text
