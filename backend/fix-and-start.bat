@echo off
echo ======================================
echo   InboxIQ Backend - Fix and Start
echo ======================================
echo.

echo [Step 1/3] Stopping any running processes on port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do (
    echo Killing process ID: %%a
    taskkill /F /PID %%a 2>nul
)
echo Done!
echo.

echo [Step 2/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [Step 3/3] Starting backend server...
echo.
echo Backend will start on http://localhost:3001
echo Press Ctrl+C to stop
echo.
call npm run dev
