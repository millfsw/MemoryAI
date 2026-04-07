from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime


class CardProgressBase(SQLModel):
    flashcard_id: int = Field(foreign_key="flashcards.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    ease_factor: float = Field(default=2.5)  # SM-2 algorithm
    interval: int = Field(default=0)  # Days until next review
    repetitions: int = Field(default=0)
    last_reviewed: Optional[datetime] = None
    next_review: Optional[datetime] = None
    is_known: bool = Field(default=False)


class CardProgress(CardProgressBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CardProgressCreate(SQLModel):
    flashcard_id: int
    is_known: bool


class CardProgressResponse(SQLModel):
    id: int
    flashcard_id: int
    user_id: int
    ease_factor: float
    interval: int
    repetitions: int
    last_reviewed: Optional[datetime]
    next_review: Optional[datetime]
    is_known: bool
    created_at: datetime
