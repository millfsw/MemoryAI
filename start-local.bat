@echo off
REM Quick start script for MemoryAI (No Docker required)

echo ========================================
echo   MemoryAI - Local Development Setup
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is required
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is required
    pause
    exit /b 1
)

echo [1/4] Setting up Backend...
echo.

REM Create backend virtual environment
cd backend
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing backend dependencies...
pip install -e .

echo.
echo [2/4] Setting up Frontend...
echo.
cd ..\client-web-react

REM Install frontend dependencies
where pnpm >nul 2>&1
if %errorlevel% equ 0 (
    echo Installing with pnpm...
    pnpm install
) else (
    echo Installing with npm...
    npm install
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start the project:
echo.
echo   Terminal 1 (Backend):
echo     cd backend
echo     venv\Scripts\activate
echo     python -m app.run
echo.
echo   Terminal 2 (Frontend):
echo     cd client-web-react
echo     npm run dev
echo.
echo Don't forget to set your AI_API_KEY in .env file!
echo.
pause
