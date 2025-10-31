from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MediaHabitCreate(BaseModel):
    respondent_name: Optional[str] = None
    age: int
    city: str
    primary_media: str
    hours_per_day: int
    comments: Optional[str] = None

class MediaHabitOut(MediaHabitCreate):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True