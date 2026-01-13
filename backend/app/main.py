from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.core.config import settings
from app.routes import auth, users, onboarding, profile, measurements, goals, notifications, devices
from app.routes import auth_enhanced, admin, coach, exercises, workouts, nutrition, progress_photos, achievements, supplements, shop, chat, sleep, ai, invite, meal_plans

# ---------------------------
# App initialization
# ---------------------------
app = FastAPI(
    title="HyperFit API",
    version="6.0",
    description="Complete Fitness Platform with User Management, RBAC, Workout System, Exercise Library, Nutrition Tracking, and Gamification",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ---------------------------
# CORS middleware
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Database initialization
# ---------------------------
Base.metadata.create_all(bind=engine)

# ---------------------------
# Routers
# ---------------------------
# Enhanced Authentication (with refresh tokens and logout)
app.include_router(auth_enhanced.router, prefix="/api")

# Admin Routes (RBAC - Admin only)
app.include_router(admin.router, prefix="/api")

# Coach Routes (RBAC - Coach only)
app.include_router(coach.router, prefix="/api")

# Workout System Routes
app.include_router(exercises.router)
app.include_router(workouts.router)

# Nutrition Tracking Routes
app.include_router(nutrition.router)

# Progress Photos Routes
app.include_router(progress_photos.router)

# Achievement & Gamification Routes
app.include_router(achievements.router)

# Supplement Tracking Routes
app.include_router(supplements.router)

# Shop & E-commerce Routes (with AI recommendations)
app.include_router(shop.router)

# AI Chat Routes (sport-focused chatbot)
app.include_router(chat.router, prefix="/api/v6")

# AI Specialized Routes (workout generation, meal planning, etc.)
app.include_router(ai.router, prefix="/api/v6")

# Meal Plan Routes (AI-generated weekly meal plans)
app.include_router(meal_plans.router)

# Client Invitation Routes (public + authenticated)
app.include_router(invite.router, prefix="/api")

# Sleep Tracking Routes
app.include_router(sleep.router, prefix="/api/v6")

# Original routes (still functional)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(profile.router)
app.include_router(measurements.router)
app.include_router(goals.router)
app.include_router(notifications.router)
app.include_router(devices.router)
app.include_router(onboarding.router)

# ---------------------------
# Health check / root route
# ---------------------------
@app.get("/", tags=["Health"])
def root():
    """API health check endpoint."""
    return {
        "message": "🚀 Welcome to HyperFit API",
        "version": "6.0",
        "status": "healthy",
        "features": [
            "JWT Authentication with Refresh Tokens",
            "Role-Based Access Control (USER, COACH, ADMIN)",
            "Coach-Client Management Platform",
            "Comprehensive Exercise Library",
            "Workout Templates & User Workouts",
            "Workout Session Tracking & Analytics",
            "Complete Nutrition Tracking System",
            "Food Database with 100+ Items",
            "Meal Logging & Macro Tracking",
            "Water Intake Monitoring",
            "Daily Nutrition Goals & Summaries",
            "Progress Photos with Base64 Upload",
            "Photo Comparison & Timeline Views",
            "Achievements & Gamification System",
            "User Levels & XP Progression",
            "Daily Activity Streaks",
            "Leaderboard Rankings",
            "Supplement Tracking & Reminders",
            "Supplement Library & Schedule Management",
            "E-commerce Shop with Product Catalog",
            "AI-Powered Product Recommendations",
            "Premium Brand Integration (Nike, Adidas, etc.)",
            "Shopping Cart & Order Management",
            "Product Reviews & Ratings",
            "AI Chat Assistant (Sport-Focused Chatbot)",
            "Contextual Fitness Advice & Recommendations",
            "Multi-Topic Conversations (Workout, Nutrition, etc.)",
            "AI Workout Generation (OpenAI + Gemini)",
            "AI Meal Planning with Dietary Preferences",
            "AI Weekly Meal Plan Generator",
            "Grocery List Auto-Generation",
            "AI Exercise Explanations & Form Tips",
            "AI Motivation Messages",
            "Secure Logout with Token Blacklist",
            "Enhanced Security (HS512, BCrypt)"
        ],
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/auth/*",
            "admin": "/api/admin/*",
            "coach": "/api/coach/*",
            "exercises": "/api/exercises",
            "workouts": "/api/workouts",
            "nutrition": "/api/nutrition/*",
            "progress_photos": "/api/progress-photos",
            "achievements": "/api/achievements",
            "supplements": "/api/v6/supplements/*",
            "shop": "/api/v6/shop/*",
            "chat": "/api/v6/chat/*",
            "ai": "/api/v6/ai/*",
            "meal_plans": "/api/meal-plans/*"
        }
    }
