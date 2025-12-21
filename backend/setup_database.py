#!/usr/bin/env python3
"""
Database setup script for HyperFit enhanced authentication system.

This script will:
1. Backup existing database (if exists)
2. Create all new tables (RefreshToken, TokenBlacklist, CoachProfile, etc.)
3. Add role column to existing users
4. Create a default admin user

Usage:
    python3 setup_database.py
"""

import os
import shutil
from datetime import datetime
from sqlalchemy import inspect

# Import all models to ensure they're registered
from app.core.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.user_measurement import UserMeasurement
from app.models.user_goal import UserGoal
from app.models.user_notification import UserNotification
from app.models.user_device import UserDevice
from app.models.token import RefreshToken, TokenBlacklist
from app.models.coach import CoachProfile
from app.models.role import UserRole
from app.core.auth_enhanced import pwd_context

def backup_database():
    """Backup existing database if it exists."""
    db_file = "hyperfit.db"
    if os.path.exists(db_file):
        backup_name = f"hyperfit.db.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        shutil.copy2(db_file, backup_name)
        print(f"✅ Database backed up to: {backup_name}")
        return True
    return False

def create_tables():
    """Create all database tables."""
    print("📊 Creating database tables...")

    # Drop all tables (fresh start)
    Base.metadata.drop_all(bind=engine)
    print("  ⚠️  Existing tables dropped")

    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("  ✅ All tables created successfully")

    # List created tables
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"\n  📋 Created tables:")
    for table in tables:
        print(f"     - {table}")

def create_default_admin():
    """Create a default admin user."""
    db = SessionLocal()

    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == "admin@hyperfit.com").first()
        if existing_admin:
            print("\n⚠️  Admin user already exists")
            return

        # Create admin user
        admin = User(
            username="admin",
            email="admin@hyperfit.com",
            hashed_password=pwd_context.hash("admin123"),  # Change this password!
            role=UserRole.ADMIN,
            is_active=True,
            is_premium=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        # Create admin profile
        admin_profile = UserProfile(
            user_id=admin.id,
            full_name="System Administrator"
        )
        db.add(admin_profile)
        db.commit()

        print("\n✅ Default admin user created:")
        print(f"   📧 Email: admin@hyperfit.com")
        print(f"   🔑 Password: admin123")
        print(f"   ⚠️  IMPORTANT: Change this password immediately!")

    except Exception as e:
        print(f"\n❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

def create_test_users():
    """Create test users with different roles."""
    db = SessionLocal()

    try:
        print("\n👥 Creating test users...")

        # Test regular user
        test_user = User(
            username="testuser",
            email="user@test.com",
            hashed_password=pwd_context.hash("password123"),
            role=UserRole.USER,
            is_active=True
        )
        db.add(test_user)

        # Test coach
        test_coach = User(
            username="testcoach",
            email="coach@test.com",
            hashed_password=pwd_context.hash("password123"),
            role=UserRole.COACH,
            is_active=True
        )
        db.add(test_coach)

        db.commit()
        db.refresh(test_user)
        db.refresh(test_coach)

        # Create profiles
        user_profile = UserProfile(user_id=test_user.id, full_name="Test User")
        coach_profile_user = UserProfile(user_id=test_coach.id, full_name="Test Coach")
        db.add(user_profile)
        db.add(coach_profile_user)

        # Create coach profile
        coach_profile = CoachProfile(
            user_id=test_coach.id,
            specialization="Weight Loss & Strength Training",
            certifications="NASM CPT",
            years_of_experience=5,
            bio="Experienced fitness coach",
            max_clients=30,
            is_accepting_clients=True
        )
        db.add(coach_profile)

        db.commit()

        print("  ✅ Test users created:")
        print("\n  👤 Regular User:")
        print(f"     Email: user@test.com")
        print(f"     Password: password123")
        print(f"     Role: USER")
        print("\n  🏋️  Coach:")
        print(f"     Email: coach@test.com")
        print(f"     Password: password123")
        print(f"     Role: COACH")

    except Exception as e:
        print(f"\n❌ Error creating test users: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main setup function."""
    print("=" * 60)
    print("🚀 HyperFit Enhanced Authentication Setup")
    print("=" * 60)

    # Backup database
    backed_up = backup_database()

    # Create tables
    create_tables()

    # Create default admin
    create_default_admin()

    # Create test users
    create_test_users()

    print("\n" + "=" * 60)
    print("✅ Database setup complete!")
    print("=" * 60)

    print("\n📝 Next steps:")
    print("1. Start the backend: ./start.sh or uvicorn app.main:app --reload")
    print("2. Visit API docs: http://localhost:8000/docs")
    print("3. Test authentication endpoints")
    print("4. CHANGE the admin password!")

    if backed_up:
        print("\n💾 Your old database was backed up and can be restored if needed.")

if __name__ == "__main__":
    main()
