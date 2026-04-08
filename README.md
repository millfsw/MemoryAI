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

---

## Demo

### Screenshots

**Login Page:**
![Login Page](https://via.placeholder.com/800x450/0d6e8b/ffffff?text=Login+Page)

**Generate Flashcards:**
![Generate Flashcards](https://via.placeholder.com/800x450/2d936c/ffffff?text=Generate+Flashcards)

**Study Mode:**
![Study Mode](https://via.placeholder.com/800x450/0a5a73/ffffff?text=Study+Mode)

> Replace the placeholder images above with actual screenshots of the deployed application.

---

## Features

### Implemented (Version 2)
- **AI-Powered Generation**: Converts raw text into structured study cards using LLM API (OpenRouter)
- **File Upload**: Upload PDF, DOCX, TXT files for flashcard generation
- **Interactive Study Mode**: Flip-card interface with "Known / Don't Know" progress tracking
- **Quiz Mode**: Multiple-choice questions generated from flashcards
- **AI Chat Sidebar**: Ask contextual questions about your study material with markdown-formatted responses
- **Authentication**: Registration, login, JWT-based sessions, password change
- **Personal Library**: Save, view, search, and delete generated card decks
- **Markdown AI Responses**: Formatted, readable AI responses (bold, lists, code blocks)
- **Docker Deployment**: Fully containerized with nginx reverse proxy

### Not Yet Implemented
- Manual editing of individual flashcard text
- Sharing decks with other users
- Spaced repetition algorithm (SM-2) for optimal review scheduling
- Mobile-responsive design improvements
- Multiple LLM provider support (fallback if one is down)

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
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL 15 |
| Frontend | React + TypeScript + Vite |
| AI | OpenRouter API (meta-llama/llama-3.1-70b-instruct) |
| Deployment | Docker Compose + nginx on Ubuntu 24.04 VM |

---

## Project Structure

```
MemoryAI/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entry point
│   │   ├── run.py                  # Server runner
│   │   ├── settings.py             # Configuration settings
│   │   ├── database.py             # Database connection and sessions
│   │   ├── models/                 # SQLModel database models
│   │   │   ├── __init__.py
│   │   │   ├── user.py             # User model
│   │   │   ├── deck.py             # Deck model
│   │   │   └── flashcard.py        # Flashcard model
│   │   ├── routers/                # API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── auth.py             # Authentication endpoints
│   │   │   ├── generation.py       # Flashcard generation endpoint
│   │   │   ├── decks.py            # Deck management endpoints
│   │   │   └── flashcards.py       # Flashcard CRUD endpoints
│   │   ├── services/               # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── ai_service.py       # AI/LLM integration
│   │   │   └── auth_service.py     # Authentication utilities
│   │   └── data/
│   │       └── init.sql            # Database initialization script
│   ├── tests/                      # Backend tests
│   │   └── __init__.py
│   ├── pyproject.toml              # Python dependencies
│   ├── Dockerfile                  # Backend Docker configuration
│   └── .dockerignore
├── client-web-react/
│   ├── src/
│   │   ├── main.tsx                # React application entry point
│   │   ├── App.tsx                 # Main React component
│   │   ├── App.css                 # App styles
│   │   ├── index.css               # Global styles
│   │   └── components/
│   │       ├── GenerationForm.tsx  # Text input form
│   │       └── FlashcardDisplay.tsx # Flashcard viewer
│   ├── package.json                # Node.js dependencies
│   ├── tsconfig.json               # TypeScript configuration
│   ├── vite.config.ts              # Vite bundler configuration
│   ├── index.html                  # HTML template
│   ├── Dockerfile                  # Frontend Docker configuration
│   ├── nginx.conf                  # Nginx configuration for production
│   └── .dockerignore
├── scripts/
│   ├── setup.sh                    # Unix setup script
│   ├── setup.bat                   # Windows setup script
│   ├── run-backend.sh              # Backend runner script
│   ├── run-frontend.sh             # Frontend runner script
│   └── init_db.py                  # Database initialization script
├── docker-compose.yml              # Docker Compose configuration
├── .env.example                    # Environment variables template
├── .env                            # Environment variables (local development)
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

---

## Quick Start

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher (with npm or pnpm)
- Docker and Docker Compose (for containerized deployment)
- OpenAI API key (or compatible LLM API)

### Option 1: Local Development

#### 1. Setup

**On Windows:**
```bash
scripts\setup.bat
```

**On Linux/Mac:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

#### 2. Configure Environment
Edit the `.env` file and add your AI API key:
```bash
AI_API_KEY=your-actual-api-key-here
```

#### 3. Run Backend
```bash
cd backend
# Activate virtual environment
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# Initialize database
python scripts/init_db.py

# Start server
python -m app.run
```

The backend will be available at `http://localhost:8000`

#### 4. Run Frontend
```bash
cd client-web-react
npm install  # or pnpm install
npm run dev  # or pnpm dev
```

The frontend will be available at `http://localhost:5173`

---

### Option 2: Docker Deployment

#### 1. Configure Environment
Edit the `.env` file with your configuration:
```bash
AI_API_KEY=your-actual-api-key-here
```

#### 2. Start Services
```bash
docker-compose up -d
```

This will start:
- Backend API at `http://localhost:8000`
- Frontend at `http://localhost:5173`
- PostgreSQL database at `http://localhost:5432`

#### 3. View Logs
```bash
docker-compose logs -f
```

#### 4. Stop Services
```bash
docker-compose down
```

---

## Deployment on VM

### Target Environment
- **OS**: Ubuntu 24.04 LTS (or compatible Linux distribution)
- **Architecture**: x86_64

### What Should Be Installed on VM
- **Docker** (latest stable)
- **Docker Compose** (V2 plugin — `docker compose` command)
- **Git** (for pulling the repository)

Install Docker on Ubuntu:
```bash
# Install prerequisites
sudo apt update
sudo apt install -y ca-certificates curl git

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER
# Log out and log back in for group changes to take effect
```

Docker Compose V2 is included with modern Docker installations.

### Step-by-Step Deployment Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/millfsw/se-toolkit-hackathon.git ~/MemoryAI
   cd ~/MemoryAI
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   nano .env  # Edit AI_API_KEY and other settings
   ```

3. **Start all services:**
   ```bash
   docker compose up -d --build
   ```

4. **Verify services are running:**
   ```bash
   docker compose ps
   docker compose logs -f
   ```

5. **Access the application:**
   - Frontend: `http://<VM_IP>:5173`
   - Backend API: `http://<VM_IP>:8000`
   - Health check: `http://<VM_IP>:8000/health`

6. **To update the application:**
   ```bash
   cd ~/MemoryAI
   git pull
   docker compose down
   docker compose up -d --build frontend
   ```

---

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `POST /auth/change-password` - Change user password

### Generation
- `POST /generate` - Generate flashcards from text
- `POST /generate/upload` - Generate flashcards from uploaded file

### Decks
- `GET /decks` - Get all decks
- `GET /decks/{deck_id}` - Get specific deck
- `GET /decks/{deck_id}/detail` - Get deck with flashcards
- `DELETE /decks/{deck_id}` - Delete a deck

### Flashcards
- `GET /flashcards/deck/{deck_id}` - Get all flashcards in a deck
- `GET /flashcards/{flashcard_id}` - Get specific flashcard
- `PUT /flashcards/{flashcard_id}` - Update a flashcard
- `DELETE /flashcards/{flashcard_id}` - Delete a flashcard

### Study
- `POST /study/review/{flashcard_id}` - Record a study review

### Chat
- `POST /chat` - Get AI chat response

### Health Check
- `GET /health` - Health check endpoint

---

## Development

### Backend Dependencies
```bash
cd backend
pip install -e .
```

### Frontend Dependencies
```bash
cd client-web-react
pnpm install  # or npm install
```

### Running Tests
```bash
cd backend
pytest
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_API_KEY` | Your OpenAI/GigaChat API key | Required |
| `AI_API_BASE_URL` | AI API base URL | `https://api.openai.com/v1` |
| `AI_MODEL` | AI model to use | `gpt-3.5-turbo` |
| `POSTGRES_DB` | Database name | `memoryai` |
| `POSTGRES_USER` | Database user | `memoryai` |
| `POSTGRES_PASSWORD` | Database password | `memoryai_password` |
| `BACKEND_PORT` | Backend server port | `8000` |
| `FRONTEND_PORT` | Frontend dev server port | `5173` |
| `SECRET_KEY` | JWT secret key | Change in production! |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with FastAPI and React
- Uses OpenRouter API for AI-powered flashcard generation
- Deployed with Docker on Ubuntu 24.04 VM

