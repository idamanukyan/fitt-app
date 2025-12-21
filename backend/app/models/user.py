from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.role import UserRole, coach_clients
from datetime import datetime

class User(Base):
    """
    User authentication and basic account information.

    Main entity for user management with relationships to all user-related data.
    Supports Role-Based Access Control (RBAC) with USER, COACH, and ADMIN roles.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_premium = Column(Boolean, default=False, nullable=False)  # For future premium features
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)

    # Relationships with cascade delete
    profile = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    measurements = relationship(
        "UserMeasurement",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="UserMeasurement.recorded_at.desc()"
    )
    goals = relationship(
        "UserGoal",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="UserGoal.created_at.desc()"
    )
    notifications = relationship(
        "UserNotification",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="UserNotification.created_at.desc()"
    )
    devices = relationship(
        "UserDevice",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    refresh_tokens = relationship(
        "RefreshToken",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    coach_profile = relationship(
        "CoachProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    progress_photos = relationship(
        "ProgressPhoto",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="ProgressPhoto.taken_at.desc()"
    )
    achievements = relationship(
        "UserAchievement",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    level = relationship(
        "UserLevel",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    streak = relationship(
        "UserStreak",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    # Coach-Client relationships (for coaches only)
    clients = relationship(
        "User",
        secondary=coach_clients,
        primaryjoin=id == coach_clients.c.coach_id,
        secondaryjoin=id == coach_clients.c.client_id,
        backref="assigned_coaches"
    )

    # Shop relationships
    orders = relationship(
        "Order",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="Order.created_at.desc()"
    )
    shopping_cart = relationship(
        "ShoppingCart",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    product_reviews = relationship(
        "ProductReview",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    # Chat relationships
    chat_conversations = relationship(
        "ChatConversation",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="ChatConversation.updated_at.desc()"
    )

    # Sleep tracking relationships
    sleep_entries = relationship(
        "SleepEntry",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="SleepEntry.date.desc()"
    )

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"
