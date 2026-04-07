from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship


class FlashcardBase(SQLModel):
    """Base flashcard model."""
    question: str
    answer: str


class Flashcard(FlashcardBase, table=True):
    """Flashcard table model."""
    __tablename__ = "flashcards"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    deck_id: int = Field(foreign_key="decks.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    deck: Optional["Deck"] = Relationship(back_populates="flashcards")


class FlashcardCreate(SQLModel):
    """Model for creating a flashcard."""
    question: str
    answer: str


class FlashcardUpdate(SQLModel):
    """Model for updating a flashcard."""
    question: Optional[str] = None
    answer: Optional[str] = None


class FlashcardResponse(SQLModel):
    """Model for flashcard response."""
    id: int
    question: str
    answer: str
    deck_id: int
    created_at: datetime
