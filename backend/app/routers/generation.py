from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlmodel import Session, select
from typing import List, Optional
from app.database import get_session
from app.models.deck import Deck, DeckCreate, DeckResponse
from app.models.flashcard import Flashcard, FlashcardCreate, FlashcardResponse
from app.services.ai_service import generate_flashcards, generate_summary, generate_both
from app.services.file_service import extract_text, validate_file
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


async def process_content(text: str, num_cards: int, mode: str, session: Session):
    """Process text and generate content."""
    
    if mode == "flashcards":
        # Generate only flashcards
        flashcard_pairs = await generate_flashcards(text, num_cards)
        
        # Create a deck
        deck = Deck(
            title="Generated Deck",
            description=f"Generated from text ({len(flashcard_pairs)} cards)",
            # user_id=None  # Will be set when auth is implemented)
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
        
    elif mode == "summary":
        # Generate only summary
        summary_text = await generate_summary(text)
        
        return GenerateResponse(
            summary=summary_text
        )
        
    else:  # mode == "both"
        # Generate both flashcards and summary
        result = await generate_both(text, num_cards)
        
        # Create a deck for flashcards
        flashcard_pairs = result['flashcards']
        deck = Deck(
            title="Generated Deck",
            description=f"Generated from text ({len(flashcard_pairs)} cards + summary)",
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


@router.post("", response_model=GenerateResponse)
async def generate_content(
    request: GenerateRequest,
    session: Session = Depends(get_session)
):
    """Generate flashcards and/or summary from text using AI."""
    
    try:
        return await process_content(request.text, request.num_cards, request.mode, session)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate content: {str(e)}"
        )


@router.post("/upload", response_model=GenerateResponse)
async def upload_and_generate(
    file: UploadFile = File(...),
    num_cards: int = Form(10),
    mode: str = Form("both"),
    session: Session = Depends(get_session)
):
    """Upload a file and generate flashcards/summary from it."""
    
    try:
        # Validate file
        validate_file(file.filename)
        
        # Read file content
        file_content = await file.read()
        
        # Check file size (max 10MB)
        if len(file_content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds 10MB limit"
            )
        
        # Extract text
        text = extract_text(file_content, file.filename)
        
        if not text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No text content found in file"
            )
        
        # Process content
        return await process_content(text, num_cards, mode, session)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process file: {str(e)}"
        )
