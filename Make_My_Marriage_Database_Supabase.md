# Make My Marriage — Database Design (Supabase)

**Version:** 1.1  
**Purpose:** Database implementation guide for Google Antigravity  
**Database:** Supabase Postgres  
**Authentication:** Supabase Auth  
**File storage:** Supabase Storage  
**Project scope:** Personal wedding-management MVP

Read this file with `Make_My_Marriage_PRD.md` and `Make_My_Marriage_Design.md`. The PRD defines product scope; the design file defines UI; this file defines Supabase database structure, security, and implementation requirements.

---

## 1. Architecture

Use:
- Supabase Postgres for relational data.
- Supabase Auth for sign-in and user identity.
- Supabase Storage for invitation and couple images.
- Supabase Row Level Security (RLS) to protect private data.
- React + Vite for the frontend.
- Supabase client SDK for database and auth access.

For the MVP, a separate Node.js/Express backend is not required for ordinary authenticated CRUD if RLS policies are correct. Use Supabase Edge Functions or a trusted server-side endpoint for operations that must safely accept public RSVP submissions or require privileged logic.

**Never put the Supabase service-role key in frontend code.** The frontend may use the project's URL and anon/publishable key, protected by RLS. Keep service-role credentials only in secure server-side secrets.

Example frontend environment:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Use placeholder values only in `.env.example`. Never commit real secrets.

## 2. Data Modeling Rules

- This is a personal project for one primary wedding in the MVP, but use a `weddings` table and `wedding_id` foreign keys so the schema can be extended later.
- Use UUID primary keys, foreign keys and timestamps.
- Store money as integer paise to avoid floating-point errors. Example: ₹1,250.50 is stored as `125050`.
- Store dates using `date` or `timestamptz` as appropriate. Store the wedding's timezone, defaulting to `Asia/Kolkata`.
- Add `created_at` and `updated_at` timestamps.
- Use constraints and checks for valid values.
- Enable RLS on every table that contains private wedding information.
- Authorize data access through the authenticated user's membership in the wedding, not by trusting an ID sent by the client.
- Do not store passwords manually; Supabase Auth handles credentials.
- Keep public invitation data separate from private dashboard data.
- Use database migrations or versioned SQL scripts so the schema can be recreated reliably.

## 3. Tables Overview

| Table | Purpose |
|---|---|
| `profiles` | Basic profile linked to Supabase Auth |
| `weddings` | Wedding details, budget and invitation settings |
| `wedding_members` | User access and family-side role |
| `expenses` | Expense records and payment tracking |
| `events` | Wedding ceremonies and schedule |
| `tasks` | Planning tasks and assignments |
| `discussions` | Announcements, notes and family decisions |
| `guests` | Guest list and RSVP status |

Use UUID primary keys unless there is a strong reason not to.

## 4. Table Schemas

### 4.1 `profiles`
- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text not null`
- `avatar_url text null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Create a profile row when a user signs up, using a safe trigger or an authenticated profile-creation flow. Do not let users edit other people's profiles.

### 4.2 `weddings`
- `id uuid primary key default gen_random_uuid()`
- `owner_user_id uuid not null references auth.users(id)`
- `bride_name text not null`
- `groom_name text not null`
- `wedding_date date null`
- `wedding_time text null` (e.g. `19:30`)
- `timezone text not null default 'Asia/Kolkata'`
- `venue_name text null`
- `venue_address text null`
- `venue_map_url text null`
- `total_budget_paise bigint not null default 0 check (total_budget_paise >= 0)`
- `cover_image_path text null`
- `invitation_slug text unique`
- `invitation_published boolean not null default false`
- `rsvp_enabled boolean not null default true`
- `invitation_heading text null`
- `invitation_message text null`
- `invitation_theme jsonb not null default '{}'::jsonb`
- `published_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:
- Ensure slug values are lowercase and URL-safe, and unique when present.
- Validate URLs at the application layer.
- Only expose selected published invitation fields to anonymous users.
- Do not hard-code a wedding ID.

### 4.3 `wedding_members`
- `id uuid primary key default gen_random_uuid()`
- `wedding_id uuid not null references weddings(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `family_side text not null check (family_side in ('groom','bride','shared'))`
- `role text not null default 'viewer' check (role in ('owner','admin','editor','viewer'))`
- `created_at timestamptz not null default now()`
- `unique (wedding_id, user_id)`

Rules:
- Add the owner as a member when the wedding is created.
- For the MVP, the owner can be the only authenticated user. Add other members only when the invite/login flow exists.
- A member name alone does not grant access; access is linked to an authenticated `user_id`.
- Do not allow an ordinary member to remove or demote the owner.
- Keep member-management operations owner/admin-only.

### 4.4 `expenses`
- `id uuid primary key default gen_random_uuid()`
- `wedding_id uuid not null references weddings(id) on delete cascade`
- `title text not null`
- `description text null`
- `category text not null`
- `total_amount_paise bigint not null check (total_amount_paise >= 0)`
- `amount_paid_paise bigint not null default 0 check (amount_paid_paise >= 0)`
- `expense_date date not null default current_date`
- `paying_side text not null check (paying_side in ('groom','bride','shared'))`
- `payee_name text null`
- `due_date date null`
- `created_by uuid not null references auth.users(id)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- Check constraint: `amount_paid_paise <= total_amount_paise`

Suggested categories:
`venue`, `catering`, `clothing`, `jewellery`, `photography`, `decoration`, `invitations`, `travel`, `gifts`, `makeup`, `ceremony`, `miscellaneous`.

Derived values:
- `pending_amount_paise = total_amount_paise - amount_paid_paise`.
- Status is `pending` if paid is zero, `partially_paid` if paid is greater than zero but less than total, and `paid` if paid equals total.
- Prefer deriving payment status in a view or application helper rather than storing duplicate status that can become inconsistent.
- Validate total and paid amounts together on insert/update.
- Format values as INR in the UI; store integer paise.

### 4.5 `events`
- `id uuid primary key default gen_random_uuid()`
- `wedding_id uuid not null references weddings(id) on delete cascade`
- `name text not null`
- `event_date date not null`
- `start_time text null`
- `venue text null`
- `notes text null`
- `created_by uuid not null references auth.users(id)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Examples include Haldi, Mehendi, Nikah, Wedding and Reception, but none are mandatory.

### 4.6 `tasks`
- `id uuid primary key default gen_random_uuid()`
- `wedding_id uuid not null references weddings(id) on delete cascade`
- `title text not null`
- `description text null`
- `due_date date null`
- `assigned_member_id uuid null references wedding_members(id) on delete set null`
- `priority text not null default 'medium' check (priority in ('low','medium','high'))`
- `status text not null default 'todo' check (status in ('todo','in_progress','completed'))`
- `created_by uuid not null references auth.users(id)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Ensure an assigned member belongs to the same wedding as the task. Enforce this with a safe trigger or application validation.

### 4.7 `discussions`
- `id uuid primary key default gen_random_uuid()`
- `wedding_id uuid not null references weddings(id) on delete cascade`
- `author_user_id uuid not null references auth.users(id)`
- `title text null`
- `content text not null`
- `entry_type text not null default 'discussion' check (entry_type in ('announcement','discussion','decision'))`
- `decision_status text null check (decision_status in ('open','decided'))`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

This is a basic shared feed, not a real-time chat system. Only authorized members may read/write. Safely render user-generated text.

### 4.8 `guests`
- `id uuid primary key default gen_random_uuid()`
- `wedding_id uuid not null references weddings(id) on delete cascade`
- `name text not null`
- `phone text null`
- `email text null`
- `family_side text not null default 'shared' check (family_side in ('groom','bride','shared'))`
- `invitation_status text not null default 'not_sent' check (invitation_status in ('not_sent','shared'))`
- `rsvp_status text not null default 'pending' check (rsvp_status in ('pending','attending','not_attending'))`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Rules:
- Never expose the full guest table to anonymous users.
- Do not allow public users to list, search, edit or delete guest records.
- Public RSVP must use a narrowly scoped Supabase Edge Function or server endpoint. Do not grant anonymous users unrestricted `INSERT` or `UPDATE` access to `guests`.
- The RSVP flow should use a safe guest-matching/verification approach or a separate RSVP submissions table.
- Do not claim that an invitation was viewed unless actual view tracking exists.

## 5. Indexes

Create indexes for common filters and joins:
- `weddings(owner_user_id)`
- `wedding_members(user_id)`
- `wedding_members(wedding_id, user_id)` unique
- `expenses(wedding_id, expense_date desc)`
- `expenses(wedding_id, category)`
- `expenses(wedding_id, paying_side)`
- `events(wedding_id, event_date)`
- `tasks(wedding_id, status, due_date)`
- `discussions(wedding_id, created_at desc)`
- `guests(wedding_id, rsvp_status)`
- Unique index on `weddings(invitation_slug)` for non-null slugs.

## 6. Row Level Security (RLS)

Enable RLS on **all** tables, including `profiles`.

Create helper SQL functions if needed, such as `is_wedding_member(wedding_id)` and `has_wedding_role(wedding_id, allowed_roles)`. Design them carefully to avoid recursive RLS policies; if using `SECURITY DEFINER`, lock down `search_path` and grant execute permissions narrowly.

Expected policy behavior:
- **Profiles:** authenticated users can read/update only their own profile.
- **Weddings:** only members can read private wedding records; only owner/admin can update settings; owner can create the wedding.
- **Wedding members:** members can view the member list; only owner/admin can add/remove members and change roles, with protections for the owner.
- **Expenses, events, tasks, discussions, guests:** only authorized wedding members can access them; restrict writes by role where applicable.
- **Public invitation:** anonymous access should use a safe view or Edge Function returning only fields intended for publication, and only if `invitation_published = true`.
- **Public RSVP:** process through an Edge Function or server endpoint that validates the slug, confirms RSVP is enabled, validates input and updates only the intended RSVP record.

Do not use permissive policies like `USING (true)` for private tables. Test policies with at least an anonymous user, the owner, an authorized member, and an unrelated authenticated user.

## 7. Storage Buckets

Create a bucket such as `wedding-media` for couple photos and invitation assets.

Requirements:
- Validate file type and size.
- Use private storage by default for admin uploads.
- If public invitation images need public URLs, publish only those selected assets or use signed URLs.
- Storage policies must verify the authenticated user is a member with permission to upload to that wedding.
- Do not allow anonymous users to upload or browse all private media.
- Store storage paths in the database rather than relying only on hard-coded URLs.

## 8. Suggested SQL Migration Files

Keep schema changes versioned in the repository, for example:

```text
supabase/
  migrations/
    001_create_profiles.sql
    002_create_weddings.sql
    003_create_wedding_members.sql
    004_create_expenses.sql
    005_create_events_and_tasks.sql
    006_create_discussions_and_guests.sql
    007_create_indexes.sql
    008_enable_rls_and_policies.sql
    009_storage_policies.sql
```

Adjust the number and grouping as needed. Prefer repeatable, reviewed migrations over manual one-off dashboard changes.

## 9. Frontend Integration

- Use `@supabase/supabase-js`.
- Create one reusable Supabase client module.
- Use Supabase Auth for login, logout, session handling and password reset.
- Fetch only data required for the current page.
- Use TypeScript types generated from the Supabase schema where possible.
- Keep loading, empty, success and error states in the UI.
- Do not put service-role keys in frontend code.
- Do not rely on hidden buttons or frontend route guards as security; RLS is the data boundary.

## 10. Acceptance Criteria

The database is ready for MVP testing when:
1. The Supabase project is configured using environment variables.
2. SQL migrations create the required tables, constraints and indexes.
3. RLS is enabled and tested on every private table.
4. The owner can sign in and create/update wedding details.
5. Expense CRUD works and stores amounts as integer paise.
6. Paid, partially paid and pending amounts calculate correctly.
7. Dashboard metrics are derived from real database records.
8. Events and tasks support validated CRUD.
9. Family roles and membership are enforced by RLS.
10. Discussions are private to authorized members.
11. Guests are managed privately.
12. Public invitation access returns only published fields.
13. Public RSVP works through a restricted Edge Function/server endpoint.
14. An unrelated user cannot access private wedding records by changing IDs.
15. No service-role key or other secret is exposed to the browser.
16. Data persists after reload and across sessions.
17. Empty states and database errors are handled clearly.

## 11. Instructions for Antigravity

1. Read `Make_My_Marriage_PRD.md`, `Make_My_Marriage_Design.md`, and this file before implementation.
2. Inspect the repository before editing and preserve existing working UI.
3. Use Supabase Postgres, Supabase Auth, Supabase Storage and RLS. Do **not** use MongoDB for this version.
4. Create versioned SQL migrations for tables, constraints, indexes and RLS policies.
5. Implement authentication and security policies before connecting sensitive UI features.
6. If Supabase project credentials are not available, add `.env.example` with placeholders and explain exactly what values are required. Never invent credentials.
7. Implement in stages: schema and RLS, auth and wedding setup, expenses/dashboard, family/tasks/discussions, guests/RSVP, invitation publishing, then testing.
8. Use a Supabase Edge Function or secure server-side endpoint for public RSVP handling.
9. Test RLS as owner, authorized member, unrelated user and anonymous visitor.
10. Run available lint, type checks and production build; report what passed and what remains.
11. Do not mark a feature complete unless it is implemented and tested.
12. Update README with Supabase setup, environment variables, migrations, storage setup and deployment instructions.

## Definition of Success

Make My Marriage uses Supabase as its persistent database and authentication platform, securely tracks wedding expenses, coordinates basic family planning, manages guests, and publishes a beautiful invitation without exposing private wedding data.
