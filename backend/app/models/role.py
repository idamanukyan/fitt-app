"""
Role-Based Access Control (RBAC) models.
"""
from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, Enum, Table, ForeignKey
from app.core.database import Base


class UserRole(str, PyEnum):
    """
    User roles for RBAC.

    - USER: Regular users who manage their own fitness data
    - COACH: Fitness coaches who can view and manage assigned clients
    - ADMIN: System administrators with full access
    - NUTRITIONIST: Future role for nutrition specialists (extensible)
    """
    USER = "user"
    COACH = "coach"
    ADMIN = "admin"
    NUTRITIONIST = "nutritionist"  # Future extension


# Association table for many-to-many relationship between coaches and users
coach_clients = Table(
    'coach_clients',
    Base.metadata,
    Column('coach_id', Integer, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('client_id', Integer, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('assigned_at', String, nullable=False)  # ISO datetime string
)
