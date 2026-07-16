"""
Rate limiting configuration using slowapi.

Provides per-user rate limiting based on authenticated user ID.
"""
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address


def get_user_identifier(request: Request) -> str:
    """Extract user ID from the request for rate limiting.

    Falls back to IP address for unauthenticated requests.
    """
    user = getattr(request.state, "user", None)
    if user and hasattr(user, "id"):
        return str(user.id)
    # Fallback: try Authorization header to create a consistent key
    auth_header = request.headers.get("authorization", "")
    if auth_header:
        return auth_header
    return get_remote_address(request)


limiter = Limiter(key_func=get_user_identifier)
