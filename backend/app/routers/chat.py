from fastapi import APIRouter, HTTPException, status, Header
from typing import Optional
from pydantic import BaseModel

from app.services.ai_service import chat_with_ai

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    context: str = ""


class ChatResponse(BaseModel):
    response: str


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    """Chat with AI about study material."""
    try:
        response = await chat_with_ai(request.message, request.context)
        return ChatResponse(response=response)
    except ValueError as e:
        # Handle AI configuration errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Handle all other errors
        error_detail = str(e)
        if "AI API error" in error_detail or "AI_API_KEY" in error_detail:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_detail
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get AI response: {error_detail}"
        )
