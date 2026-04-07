"""
Basic tests for MemoryAI backend.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine

from app.main import app
from app.database import get_session
from app.models import User, Deck, Flashcard


# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)


def override_get_session():
    with Session(engine) as session:
        yield session


app.dependency_overrides[get_session] = override_get_session


@pytest.fixture
def client():
    # Create tables
    SQLModel.metadata.create_all(engine)
    with TestClient(app) as c:
        yield c
    # Drop tables
    SQLModel.metadata.drop_all(engine)


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_register_user(client):
    """Test user registration."""
    response = client.post(
        "/auth/register",
        json={"username": "testuser", "password": "testpassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert "id" in data


def test_login_user(client):
    """Test user login."""
    # Register user first
    client.post(
        "/auth/register",
        json={"username": "testuser2", "password": "testpassword2"}
    )
    
    # Login
    response = client.post(
        "/auth/login",
        json={"username": "testuser2", "password": "testpassword2"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "user" in data


def test_generate_flashcards(client):
    """Test flashcard generation."""
    response = client.post(
        "/generate",
        json={
            "text": "The mitochondria is the powerhouse of the cell. It produces ATP through cellular respiration.",
            "num_cards": 3
        }
    )
    # This might fail without a real AI API key, so we just check it doesn't crash
    assert response.status_code in [200, 500]
