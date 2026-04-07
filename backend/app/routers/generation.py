from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.database import get_session
from app.models.deck import Deck, DeckCreate, DeckResponse
from app.models.flashcard import Flashcard, FlashcardCreate, FlashcardResponse
from app.services.ai_service import generate_flashcards
from pydantic import BaseModel

router = APIRouter(prefix="/generate", tags=["generation"])


class GenerateRequest(BaseModel):
    text: str
    num_cards: int = 10


class GenerateResponse(BaseModel):
    deck: DeckResponse
    flashcards: List[FlashcardResponse]


@router.post("", response_model=GenerateResponse)
async def generate_deck(
    request: GenerateRequest,
    session: Session = Depends(get_session)
):
    """Generate flashcards from text using AI."""
    try:
        # Call AI service to generate flashcards
        flashcard_pairs = await generate_flashcards(request.text, request.num_cards)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate flashcards: {str(e)}"
        )
    
    # Create a deck (user_id=0 for MVP, will be replaced with actual user ID)
    deck = Deck(
        title="Generated Deck",
        description=f"Generated from text ({len(flashcard_pairs)} cards)",
        user_id=0  # TODO: Get from authenticated user
    )
    
    session.add(deck)
    session.commit()
    session.refresh(deck)
    
    # Create flashcards
    created_flashcards = []
    for pair in flashcard_pairs:
        flashcard = Flashcard(
            question=pair.question,
            answer=pair.answer,
            deck_id=deck.id
        )
        session.add(flashcard)
        created_flashcards.append(flashcard)
    
    session.commit()
    
    # Refresh all flashcards
    for flashcard in created_flashcards:
        session.refresh(flashcard)
    
    return GenerateResponse(
        deck=DeckResponse.model_validate(deck),
        flashcards=[FlashcardResponse.model_validate(fc) for fc in created_flashcards]
    )
