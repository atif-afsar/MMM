# Make My Marriage --- UI Design System

**Version:** 1.0\
**Purpose:** Visual and interaction guidelines for the Make My Marriage
MVP\
**Design principle:** Elegant wedding warmth with the clarity of a
modern productivity app

## 1. Product Design Direction

Make My Marriage should feel personal, calm, premium and
trustworthy---not like a generic finance dashboard and not like an
overly decorative wedding invitation site.

Use two related visual modes: 1. **Private app:** Minimal, practical,
calm and easy to scan. This is where the owner manages the wedding. 2.
**Public invitation:** Romantic, editorial and celebratory. This is what
invited guests see.

Both modes should share typography and a restrained palette, while the
invitation can use richer decorative details.

## 2. Brand Personality

-   Elegant, warm, modern, personal, organized and trustworthy.
-   Avoid excessive gradients, glassmorphism, neon colors, heavy
    shadows, thick borders, unnecessary animations, generic
    admin-template styling, and excessive wedding decoration that harms
    readability.

## 3. Color Palette

-   **Warm Ivory:** `#FAF8F4` --- primary app background.
-   **Pure White:** `#FFFFFF` --- main content surfaces.
-   **Deep Forest:** `#233D35` --- primary brand color and main action.
-   **Muted Sage:** `#DCE5DC` --- subtle secondary surfaces.
-   **Champagne:** `#D7BE8A` --- restrained premium accent.
-   **Charcoal:** `#292B29` --- main text.
-   **Muted Gray:** `#777A75` --- secondary text.
-   **Border:** `#E8E4DC` --- separators and outlines.
-   **Success:** `#34765B`.
-   **Warning:** `#A96C24`.
-   **Danger:** `#B54747`.

Use ivory for the canvas, white for surfaces, forest green for primary
actions, and gold sparingly. Status must not be communicated by color
alone.

## 4. Typography

Recommended pairing: - **Headings / invitation names:**
`DM Serif Display` or `Playfair Display`. - **Body / UI:** `Inter` or
`Manrope`.

Type scale: - Page title: 30--36 px desktop, 26--30 px mobile. - Section
title: 18--22 px. - Card metric: 26--32 px. - Body: 14--16 px. - Helper
text: 12--13 px. - Button text: 14--15 px, medium weight.

Use serif type sparingly in the private app and more expressively in the
invitation. Keep labels and data easy to read.

## 5. Layout and Spacing

-   4 px spacing scale: 4, 8, 12, 16, 24, 32, 40, 48.
-   Main desktop content max width: 1440 px.
-   Desktop sidebar: 240--256 px.
-   Main content padding: 32 px desktop, 20--24 px tablet, 16 px mobile.
-   Use a 12-column grid on wide screens where helpful.
-   Cards: 12--16 px radius.
-   Buttons and inputs: 10--12 px radius.
-   Use subtle 1 px borders and light shadows only when they clarify
    hierarchy.
-   Keep whitespace generous but ensure key actions are visible.
-   Mobile touch targets should be at least 44 px.

## 6. Private App Shell

### Desktop

-   Left sidebar with brand mark and "Make My Marriage".
-   Navigation: Overview, Expenses, Events & Tasks, Family Space,
    Guests, Invitation, Settings.
-   Active navigation uses a soft sage surface and deep forest text.
-   Compact profile/workspace area at the bottom of the sidebar.
-   Main header includes current page title and one clear primary
    action.

### Mobile

-   Use a compact top bar and collapsible drawer or clean bottom
    navigation.
-   Do not squeeze the desktop sidebar onto mobile.
-   Keep the page's main action easy to reach.
-   Convert tables to readable cards or use deliberate horizontal
    scrolling.

## 7. Dashboard Components

-   Greeting and couple names.
-   Wedding date/countdown only when a date is configured.
-   Four key metrics: Total Budget, Spent, Remaining, Pending Payments.
-   Budget usage progress bar.
-   Optional category breakdown chart.
-   Recent expenses with category, paying side, date, amount and status.
-   Upcoming events and tasks.
-   Helpful empty states such as "Add your first expense".
-   Never show fabricated values or fake charts as real data.

Keep the first screen calm, useful and scannable.

## 8. Expense Tracker UI

-   Page title and concise helper text.
-   Primary "Add Expense" action.
-   Search and filters for category, family side, date and payment
    status.
-   Desktop columns: Expense, Category, Paid By, Date, Total, Paid,
    Status.
-   Mobile cards with the most important fields first.
-   Consistent status pills for Paid, Partially Paid and Pending.
-   Add/edit form in a modal or dedicated page with grouped fields.
-   Confirm before deletion.
-   Show totals and budget context without overwhelming the page.

## 9. Family Space UI

-   Clearly labeled groups: Groom's Side, Bride's Side and Shared.
-   Member rows with name, role and permission indicator.
-   Announcement/discussion feed with author and date.
-   Compact task assignments and decision records.
-   Keep it a shared planning space, not a chat-app clone.

## 10. Events, Tasks and Guests

### Events & Tasks

-   Separate Events and Tasks with tabs or distinct sections.
-   Event cards show name, date, time, venue and notes.
-   Task rows show title, assignee, due date, priority and completion
    state.
-   Make overdue tasks noticeable but not alarmist.

### Guests

-   Summary counts: Total Guests, Attending, Awaiting Response.
-   Search and filters for family side and RSVP status.
-   Compact, readable guest list.
-   Never expose guest contact details on public pages.

## 11. Invitation Editor

-   Connect editor and preview visually.
-   Desktop: two columns, fields on one side and live preview on the
    other.
-   Mobile: stack editor and preview with a clear preview action.
-   Editable fields: names, message, date/time, venue, events, photos,
    theme colors and RSVP setting.
-   Provide Save Draft and Publish actions.
-   Show the public URL with Copy Link and Share on WhatsApp controls.
-   Never claim changes are published until the save/publish operation
    succeeds.

## 12. Public Invitation Design

The invitation is the emotional centerpiece of the product.

-   Editorial Indian wedding aesthetic.
-   Warm ivory/cream base, deep green text and restrained champagne-gold
    accents.
-   Elegant serif typography for couple names.
-   Subtle botanical, floral or fine-line ornamental details.
-   One strong hero area with names and wedding date.
-   Clear event details and venue.
-   Optional couple photo with tasteful cropping.
-   One clear RSVP action.
-   Mobile-first vertical composition.
-   Subtle fade/slide animations; respect reduced-motion preferences.
-   No autoplay audio.

## 13. Interaction and Component Rules

-   Primary buttons: deep forest fill with white text.
-   Secondary buttons: white/transparent with subtle border.
-   Destructive actions: danger styling plus confirmation.
-   Inputs need visible labels, focus states and helpful validation.
-   Use familiar Lucide-style icons sparingly.
-   Loading states should avoid layout jumps.
-   Empty states should explain the next action.
-   Keep success and error messages concise.
-   Dialogs must be keyboard accessible and have a clear close action.
-   Avoid animations that delay user tasks.

## 14. Accessibility and Responsive Requirements

-   Aim for WCAG AA contrast.
-   All controls need accessible labels and keyboard support.
-   Show visible focus rings.
-   Do not rely only on color for status.
-   Mobile touch targets at least 44 × 44 px.
-   Test at widths around 360 px, 768 px, 1024 px and 1440 px.
-   Public invitation must not have horizontal scrolling on narrow
    screens.
-   Handle long names, long venue addresses and missing images
    gracefully.

## 15. Implementation Notes for Antigravity

-   Read this file together with `Make_My_Marriage_PRD.md`.
-   The PRD is the source of truth for features; this file defines
    visual direction.
-   Inspect existing code before editing.
-   Extract colors, spacing, radii and typography into reusable theme
    tokens.
-   Build reusable components for buttons, inputs, status pills, summary
    metrics, page headers, empty states and dialogs.
-   Use real app data for functional screens; do not leave placeholder
    charts or inert controls.
-   Keep the private dashboard and public invitation visually related
    but clearly distinct.
-   Use Framer Motion only for purposeful, subtle transitions.
-   Do not redesign the product into a public SaaS marketing site.
-   Implement incrementally and verify responsive behavior after each
    major page.
