from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.supplement import (
    Supplement,
    SupplementCreate,
    SupplementUpdate,
    SupplementListResponse,
    UserSupplement,
    UserSupplementCreate,
    UserSupplementUpdate,
    UserSupplementListResponse,
    SupplementIntake,
    SupplementIntakeCreate,
    TodaysSupplementsResponse,
    SupplementStatsResponse,
    SupplementCategory
)
from app.services.supplement_service import (
    SupplementService,
    UserSupplementService,
    SupplementIntakeService
)

router = APIRouter(prefix="/api/v6/supplements", tags=["Supplements"])

# ===== SUPPLEMENT LIBRARY ROUTES =====

@router.get("/library", response_model=SupplementListResponse)
def get_supplement_library(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: Optional[SupplementCategory] = None,
    search: Optional[str] = None,
    is_popular: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all supplements from the library.

    Filters:
    - category: Filter by supplement category
    - search: Search in name, description, brand
    - is_popular: Filter by popularity
    """
    supplements, total = SupplementService.get_supplements(
        db, skip=skip, limit=limit, category=category,
        search=search, is_popular=is_popular
    )

    return {
        "supplements": supplements,
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit
    }


@router.get("/library/{supplement_id}", response_model=Supplement)
def get_supplement_detail(
    supplement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a supplement"""
    supplement = SupplementService.get_supplement(db, supplement_id)
    if not supplement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplement not found"
        )
    return supplement


@router.post("/library", response_model=Supplement, status_code=status.HTTP_201_CREATED)
def create_supplement(
    supplement_data: SupplementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new supplement in the library.

    Admin/Coach only. Regular users can request supplements via support.
    """
    if current_user.role not in ["admin", "coach"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and coaches can create supplements"
        )

    supplement = SupplementService.create_supplement(db, supplement_data)
    return supplement


@router.patch("/library/{supplement_id}", response_model=Supplement)
def update_supplement(
    supplement_id: int,
    supplement_data: SupplementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update supplement information. Admin/Coach only."""
    if current_user.role not in ["admin", "coach"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and coaches can update supplements"
        )

    supplement = SupplementService.update_supplement(db, supplement_id, supplement_data)
    if not supplement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplement not found"
        )
    return supplement


@router.delete("/library/{supplement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplement(
    supplement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft delete supplement. Admin only."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete supplements"
        )

    success = SupplementService.delete_supplement(db, supplement_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplement not found"
        )


# ===== USER SUPPLEMENT ROUTES =====

@router.get("/my-supplements", response_model=UserSupplementListResponse)
def get_my_supplements(
    is_active: Optional[bool] = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's supplement schedule"""
    supplements = UserSupplementService.get_user_supplements(
        db, current_user.id, is_active=is_active
    )
    return {"supplements": supplements, "total": len(supplements)}


@router.get("/my-supplements/{user_supplement_id}", response_model=UserSupplement)
def get_my_supplement_detail(
    user_supplement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a user's supplement"""
    user_supplement = UserSupplementService.get_user_supplement(
        db, user_supplement_id, current_user.id
    )
    if not user_supplement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User supplement not found"
        )
    return user_supplement


@router.post("/my-supplements", response_model=UserSupplement, status_code=status.HTTP_201_CREATED)
def add_supplement_to_schedule(
    supplement_data: UserSupplementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a supplement to user's schedule"""
    user_supplement = UserSupplementService.add_supplement_to_user(
        db, current_user.id, supplement_data
    )
    if not user_supplement:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supplement not found or already in your schedule"
        )
    return user_supplement


@router.patch("/my-supplements/{user_supplement_id}", response_model=UserSupplement)
def update_my_supplement(
    user_supplement_id: int,
    update_data: UserSupplementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user's supplement schedule"""
    user_supplement = UserSupplementService.update_user_supplement(
        db, user_supplement_id, current_user.id, update_data
    )
    if not user_supplement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User supplement not found"
        )
    return user_supplement


@router.delete("/my-supplements/{user_supplement_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_supplement_from_schedule(
    user_supplement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove supplement from user's schedule"""
    success = UserSupplementService.remove_user_supplement(
        db, user_supplement_id, current_user.id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User supplement not found"
        )


@router.get("/today", response_model=TodaysSupplementsResponse)
def get_todays_supplements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get today's supplement schedule.

    Returns:
    - scheduled: Supplements to take now
    - taken: Already taken today
    - missed: Should have been taken but weren't
    - upcoming: Due later today
    """
    schedule = UserSupplementService.get_todays_supplements(db, current_user.id)
    return schedule


@router.get("/low-stock", response_model=List[UserSupplement])
def get_low_stock_supplements(
    threshold: int = Query(7, ge=1, le=30, description="Days of stock remaining"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get supplements that are running low on stock"""
    low_stock = UserSupplementService.get_low_stock_supplements(
        db, current_user.id, threshold=threshold
    )
    return low_stock


# ===== INTAKE LOGGING ROUTES =====

@router.post("/intake", response_model=SupplementIntake, status_code=status.HTTP_201_CREATED)
def log_supplement_intake(
    intake_data: SupplementIntakeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Log that user took a supplement"""
    intake = SupplementIntakeService.log_intake(db, current_user.id, intake_data)
    if not intake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User supplement not found"
        )
    return intake


@router.get("/intake/history", response_model=List[SupplementIntake])
def get_intake_history(
    user_supplement_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get supplement intake history"""
    history = SupplementIntakeService.get_intake_history(
        db, current_user.id,
        user_supplement_id=user_supplement_id,
        start_date=start_date,
        end_date=end_date,
        limit=limit
    )
    return history


@router.get("/stats", response_model=SupplementStatsResponse)
def get_supplement_stats(
    days: int = Query(7, ge=1, le=90, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get supplement compliance statistics.

    Includes:
    - Total supplements
    - Compliance rate (% of scheduled doses taken)
    - Doses taken vs missed this week
    - Low stock alerts
    """
    stats = SupplementIntakeService.get_compliance_stats(db, current_user.id, days=days)

    # Add low stock info
    low_stock = UserSupplementService.get_low_stock_supplements(db, current_user.id)
    stats["low_stock_alerts"] = [
        {
            "id": us.id,
            "supplement_name": us.supplement.name,
            "remaining_stock": us.remaining_stock,
            "total_stock": us.total_stock
        }
        for us in low_stock
    ]

    return stats
