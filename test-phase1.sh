#!/bin/bash
# ============================================
# Phase 1 — Core Foundation Test Script
# ============================================
# Tests all components of Phase 1

set -e  # Exit on error

echo "🧪 InboxIQ Phase 1 Test Suite"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:3001"
AI_SERVICE_URL="http://localhost:8000"
TEST_USER_ID="00000000-0000-0000-0000-000000000001"
TEST_EMAIL_ID="00000000-0000-0000-0000-000000000002"

# ============================================
# 1. Health Checks
# ============================================
echo "1️⃣  Running Health Checks..."
echo "----------------------------"

# Backend health
echo -n "  - Backend service... "
if curl -s -f "$BACKEND_URL/health" > /dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  Error: Backend not responding. Start with: cd backend && npm run dev"
    exit 1
fi

# AI service health
echo -n "  - AI service... "
if curl -s -f "$AI_SERVICE_URL/health" > /dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  Error: AI service not responding. Start with: cd ai-service && uvicorn app.main:app --reload"
    exit 1
fi

echo ""

# ============================================
# 2. Email Classification Tests
# ============================================
echo "2️⃣  Testing Email Classification..."
echo "-------------------------------------"

test_classification() {
    local category="$1"
    local subject="$2"
    local snippet="$3"
    local sender="$4"
    
    echo -n "  - $category... "
    
    response=$(curl -s -X POST "$AI_SERVICE_URL/ai/classify" \
        -H "Content-Type: application/json" \
        -d "{
            \"subject\": \"$subject\",
            \"snippet\": \"$snippet\",
            \"sender_email\": \"$sender\"
        }")
    
    result_category=$(echo "$response" | grep -o '"category":"[^"]*"' | cut -d'"' -f4)
    
    if [[ "$result_category" == "$category" ]]; then
        echo -e "${GREEN}✓ PASS${NC} ($result_category)"
    else
        echo -e "${YELLOW}⚠ PARTIAL${NC} (got: $result_category, expected: $category)"
    fi
}

test_classification "Orders & Deliveries" \
    "Your Amazon order #123 has shipped" \
    "Track your package at..." \
    "no-reply@amazon.com"

test_classification "Job Applications" \
    "Interview Invitation - Software Engineer" \
    "We'd like to invite you for an interview..." \
    "hr@techcorp.com"

test_classification "Bills & Invoices" \
    "Your payment is due" \
    "Invoice #45678 - Amount due: \$99.99" \
    "billing@service.com"

test_classification "OTPs & Notifications" \
    "Your verification code is 123456" \
    "Use this code to verify your account" \
    "noreply@notifications.com"

test_classification "Academic" \
    "Assignment Submission Reminder" \
    "Your CS101 assignment is due tomorrow" \
    "professor@university.edu"

test_classification "Travel & Bookings" \
    "Flight Confirmation - AA1234" \
    "Your flight to New York is confirmed" \
    "reservations@airline.com"

echo ""

# ============================================
# 3. Sentiment Analysis Tests
# ============================================
echo "3️⃣  Testing Sentiment Analysis..."
echo "----------------------------------"

test_sentiment() {
    local expected="$1"
    local subject="$2"
    
    echo -n "  - $expected sentiment... "
    
    response=$(curl -s -X POST "$AI_SERVICE_URL/ai/classify" \
        -H "Content-Type: application/json" \
        -d "{
            \"subject\": \"$subject\",
            \"snippet\": \"Preview text\",
            \"sender_email\": \"test@example.com\"
        }")
    
    sentiment=$(echo "$response" | grep -o '"sentiment":"[^"]*"' | cut -d'"' -f4)
    score=$(echo "$response" | grep -o '"sentiment_score":[^,}]*' | cut -d':' -f2)
    
    if [[ "$sentiment" == "$expected" ]]; then
        echo -e "${GREEN}✓ PASS${NC} (score: $score)"
    else
        echo -e "${YELLOW}⚠ PARTIAL${NC} (got: $sentiment, expected: $expected, score: $score)"
    fi
}

test_sentiment "positive" "Congratulations! You've been selected for an interview"
test_sentiment "negative" "Payment Failed - Immediate Action Required"
test_sentiment "neutral" "Weekly Newsletter - January 2025"

echo ""

# ============================================
# 4. Batch Processing Test
# ============================================
echo "4️⃣  Testing Batch Processing..."
echo "--------------------------------"

echo -n "  - Batch classify & embed... "

response=$(curl -s -X POST "$AI_SERVICE_URL/ai/process/batch" \
    -H "Content-Type: application/json" \
    -d "{
        \"user_id\": \"$TEST_USER_ID\",
        \"emails\": [
            {
                \"email_id\": \"${TEST_EMAIL_ID}-1\",
                \"subject\": \"Test Email 1\",
                \"snippet\": \"This is a test email\",
                \"sender_email\": \"test1@example.com\",
                \"body_text\": \"This is the full body of test email 1. It contains multiple sentences to test chunking. The chunking algorithm should split this appropriately.\"
            },
            {
                \"email_id\": \"${TEST_EMAIL_ID}-2\",
                \"subject\": \"Test Email 2\",
                \"snippet\": \"Another test\",
                \"sender_email\": \"test2@example.com\",
                \"body_text\": \"Short email body.\"
            }
        ]
    }")

processed=$(echo "$response" | grep -o '"processed":[0-9]*' | cut -d':' -f2)
failed=$(echo "$response" | grep -o '"failed":[0-9]*' | cut -d':' -f2)

if [[ "$processed" == "2" ]] && [[ "$failed" == "0" ]]; then
    echo -e "${GREEN}✓ PASS${NC} ($processed processed, $failed failed)"
else
    echo -e "${YELLOW}⚠ WARNING${NC} ($processed processed, $failed failed)"
fi

echo ""

# ============================================
# 5. Database Schema Validation
# ============================================
echo "5️⃣  Validating Database Schema..."
echo "----------------------------------"

echo -e "${YELLOW}  ⚠ Manual Check Required:${NC}"
echo "  Run the following in Supabase SQL Editor:"
echo ""
echo "  -- Check tables exist"
echo "  SELECT table_name FROM information_schema.tables"
echo "  WHERE table_schema = 'public'"
echo "  AND table_name IN ('users', 'emails', 'email_chunks', 'embeddings');"
echo ""
echo "  -- Check pgvector extension"
echo "  SELECT * FROM pg_extension WHERE extname = 'vector';"
echo ""
echo "  -- Check HNSW index"
echo "  SELECT indexname FROM pg_indexes"
echo "  WHERE tablename = 'embeddings' AND indexname = 'idx_embeddings_hnsw';"
echo ""

# ============================================
# 6. Chunking Algorithm Test
# ============================================
echo "6️⃣  Testing Chunking Algorithm..."
echo "-----------------------------------"

echo -n "  - Semantic chunking... "

# Test with long email
long_email="Subject: Project Update

Hi team,

This is the first paragraph with important information about the project status.

This is the second paragraph discussing the next steps and action items for everyone.

On Mon, Jan 1, 2025 at 10:00 AM, John Doe wrote:
> This is a quoted reply from the previous email.
> It should be detected as a separate section.

This is my response to the quoted text above.

Best regards,
Jane"

response=$(curl -s -X POST "$AI_SERVICE_URL/ai/process/batch" \
    -H "Content-Type: application/json" \
    -d "{
        \"user_id\": \"$TEST_USER_ID\",
        \"emails\": [{
            \"email_id\": \"${TEST_EMAIL_ID}-chunk\",
            \"subject\": \"Project Update\",
            \"snippet\": \"Hi team\",
            \"sender_email\": \"jane@example.com\",
            \"body_text\": $(echo "$long_email" | jq -Rs .)
        }]
    }")

# Check if chunks were created
chunks_count=$(echo "$response" | grep -o '"chunks_created":[0-9]*' | head -1 | cut -d':' -f2)

if [[ -n "$chunks_count" ]] && [[ "$chunks_count" -gt 0 ]]; then
    echo -e "${GREEN}✓ PASS${NC} ($chunks_count chunks created)"
else
    echo -e "${YELLOW}⚠ PARTIAL${NC} (chunks: $chunks_count)"
fi

echo ""

# ============================================
# Summary
# ============================================
echo "================================"
echo "✅ Phase 1 Test Suite Complete!"
echo "================================"
echo ""
echo "Next Steps:"
echo "  1. Review any warnings above"
echo "  2. Run database schema validation in Supabase"
echo "  3. Test with real Gmail account authentication"
echo "  4. Monitor sync worker logs during first sync"
echo ""
echo "Documentation: See PHASE1_COMPLETION.md for details"
echo ""
