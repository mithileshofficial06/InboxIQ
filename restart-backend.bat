@echo off
echo ========================================
echo   Restarting InboxIQ Backend
echo ========================================
echo.

cd backend

echo Killing any running node processes...
taskkill /F /IM node.exe /T >nul 2>&1

echo Clearing node modules cache...
if exist node_modules\.cache (
    rmdir /S /Q node_modules\.cache
)

echo.
echo Starting backend with fresh environment...
echo.

npm run dev
