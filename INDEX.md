# BMSA Email Dashboard — File Index

> Every file and folder in the project with its path and a one-line description.

## Root Config Files

| Path | Description |
|---|---|
| `package.json` | Project dependencies and npm scripts |
| `tsconfig.json` | TypeScript compiler configuration |
| `next.config.ts` | Next.js configuration with xlsx externalized |
| `tailwind.config.ts` | Tailwind CSS theme with BMSA brand colors and custom animations |
| `postcss.config.mjs` | PostCSS configuration for Tailwind processing |
| `.env.local` | Environment variables (Brevo API key, Supabase credentials, password, sender info) |
| `.gitignore` | Files excluded from version control |
| `vercel.json` | Vercel deployment config with cron job for scheduled emails |
| `INDEX.md` | This file — project file index |

---

## `/app` — Pages & API Routes (Next.js App Router)

| Path | Description |
|---|---|
| `app/layout.tsx` | Root layout with Inter font, metadata, and global CSS |
| `app/globals.css` | Global styles with Tailwind directives, editor styles, and reusable component classes |
| `app/page.tsx` | Login page — password input with "Remember this device", redirects to dashboard if authenticated |
| `app/dashboard/page.tsx` | Main compose interface — subject input, rich text editor, audience selector, live preview, send/test/schedule actions |
| `app/members/page.tsx` | Member management — drag-and-drop Excel upload, preview, filterable table with inline edit/delete |
| `app/history/page.tsx` | Sent email history table with status badges and CSV export |
| `app/templates/page.tsx` | Saved email templates as cards — load into compose with one click, delete |
| `app/scheduled/page.tsx` | Scheduled email queue — upcoming sends with cancel option |
| `app/settings/page.tsx` | Configure sender name and email, view env variable reference |

### API Routes

| Path | Description |
|---|---|
| `app/api/auth/route.ts` | POST — verify president password, return auth token |
| `app/api/members/route.ts` | GET — list all members; POST — upload Excel (preview) or confirm JSON import |
| `app/api/members/[id]/route.ts` | PUT — update a member; DELETE — remove a member |
| `app/api/send/route.ts` | POST — send personalized emails to selected audience via Brevo, log to history |
| `app/api/send-test/route.ts` | POST — send test email to president's address with [TEST] prefix |
| `app/api/templates/route.ts` | GET — list templates; POST — create new named template |
| `app/api/templates/[id]/route.ts` | DELETE — remove a template |
| `app/api/history/route.ts` | GET — list all sent email history |
| `app/api/scheduled/route.ts` | GET — list scheduled emails; POST — create scheduled email |
| `app/api/scheduled/[id]/route.ts` | DELETE — cancel/remove a scheduled email |
| `app/api/settings/route.ts` | GET — read sender settings; PUT — update sender settings |
| `app/api/cron/route.ts` | GET — cron endpoint to process due scheduled emails |

---

## `/components` — React Components

| Path | Description |
|---|---|
| `components/Sidebar.tsx` | Collapsible navigation sidebar with page links, BMSA branding, and logout button |
| `components/AuthGuard.tsx` | Client-side auth wrapper — checks localStorage token, redirects to login if invalid |
| `components/AudienceSelector.tsx` | Multi-select toggle buttons (SCOPH, SCORA, etc.) with live member count badges and dedup logic |
| `components/EmailComposer.tsx` | Rich text editor (contentEditable) with formatting toolbar — bold, italic, underline, headings, lists, links |
| `components/EmailPreview.tsx` | Live HTML email preview in sandboxed iframe — shows exactly how recipients will see the email |
| `components/MemberTable.tsx` | Filterable data table with search, committee/status filters, inline editing, and delete |
| `components/ConfirmSendModal.tsx` | Confirmation modal showing subject, audience, and scrollable recipient list before sending |
| `components/ScheduleModal.tsx` | Date/time picker modal for scheduling future email sends |
| `components/TemplateCard.tsx` | Card component for saved templates with preview snippet, load action, and delete |

---

## `/lib` — Utility Libraries

| Path | Description |
|---|---|
| `lib/supabase.ts` | Supabase client initialization using service role key (server-side only) |
| `lib/auth.ts` | Auth utilities — password verification, token generation (30-day or session), token validation |
| `lib/brevo.ts` | Brevo API wrapper — individual and batch personalized email sending with rate limiting |
| `lib/excel.ts` | Excel file parser using SheetJS — validates headers, normalizes data, returns structured members |
| `lib/emailTemplate.ts` | HTML email template builder with inline styles, base64 logo, and `{{name}}` personalization |
| `lib/logo.ts` | BMSA logo as base64 string for embedding in email HTML |

---

## `/types` — TypeScript Types

| Path | Description |
|---|---|
| `types/index.ts` | TypeScript interfaces for Member, EmailTemplate, HistoryEntry, ScheduledEmail, Settings, AudienceGroup |

---

## `/supabase` — Database

| Path | Description |
|---|---|
| `supabase/schema.sql` | SQL schema for all 5 tables (members, templates, sent_history, scheduled_emails, settings) with indexes and RLS |

---

## `/public` — Static Assets

| Path | Description |
|---|---|
| `public/bmsa-logo.png` | BMSA logo image for web UI display |
