from datetime import date

from pydantic import BaseModel


class UserProfileCreate(BaseModel):
    gender: str | None = None
    age: int | None = None
    height: float | None = None
    weight: float | None = None
    date_of_birth: date | None = None

class UserProfileOut(BaseModel):
    id: int
    gender: str | None
    height: float | None
    weight: float | None
    age: int | None
    date_of_birth: date | None

    class Config:
        orm_mode = True
