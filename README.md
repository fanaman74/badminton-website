# 🏸 Badminton Team App (VUB Smashers)

A mobile-first web app to manage your badminton team: schedule sessions, track RSVPs with automatic waitlists, calculate court capacity, and manage team members.

## Features

- **Session Management**: Browse upcoming sessions, view court capacity, and manage bookings.
- **RSVP & Waitlist System**: Mark yourself as "In", "Out", or "Maybe" with automatic waitlist and promotion.
- **Court Calculator**: Interactive court visualizer (`CourtMeter`) showing capacity based on confirmed players.
- **Player Lists & Admin Notes**: See who is going, waitlisted, or tentative, plus pin admin notices.
- **Email Notifications**: Confirmation emails via Resend when RSVPs are updated or waitlist promotions occur, with a per-member on/off toggle in the profile section (login codes are always sent).
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
   Copy `.env.example` to `.env.local` and fill in the values you need:

   ```bash
   cp .env.example .env.local
   ```

   - `DATABASE_URL` *(required)* — Neon pooled connection string.
   - `DATABASE_URL_UNPOOLED` — direct connection used by the migration and seed scripts.
   - `RESEND_API_KEY` — Resend API key. Without it no email is sent: in development the
     login code is printed to the terminal instead, and in production email-code sign-in
     fails with "Email service is not configured".
   - `ADMIN_PASSWORD` — password for the designated admin accounts. Admin password
     sign-in is disabled while it is unset (admins can still use an emailed login code).
   - `NEXT_PUBLIC_APP_URL` — public origin used to build callback links.
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — only needed for Google sign-in.

   `.env.local` is gitignored, so your keys are never committed.

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
2. Add the environment variables listed in `.env.example` (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`,
   `RESEND_API_KEY`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_APP_URL`, ...) in your environment settings. On Railway
   `RAILWAY_PUBLIC_DOMAIN` is injected automatically and used as a fallback for the public origin.
3. Deploy.

> Without `RESEND_API_KEY`, email-code sign-in fails in production with
> "Email service is not configured" rather than silently sending nothing.

### Diagnosing email

- `GET /api/health` — includes an `email` block (`configured`, `from`, `senderDomain`) with no API call.
- `GET /api/health/email-test` — **admins only**: reports whether the sender domain is verified in Resend and sends a real test email to the signed-in admin, returning Resend's exact reply. It only ever mails the signed-in admin, so it cannot be abused as an open relay.

If a send is rejected, the usual causes are a missing/blank `RESEND_API_KEY` (values pasted with a trailing newline or quotes are tolerated, they are stripped automatically) or a sender domain that is not verified in Resend — override the sender with `RESEND_FROM_EMAIL`. The sender is `notifications@msoit.eu` — the club's verified domain and its intended permanent sender (members see `msoit.eu`; leave `RESEND_FROM_EMAIL` unset).

## License

MIT
