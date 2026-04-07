from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.database import get_session
from app.models.flashcard import Flashcard, FlashcardCreate, FlashcardResponse, FlashcardUpdate

router = APIRouter(prefix="/flashcards", tags=["flashcards"])


@router.get("/deck/{deck_id}", response_model=List[FlashcardResponse])
async def get_flashcards_by_deck(deck_id: int, session: Session = Depends(get_session)):
    """Get all flashcards in a deck."""
    statement = select(Flashcard).where(Flashcard.deck_id == deck_id)
    flashcards = session.exec(statement).all()
    return [FlashcardResponse.model_validate(fc) for fc in flashcards]


@router.get("/{flashcard_id}", response_model=FlashcardResponse)
async def get_flashcard(flashcard_id: int, session: Session = Depends(get_session)):
    """Get a specific flashcard by ID."""
    flashcard = session.get(Flashcard, flashcard_id)
    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    return FlashcardResponse.model_validate(flashcard)


@router.put("/{flashcard_id}", response_model=FlashcardResponse)
async def update_flashcard(
    flashcard_id: int,
    flashcard_data: FlashcardUpdate,
    session: Session = Depends(get_session)
):
    """Update a flashcard."""
    flashcard = session.get(Flashcard, flashcard_id)
    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    
    update_data = flashcard_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(flashcard, key, value)
    
    session.add(flashcard)
    session.commit()
    session.refresh(flashcard)
    
    return FlashcardResponse.model_validate(flashcard)


@router.delete("/{flashcard_id}")
async def delete_flashcard(flashcard_id: int, session: Session = Depends(get_session)):
    """Delete a flashcard."""
    flashcard = session.get(Flashcard, flashcard_id)
    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    
    session.delete(flashcard)
    session.commit()
    
    return {"message": "Flashcard deleted successfully"}
