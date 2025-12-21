from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserGoalCreate(BaseModel):
    goal_type: str  # e.g. "lose_weight", "gain_muscle"
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    deadline: Optional[datetime] = None

class UserGoalOut(BaseModel):
    id: int
    goal_type: str
    target_value: Optional[float]
    current_value: Optional[float]
    deadline: Optional[datetime]

    class Config:
        orm_mode = True
