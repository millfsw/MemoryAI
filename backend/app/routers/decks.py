from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlmodel import Session, select
from typing import List, Optional

from app.database import get_session
from app.models.deck import Deck, DeckCreate, DeckResponse
from app.models.flashcard import Flashcard, FlashcardCreate, FlashcardResponse
from app.services.auth_service import decode_access_token
from pydantic import BaseModel

router = APIRouter(prefix="/decks", tags=["decks"])


class DeckDetailResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    user_id: Optional[int]
    created_at: str
    flashcards: List[FlashcardResponse]
    summary: Optional[str] = None


def get_user_id_from_token(authorization: Optional[str] = Header(None)) -> Optional[int]:
    """Extract user_id from JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    
    if not payload or "sub" not in payload:
        return None
    
    return int(payload["sub"])


@router.get("", response_model=List[DeckResponse])
async def get_decks(
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    """Get all decks (filtered by user if authenticated)."""
    user_id = get_user_id_from_token(authorization)
    
    if user_id:
        # Get user's decks only
        statement = select(Deck).where(Deck.user_id == user_id)
    else:
        # Get all decks (for anonymous users - backward compatibility)
        statement = select(Deck)
    
    decks = session.exec(statement).all()
    return [DeckResponse.model_validate(deck) for deck in decks]


@router.get("/{deck_id}", response_model=DeckResponse)
async def get_deck(deck_id: int, session: Session = Depends(get_session)):
    """Get a specific deck by ID."""
    deck = session.get(Deck, deck_id)
    if not deck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deck not found"
        )
    return DeckResponse.model_validate(deck)


@router.get("/{deck_id}/detail", response_model=DeckDetailResponse)
async def get_deck_detail(deck_id: int, session: Session = Depends(get_session)):
    """Get a deck with all its flashcards."""
    deck = session.get(Deck, deck_id)
    if not deck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deck not found"
        )
    
    # Get all flashcards for this deck
    statement = select(Flashcard).where(Flashcard.deck_id == deck_id)
    flashcards = session.exec(statement).all()
    
    return DeckDetailResponse(
        id=deck.id,
        title=deck.title,
        description=deck.description,
        user_id=deck.user_id,
        created_at=deck.created_at.isoformat(),
        flashcards=[FlashcardResponse.model_validate(fc) for fc in flashcards],
        summary=None  # Summary is not stored in DB (MVP limitation)
    )


@router.delete("/{deck_id}")
async def delete_deck(
    deck_id: int,
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    """Delete a deck and its flashcards."""
    deck = session.get(Deck, deck_id)
    if not deck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deck not found"
        )
    
    # Check if user owns this deck
    user_id = get_user_id_from_token(authorization)
    if user_id and deck.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this deck"
        )
    
    # Delete associated flashcards
    statement = select(Flashcard).where(Flashcard.deck_id == deck_id)
    flashcards = session.exec(statement).all()
    for flashcard in flashcards:
        session.delete(flashcard)
    
    session.delete(deck)
    session.commit()
    
    return {"message": "Deck deleted successfully"}
