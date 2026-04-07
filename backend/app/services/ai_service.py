from typing import List, Optional
from openai import AsyncOpenAI
from pydantic import BaseModel
import json

from app.settings import settings


class FlashcardPair(BaseModel):
    question: str
    answer: str


class FlashcardResponse(BaseModel):
    flashcards: List[FlashcardPair]


async def generate_flashcards(text: str, num_cards: int = 10) -> List[FlashcardPair]:
    """
    Send text to AI and get flashcard pairs back.
    Uses OpenAI-compatible API.
    """
    client = AsyncOpenAI(
        api_key=settings.AI_API_KEY,
        base_url=settings.AI_API_BASE_URL,
    )
    
    prompt = f"""Convert the following text into {num_cards} flashcard question-answer pairs.
Each question should test a key concept from the text, and the answer should be clear and concise.

Format the response as a JSON array with this exact structure:
{{
  "flashcards": [
    {{"question": "Question 1", "answer": "Answer 1"}},
    {{"question": "Question 2", "answer": "Answer 2"}}
  ]
}}

Text to convert:
{text}

Respond ONLY with valid JSON, no additional text."""

    response = await client.chat.completions.create(
        model=settings.AI_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that creates educational flashcards. You always respond with valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7,
        max_tokens=2000,
    )
    
    try:
        # Parse the JSON response
        content = response.choices[0].message.content
        # Remove markdown code blocks if present
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        data = FlashcardResponse.model_validate_json(content)
        return data.flashcards
    except Exception as e:
        raise ValueError(f"Failed to parse AI response as flashcards: {str(e)}")


async def generate_summary(text: str) -> str:
    """
    Generate a concise summary from the text.
    Uses OpenAI-compatible API.
    """
    client = AsyncOpenAI(
        api_key=settings.AI_API_KEY,
        base_url=settings.AI_API_BASE_URL,
    )
    
    prompt = f"""Create a well-structured study summary of the following text.

Requirements:
- Extract and highlight the key concepts and main ideas
- Use bullet points or numbered lists for clarity
- Keep it concise but comprehensive
- Focus on information that would be important for exams or understanding
- Format with clear headings and structure

Text to summarize:
{text}

Summary:"""

    response = await client.chat.completions.create(
        model=settings.AI_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are an expert tutor who creates clear, well-structured study summaries. You focus on key concepts and present them in an organized way that helps students understand and remember the material."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7,
        max_tokens=1500,
    )
    
    return response.choices[0].message.content


async def generate_both(text: str, num_cards: int = 10) -> dict:
    """
    Generate both flashcards and summary from text.
    Uses two separate AI calls for better quality.
    """
    import asyncio
    
    # Run both generations in parallel for faster response
    flashcards_task = generate_flashcards(text, num_cards)
    summary_task = generate_summary(text)
    
    flashcards, summary = await asyncio.gather(
        flashcards_task, 
        summary_task,
        return_exceptions=True
    )
    
    result = {}
    
    if isinstance(flashcards, Exception):
        raise ValueError(f"Flashcard generation failed: {str(flashcards)}")
    else:
        result['flashcards'] = flashcards
    
    if isinstance(summary, Exception):
        raise ValueError(f"Summary generation failed: {str(summary)}")
    else:
        result['summary'] = summary
    
    return result
