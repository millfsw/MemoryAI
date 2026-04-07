from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.flashcard import Flashcard
    from app.models.user import User


class DeckBase(SQLModel):
    """Base deck model."""
    title: str
    description: Optional[str] = None


class Deck(DeckBase, table=True):
    """Deck table model."""
    __tablename__ = "decks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    summary: Optional[str] = Field(default=None)  # Store generated summary
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
    user_id: Optional[int]
    created_at: datetime
