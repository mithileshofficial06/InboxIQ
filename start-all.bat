@echo off
echo ========================================
echo   Starting InboxIQ - All Services
echo ========================================
echo.

REM Start Backend (Node.js)
echo [1/3] Starting Backend on port 3001...
start "InboxIQ Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

REM Start AI Service (Python)
echo [2/3] Starting AI Service on port 8000...
start "InboxIQ AI Service" cmd /k "cd ai-service && call venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"
timeout /t 3 /nobreak >nul

REM Start Frontend (Next.js)
echo [3/3] Starting Frontend on port 3000...
start "InboxIQ Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   All services started!
echo ========================================
echo.
echo Backend:   http://localhost:3001
echo AI Service: http://localhost:8000
echo Frontend:   http://localhost:3000
echo.
echo Press any key to exit this window...
echo (The services will keep running)
pause >nul
