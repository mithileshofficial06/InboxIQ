#!/bin/bash
# InboxIQ — Environment Setup Script
# Usage: chmod +x setup-env.sh && ./setup-env.sh

echo "🔧 InboxIQ Environment Setup"
echo "============================"
echo ""

# Root .env
if [ ! -f ".env" ]; then
    echo "📋 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env"
    echo "   → Edit .env with your rotated credentials"
else
    echo "⏭️  .env already exists"
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    echo "📋 Creating frontend/.env.local..."
    cp frontend/.env.local.example frontend/.env.local
    echo "✅ Created frontend/.env.local"
else
    echo "⏭️  frontend/.env.local already exists"
fi

# AI Service .env
if [ ! -f "ai-service/.env" ]; then
    echo "📋 Creating ai-service/.env..."
    cp ai-service/.env.example ai-service/.env
    echo "✅ Created ai-service/.env"
    echo "   → Copy DATABASE_URL and GEMINI_API_KEY from root .env"
else
    echo "⏭️  ai-service/.env already exists"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env with your rotated credentials"
echo "   2. Copy DATABASE_URL & GEMINI_API_KEY to ai-service/.env"
echo "   3. Run: npm install && cd backend && npm install && cd ../frontend && npm install"
echo ""
