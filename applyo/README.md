#🗳 Real-Time Poll Rooms

A lightweight full-stack app to create polls, share them via link, and watch results update live — no account needed.

## Live Demo
> [Add your deployed URL here]

## Tech Stack

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Node.js + Express + Socket.io
- **Database:** PostgreSQL via Prisma ORM (hosted on Supabase)
- **Deployment:** Vercel (frontend) + Render (backend)

---

## Features

- ✅ Create a poll with a question and 2–6 options
- ✅ Get a shareable link instantly — no signup required
- ✅ Real-time vote updates via WebSockets (Socket.io)
- ✅ Results persist across refreshes and sessions
- ✅ Anti-abuse mechanisms to reduce repeat voting

---

## Anti-Abuse Mechanisms

### 1. Session ID (Primary)
When a user visits the app for the first time, a unique UUID is generated and stored in `localStorage`. This `sessionId` is sent with every vote request. The database enforces a `@@unique([pollId, sessionId])` constraint, meaning the same browser session can only vote once per poll.

**What it prevents:** A single user spamming votes by clicking repeatedly.

**Known limitation:** Clearing `localStorage` or using a different browser generates a new session ID, allowing a second vote. This is a tradeoff between friction and usability for a no-auth system.

---

### 2. IP Address Tracking (Secondary)
The server captures the voter's IP address (`x-forwarded-for` header in production, `remoteAddress` in development) and stores it alongside each vote in the database.

**What it prevents:** Provides an audit trail for suspicious voting patterns. Admins can query the database to detect multiple votes from the same IP across different sessions (e.g., private browsing abuse).

**Known limitation:** IP tracking is currently passive (stored but not enforced as a hard block) to avoid false positives from shared networks (offices, universities, NAT). It can be upgraded to a hard rate limit if needed.

---

## Edge Cases Handled

- **Duplicate vote detection** — returns a clear error and shows results instead of crashing
- **Poll not found** — graceful 404 page with a helpful message
- **Empty or invalid options** — frontend validates before sending to API (min 2 options, no blanks, no duplicates)
- **Race conditions on vote count** — vote count is recalculated fresh from DB after each vote, not incremented in memory
- **Socket disconnection** — socket reconnects automatically via Socket.io's built-in retry logic
- **Missing sessionId** — backend generates one server-side if not provided by client

---

## Known Limitations & Future Improvements

| Limitation | Potential Fix |
|---|---|
| No poll expiry | Add `expiresAt` field to Poll model |
| No poll creator auth | Add lightweight magic-link auth |
| Single vote only (no changing vote) | Track `optionIndex` per session and allow updates |
| IP block not enforced | Add Redis-based rate limiter per IP |
| No poll deletion | Add creator token stored in cookie |
| Basic UI | Add vote animations, confetti on result |

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL (or Supabase free tier)

### Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/poll-rooms
cd poll-rooms

# Install all dependencies
npm install

# Setup database
cd packages/db
cp .env.example .env
# Add your DATABASE_URL to .env
npx prisma migrate dev --name init

# Start backend
cd ../../apps/Backend
cp .env.example .env
# Add DATABASE_URL and FRONTEND_URL to .env
npm run dev

# Start frontend (new terminal)
cd apps/frontend
cp .env.example .env
# Add VITE_API_URL to .env
npm run dev
```