@echo off
REM ============================================
REM Phase 1 - Core Foundation Test Script (Windows)
REM ============================================

setlocal enabledelayedexpansion

echo ========================================
echo  InboxIQ Phase 1 Test Suite (Windows)
echo ========================================
echo.

REM Configuration
set BACKEND_URL=http://localhost:3001
set AI_SERVICE_URL=http://localhost:8000
set TEST_USER_ID=00000000-0000-0000-0000-000000000001
set TEST_EMAIL_ID=00000000-0000-0000-0000-000000000002

REM ============================================
REM 1. Health Checks
REM ============================================
echo 1. Running Health Checks...
echo ----------------------------

echo   - Backend service...
curl -s -f %BACKEND_URL%/health > nul 2>&1
if %errorlevel%==0 (
    echo     [PASS] Backend is running
) else (
    echo     [FAIL] Backend not responding
    echo     Start with: cd backend ^& npm run dev
    exit /b 1
)

echo   - AI service...
curl -s -f %AI_SERVICE_URL%/health > nul 2>&1
if %errorlevel%==0 (
    echo     [PASS] AI service is running
) else (
    echo     [FAIL] AI service not responding
    echo     Start with: cd ai-service ^& uvicorn app.main:app --reload
    exit /b 1
)

echo.

REM ============================================
REM 2. Email Classification Tests
REM ============================================
echo 2. Testing Email Classification...
echo -------------------------------------

echo   - Testing Orders ^& Deliveries...
curl -s -X POST %AI_SERVICE_URL%/ai/classify ^
    -H "Content-Type: application/json" ^
    -d "{\"subject\":\"Your Amazon order has shipped\",\"snippet\":\"Track your package\",\"sender_email\":\"no-reply@amazon.com\"}" > temp_response.json
type temp_response.json
echo.

echo   - Testing Job Applications...
curl -s -X POST %AI_SERVICE_URL%/ai/classify ^
    -H "Content-Type: application/json" ^
    -d "{\"subject\":\"Interview Invitation\",\"snippet\":\"We'd like to invite you\",\"sender_email\":\"hr@company.com\"}" > temp_response.json
type temp_response.json
echo.

echo   - Testing Bills ^& Invoices...
curl -s -X POST %AI_SERVICE_URL%/ai/classify ^
    -H "Content-Type: application/json" ^
    -d "{\"subject\":\"Payment Due\",\"snippet\":\"Invoice amount due\",\"sender_email\":\"billing@service.com\"}" > temp_response.json
type temp_response.json
echo.

echo   - Testing OTPs ^& Notifications...
curl -s -X POST %AI_SERVICE_URL%/ai/classify ^
    -H "Content-Type: application/json" ^
    -d "{\"subject\":\"Verification Code\",\"snippet\":\"Your code is 123456\",\"sender_email\":\"noreply@service.com\"}" > temp_response.json
type temp_response.json
echo.

REM ============================================
REM 3. Sentiment Analysis Tests
REM ============================================
echo 3. Testing Sentiment Analysis...
echo ----------------------------------

echo   - Positive sentiment...
curl -s -X POST %AI_SERVICE_URL%/ai/classify ^
    -H "Content-Type: application/json" ^
    -d "{\"subject\":\"Congratulations! Interview Offer\",\"snippet\":\"We're pleased to invite you\",\"sender_email\":\"hr@company.com\"}" > temp_response.json
type temp_response.json
echo.

echo   - Negative sentiment...
curl -s -X POST %AI_SERVICE_URL%/ai/classify ^
    -H "Content-Type: application/json" ^
    -d "{\"subject\":\"Payment Failed - Action Required\",\"snippet\":\"Your payment was declined\",\"sender_email\":\"billing@service.com\"}" > temp_response.json
type temp_response.json
echo.

REM ============================================
REM 4. Batch Processing Test
REM ============================================
echo 4. Testing Batch Processing...
echo --------------------------------

echo   - Processing batch of 2 emails...
curl -s -X POST %AI_SERVICE_URL%/ai/process/batch ^
    -H "Content-Type: application/json" ^
    -d "{\"user_id\":\"%TEST_USER_ID%\",\"emails\":[{\"email_id\":\"%TEST_EMAIL_ID%-1\",\"subject\":\"Test 1\",\"snippet\":\"Test\",\"sender_email\":\"test1@example.com\",\"body_text\":\"Test body 1\"},{\"email_id\":\"%TEST_EMAIL_ID%-2\",\"subject\":\"Test 2\",\"snippet\":\"Test\",\"sender_email\":\"test2@example.com\",\"body_text\":\"Test body 2\"}]}" > temp_response.json
type temp_response.json
echo.

REM Cleanup
del temp_response.json 2>nul

REM ============================================
REM Summary
REM ============================================
echo ========================================
echo  Phase 1 Test Suite Complete!
echo ========================================
echo.
echo All tests executed. Review results above.
echo.
echo Next Steps:
echo   1. Verify all responses show correct categories
echo   2. Check database for stored data
echo   3. Test with real Gmail authentication
echo.
echo See PHASE1_COMPLETION.md for full documentation
echo.

pause
