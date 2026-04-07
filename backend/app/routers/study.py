from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlmodel import Session, select
from typing import Optional
from datetime import datetime, timedelta

from app.database import get_session
from app.models.card_progress import CardProgress, CardProgressCreate, CardProgressResponse
from app.models.flashcard import Flashcard
from app.services.auth_service import decode_access_token

router = APIRouter(prefix="/study", tags=["spaced-repetition"])


def get_user_id(authorization: Optional[str] = Header(None)) -> int:
    """Extract user ID from JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    return int(payload["sub"])


@router.post("/review/{flashcard_id}", response_model=CardProgressResponse)
async def review_card(
    flashcard_id: int,
    review: CardProgressCreate,
    user_id: int = Depends(get_user_id),
    session: Session = Depends(get_session)
):
    """
    Review a flashcard and update spaced repetition progress.
    Uses SM-2 algorithm (simplified).
    """
    # Verify flashcard exists
    flashcard = session.get(Flashcard, flashcard_id)
    if not flashcard:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flashcard not found")
    
    # Find existing progress or create new
    statement = select(CardProgress).where(
        CardProgress.flashcard_id == flashcard_id,
        CardProgress.user_id == user_id
    )
    progress = session.exec(statement).first()
    
    if not progress:
        progress = CardProgress(
            flashcard_id=flashcard_id,
            user_id=user_id,
            is_known=review.is_known
        )
        session.add(progress)
        session.commit()
        session.refresh(progress)
    
    # Update progress using simplified SM-2 algorithm
    now = datetime.utcnow()
    progress.last_reviewed = now
    
    if review.is_known:
        progress.is_known = True
        progress.repetitions += 1
        
        # Calculate new interval
        if progress.repetitions == 1:
            progress.interval = 1
        elif progress.repetitions == 2:
            progress.interval = 6
        else:
            progress.interval = int(progress.interval * progress.ease_factor)
    else:
        # Reset progress if not known
        progress.repetitions = 0
        progress.interval = 0
        progress.is_known = False
    
    # Calculate next review date
    progress.next_review = now + timedelta(days=progress.interval)
    
    # Update ease factor (simplified)
    if review.is_known:
        progress.ease_factor = min(2.5, progress.ease_factor + 0.1)
    else:
        progress.ease_factor = max(1.3, progress.ease_factor - 0.2)
    
    session.add(progress)
    session.commit()
    session.refresh(progress)
    
    return progress


@router.get("/deck/{deck_id}/due")
async def get_due_cards(
    deck_id: int,
    user_id: int = Depends(get_user_id),
    session: Session = Depends(get_session)
):
    """Get flashcards that are due for review in a deck."""
    now = datetime.utcnow()
    
    # Get all flashcards in deck
    statement = select(Flashcard).where(Flashcard.deck_id == deck_id)
    flashcards = session.exec(statement).all()
    
    due_cards = []
    for fc in flashcards:
        # Get progress for this card
        progress_stmt = select(CardProgress).where(
            CardProgress.flashcard_id == fc.id,
            CardProgress.user_id == user_id
        )
        progress = session.exec(progress_stmt).first()
        
        # Card is due if: no progress, or next_review has passed
        if not progress or (progress.next_review and progress.next_review <= now):
            due_cards.append({
                "flashcard": {
                    "id": fc.id,
                    "question": fc.question,
                    "answer": fc.answer
                },
                "progress": CardProgressResponse.model_validate(progress).dict() if progress else None
            })
    
    return {
        "deck_id": deck_id,
        "total_cards": len(flashcards),
        "due_cards": len(due_cards),
        "cards": due_cards
    }


@router.get("/progress")
async def get_study_progress(
    user_id: int = Depends(get_user_id),
    session: Session = Depends(get_session)
):
    """Get overall study progress for the user."""
    statement = select(CardProgress).where(CardProgress.user_id == user_id)
    all_progress = session.exec(statement).all()
    
    total_cards = len(all_progress)
    known_cards = sum(1 for p in all_progress if p.is_known)
    due_today = sum(
        1 for p in all_progress 
        if p.next_review and p.next_review <= datetime.utcnow()
    )
    
    return {
        "total_reviewed": total_cards,
        "cards_known": known_cards,
        "cards_due_today": due_today,
        "mastery_percentage": round((known_cards / total_cards * 100) if total_cards > 0 else 0, 1)
    }
