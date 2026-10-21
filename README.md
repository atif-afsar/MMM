# Make My Marriage 💍

A personal wedding management platform and digital invitation experience built with **React, Vite, TypeScript, Tailwind CSS, and Supabase**.

---

## 🌟 Overview

Make My Marriage centralizes wedding planning for the couple and both families:
- **Budget & Expense Tracking:** Track every vendor cost, down payments, and balances with precision using integer paise (avoiding floating-point issues).
- **Ceremonies & Event Schedules:** Schedule Haldi, Mehendi, Sangeet, Wedding, and Reception.
- **Task Management & Checklists:** Assign tasks to family members with priorities and deadlines.
- **Family Workspace:** Shared announcements, notes, and family decisions.
- **Private Guest List & Public RSVP:** Safe, isolated guest management and public RSVP handling.
- **Digital Wedding Invitation:** Editorial, mobile-first invitation page with a shareable URL and venue maps.

---

## 🗄️ Database Architecture & Supabase Setup

The database is built on **Supabase PostgreSQL** using Row Level Security (RLS) to enforce data privacy.

### 1. Database Schema & Migrations

All versioned migrations are located under `supabase/migrations/`:

| Migration | Purpose |
|---|---|
| `001_create_profiles.sql` | `profiles` table linked to `auth.users` with auto-creation trigger |
| `002_create_weddings.sql` | `weddings` table with budget in paise and invitation settings |
| `003_create_wedding_members.sql` | `wedding_members` table with owner auto-membership trigger |
| `004_create_expenses.sql` | `expenses` table storing integer paise with amount constraints |
| `005_create_events_and_tasks.sql` | `events` and `tasks` planning tables |
| `006_create_discussions_and_guests.sql` | `discussions` family board and private `guests` list |
| `007_create_rsvp_and_views.sql` | Isolated `rsvp_submissions` inbox and secure public invitation view |
| `008_create_indexes.sql` | Query performance indexes on foreign keys, dates, and slugs |
| `009_enable_rls_and_policies.sql` | Non-recursive `SECURITY DEFINER` helpers & RLS policies across all tables |
| `010_storage_setup.sql` | `wedding-media` storage bucket and file access policies |

> **Quick Setup:** If you prefer running a single consolidated script, copy the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and execute it inside the **Supabase Dashboard > SQL Editor**.

---

### 2. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Retrieve your project API credentials from **Supabase Dashboard > Project Settings > API**:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. *Never put your Supabase `service_role` key into client-side `.env` or frontend code.*

---

### 3. Storage Setup (`wedding-media`)

The app uses Supabase Storage for invitation cover photos and couple avatars:
1. Bucket: `wedding-media`
2. Max file size: 5 MB
3. Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
4. Public read enabled for invitation imagery, authenticated upload restricted to wedding members.

This is automatically configured when running `010_storage_setup.sql` or `supabase/schema.sql`.

---

### 4. Deploying Public RSVP Edge Function

For production deployments, the public RSVP endpoint is hosted as a Supabase Edge Function:
```bash
supabase functions deploy public-rsvp
```
The function code is located in [`supabase/functions/public-rsvp/index.ts`](supabase/functions/public-rsvp/index.ts).

---

### 5. Verifying Row Level Security (RLS)

A complete test suite is provided in [`supabase/verify_rls.sql`](supabase/verify_rls.sql).
Run this script in the Supabase SQL Editor to test:
- **Owner persona:** full read/write access to wedding records.
- **Authorized member persona:** role-based read/edit access.
- **Unrelated authenticated user:** blocked from viewing or modifying private records.
- **Anonymous visitor:** can only view published invitation view and submit RSVPs when enabled.

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Type check & build for production
npm run build

# 4. Run linter
npm run lint
```

When Supabase credentials are not configured, the app runs in **Local Preview Mode** with pre-populated demo data so you can inspect the UI immediately. Once credentials are set in `.env`, it automatically connects to your Supabase PostgreSQL backend.
