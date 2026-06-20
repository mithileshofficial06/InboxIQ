# 🚀 Phase 3 - Advanced Intelligence Features

## Executive Summary

**Phase 3 Goals**: Build advanced AI-powered features that leverage Phase 1's embeddings and Phase 2's dashboard infrastructure.

**Duration**: ~2-3 days
**Complexity**: High (RAG, NLP parsing, complex UI)
**Dependencies**: Phase 1 (embeddings) + Phase 2 (dashboard) complete ✅

---

## 🎯 Features to Build

### 1. RAG-Based Semantic Search 🔍

**Description**: Natural language search across all emails using vector similarity

**Features**:
- Semantic search bar: "Find emails about job interviews"
- Vector similarity search using pgvector HNSW index
- Context-aware results with relevance scoring
- Query expansion using Gemini (optional)
- Search filters: date range, sender, category
- Results ranked by cosine similarity
- Highlight relevant passages in results

**Technical Implementation**:
- **Frontend**: Search page at `/dashboard/search`
  - Natural language search input
  - Real-time search as user types (debounced)
  - Result cards with similarity scores
  - Snippet highlighting
  - Filter sidebar
  
- **Backend API**: New endpoint `POST /search/semantic`
  - Accept query text
  - Generate embedding for query (Gemini)
  - Perform vector similarity search in pgvector
  - Return top 20 results with scores
  - Support filters: category, date range, sender
  
- **AI Service**: Enhance embedding service
  - Query embedding endpoint: `POST /ai/embed`
  - Same model as email embeddings (Gemini text-embedding-004)
  - Returns 768-dim vector

**Database Queries**:
```sql
-- Vector similarity search with filters
SELECT 
  e.id, e.subject, e.sender_name, e.sender_email,
  ec.chunk_text, e.received_at, e.category,
  1 - (emb.embedding <=> query_embedding) AS similarity
FROM embeddings emb
JOIN email_chunks ec ON emb.chunk_id = ec.id
JOIN emails e ON ec.email_id = e.id
WHERE e.user_id = $1
  AND e.category = ANY($2)  -- optional filter
  AND e.received_at >= $3   -- optional filter
ORDER BY emb.embedding <=> query_embedding
LIMIT 20;
```

**UI/UX**:
- Search bar prominent at top
- Skeleton loaders while searching
- Result cards show:
  - Subject (bold)
  - Sender
  - Relevant passage (highlighted)
  - Similarity score (%)
  - Date
  - Category badge
- Click result → opens email detail modal
- "No results" state with suggestions

---

### 2. Subscription Tracker 📬

**Description**: Automatically detect recurring senders and manage subscriptions

**Features**:
- Detect newsletter/promotional senders (emails from same sender >5 times)
- Track subscription metadata:
  - Sender name/email
  - Total emails received
  - Frequency (daily/weekly/monthly)
  - First/last email date
  - Category distribution
  - Average sentiment
- Unsubscribe suggestions (emails with unsubscribe link)
- "Mute" sender (mark as low priority)
- View all emails from subscription
- Export subscription list

**Technical Implementation**:
- **Frontend**: Subscriptions page at `/dashboard/subscriptions`
  - Grid/list view of subscriptions
  - Sort by: frequency, total count, last email
  - Filter by: category, has_unsubscribe_link
  - Subscription detail view:
    - Timeline of emails
    - Stats (total, frequency, sentiment)
    - Quick actions (mute, view all, unsubscribe)
  
- **Backend API**: New endpoints
  - `GET /subscriptions` - List all detected subscriptions
  - `GET /subscriptions/:id` - Single subscription details
  - `GET /subscriptions/:id/emails` - All emails from this sender
  - `POST /subscriptions/:id/mute` - Mark as low priority
  - `POST /subscriptions/:id/detect-unsubscribe` - Find unsubscribe link
  
- **Database**: New table `subscriptions`
  ```sql
  CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    sender_email TEXT NOT NULL,
    sender_name TEXT,
    total_emails INT DEFAULT 0,
    frequency TEXT, -- 'daily', 'weekly', 'monthly'
    first_email_at TIMESTAMP,
    last_email_at TIMESTAMP,
    primary_category TEXT,
    avg_sentiment_score FLOAT,
    has_unsubscribe_link BOOLEAN DEFAULT false,
    is_muted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  
  CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
  CREATE INDEX idx_subscriptions_sender ON subscriptions(sender_email);
  ```

**Detection Algorithm**:
```typescript
// Run after email sync completes
async function detectSubscriptions(userId: string) {
  // Find senders with >5 emails
  const frequentSenders = await db.query(`
    SELECT 
      sender_email,
      sender_name,
      COUNT(*) as total,
      MIN(received_at) as first_email,
      MAX(received_at) as last_email,
      MODE() WITHIN GROUP (ORDER BY category) as primary_category,
      AVG(sentiment_score) as avg_sentiment
    FROM emails
    WHERE user_id = $1
    GROUP BY sender_email, sender_name
    HAVING COUNT(*) >= 5
  `, [userId]);
  
  // Calculate frequency
  for (const sender of frequentSenders) {
    const daysBetween = dateDiff(sender.first_email, sender.last_email);
    const frequency = calculateFrequency(sender.total, daysBetween);
    
    // Upsert subscription
    await db.query(`
      INSERT INTO subscriptions (...)
      VALUES (...)
      ON CONFLICT (user_id, sender_email) DO UPDATE SET ...
    `);
  }
}

function calculateFrequency(count: number, days: number): string {
  const perDay = count / days;
  if (perDay >= 0.8) return 'daily';
  if (count / (days / 7) >= 0.8) return 'weekly';
  return 'monthly';
}
```

**UI/UX**:
- Subscription cards show:
  - Sender avatar (gradient)
  - Name and email
  - Total emails badge
  - Frequency tag (daily/weekly/monthly)
  - Primary category
  - Sentiment indicator
  - Actions: Mute, View emails, Unsubscribe
- Click card → detail view with email timeline
- Unsubscribe button → detect link in recent emails

---

### 3. Job Application Tracker 💼

**Description**: Track job applications, interviews, and offers automatically

**Features**:
- Auto-detect job-related emails (category = "Job Applications")
- Parse company names from email body/sender
- Detect application status:
  - Applied (confirmation emails)
  - Interview Scheduled (calendar invites, "interview" keyword)
  - Rejected (sentiment = negative + "unfortunately")
  - Offer Received (sentiment = positive + "offer")
  - Accepted/Declined
- Kanban board view (Applied → Interview → Offer)
- Timeline view per company
- Stats: total applications, interview rate, offer rate
- Export to CSV

**Technical Implementation**:
- **Frontend**: Jobs page at `/dashboard/jobs`
  - Kanban board with 5 columns:
    - Applied (gray)
    - Interview Scheduled (blue)
    - Rejected (red)
    - Offer Received (green)
    - Accepted/Declined (purple)
  - Job cards show:
    - Company name
    - Position title (if parsed)
    - Date applied
    - Last update
    - Email count
  - Drag-and-drop to change status
  - Click card → job detail modal
  - Stats dashboard at top:
    - Total applications
    - Interview rate (%)
    - Offer rate (%)
    - Avg response time
  
- **Backend API**: New endpoints
  - `GET /jobs/applications` - List all job applications
  - `GET /jobs/applications/:id` - Single application details
  - `GET /jobs/applications/:id/emails` - All related emails
  - `PATCH /jobs/applications/:id` - Update status manually
  - `POST /jobs/parse` - Re-parse all job emails
  
- **Database**: New table `job_applications`
  ```sql
  CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    company_name TEXT NOT NULL,
    position_title TEXT,
    status TEXT DEFAULT 'applied', -- applied, interview, rejected, offer, accepted, declined
    applied_at TIMESTAMP,
    last_update_at TIMESTAMP,
    response_time_days INT, -- days between applied and first response
    email_ids UUID[], -- array of related email IDs
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  
  CREATE INDEX idx_jobs_user ON job_applications(user_id);
  CREATE INDEX idx_jobs_status ON job_applications(status);
  ```

**Parsing Algorithm**:
```python
# AI Service: POST /ai/parse-job-email
def parse_job_email(email: dict) -> dict:
    """Extract company name, position, and status from job email"""
    
    # Use Gemini to parse
    prompt = f"""
    Extract job application details from this email:
    
    Subject: {email['subject']}
    From: {email['sender_email']}
    Body: {email['body_text'][:1000]}
    
    Return JSON:
    {{
      "company_name": "Company name (REQUIRED)",
      "position_title": "Job title or null",
      "status": "applied|interview|rejected|offer",
      "confidence": 0.0-1.0
    }}
    
    Rules:
    - Extract company name from sender domain or email body
    - Detect "interview" keyword for status
    - Detect "unfortunately" or "not selected" for rejection
    - Detect "offer" or "congratulations" for offer
    - Default status is "applied" for confirmation emails
    """
    
    response = gemini.generate_content(prompt)
    parsed = json.loads(response.text)
    
    # Fallback: heuristic parsing
    if parsed['confidence'] < 0.7:
        parsed = fallback_parse(email)
    
    return parsed

def fallback_parse(email: dict) -> dict:
    """Keyword-based parsing"""
    body = email['body_text'].lower()
    
    # Extract company from sender domain
    domain = email['sender_email'].split('@')[1]
    company = domain.split('.')[0].title()
    
    # Detect status
    status = 'applied'
    if 'interview' in body or 'calendar' in body:
        status = 'interview'
    elif 'unfortunately' in body or 'not selected' in body:
        status = 'rejected'
    elif 'offer' in body or 'congratulations' in body:
        status = 'offer'
    
    return {
        'company_name': company,
        'position_title': None,
        'status': status,
        'confidence': 0.5
    }
```

**Kanban Board UI**:
- Drag-and-drop using `react-beautiful-dnd` or `dnd-kit`
- Column headers show count
- Cards have colored left border (status color)
- Hover reveals quick actions
- Double-click to edit
- Responsive: stacks vertically on mobile

---

### 4. AI Chat Interface 🤖

**Description**: Ask questions about your emails in natural language

**Features**:
- Chat interface: "When did I last hear from John?"
- Conversational AI using Gemini + RAG
- Context-aware responses with email citations
- Suggested questions:
  - "Show me job rejection emails from last month"
  - "What's the status of my Amazon orders?"
  - "Find bills I haven't paid"
  - "Who sends me the most emails?"
- Export chat history
- Copy code/text from responses

**Technical Implementation**:
- **Frontend**: Chat page at `/dashboard/chat`
  - Chat interface (like ChatGPT)
  - Message bubbles (user vs AI)
  - Typing indicator
  - Suggested questions as chips
  - Email citations as cards
  - Code/text copy buttons
  
- **Backend API**: New endpoint `POST /chat`
  - Accept user message
  - Determine intent (search, stats, question)
  - Execute appropriate query
  - Use RAG for context retrieval
  - Generate natural language response with Gemini
  - Return response + citations
  
- **AI Service**: RAG pipeline
  - Intent classification
  - Query generation (text-to-SQL)
  - Semantic search for relevant emails
  - Context injection into prompt
  - Response generation

**RAG Pipeline**:
```typescript
async function handleChatMessage(userId: string, message: string) {
  // 1. Classify intent
  const intent = await classifyIntent(message);
  // Intents: search, stats, question, command
  
  // 2. Generate SQL query or vector search
  let context = '';
  if (intent === 'search') {
    const emails = await semanticSearch(userId, message);
    context = formatEmailsAsContext(emails);
  } else if (intent === 'stats') {
    const stats = await fetchStats(userId);
    context = JSON.stringify(stats);
  }
  
  // 3. Generate response with Gemini
  const prompt = `
    User question: ${message}
    
    Context from emails:
    ${context}
    
    Answer the question naturally. Cite specific emails when relevant.
    If you found relevant emails, say "Based on your emails..."
  `;
  
  const response = await gemini.generate(prompt);
  
  // 4. Extract citations
  const citations = extractCitedEmails(context, response);
  
  return {
    response: response.text,
    citations: citations,
    intent: intent
  };
}
```

**UI/UX**:
- Chat input at bottom (multiline, shift+enter for newline)
- Messages scroll smoothly
- AI messages have:
  - Avatar icon
  - Markdown rendering
  - Citation cards (clickable)
  - Copy button
- User messages right-aligned (blue)
- AI messages left-aligned (gray)
- Suggested questions below input
- "Clear chat" button

---

## 📊 Database Schema Changes

### New Tables

```sql
-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  sender_email TEXT NOT NULL,
  sender_name TEXT,
  total_emails INT DEFAULT 0,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  first_email_at TIMESTAMP,
  last_email_at TIMESTAMP,
  primary_category TEXT,
  avg_sentiment_score FLOAT,
  has_unsubscribe_link BOOLEAN DEFAULT false,
  is_muted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, sender_email)
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_frequency ON subscriptions(frequency);

-- Job Applications
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  company_name TEXT NOT NULL,
  position_title TEXT,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'interview', 'rejected', 'offer', 'accepted', 'declined')),
  applied_at TIMESTAMP NOT NULL,
  last_update_at TIMESTAMP,
  response_time_days INT,
  email_ids UUID[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jobs_user ON job_applications(user_id);
CREATE INDEX idx_jobs_status ON job_applications(status);
CREATE INDEX idx_jobs_company ON job_applications(company_name);

-- Chat History
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  cited_email_ids UUID[],
  intent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_user ON chat_messages(user_id, created_at DESC);
```

---

## 🛣️ Implementation Order

### Day 1: RAG Search + Subscriptions
1. **Morning**: RAG backend
   - Embedding endpoint in AI service
   - Semantic search endpoint in backend
   - Vector similarity queries
   
2. **Afternoon**: RAG frontend
   - Search page UI
   - Result cards
   - Filter sidebar
   
3. **Evening**: Subscription detection
   - Subscriptions table
   - Detection algorithm
   - Backend API endpoints

### Day 2: Subscriptions UI + Job Tracker
1. **Morning**: Subscriptions frontend
   - Subscriptions page
   - Grid/list view
   - Detail modal
   
2. **Afternoon**: Job tracker backend
   - Job applications table
   - Parsing algorithm (Gemini)
   - Backend API endpoints
   
3. **Evening**: Job tracker frontend
   - Kanban board layout
   - Drag-and-drop
   - Stats dashboard

### Day 3: AI Chat + Polish
1. **Morning**: Chat backend
   - Intent classification
   - RAG pipeline
   - Chat endpoint
   
2. **Afternoon**: Chat frontend
   - Chat interface
   - Message bubbles
   - Citations
   
3. **Evening**: Testing & Documentation
   - End-to-end tests
   - Phase 3 completion doc
   - README update

---

## 🧪 Testing Checklist

### RAG Search
- [ ] Search query generates embedding
- [ ] Vector search returns relevant results
- [ ] Similarity scores accurate (0.0-1.0)
- [ ] Filters work (category, date, sender)
- [ ] Results render correctly
- [ ] No results state shows
- [ ] Snippet highlighting works

### Subscriptions
- [ ] Detection algorithm finds frequent senders
- [ ] Frequency calculation correct
- [ ] Subscriptions list displays
- [ ] Detail view shows timeline
- [ ] Mute functionality works
- [ ] Unsubscribe link detection works

### Job Tracker
- [ ] Job emails parsed correctly
- [ ] Company names extracted
- [ ] Status detection accurate
- [ ] Kanban board renders
- [ ] Drag-and-drop works
- [ ] Stats calculations correct
- [ ] Manual status updates work

### AI Chat
- [ ] Intent classification accurate
- [ ] Search queries work
- [ ] Stats queries work
- [ ] Responses are natural
- [ ] Citations displayed correctly
- [ ] Suggested questions work
- [ ] Chat history persists

---

## 🎯 Success Metrics

- **Search Relevance**: Top 5 results >70% relevant
- **Subscription Detection**: >90% accuracy for newsletters
- **Job Parsing**: >80% company name extraction
- **Chat Response Time**: <3 seconds per message
- **User Satisfaction**: 4.5+ stars

---

## 🚀 Ready to Start?

Phase 3 will transform InboxIQ from a classifier into a true AI-powered email assistant!

**Let's build! 🎉**
