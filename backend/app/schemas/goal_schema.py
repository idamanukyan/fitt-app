from datetime import datetime

from pydantic import BaseModel


class UserGoalCreate(BaseModel):
    goal_type: str  # e.g. "lose_weight", "gain_muscle"
    target_value: float | None = None
    current_value: float | None = None
    deadline: datetime | None = None

class UserGoalOut(BaseModel):
    id: int
    goal_type: str
    target_value: float | None
    current_value: float | None
    deadline: datetime | None

    class Config:
        orm_mode = True
