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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get AI response: {str(e)}"
        )
