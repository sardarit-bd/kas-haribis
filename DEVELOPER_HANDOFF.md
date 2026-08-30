# Kav Haribis — Fiverr Pro Developer Handoff

This package contains the full frontend and backend application source code for the Kav Haribis website.

## Technology

- TypeScript, React, Next.js/Vinext, and Vite
- Cloudflare Worker runtime
- Cloudflare D1-compatible database through Drizzle ORM
- R2-compatible file storage
- Server-rendered public and administration routes

## Included

- All public website pages and styling
- All administration pages
- API/backend routes
- Database schema and migrations
- Authentication and role/permission logic
- Payment integration code
- Static images, PDFs, and educational materials stored in the source project
- Build, validation, and test scripts

## Intentionally not included

- Production database contents or private customer records
- Production file-storage contents that are not source-controlled
- Cardknox/Sola credentials
- Encryption keys, API keys, session secrets, or access codes
- ChatGPT Sites project identity or deployment credentials

The developer must use a separate development database and storage bucket. Never connect the development copy to the live production database.

## Local setup

1. Install Node.js 22.13 or newer on Linux/WSL.
2. Run `npm ci`.
3. Run `npm run dev` for local development.
4. Run `npm test` before delivery.

The database schema is in `db/schema.ts`; migration files are in `drizzle/`.

## Scope of work

Polish the complete public frontend and administration interface while preserving all existing routes, forms, permissions, database behavior, uploads, protected downloads, and payment workflows. Do not remove functionality merely to simplify the design.

## Delivery requirements

- Return the complete updated source code, not only screenshots or compiled files.
- Provide a list of every changed file and all setup/deployment changes.
- Include any new environment-variable names in an `.env.example` file without real credentials.
- Confirm `npm test` passes.
- Provide a test/staging URL for review.
- Do not deploy over the live Kav Haribis website or use live credentials without written approval from the owner.
