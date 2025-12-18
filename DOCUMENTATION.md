# TinyGains Planner Documentation

## 1. Architecture Overview

TinyGains Planner is a server-less, edge-ready web application built on the **Next.js App Router** architecture. It leverages **Supabase** for Backend-as-a-Service (BaaS) features including Authentication and Database, and **Razorpay** for handling payments.

### Key Technologies

- **Frontend**: Next.js 15 (React 19), Tailwind CSS, Lucide Icons.
- **Backend**: Supabase (PostgreSQL, GoTrue Auth).
- **Payments**: Razorpay (Subscriptions API).
- **Deployment**: Vercel (recommended).

## 2. Project Structure

```
src/
├── actions/        # Server Actions for data mutation and fetching
├── app/            # Next.js App Router pages and layouts
│   ├── (main)/     # Protected routes (Dashboard, Planner, etc.)
│   └── (auth)/     # Authentication routes (Login, Signup)
├── components/     # Reusable UI components
├── lib/            # Utilities and client initializers (Supabase, Razorpay)
└── types/          # TypeScript definitions (Supabase DB types)
```

## 3. Database Schema

The database is hosted on Supabase (PostgreSQL). Below are the key tables and their roles.

### Users & Profiles

- **`users`**: Managed by Supabase Auth.
- **`profiles`**: Extends user data (names, avatars). Linked 1:1 with `users`.

### Goal Hierarchy

The core feature involves breaking down long-term visions into actionable tasks.

1.  **`yearly_goals`**: High-level goals for a specific year.
2.  **`monthly_goals`**: Derived from yearly goals, targeting a specific month.
3.  **`weekly_goals`**: Actionable milestones for a week, linked to monthly goals.
4.  **`daily_goals`**: Concrete tasks for a specific date, prioritized (High/Medium/Low).

### Planning & Focus

- **`daily_intents`**: A single improving focus/intent for the day.
- **`daily_reflections`**: End-of-day review (what went well, energy drains).
- **`focus_blocks`**: Time-blocked sessions (Deep Work, Light Work) for a day.
- **`focus_sessions`**: Actual recorded time logs linked to focus blocks.

### Subscriptions

- **`plans`**: Available subscription tiers (Free, Pro) with pricing and Razorpay Plan IDs.
- **`subscriptions`**: User subscription records. functionality features:
  - `status`: active, created, cancelled, etc.
  - `current_period_end`: Expiry date for access control.
  - `plan`: 'free' or 'pro'.

## 4. Key Workflows

### Authentication

- Uses Supabase Auth (Email/Password + OAuth providers).
- Middleware protects routes under `(main)`, redirecting unauthenticated users to `/login`.

### Subscription Flow

1.  User visits `/pricing`.
2.  Selects a plan (Monthly/Yearly).
3.  **Client**: Initiates checkout via `createSubscriptionAction`.
4.  **Server**: Validates user and plan, calls Razorpay API to create a subscription, returns `subscription_id`.
5.  **Client**: Opens Razorpay Modal.
6.  **Webhook/Callback**: On success, updates the `subscriptions` table in Supabase (managed via webhooks or client-side verification).

### Goal Tracking

- Users create goals cascading from Year -> Day.
- **Context**: A weekly goal can optionally link to a monthly goal for context.
- **Progress**: Progress is visualized on the Dashboard based on completed goals vs total goals.

## 5. Development

### Environment Variables

Required keys in `.env`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### Linting & Formatting

- **Lint**: `npm run lint` (ESLint)
- **Format**: `npm run format` (Prettier)

### Type Generation

To update Supabase types after DB changes:

```bash
npx supabase gen types typescript --project-id "your-project-id" > src/types/supabase.ts
```
