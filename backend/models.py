# backend/models.py
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from .db import Base

class MediaHabit(Base):
    """
    Representa un registro de hábitos de consumo de medios digitales.
    """
    __tablename__ = "media_habits"

    id = Column(Integer, primary_key=True, index=True)
    respondent_name = Column(String(150), nullable=True)   # opcional
    age = Column(Integer, nullable=False)
    city = Column(String(100), nullable=False)
    primary_media = Column(String(100), nullable=False)    # ejemplo: 'Televisión', 'Redes'
    hours_per_day = Column(Integer, nullable=False)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
