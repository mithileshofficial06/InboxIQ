@echo off
REM InboxIQ — Environment Setup Script (Windows)
REM Usage: setup-env.bat

echo.
echo 🔧 InboxIQ Environment Setup
echo ============================
echo.

REM Root .env
if not exist ".env" (
    echo 📋 Creating .env from .env.example...
    copy .env.example .env
    echo ✅ Created .env
    echo    → Edit .env with your rotated credentials
) else (
    echo ⏭️  .env already exists
)

echo.

REM Frontend .env.local
if not exist "frontend\.env.local" (
    echo 📋 Creating frontend\.env.local...
    copy frontend\.env.local.example frontend\.env.local
    echo ✅ Created frontend\.env.local
) else (
    echo ⏭️  frontend\.env.local already exists
)

echo.

REM AI Service .env
if not exist "ai-service\.env" (
    echo 📋 Creating ai-service\.env...
    copy ai-service\.env.example ai-service\.env
    echo ✅ Created ai-service\.env
    echo    → Copy DATABASE_URL and GEMINI_API_KEY from root .env
) else (
    echo ⏭️  ai-service\.env already exists
)

echo.
echo ✨ Setup complete!
echo.
echo 📝 Next steps:
echo    1. Edit .env with your rotated credentials
echo    2. Copy DATABASE_URL ^& GEMINI_API_KEY to ai-service\.env
echo    3. Run: npm install
echo    4. cd backend ^&^& npm install
echo    5. cd ..\frontend ^&^& npm install
echo.
