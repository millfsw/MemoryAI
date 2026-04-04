# MemoryAI (AI Flashcard Generator)

## Project Overview

A web-based application that uses Large Language Models (LLMs) to automatically transform study materials and lecture notes into interactive flashcards for efficient memorization.

### End-user
Students and lifelong learners who need to quickly prepare for exams, certifications, or master large volumes of textual information.

### What problem does it solve?
It solves the problem of "passive reading," where students simply skim text without retaining information. The key feature is the automated extraction of core concepts: the AI identifies the most important facts and rephrases them into "Question-Answer" pairs, saving the user hours of manual note-taking.

### Product idea in one sentence
An AI-powered flashcard generator that converts lecture notes and study materials into interactive question-answer cards for efficient exam preparation.

### Core feature
AI-powered generation: instantly converts raw text into structured study cards using an LLM API.

### Main Features
1. **AI-Powered Generation**: Converts raw text into structured study cards using an LLM API.
2. **Interactive Study Mode**: A "flip-card" interface where users see a question, recall the answer, and click to reveal it.
3. **Personal Library**: A database-backed storage system that allows users to save, view, and revisit their generated card decks later.

---

## Implementation Plan

### Version 1 (MVP — Core functionality)

**Goal**: A fully functional pipeline: Input Text → AI Processing → Database Storage → Display Result.

#### Backend
- Python (FastAPI/Flask) or Node.js (Express) server
- Handles requests from the client
- Sends text to an LLM API (e.g., OpenAI or GigaChat)
- Parses the LLM response and returns structured flashcards

#### Database
- Relational database (PostgreSQL or SQLite)
- Simple schema:
  - **Users**: id, username, password_hash
  - **Decks**: id, user_id, title, created_at
  - **Flashcards**: id, deck_id, question, answer

#### Client
- Clean web interface with:
  - Text input area for study materials
  - "Generate" button
  - Display area showing generated question-answer pairs

#### Deliverable
A functioning product that takes raw text, processes it through AI, stores results in the database, and displays flashcards to the user.

---

### Version 2 (Improvements & Deployment)

**Goal**: Improve UX, add user management, and deploy to make it publicly accessible.

#### Interactive UI
- Implement "Study Mode" with flip-card animations (front/back)
- Cards displayed one by one for focused studying

#### Manual Editing
- Allow users to delete irrelevant AI-generated cards
- Enable editing of question/answer text to fix inaccuracies

#### Authentication
- Simple login/registration system
- Users have private collections of card decks

#### Deployment
- Containerize the application using Docker (Backend + Database)
- Deploy to university VM
- Make it accessible via web browser

#### Address TA Feedback
- Incorporate feedback received from demonstrating Version 1

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | FastAPI (Python) or Express (Node.js) |
| Database | PostgreSQL / SQLite |
| Frontend | React + Bootstrap / Vanilla HTML/CSS/JS |
| AI | OpenAI API / GigaChat API |
| Deployment | Docker + University VM |

---

## Project Structure (planned)

```
MemoryAI/
├── backend/
│   ├── app.py / main.py
│   ├── models.py
│   ├── routes/
│   └── services/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── database/
│   └── schema.sql
├── docker-compose.yml
├── Dockerfile
└── README.md
```
