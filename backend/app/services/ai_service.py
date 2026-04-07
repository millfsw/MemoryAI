from typing import List, Optional
from openai import AsyncOpenAI
from pydantic import BaseModel
import json
import openai

from app.settings import settings


class FlashcardPair(BaseModel):
    question: str
    answer: str


class FlashcardResponse(BaseModel):
    flashcards: List[FlashcardPair]


def validate_api_key():
    """Validate that API key is configured."""
    if not settings.AI_API_KEY:
        raise ValueError(
            "AI_API_KEY is not configured. "
            "Please set the AI_API_KEY environment variable in your .env file. "
            "Get your API key from your AI provider (e.g., DashScope, OpenAI, etc.)."
        )


async def generate_topic(text: str) -> str:
    """Generate a short topic/title from text."""
    validate_api_key()
    
    client = AsyncOpenAI(
        api_key=settings.AI_API_KEY,
        base_url=settings.AI_API_BASE_URL,
    )

    prompt = f"""Extract the main topic of this text in 3-5 words. Return ONLY the topic, nothing else.

Text:
{text[:500]}

Topic:"""

    try:
        response = await client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You extract concise topic titles from text."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=50,
        )
    except openai.APIStatusError as e:
        raise ValueError(f"AI API error ({e.status_code}): {e.message}. Please check your AI_API_KEY and try again.")

    return response.choices[0].message.content.strip()


async def generate_flashcards(text: str, num_cards: int = 10) -> List[FlashcardPair]:
    """
    Send text to AI and get flashcard pairs back.
    Uses OpenAI-compatible API.
    """
    validate_api_key()
    
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

    try:
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
    except openai.APIStatusError as e:
        raise ValueError(f"AI API error ({e.status_code}): {e.message}. Please check your AI_API_KEY and try again.")
    
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
    validate_api_key()
    
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
- Use **bold** to highlight important terms and concepts

Text to summarize:
{text}

Summary:"""

    try:
        response = await client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert tutor who creates clear, well-structured study summaries. You use **bold** to highlight important terms and concepts."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=1500,
        )
    except openai.APIStatusError as e:
        raise ValueError(f"AI API error ({e.status_code}): {e.message}. Please check your AI_API_KEY and try again.")
    
    return response.choices[0].message.content


async def generate_both(text: str, num_cards: int = 10) -> dict:
    """
    Generate both flashcards and summary from text.
    Uses two separate AI calls for better quality.
    """
    import asyncio
    
    # Run all three generations in parallel
    flashcards_task = generate_flashcards(text, num_cards)
    summary_task = generate_summary(text)
    topic_task = generate_topic(text)
    
    flashcards, summary, topic = await asyncio.gather(
        flashcards_task, 
        summary_task,
        topic_task,
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
    
    if isinstance(topic, Exception):
        result['topic'] = 'Generated Deck'
    else:
        result['topic'] = topic
    
    return result


async def chat_with_ai(message: str, context: str = "") -> str:
    """Chat with AI about the study material."""
    validate_api_key()
    
    client = AsyncOpenAI(
        api_key=settings.AI_API_KEY,
        base_url=settings.AI_API_BASE_URL,
    )
    
    messages = [
        {
            "role": "system",
            "content": f"You are a helpful AI tutor. Help the user understand the material. {'The context material is: ' + context if context else ''} Answer questions clearly and provide examples when helpful."
        },
        {
            "role": "user",
            "content": message
        }
    ]
    
    try:
        response = await client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1000,
        )
    except openai.APIStatusError as e:
        raise ValueError(f"AI API error ({e.status_code}): {e.message}. Please check your AI_API_KEY and try again.")
    
    return response.choices[0].message.content
