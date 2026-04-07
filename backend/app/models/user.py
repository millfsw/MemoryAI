from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.deck import Deck


class UserBase(SQLModel):
    """Base user model."""
    username: str = Field(index=True, unique=True)


class User(UserBase, table=True):
    """User table model."""
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    decks: list["Deck"] = Relationship(back_populates="user")


class UserCreate(SQLModel):
    """Model for creating a user."""
    username: str
    password: str


class UserLogin(SQLModel):
    """Model for user login."""
    username: str
    password: str


class UserResponse(SQLModel):
    """Model for user response."""
    id: int
    username: str
    created_at: datetime
