# Kav Haribis (קַו הַרִבִּית) — Official Web Platform

Welcome to the **Kav Haribis** repository. This is a full-stack Next.js/Vinext web application built for Halachic financial services, Kosher bank & investment research, Heter Iska frameworks, Rabbinical consultation (Bais Horaah), Ribbis alerts, educational media, and Seforim distribution.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Database & Schema](#-database--schema)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Deployment & Cloudflare Setup](#-deployment--cloudflare-setup)
- [License & Credits](#-license--credits)

---

## 🌟 Overview

**Kav Haribis** is dedicated to educating, reviewing, certifying, and guiding individuals, businesses, lenders, and financial institutions on the Halachos of *Ribbis* (prohibition of interest). The platform bridges traditional Halachic authority with modern digital tools, providing searchable directories, automated document workflows, public alerts, and administration portals.

---

## 🚀 Key Features

### 🏦 Kosher Bank & Investment Research
* **Bank Directory**: Searchable directory of banks and financial institutions categorized by their Halachic status and Heter Iska compliance.
* **Bank Research Portal**: Multi-stage workflow for researchers and reviewers to submit, inspect, and approve institutional reports.
* **High-Yield Savings & Investment Directories**: Comparisons of Halachically reviewed savings accounts and verified investment opportunities.

### 📜 Heter Iska & Business Verification
* **Heter Iska Advisory**: Educational materials, templates, and guidance on choosing and executing a valid Heter Iska.
* **Personalized Heter Iska Service**: Form-based request system for custom corporate and personal Heter Iska documents.
* **Directory of Verified Businesses**: Searchable list of businesses operating with an active, verified Heter Iska under Rabbinical oversight.

### 🛡️ Kosher Investment & Lender Certification
* **Institutional Assessment**: Comprehensive Halachic review of ownership, economic structure, loan products, agreements, and servicing.
* **Certification Application & Review**: Structured submission system for investment sponsors, mortgage companies, and direct lenders.
* **Verification Badges & Reports**: Publicly verifiable certification seals and downloadable determination reports.

### ⚖️ Bais Horaah (Rabbinical Inquiry Hub)
* **Confidential Q&A**: Direct submission form for complex Ribbis inquiries with reference tracking and email updates.
* **Admin Review Queue**: Rabbinical response management dashboard.

### 🔔 Ribbis Alerts & Tip Submissions
* **Community Alerts**: Real-time notifications on financial product updates, institutional changes, and Ribbis advisories.
* **Tip Line**: Secure submission form for users to report potential Ribbis concerns or institutional updates.
* **Subscriber System**: Email notification management for subscribers.

### 📚 Educational Center & Seforim Store
* **Articles & Gilyonos**: PDF viewer and digital download library for published Halachic papers and newsletters.
* **Educational Downloads**: Media, coloring pages, and learning guides for families and institutions.
* **Seforim Store**: Online bookstore with physical & digital format selection, shopping cart, and checkout workflow.

### 🔒 Administration & Access Control
* **Role-Based Admin Panel**: Granular permissions for admins, staff, researchers, and reviewers.
* **Submissions & Order Management**: Central management for questions, donations, certifications, alerts, and member orders.

---

## 🛠️ Tech Stack

* **Framework & Engine**: [Next.js](https://nextjs.org/) (App Router format), powered by [Vinext](https://github.com/cloudflare/vinext) & [Vite](https://vitejs.dev/)
* **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/) Edge Runtime
* **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, React Icons
* **Database & ORM**: Cloudflare D1 (SQLite) with [Drizzle ORM](https://orm.drizzle.team/) & Drizzle Kit
* **Storage & Media**: Cloudflare R2 / Local Static Storage with PDF processing via `pdf-lib`
* **Email & Payments**: Nodemailer, Cardknox/Sola API integration
* **Testing & Tools**: Node.js test runner (`node --test`), ESLint, Prettier, Wrangler CLI

---

## 📂 Project Architecture

```text
├── app/                              # Next.js App Router source
│   ├── (public pages)/               # Home, About, Contact, Donate, Membership
│   ├── bank-directory/               # Kosher bank directory & reports
│   ├── kosher-investment-certification/ # Investment & lender certification
│   ├── heter-iska/                   # Heter Iska guidance & resources
│   ├── personalized-heter-iska/      # Custom Heter Iska request workflow
│   ├── businesses-with-a-heter-iska/ # Directory of verified businesses
│   ├── bais-horaah/                  # Rabbinical consultation Q&A
│   ├── ribis-alerts/                 # Ribbis alerts & tip submission portal
│   ├── savings/                      # High-yield kosher savings comparison
│   ├── kosher-investment-opportunities/ # Kosher investments directory
│   ├── seforim/                      # Online Seforim bookstore & cart
│   ├── articles/                     # Digital article PDFs & reader
│   ├── educational-center/           # Educational downloads & media
│   ├── admin/                        # Secure administration dashboard
│   ├── api/                          # Backend API routes & Cloudflare worker handlers
│   └── shared/                       # Shared components (Header, Footer, Navigation)
├── db/                               # Database schema definition (Drizzle ORM)
├── drizzle/                          # SQL migration files
├── public/                           # Static brand assets, images, and documents
├── scripts/                          # Build, Wrangler sync, and migration helper scripts
├── tests/                            # Automated end-to-end and HTML integration tests
├── vite.config.ts                    # Vite configuration with Cloudflare / React plugins
├── drizzle.config.ts                 # Drizzle Kit migration configuration
└── wrangler.jsonc                    # Cloudflare Worker & D1 binding configuration
```

---

## 🗄️ Database & Schema

The application uses **Drizzle ORM** over **Cloudflare D1**. Key tables defined in [`db/schema.ts`](file:///c:/Users/Win%2011/OneDrive/Desktop/Kav-Haribis-Developer-Source/db/schema.ts):

- `questions`: Bais Horaah inquiries and rabbinical answers.
- `donations`: Supporter contributions and dedications.
- `banks` & `bank_research_submissions`: Kosher bank directory data and multi-step research workflow.
- `businesses`: Verified Heter Iska business directory listings.
- `loan_services`: Certified lending companies and kosher loan service directory.
- `savings_accounts`: Kosher high-yield savings directory.
- `investment_opportunities`: Halachically reviewed investment offerings.
- `ribbis_alerts` & `alert_tips`: Public alerts and user-submitted tip reports.
- `articles` & `educational_resources`: Digital library items and downloads.
- `members` & `member_orders`: Seforim orders and user accounts.
- `admin_staff_access` & `bank_researchers`: Role-based permissions and access tokens.

---

## 💻 Getting Started

### Prerequisites

* **Node.js**: `>= 22.13.0`
* **npm**: `>= 10.0.0`
* **Git** & **Bash** (for script execution)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sardarit-bd/kas-haribis.git
   cd kas-haribis
   ```

2. **Install dependencies**:
   ```bash
   npm ci
   ```

3. **Set up local environment variables**:
   Copy `.env.example` to `.env.local` and configure your credentials:
   ```bash
   cp env.example .env.local
   ```

4. **Run database migrations (Local D1)**:
   ```bash
   npm run db:migrate:local
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` (or the URL shown in terminal) to view the app.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite local development server with Wrangler config sync |
| `npm run build` | Builds the production artifact via `vinext` |
| `npm run start` | Previews the production build locally |
| `npm run test` | Builds and runs automated HTML integration tests (`tests/rendered-html.test.mjs`) |
| `npm run db:generate` | Generates new SQL migrations from `db/schema.ts` |
| `npm run db:migrate:local` | Applies pending migrations to local Cloudflare D1 database |
| `npm run db:migrate:remote` | Applies pending migrations to production Cloudflare D1 database |
| `npm run deploy` | Deploys the project to Cloudflare Workers |

---

## ☁️ Deployment & Cloudflare Setup

This application is designed for seamless deployment on **Cloudflare Workers**.

1. **Wrangler Configuration**:
   Ensure `wrangler.jsonc` is configured with your Cloudflare D1 database bindings and environment variables.

2. **Remote Migration**:
   Before deploying, apply database schema migrations to the remote D1 instance:
   ```bash
   npm run db:migrate:remote
   ```

3. **Deploy to Cloudflare**:
   ```bash
   npm run deploy
   ```

---

## 📄 License & Contact

Copyright © **Kav Haribis**. All rights reserved.

For inquiries, rabbinical guidance, or institutional certification requests, please visit the website or contact **kavharibis@gmail.com**.
