# 🏸 Badminton Team App (VUB Smashers)

A mobile-first web app to manage your badminton team: schedule sessions, track RSVPs with automatic waitlists, calculate court capacity, and manage team members.

## Features

- **Session Management**: Browse upcoming sessions, view court capacity, and manage bookings.
- **RSVP & Waitlist System**: Mark yourself as "In", "Out", or "Maybe" with automatic waitlist and promotion.
- **Court Calculator**: Interactive court visualizer (`CourtMeter`) showing capacity based on confirmed players.
- **Player Lists & Admin Notes**: See who is going, waitlisted, or tentative, plus pin admin notices.
- **Email Notifications**: Confirmation emails via Resend when RSVPs are updated or waitlist promotions occur.
- **Admin Controls**: Create and edit sessions, configure weekly court defaults, and manage player roles.

## Tech Stack

- **Framework**: Next.js (App Router), React 19, TypeScript
- **Styling**: Vanilla CSS design tokens + Tailwind CSS + shadcn/ui primitives
- **Database**: Neon (Serverless PostgreSQL) via `@neondatabase/serverless`
- **Email**: Resend
- **Auth**: Team session system with secure httpOnly cookies

## Getting Started

### Prerequisites

- Node.js 18+
- Neon project / account

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Ensure `.env.local` has your Neon database URL and optional Resend API key:
   ```env
   DATABASE_URL=postgres://...
   INVITE_CODE=smash2024
   RESEND_API_KEY=re_...
   ```

3. **Run database migrations**:
   ```bash
   npx tsx scripts/migrate-neon.ts
   ```

4. **Seed database (optional sample data)**:
   ```bash
   npm run seed
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  ├── auth/                  # Sign-in page
  ├── (main)/                # Authenticated layout & navigation
  │   ├── sessions/          # Session list & detail pages
  │   ├── admin/             # Admin controls (config, new/edit session, setup)
  │   ├── history/           # Booking history
  │   ├── team/              # Team member list
  │   └── you/               # User profile & sign-out
components/                  # UI components (SessionCard, CourtMeter, RsvpButtons, etc.)
lib/
  ├── db.ts                  # Neon serverless database client
  ├── auth.ts                # Session resolution helpers
  ├── email.ts               # Resend email templates and sending
  └── actions/               # Server Actions (auth, rsvp, sessions, config, profile)
scripts/
  ├── migrate-neon.ts        # Database schema migrations
  └── seed.ts                # Seed script for initial players and sessions
neon.ts                      # Neon project policy configuration
```

## Deployment

Deployable to Railway, Vercel, or any Node.js hosting provider:
1. Connect your repository.
2. Add `DATABASE_URL`, `INVITE_CODE`, and `RESEND_API_KEY` in your environment settings.
3. Deploy.

## License

MIT
