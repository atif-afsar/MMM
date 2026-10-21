# Make My Marriage --- Product Requirements Document (PRD)

**Version:** 1.0\
**Project type:** Personal wedding-management web application\
**Status:** MVP planning\
**Primary builder:** Google Antigravity\
**Recommended stack:** React + Vite, Tailwind CSS, Framer Motion,
Supabase, Vercel

------------------------------------------------------------------------

## 1. Project Overview

**Make My Marriage** is a personal web platform to manage wedding
planning in one place. It should help the user track wedding expenses,
coordinate the bride's and groom's families, organize wedding events and
tasks, manage guests, and share a beautiful digital wedding invitation.

This is a **personal project for one wedding**, not a public SaaS
platform in the MVP. Build it as a polished, responsive and functional
application, while keeping the scope small and easy to extend later.

## 2. Product Goals

1.  Track all wedding expenses and payments in one place.
2.  See the total budget, amount spent, remaining budget and pending
    payments.
3.  Keep basic information, tasks, announcements and discussions from
    both families organized.
4.  Create a beautiful mobile-first digital wedding invitation with a
    unique shareable URL.
5.  Manage guest details and RSVP responses.
6.  Provide a protected admin area to manage wedding details and the
    invitation.
7.  Keep the codebase modular so future features can be added without
    rebuilding the app.

## 3. Non-Goals for the MVP

Do **not** build these in the first version: - Public SaaS onboarding or
multiple independent wedding accounts. - Payment gateway or online money
transfers. - Vendor marketplace or vendor booking. - AI wedding
assistant. - Automated WhatsApp messaging. - Complex real-time chat. -
Advanced analytics. - Multiple invitation templates marketplace. -
Native mobile applications.

WhatsApp support in the MVP means sharing a link using a WhatsApp share
URL or the device's native share functionality. It must not send
messages automatically.

## 4. User Roles and Access

### 4.1 Admin / Owner

The primary user who owns the wedding workspace.

Can: - View and update wedding details and budget. - Create, edit and
delete expenses. - Manage events, tasks, guests and RSVP records. - Add
or remove family members. - Create announcements and discussions. -
Customize and publish the digital invitation. - View dashboard summaries
and all records.

### 4.2 Family Member

A trusted person invited into the private workspace.

Permissions should be configurable where practical: - View shared
wedding information. - View or add expenses if permitted. - View tasks
and mark assigned tasks complete. - Read and contribute to discussions
if permitted.

Do not expose private contact details or financial records to
unauthorized users.

### 4.3 Guest

A person who receives the public invitation link.

Can: - View the published invitation without logging in. - View the
event details and venue information. - Submit an RSVP if RSVP is
enabled.

Guests must not be able to access the private dashboard, expenses,
family workspace or admin panel.

## 5. Core Features and Functional Requirements

### 5.1 Authentication and Wedding Setup

-   Provide login, logout and password-reset flows using Supabase Auth.
-   Protect all private pages behind authentication.
-   On first setup, allow the owner to enter:
    -   Bride's name.
    -   Groom's name.
    -   Wedding date and time.
    -   Venue name and address.
    -   Total wedding budget.
    -   Optional cover photo.
-   Provide an edit screen for wedding details.
-   Because this is a personal project, assume one primary wedding
    workspace in the MVP. Keep data models extensible for future
    multi-wedding support.

### 5.2 Dashboard

Display: - Total wedding budget. - Total expenses recorded. - Remaining
budget. - Pending payment amount. - Upcoming wedding events. - Recent
expense entries. - Spending by category. - Budget-versus-actual
overview.

Calculations: - **Total spent:** Sum of amounts actually paid. -
**Pending amount:** Sum of unpaid balances on expenses. - **Remaining
budget:** Total budget minus total paid/spent. - Avoid counting a
partially paid expense as fully paid. Store total expense amount and
amount paid separately, or use an equivalent reliable data model.

Provide quick actions: - Add expense. - Add task. - Add event. - Open
invitation preview.

Show helpful empty states when there are no expenses, events or guests
yet. Never display hard-coded sample figures as real user data.

### 5.3 Expense Tracker

Users with permission can create, view, edit and delete expense records.

Each expense should support: - Expense title/name. - Description or
notes (optional). - Amount. - Amount paid. - Category. - Expense date. -
Responsible/paying side: Groom's Side, Bride's Side or Shared. - Payment
status: Paid, Partially Paid or Pending. - Payee/vendor name
(optional). - Due date (optional).

Suggested categories: - Venue. - Catering. - Clothing. - Jewellery. -
Photography and videography. - Decoration. - Invitations. - Travel and
accommodation. - Gifts. - Makeup and grooming. - Religious/ceremony
expenses. - Miscellaneous.

Requirements: - Search expenses by name. - Filter by category, date,
paying side and payment status. - Sort by date and amount. - Show totals
by category and paying side. - Allow the user to edit or delete an entry
with confirmation before deletion. - Validate that amounts are
non-negative and amount paid does not exceed the total expense. -
Display INR currency formatting (₹). - Set an optional overall budget
and optional category budgets. - Clearly distinguish expense total,
amount paid and amount pending. - Do not imply that the platform
transfers money; it only records payments.

### 5.4 Family Coordination

Keep coordination simple rather than building a full chat application.

#### Family members

-   Add a member's name, family side (Groom's Side or Bride's Side),
    role and optional contact information.
-   Allow the admin to edit or remove members.
-   Where actual login access is provided, associate members with
    authenticated user accounts and permissions. Do not treat a name in
    the member list alone as authentication.

#### Announcements and discussions

-   Create announcements with title, content, author and date.
-   Provide a simple discussion/notes feed for important updates.
-   Show newest items first.
-   Allow authorized users to add entries and edit/delete their own
    entries where appropriate.
-   This is a basic shared feed, not real-time chat, typing indicators
    or message delivery infrastructure.

#### Decisions

-   Allow users to record a decision with a title, details, date and
    optional status such as Open or Decided.
-   Keep the feature lightweight.

### 5.5 Wedding Events and Tasks

#### Events

-   Create, edit and delete events.
-   Fields: event name, date, start time, venue and notes.
-   Suggested examples: Haldi, Mehendi, Nikah, Wedding and Reception.
-   Display upcoming events in chronological order.
-   Allow events to be optional; do not force every ceremony type.

#### Tasks

-   Create, edit and delete tasks.
-   Fields: title, details, due date, assigned family member (optional),
    status and priority.
-   Status: To Do, In Progress, Completed.
-   Display overdue and upcoming tasks clearly.
-   Allow an authorized user to mark a task complete.
-   Provide a simple checklist view.

### 5.6 Guest Management and RSVP

-   Add, edit and delete guests.
-   Fields: guest name, optional contact details, family side,
    invitation status and RSVP response.
-   Invitation status can be Not Sent, Shared or Viewed only if view
    tracking is actually implemented. Do not claim that a guest viewed
    the invitation without reliable tracking.
-   RSVP values: Pending, Attending, Not Attending.
-   Allow search and filtering by family side and RSVP status.
-   Show total guests, confirmed attendees and pending responses.
-   Guests can submit an RSVP from the public invitation page using a
    simple form.
-   Validate form inputs and prevent unauthorized access to the full
    guest list.
-   Do not require guests to create an account.

### 5.7 Digital Invitation Editor

Create an admin-only invitation editor with a live preview.

Editable fields: - Bride's and groom's names. - Invitation heading and
message. - Wedding date and time. - Venue name, full address and
optional map URL. - Event details. - Couple/family photos or cover
image. - Theme colors and typography choices. - Optional short welcome
message.

Requirements: - Provide at least one polished, elegant Indian wedding
invitation design. - Use subtle animations and transitions; prioritize
performance and readability. - Preview the invitation before
publishing. - Save draft changes. - Publish/unpublish the invitation. -
Generate a stable, unique public URL/slug for the wedding. - Provide
Copy Link and Share on WhatsApp actions. - Ensure the invitation works
well on mobile screens. - Add accessible contrast, readable typography
and reduced-motion support. - Use uploaded images safely and provide
sensible fallbacks if an image is missing.

### 5.8 Public Invitation Page

-   Publicly accessible using the unique invitation URL, without login.
-   Display only the information deliberately published by the admin.
-   Include names, date, venue, event details, images and invitation
    message.
-   Include RSVP form if enabled.
-   Include a clear location/map link if configured.
-   Include a share action.
-   Do not expose the admin interface, expense information, private
    discussions, member list or guest list.
-   If unpublished or the slug is invalid, show a clean
    unavailable/not-found page.

### 5.9 Admin Settings

-   Edit wedding information and budget.
-   Manage expense categories and category budgets.
-   Manage family members and permissions.
-   Manage events, tasks and guests.
-   Customize and publish invitation content.
-   Enable or disable RSVP.
-   Provide basic account settings and logout.

The admin panel should be a practical management area, not a separate
complex content-management system.

## 6. Main Pages and Navigation

Private application: 1. Login / Password Reset. 2. Initial Wedding
Setup. 3. Dashboard. 4. Expenses List. 5. Add/Edit Expense. 6. Events &
Tasks. 7. Family Members. 8. Announcements & Discussions. 9. Guests &
RSVP Management. 10. Invitation Editor and Preview. 11. Settings.

Public page: 12. Public Wedding Invitation.

Suggested desktop navigation: - Dashboard - Expenses - Events & Tasks -
Family Workspace - Guests - Invitation - Settings

Suggested mobile navigation: - Use a compact bottom navigation or
collapsible menu. - Keep common actions such as Add Expense easy to
reach. - Avoid overcrowding the screen.

## 7. UI/UX and Visual Direction

Design direction: **premium, minimal, elegant and warm**, with Indian
wedding-inspired details.

Private dashboard: - Clean SaaS-style layout. - Light neutral
background. - Elegant typography and clear visual hierarchy. -
Restrained use of cards, borders and shadows. - Clear charts or progress
indicators for budget. - Responsive tables that become cards or
scrollable lists on mobile. - Consistent spacing, buttons, forms,
dialogs and status badges.

Public invitation: - More expressive and celebratory than the admin
dashboard. - Elegant typography, refined decorative motifs and subtle
floral/ornamental details. - Use a tasteful palette such as ivory,
cream, muted gold and a restrained accent color. - Smooth entrance
animations without excessive effects. - Make names, date and venue
immediately visible. - Mobile-first composition.

General UX: - Provide loading, empty, success and error states. - Use
confirmation dialogs for destructive actions. - Show understandable
validation messages. - Keep forms short and grouped logically. - Do not
use decorative controls that do nothing. - Ensure keyboard
accessibility, focus states and appropriate labels. - Support reduced
motion preferences.

## 8. Recommended Technical Architecture

### Frontend

-   React + Vite.
-   TypeScript recommended for safer data handling.
-   Tailwind CSS.
-   Framer Motion for subtle animations.
-   React Router for navigation.
-   A chart library only if a dashboard chart materially improves
    clarity.

### Backend and data

-   Supabase Postgres for the database.
-   Supabase Auth for authentication.
-   Supabase Storage for invitation and couple images.
-   Supabase Row Level Security (RLS) for access control.

### Deployment

-   Vercel for the frontend.
-   Supabase hosted services for database, authentication and storage.
-   Store environment variables in local environment files and hosting
    settings.
-   Never commit secrets or service-role keys to the frontend
    repository.

Do not create a separate Node.js/Express server for the MVP unless a
real requirement emerges.

## 9. Initial Database Design

Use UUID primary keys, created/updated timestamps and foreign keys where
appropriate.

### `weddings`

-   `id`
-   `owner_user_id`
-   `bride_name`
-   `groom_name`
-   `wedding_date`
-   `wedding_time`
-   `venue_name`
-   `venue_address`
-   `venue_map_url` (optional)
-   `total_budget`
-   `cover_image_url` (optional)
-   `invitation_slug` (unique)
-   `invitation_published`
-   `rsvp_enabled`
-   `created_at`
-   `updated_at`

### `expenses`

-   `id`
-   `wedding_id`
-   `title`
-   `description` (optional)
-   `category`
-   `total_amount`
-   `amount_paid`
-   `expense_date`
-   `paying_side` (Groom, Bride, Shared)
-   `payee_name` (optional)
-   `due_date` (optional)
-   `created_by`
-   `created_at`
-   `updated_at`

Derive payment status from `total_amount` and `amount_paid` when
possible: - Paid when amount paid equals total amount. - Partially Paid
when amount paid is greater than zero but below total. - Pending when
amount paid is zero.

### `family_members`

-   `id`
-   `wedding_id`
-   `user_id` (nullable until an account is linked)
-   `name`
-   `family_side`
-   `role`
-   `contact_info` (optional; protect carefully)
-   `created_at`

### `events`

-   `id`
-   `wedding_id`
-   `name`
-   `event_date`
-   `start_time` (optional)
-   `venue` (optional)
-   `notes` (optional)
-   `created_at`
-   `updated_at`

### `tasks`

-   `id`
-   `wedding_id`
-   `title`
-   `description` (optional)
-   `due_date` (optional)
-   `assigned_member_id` (optional)
-   `priority`
-   `status`
-   `created_at`
-   `updated_at`

### `discussions`

-   `id`
-   `wedding_id`
-   `author_user_id`
-   `title` (optional)
-   `content`
-   `entry_type` (Announcement, Discussion, Decision)
-   `status` (optional, for decisions)
-   `created_at`
-   `updated_at`

### `guests`

-   `id`
-   `wedding_id`
-   `name`
-   `contact_info` (optional)
-   `family_side`
-   `invitation_status`
-   `rsvp_status`
-   `created_at`
-   `updated_at`

If needed, add a separate RSVP submission table to record submission
timestamps and avoid exposing private guest records through public form
access. Public users must never receive unrestricted access to the
`guests` table.

### Data rules

-   All private records must be linked to the correct wedding.
-   Only the owner and explicitly authorized members can read or modify
    private records.
-   Public invitation reads must return only published invitation
    fields.
-   Public RSVP submissions must use a safe, restricted operation or
    server-side function; do not grant anonymous users broad table write
    access.
-   Validate all input on the client and enforce important constraints
    in the database.
-   Store timestamps consistently and display dates in the appropriate
    local timezone.

## 10. Security and Privacy Requirements

-   Enable Supabase RLS on every table containing private data.
-   Deny access by default and add explicit policies for authorized
    users.
-   Keep the public invitation separate from the private workspace.
-   Never expose Supabase service-role keys in client-side code.
-   Do not store passwords manually.
-   Protect guest contact details and family contact information.
-   Do not trust a hidden UI button as a security boundary; enforce
    permissions in the database.
-   Use safe validation for public RSVP submissions.
-   Avoid logging sensitive information.
-   Ensure a public slug cannot be used to access private records.

## 11. Functional Acceptance Criteria

The MVP is ready for testing when all of the following work:

1.  The owner can sign in and securely access the private dashboard.
2.  The owner can create and update wedding details and budget.
3.  The owner can add, edit, search, filter and delete expenses.
4.  Dashboard totals update correctly after expense changes.
5.  Paid, pending and partially paid amounts calculate correctly.
6.  Expenses can be identified by the bride's side, groom's side or
    shared.
7.  The owner can create events and tasks and update task status.
8.  Authorized family members can access only the areas permitted to
    them.
9.  Announcements and discussion entries can be created and displayed.
10. Guests can be added and their RSVP statuses can be managed.
11. The admin can customize, preview and publish an invitation.
12. The public invitation URL works without login and shows only
    published details.
13. Guests can submit an RSVP without accessing private records.
14. The invitation link can be copied and shared through WhatsApp.
15. The app works on mobile, tablet and desktop.
16. Forms show useful validation and error messages.
17. Unauthorized users cannot read or modify private wedding records.
18. Empty states work correctly and no fake dashboard totals are
    presented as real data.

## 12. Implementation Plan for Antigravity

Build in small, testable stages. Do not generate the entire application
as a single unverified code dump.

### Stage 1 --- Project Foundation

-   Inspect the existing repository before changing files.
-   Preserve existing working code and dependencies.
-   Set up routes, shared layout, design tokens and responsive
    navigation.
-   Create login and wedding setup screens.
-   Configure Supabase using environment variables.
-   Document required environment variables in `.env.example` without
    real secrets.

### Stage 2 --- Database and Authentication

-   Create database migrations or SQL setup scripts.
-   Configure authentication and RLS policies.
-   Test access restrictions before adding sensitive data.
-   Create typed data-access helpers.

### Stage 3 --- Dashboard and Expenses

-   Implement expense CRUD.
-   Add category and family-side filters.
-   Implement correct budget calculations.
-   Add dashboard summaries and empty states.
-   Test edge cases for partial payments and budget overruns.

### Stage 4 --- Family, Events and Tasks

-   Implement family member records and permissions.
-   Implement announcements, discussions and decisions.
-   Implement events and task management.
-   Verify private access rules.

### Stage 5 --- Guests and Invitation

-   Implement guest management and RSVP.
-   Build the invitation editor and live preview.
-   Build the public invitation route using a unique slug.
-   Add safe RSVP submission and WhatsApp sharing.
-   Ensure unpublished invitation data remains private.

### Stage 6 --- Polish and Release

-   Test responsive layouts and accessibility.
-   Test loading, empty, success and failure states.
-   Test authentication and RLS with different users.
-   Verify environment variables and production build.
-   Deploy to Vercel and document setup steps.

At the end of each stage, summarize files changed, functionality
completed, tests run and any remaining setup required. Do not claim a
feature is complete unless it has been implemented and tested.

## 13. Antigravity Working Instructions

-   First inspect the repository and report its current structure and
    installed dependencies.
-   If the project already exists, adapt it instead of replacing it
    unnecessarily.
-   If it is empty, scaffold the recommended stack.
-   Use reusable components and a clear feature-based folder structure.
-   Separate UI components, pages, data access, types and utilities.
-   Use TypeScript types for database records and form values where
    possible.
-   Keep business logic out of large UI components.
-   Use real Supabase data for persistent functionality; do not
    substitute local mock data for completed features.
-   If Supabase credentials are not configured, build the integration
    points and clearly identify what needs configuration. Never invent
    credentials.
-   Do not leave buttons, forms, filters or navigation links
    non-functional.
-   Do not add features outside the MVP without asking first.
-   Avoid unnecessary dependencies and excessive animation.
-   Run available linting, type checks and production builds; fix errors
    before moving to the next stage.
-   Keep setup and deployment instructions in the README.

## 14. Definition of Success

Make My Marriage succeeds as an MVP when the owner can use one private,
responsive web app to track the wedding budget and expenses, coordinate
basic family information and tasks, manage guests, and publish a
beautiful shareable invitation---all with secure data access and no
unnecessary complexity.

**Final priority:** Correct functionality and data security first,
polished UI second, advanced features later.
