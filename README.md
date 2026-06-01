# 🏸 Badminton Team App

A mobile-first web app to replace messy chat groups and manage your badminton team. Schedule sessions, track RSVPs with waitlist support, and manage team finances all in one place.

## Features (Phase 1 - MVP)

- **Session Management**: Create and browse upcoming badminton sessions
- **RSVP System**: Mark yourself as "In", "Out", or "Maybe" with automatic waitlist when sessions fill up
- **Court Calculator**: See how many courts are needed based on confirmed players
- **Player Lists**: View who's going, waitlisted, or maybe at a glance
- **Mobile-First Design**: Optimized for phones with bottom navigation
- **Admin Controls**: Admins can create sessions and manage the team

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (Postgres) with Row Level Security
- **Icons**: Lucide React
- **Auth**: Supabase Auth (email + password)
- **Deployment**: Railway

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account

### Setup

1. **Clone and install**:
   ```bash
   git clone https://github.com/fanaman74/badminton-website.git
   cd badminton-website
   npm install
   ```

2. **Environment setup**:
   Create `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   INVITE_CODE=smash2024
   ```

3. **Database migrations**:
   Run the SQL migrations in Supabase dashboard:
   - `supabase/migrations/001_schema.sql` — Tables & triggers
   - `supabase/migrations/002_rls.sql` — Row Level Security policies

4. **Seed test data**:
   ```bash
   npm run seed
   ```
   Creates 5 test users and 2 sample sessions.

5. **Start dev server**:
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000)

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@team.com` | `Admin1234!` |
| Player | `ben@team.com` | `Player1234!` |

**Invite Code** (for new registrations): `smash2024`

## Project Structure

```
app/
  ├── auth/              # Login, register, auth callback
  ├── (main)/            # Main app layout
  │   ├── sessions/      # Session list & detail pages
  │   ├── admin/         # Admin: create session, setup
  │   ├── finances/      # (Phase 2 stub)
  │   └── leaderboard/   # (Phase 3 stub)
components/
  ├── ui/                # shadcn/ui components
  ├── BottomNav.tsx      # Mobile navigation
  ├── Sidebar.tsx        # Desktop sidebar
  ├── SessionCard.tsx    # Session card component
  └── RsvpButtons.tsx    # RSVP toggle buttons
lib/
  ├── supabase/          # Supabase client setup
  ├── actions/           # Server Actions (rsvp, sessions)
  └── utils.ts           # Utility functions
types/
  └── database.ts        # TypeScript types from Supabase schema
scripts/
  └── seed.ts            # Database seed script
supabase/migrations/     # SQL schema & RLS policies
```

## Key Features Details

### RSVP & Waitlist Logic
- Players can mark themselves as "In", "Out", or "Maybe"
- When a session reaches max capacity, new "In" responses go to the waitlist
- If someone leaves, the first waitlist person is automatically promoted

### Court Calculator
- Displays how many courts are needed: `ceil(confirmed_players / 4)`
- Shows capacity status and remaining spots

### Role-Based Access
- **ADMIN**: Can create sessions, manage team
- **PLAYER**: Can RSVP and view sessions

## Deployment

Deploy to Railway:

1. Push to GitHub (`.env.local` is already in `.gitignore`)
2. Connect the repo in [Railway](https://railway.app)
3. Add env variables in Railway dashboard
4. Deploy — Railway auto-detects Next.js

## Roadmap

### Phase 2: Team Finances
- Expense ledger (track who paid for courts/shuttles)
- Balance sheet (who owes whom)
- Carpooling coordination

### Phase 3: Gamification
- Match logger (record game results)
- Leaderboard (win rates)
- Partner randomizer (auto-generate balanced pairs)

## Local Development

- **Dev server**: `npm run dev` (port 3000)
- **Type check**: `npx tsc --noEmit`
- **Lint**: `npm run lint`

## Contributing

Push to your branch and open a PR against `main`.

## License

MIT
