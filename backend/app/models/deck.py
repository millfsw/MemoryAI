from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship


class DeckBase(SQLModel):
    """Base deck model."""
    title: str
    description: Optional[str] = None


class Deck(DeckBase, table=True):
    """Deck table model."""
    __tablename__ = "decks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    flashcards: list["Flashcard"] = Relationship(back_populates="deck")
    user: Optional["User"] = Relationship(back_populates="decks")


class DeckCreate(SQLModel):
    """Model for creating a deck."""
    title: str
    description: Optional[str] = None


class DeckResponse(SQLModel):
    """Model for deck response."""
    id: int
    title: str
    description: Optional[str]
    user_id: int
    created_at: datetime
