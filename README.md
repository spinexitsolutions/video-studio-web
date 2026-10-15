# Lumen Studio — Photography & Film Website + CMS

A cinematic, fully dynamic website for a photography & videography studio, with a complete admin CMS.
Built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, **Framer Motion**, **Lenis** smooth scroll and **Three.js / React Three Fiber**.

## Highlights

### Website
- **Hero viewfinder** – full-screen slideshow with Ken Burns motion, a live camera HUD (REC timecode, ISO/f-stop/shutter, exposure scale, frame counter) and an autofocus box that tracks the cursor and "locks" on each new frame.
- **Scroll-driven 3D camera** – a procedurally built mirrorless camera (no model file needed). As you scroll it rotates, zooms its lens, explodes into its optical elements, turns to show its screen and ends with a shutter flash. Chapters are editable in the CMS.
- **Text animation** – masked letter/word reveals, rotating hero words, scramble/decoding labels and an Apple-style manifesto where words light up as you scroll.
- **35 mm film-strip portfolio** – a pinned horizontal gallery with sprocket holes and frame numbers.
- **Bento services grid** with cursor spotlight, **showreel** that grows to full-bleed on scroll, **before/after retouch slider**, animated **stats counters**, **process timeline**, **testimonials carousel**, **pricing** with an animated highlight border, **team**, **journal**, **FAQ** accordion and a parallax **call to action**.
- Site-wide: intro preloader (aperture blades), custom focus-ring cursor with contextual labels ("View", "Play", "Drag"…), magnetic buttons, smooth scroll, scroll-progress bar, film-grain overlay, glass navigation that hides on scroll, announcement bar, WhatsApp chat button, newsletter signup.
- Pages: Home, Work (filterable masonry), Project detail (gallery + lightbox + video), Services, Pricing, Studio/About, Journal + posts, Contact with a **3-step booking form**, 404.
- SEO: per-page metadata, Open Graph, `sitemap.xml`, `robots.txt`, JSON-LD business schema.
- Respects `prefers-reduced-motion`; responsive down to small phones.

### Admin CMS (`/admin`)
- Secure login (bcrypt + signed HTTP-only session cookie), **admin** and **editor** roles, brute-force throttling.
- **Dashboard** with enquiry chart, booking pipeline, latest enquiries and content counts.
- **Bookings inbox** – status workflow (new → contacted → confirmed → completed/cancelled), internal notes, reply by email / WhatsApp, CSV export.
- **Subscribers** list with copy-all and CSV export.
- **Pages**: Hero, Homepage (drag to reorder / toggle every section, edit all headings), About, Site settings (brand, accent colour, contact, socials, SEO, announcement bar, feature toggles).
- **Collections**: Portfolio, Services, Pricing, Testimonials, Team, Journal, FAQs, 3D-camera chapters, Process, Stats, Clients — search, draft/publish toggle, drag-to-reorder, duplicate, delete.
- Rich field types: image picker, drag-sortable galleries, markdown editor with preview, lists, tags, colour picker, slugs, toggles, dates.
- **Media library** – drag-and-drop uploads (images & video), alt text, copy URL.
- **Users** management, **My account** (change password), **Backup & restore** (JSON).
- Unsaved-changes indicator and ⌘S / Ctrl+S to save. Every change is live on the site instantly.

The admin is schema-driven: add a field to `src/lib/cms-schema.ts` and it appears in the editor automatically.

## Getting started

```bash
npm install
cp .env.example .env.local   # then edit the values
npm run dev                  # http://localhost:3000
```

Admin: <http://localhost:3000/admin> — default login `admin@lumenstudio.com` / `admin123`
(set `ADMIN_EMAIL` / `ADMIN_PASSWORD` **before the first run** to choose your own, and change the password under *My account*).

Production:

```bash
npm run build
npm start
```

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | Long random string used to sign admin sessions. **Required in production.** |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin account, created when the database is first seeded. |
| `DATA_DIR` | Where the database and uploads live (default `./data`). |
| `SITE_URL` | Public URL used in the sitemap (optional). |
| `INSECURE_COOKIES=1` | Allow login over plain HTTP in production (not recommended). |

## Data & hosting

Content is stored in a small JSON document database at `data/db.json` (created and filled with demo content on first run) and uploaded files in `data/uploads/`. Writes are atomic and serialized. Run `npm run seed` to wipe the database and restore the demo content.

Because content is stored on disk, deploy to a host with a persistent filesystem — a VPS, Docker, Railway, Render, Fly.io etc. — and keep `DATA_DIR` on a persistent volume. (Serverless platforms with read-only filesystems would need the store in `src/lib/db.ts` swapped for a hosted database.)

Demo photography is loaded from Unsplash; replace it with your own work through the admin's media library.

## Project structure

```
src/
  app/(site)/        public pages
  app/admin/         admin login + panel pages
  app/api/           auth, admin CRUD, media upload, bookings, newsletter
  components/
    sections/        homepage & page sections
    three/           3D camera (React Three Fiber)
    motion/          text/scroll animation primitives
    site/            nav, footer, cursor, preloader, lightbox…
    admin/           CMS shell, forms, fields, inbox, media picker
  lib/               db, auth, cms schema, seed content, types
```
