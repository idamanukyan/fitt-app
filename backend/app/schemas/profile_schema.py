from pydantic import BaseModel
from typing import Optional
from datetime import date

class UserProfileCreate(BaseModel):
    gender: Optional[str] = None
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    date_of_birth: Optional[date] = None

class UserProfileOut(BaseModel):
    id: int
    gender: Optional[str]
    height: Optional[float]
    weight: Optional[float]
    age: Optional[int]
    date_of_birth: Optional[date]

    class Config:
        orm_mode = True
