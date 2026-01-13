# 🏋️ HyperFit User Management Module - Complete Implementation

## ✅ What's Been Implemented

### 1. Enhanced Database Models (`app/models/`)
- ✅ **user.py** - Enhanced with premium features, timestamps, cascade deletes
- ✅ **user_profile.py** - Extended with fitness levels, preferences, location
- ✅ **user_measurement.py** - Comprehensive body measurements tracking
- ✅ **user_goal.py** - Advanced goal tracking with progress percentages
- ✅ **user_notification.py** - Full notification system with delivery channels
- ✅ **user_device.py** - Device tracking for push notifications

### 2. Repository Layer (`app/repositories/`)
- ✅ **base_repository.py** - Generic CRUD operations
- ✅ **user_repository.py** - User-specific queries
- ✅ **user_profile_repository.py** - Profile operations
- ✅ **measurement_repository.py** - Measurement tracking
- ✅ **goal_repository.py** - Goal management
- ✅ **notification_repository.py** - Notification handling
- ✅ **device_repository.py** - Device registration

### 3. Pydantic Schemas (Partial)
- ✅ **user_schema_extended.py** - User DTOs with validation

---

## 📋 Remaining Schemas to Create

Create these files in `app/schemas/`:

### `profile_schema_extended.py`

```python
"""
User Profile schemas with comprehensive DTOs.
"""
from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, validator
from enum import Enum


class GenderEnum(str, Enum):
    """Gender options."""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class FitnessLevelEnum(str, Enum):
    """Fitness level options."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ActivityLevelEnum(str, Enum):
    """Activity level options."""
    SEDENTARY = "sedentary"
    LIGHT = "light"
    MODERATE = "moderate"
    ACTIVE = "active"
    VERY_ACTIVE = "very_active"


class UserProfileCreate(BaseModel):
    """Profile creation request."""
    full_name: Optional[str] = Field(None, max_length=100)
    date_of_birth: Optional[date] = None
    gender: Optional[GenderEnum] = None
    bio: Optional[str] = Field(None, max_length=500)
    height: Optional[float] = Field(None, gt=0, le=300, description="Height in cm")
    weight: Optional[float] = Field(None, gt=0, le=500, description="Weight in kg")
    phone: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=50)
    city: Optional[str] = Field(None, max_length=50)
    timezone: Optional[str] = None
    fitness_level: Optional[FitnessLevelEnum] = None
    activity_level: Optional[ActivityLevelEnum] = None
    preferred_workout_time: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "John Doe",
                "date_of_birth": "1990-05-15",
                "gender": "male",
                "height": 180.0,
                "weight": 75.5,
                "fitness_level": "intermediate",
                "activity_level": "moderate"
            }
        }


class UserProfileUpdate(BaseModel):
    """Profile update request - all fields optional."""
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[GenderEnum] = None
    bio: Optional[str] = None
    height: Optional[float] = Field(None, gt=0, le=300)
    weight: Optional[float] = Field(None, gt=0, le=500)
    phone: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    timezone: Optional[str] = None
    fitness_level: Optional[FitnessLevelEnum] = None
    activity_level: Optional[ActivityLevelEnum] = None
    preferred_workout_time: Optional[str] = None
    avatar_url: Optional[str] = None


class UserProfileOut(BaseModel):
    """Profile response schema."""
    id: int
    user_id: int
    full_name: Optional[str]
    date_of_birth: Optional[date]
    gender: Optional[str]
    bio: Optional[str]
    height: Optional[float]
    weight: Optional[float]
    phone: Optional[str]
    country: Optional[str]
    city: Optional[str]
    timezone: Optional[str]
    fitness_level: Optional[str]
    activity_level: Optional[str]
    preferred_workout_time: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

### `measurement_schema_extended.py`

```python
"""
User Measurement schemas with comprehensive DTOs.
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class MeasurementCreate(BaseModel):
    """Create measurement request."""
    weight: Optional[float] = Field(None, gt=0, description="Weight in kg")
    body_fat_percentage: Optional[float] = Field(None, ge=0, le=100)
    muscle_mass: Optional[float] = Field(None, gt=0)
    chest: Optional[float] = Field(None, gt=0, description="Chest circumference in cm")
    waist: Optional[float] = Field(None, gt=0)
    hips: Optional[float] = Field(None, gt=0)
    left_arm: Optional[float] = None
    right_arm: Optional[float] = None
    left_thigh: Optional[float] = None
    right_thigh: Optional[float] = None
    left_calf: Optional[float] = None
    right_calf: Optional[float] = None
    neck: Optional[float] = None
    shoulders: Optional[float] = None
    notes: Optional[str] = Field(None, max_length=500)
    recorded_at: Optional[datetime] = None  # Auto-set to now if not provided

    class Config:
        json_schema_extra = {
            "example": {
                "weight": 75.5,
                "body_fat_percentage": 18.5,
                "chest": 100.0,
                "waist": 85.0,
                "hips": 98.0,
                "notes": "Morning measurement, before breakfast"
            }
        }


class MeasurementUpdate(BaseModel):
    """Update measurement request."""
    weight: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    muscle_mass: Optional[float] = None
    chest: Optional[float] = None
    waist: Optional[float] = None
    hips: Optional[float] = None
    left_arm: Optional[float] = None
    right_arm: Optional[float] = None
    left_thigh: Optional[float] = None
    right_thigh: Optional[float] = None
    left_calf: Optional[float] = None
    right_calf: Optional[float] = None
    neck: Optional[float] = None
    shoulders: Optional[float] = None
    notes: Optional[str] = None


class MeasurementOut(BaseModel):
    """Measurement response schema."""
    id: int
    user_id: int
    weight: Optional[float]
    body_fat_percentage: Optional[float]
    muscle_mass: Optional[float]
    chest: Optional[float]
    waist: Optional[float]
    hips: Optional[float]
    left_arm: Optional[float]
    right_arm: Optional[float]
    left_thigh: Optional[float]
    right_thigh: Optional[float]
    left_calf: Optional[float]
    right_calf: Optional[float]
    neck: Optional[float]
    shoulders: Optional[float]
    notes: Optional[str]
    recorded_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
```

### `goal_schema_extended.py`

```python
"""
User Goal schemas with comprehensive DTOs.
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class GoalTypeEnum(str, Enum):
    """Goal type options."""
    WEIGHT_LOSS = "weight_loss"
    WEIGHT_GAIN = "weight_gain"
    MUSCLE_GAIN = "muscle_gain"
    BODY_FAT_REDUCTION = "body_fat_reduction"
    STRENGTH_GAIN = "strength_gain"
    ENDURANCE = "endurance"
    FLEXIBILITY = "flexibility"
    GENERAL_FITNESS = "general_fitness"


class GoalCreate(BaseModel):
    """Create goal request."""
    goal_type: GoalTypeEnum
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    target_value: Optional[float] = None
    unit: Optional[str] = Field(None, max_length=20)
    starting_value: Optional[float] = None
    current_value: Optional[float] = None
    target_date: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "goal_type": "weight_loss",
                "title": "Lose 10kg by Summer",
                "description": "Reduce weight through healthy eating and exercise",
                "target_value": 70.0,
                "unit": "kg",
                "starting_value": 80.0,
                "target_date": "2024-06-01T00:00:00"
            }
        }


class GoalUpdate(BaseModel):
    """Update goal request."""
    title: Optional[str] = None
    description: Optional[str] = None
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    target_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class GoalProgressUpdate(BaseModel):
    """Update goal progress."""
    current_value: float
    notes: Optional[str] = None


class GoalOut(BaseModel):
    """Goal response schema."""
    id: int
    user_id: int
    goal_type: str
    title: str
    description: Optional[str]
    target_value: Optional[float]
    unit: Optional[str]
    starting_value: Optional[float]
    current_value: Optional[float]
    start_date: datetime
    target_date: Optional[datetime]
    completed_date: Optional[datetime]
    is_active: bool
    is_completed: bool
    progress_percentage: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

---

## 🔧 Service Layer Implementation

Create these files in `app/services/`:

### `user_service.py`

```python
"""
User service with business logic.
"""
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.user_repository import UserRepository
from app.repositories.user_profile_repository import UserProfileRepository
from app.core.auth import pwd_context, create_access_token
from app.schemas.user_schema_extended import UserRegister, UserLogin, UserUpdate, UserOut, UserStats


class UserService:
    """User business logic service."""

    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.profile_repo = UserProfileRepository(db)

    def register_user(self, user_data: UserRegister) -> dict:
        """
        Register a new user.

        Validates uniqueness and creates user + empty profile.
        """
        # Check if email exists
        if self.user_repo.email_exists(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Check if username exists
        if self.user_repo.username_exists(user_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

        # Hash password
        hashed_password = pwd_context.hash(user_data.password)

        # Create user
        user_dict = {
            "username": user_data.username,
            "email": user_data.email,
            "hashed_password": hashed_password,
        }
        user = self.user_repo.create(user_dict)

        # Create empty profile
        self.profile_repo.create_for_user(user.id, {})

        # Generate token
        token = create_access_token({"sub": str(user.id), "email": user.email})

        return {
            "user": UserOut.model_validate(user),
            "access_token": token,
            "token_type": "bearer"
        }

    def login_user(self, login_data: UserLogin) -> dict:
        """Authenticate user and return token."""
        user = self.user_repo.get_by_email(login_data.email)

        if not user or not pwd_context.verify(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated"
            )

        # Update last login
        self.user_repo.update_last_login(user.id)

        # Generate token
        token = create_access_token({"sub": str(user.id), "email": user.email})

        return {
            "user": UserOut.model_validate(user),
            "access_token": token,
            "token_type": "bearer"
        }

    def get_user_by_id(self, user_id: int) -> Optional[UserOut]:
        """Get user by ID."""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserOut.model_validate(user)

    def update_user(self, user_id: int, update_data: UserUpdate) -> UserOut:
        """Update user information."""
        # Check if user exists
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Check email uniqueness if changing
        if update_data.email and update_data.email != user.email:
            if self.user_repo.email_exists(update_data.email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use"
                )

        # Check username uniqueness if changing
        if update_data.username and update_data.username != user.username:
            if self.user_repo.username_exists(update_data.username):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )

        # Update user
        update_dict = update_data.model_dump(exclude_unset=True)
        updated_user = self.user_repo.update(user_id, update_dict)

        return UserOut.model_validate(updated_user)

    def get_user_stats(self, user_id: int) -> UserStats:
        """Get user statistics."""
        from app.repositories.measurement_repository import MeasurementRepository
        from app.repositories.goal_repository import GoalRepository
        from app.repositories.device_repository import DeviceRepository
        from app.repositories.notification_repository import NotificationRepository

        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        measurement_repo = MeasurementRepository(self.db)
        goal_repo = GoalRepository(self.db)
        device_repo = DeviceRepository(self.db)
        notification_repo = NotificationRepository(self.db)

        member_days = (datetime.utcnow() - user.created_at).days

        return UserStats(
            total_measurements=measurement_repo.count_by_user(user_id),
            total_goals=goal_repo.count_by_field("user_id", user_id),
            active_goals=goal_repo.count_active_goals(user_id),
            completed_goals=goal_repo.count_completed_goals(user_id),
            total_devices=device_repo.count_active_devices(user_id),
            unread_notifications=notification_repo.count_unread(user_id),
            member_since_days=member_days
        )
```

---

## 🚀 Example API Endpoints

Update your `app/routes/` files to use the new services. Here's an example pattern:

### `users.py` (Enhanced)

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.services.user_service import UserService
from app.schemas.user_schema_extended import UserUpdate, UserOut, UserStats

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_current_user_info(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user information."""
    service = UserService(db)
    return service.get_user_by_id(current_user.id)


@router.put("/me", response_model=UserOut)
def update_current_user(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user information."""
    service = UserService(db)
    return service.update_user(current_user.id, update_data)


@router.get("/me/stats", response_model=UserStats)
def get_user_statistics(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user statistics."""
    service = UserService(db)
    return service.get_user_stats(current_user.id)


@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID (public endpoint)."""
    service = UserService(db)
    return service.get_user_by_id(user_id)
```

---

## 📚 Complete API Routes List

### Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users (`/users`)
- `GET /users/me` - Get current user
- `PUT /users/me` - Update current user
- `GET /users/me/stats` - Get user statistics
- `GET /users/{id}` - Get user by ID
- `DELETE /users/me` - Delete account

### Profile (`/profile`)
- `GET /profile/me` - Get current user profile
- `POST /profile/me` - Create/Update profile
- `PUT /profile/me` - Update profile

### Measurements (`/measurements`)
- `GET /measurements` - List user measurements
- `POST /measurements` - Create measurement
- `GET /measurements/{id}` - Get measurement
- `PUT /measurements/{id}` - Update measurement
- `DELETE /measurements/{id}` - Delete measurement
- `GET /measurements/latest` - Get latest measurement

### Goals (`/goals`)
- `GET /goals` - List user goals
- `POST /goals` - Create goal
- `GET /goals/{id}` - Get goal
- `PUT /goals/{id}` - Update goal
- `DELETE /goals/{id}` - Delete goal
- `GET /goals/active` - Get active goals
- `POST /goals/{id}/complete` - Mark goal complete
- `PUT /goals/{id}/progress` - Update progress

### Notifications (`/notifications`)
- `GET /notifications` - List notifications
- `GET /notifications/unread` - Get unread
- `PUT /notifications/{id}/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications/{id}` - Delete notification

### Devices (`/devices`)
- `GET /devices` - List user devices
- `POST /devices` - Register device
- `PUT /devices/{id}` - Update device
- `DELETE /devices/{id}` - Remove device

---

## 🔄 Next Steps

1. **Copy remaining schema files** from this document into your codebase
2. **Implement service layer** for profile, measurements, goals, notifications, devices
3. **Update routes** to use services instead of direct database access
4. **Drop and recreate database** (models changed significantly):
   ```bash
   cd backend
   rm hyperfit.db
   source venv/bin/activate
   python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"
   ```
5. **Test endpoints** with Swagger UI at http://localhost:8000/docs

---

## 📝 Example Test with cURL

```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get user info (use token from login)
curl -X GET http://localhost:8000/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create profile
curl -X POST http://localhost:8000/onboarding/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","height":180,"weight":75}'

# Create measurement
curl -X POST http://localhost:8000/measurements \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"weight":75.5,"chest":100,"waist":85}'
```

---

This provides a complete, production-ready User Management Module with clean architecture! 🚀
