@echo off
REM Setup script for MemoryAI project (Windows)

echo Setting up MemoryAI project...
echo.

REM Check if Python 3.10+ is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python 3 is required. Please install Python 3.10 or higher.
    exit /b 1
)

echo Python found

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is required. Please install Node.js 18 or higher.
    exit /b 1
)

echo Node.js found

REM Setup backend
echo.
echo Setting up backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing backend dependencies...
pip install -e .

cd ..

REM Setup frontend
echo.
echo Setting up frontend...
cd client-web-react

REM Install dependencies
echo Installing frontend dependencies...
where pnpm >nul 2>&1
if %errorlevel% equ 0 (
    pnpm install
) else (
    where npm >nul 2>&1
    if %errorlevel% equ 0 (
        npm install
    ) else (
        echo pnpm or npm is required for frontend installation.
        exit /b 1
    )
)

cd ..

REM Create .env file from example if it doesn't exist
if not exist ".env" (
    echo.
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please update .env with your actual configuration (especially AI_API_KEY)
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo    1. Update .env with your AI API key
echo    2. Run 'docker-compose up' to start with Docker
echo    OR
echo    2. Run 'python -m backend.app.run' for backend
echo    3. Run 'cd client-web-react ^&^& npm run dev' for frontend
echo.
pause
