from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from app.database import get_session
from app.models.deck import Deck, DeckCreate, DeckResponse
from app.models.flashcard import Flashcard, FlashcardCreate, FlashcardResponse
from app.services.ai_service import generate_flashcards, generate_summary, generate_both
from pydantic import BaseModel

router = APIRouter(prefix="/generate", tags=["generation"])


class GenerateRequest(BaseModel):
    text: str
    num_cards: int = 10
    mode: str = "both"  # "flashcards", "summary", or "both"


class GenerateResponse(BaseModel):
    deck: Optional[DeckResponse] = None
    flashcards: Optional[List[FlashcardResponse]] = None
    summary: Optional[str] = None


@router.post("", response_model=GenerateResponse)
async def generate_content(
    request: GenerateRequest,
    session: Session = Depends(get_session)
):
    """Generate flashcards and/or summary from text using AI."""
    
    try:
        if request.mode == "flashcards":
            # Generate only flashcards
            flashcard_pairs = await generate_flashcards(request.text, request.num_cards)
            
            # Create a deck
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
            
            for flashcard in created_flashcards:
                session.refresh(flashcard)
            
            return GenerateResponse(
                deck=DeckResponse.model_validate(deck),
                flashcards=[FlashcardResponse.model_validate(fc) for fc in created_flashcards]
            )
            
        elif request.mode == "summary":
            # Generate only summary
            summary_text = await generate_summary(request.text)
            
            return GenerateResponse(
                summary=summary_text
            )
            
        else:  # mode == "both"
            # Generate both flashcards and summary
            result = await generate_both(request.text, request.num_cards)
            
            # Create a deck for flashcards
            flashcard_pairs = result['flashcards']
            deck = Deck(
                title="Generated Deck",
                description=f"Generated from text ({len(flashcard_pairs)} cards + summary)",
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
            
            for flashcard in created_flashcards:
                session.refresh(flashcard)
            
            return GenerateResponse(
                deck=DeckResponse.model_validate(deck),
                flashcards=[FlashcardResponse.model_validate(fc) for fc in created_flashcards],
                summary=result['summary']
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate content: {str(e)}"
        )
