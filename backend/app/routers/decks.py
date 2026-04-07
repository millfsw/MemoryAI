from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.database import get_session
from app.models.deck import Deck, DeckCreate, DeckResponse
from app.models.flashcard import Flashcard, FlashcardCreate, FlashcardResponse, FlashcardUpdate

router = APIRouter(prefix="/decks", tags=["decks"])


@router.get("", response_model=List[DeckResponse])
async def get_decks(session: Session = Depends(get_session)):
    """Get all decks (for MVP, returns all decks)."""
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


@router.delete("/{deck_id}")
async def delete_deck(deck_id: int, session: Session = Depends(get_session)):
    """Delete a deck and its flashcards."""
    deck = session.get(Deck, deck_id)
    if not deck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deck not found"
        )
    
    # Delete associated flashcards
    statement = select(Flashcard).where(Flashcard.deck_id == deck_id)
    flashcards = session.exec(statement).all()
    for flashcard in flashcards:
        session.delete(flashcard)
    
    session.delete(deck)
    session.commit()
    
    return {"message": "Deck deleted successfully"}
