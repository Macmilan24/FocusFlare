# 🔥 FocusFlare

**FocusFlare** is an educational Next.js 15 application designed to empower children with ADHD through interactive stories, quizzes, games, and progress tracking—while giving parents full visibility into their child’s learning journey.

---

## 🚀 Table of Contents

1. [👋 Introduction](#-introduction)
2. [🔗 Repository](#-repository)
3. [🛠️ Prerequisites](#️-prerequisites)
4. [📥 Installation & Setup](#-installation--setup)
5. [⚙️ Environment Variables](#️-environment-variables)
6. [💾 Database & Seeding](#-database--seeding)
7. [🚧 Running the App](#-running-the-app)
8. [📋 Available Scripts](#-available-scripts)
9. [📁 Project Structure](#-project-structure)
10. [❓ Troubleshooting](#-troubleshooting)
11. [☁️ Deployment](#️-deployment)

---

## 👋 Introduction

FocusFlare helps children with ADHD learn and parents monitor progress.
Key features:

- Role-based authentication (Parents vs. Children)
- Interactive story modules, quizzes, mini-games
- Real-time progress tracking and dashboards
- Next.js 15 App Router + Server Components
- Prisma ORM with MongoDB
- TailwindCSS + Radix UI for styling

---

## 🔗 Repository

This is a **private** GitHub repo under the `Focus-Flare` organization:

```bash
git clone https://github.com/Focus-Flare/FocusFlare.git
```

---

## 🛠️ Prerequisites

Before you begin, ensure you have:

- Git (https://git-scm.com/)
- Node.js v18+ & npm (https://nodejs.org/) _(or Yarn/PNPM)_
- A MongoDB Atlas account (free tier is fine)
- npx & ts-node (for seeding)

---

## 📥 Installation & Setup

1. **Clone the repo & cd in**

   ```bash
   git clone https://github.com/Focus-Flare/FocusFlare.git
   cd FocusFlare
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or yarn install
   # or pnpm install
   ```

3. **Set up your environment file** (see next section)

---

## ⚙️ Environment Variables

Copy the example and fill in your own values:

```bash
cp .env.example .env
```

Open `.env` and provide:

- **DATABASE_URL**

  - Go to MongoDB Atlas → Build a Cluster → Connect → “Connect your application” → copy URI.
  - Paste and replace `<username>`, `<password>`, `<cluster>`, and `<dbname>`.

- **AUTH_SECRET**

  - Generate a 32-byte secret:
    ```bash
    npx next-auth secret
    # or
    openssl rand -base64 32
    ```

- **AUTH_TRUST_HOST**

  - Keep as `true` for local development.

- **NEXTAUTH_URL**
  - Your app base URL, e.g. `http://localhost:3000`.

---

## 💾 Database & Seeding

1. **Generate Prisma client**

   ```bash
   npm run prisma:generate
   ```

2. **Push schema to MongoDB**

   ```bash
   npm run prisma:push
   ```

3. **Seed the database**
   ```bash
   npm run prisma:seed
   ```

The seed script ([`prisma/seed.ts`](prisma/seed.ts)) creates sample users (Parent & Child) and demo content.

---

## 🚧 Running the App

Start the development server with Turbopack:

```bash
npm run dev
```

- Open http://localhost:3000
- First-time users see the Sign In / Register pages
- Parents are redirected to `/parent/home`
- Children are redirected to `/kid/home`

---

## 📋 Available Scripts

| Command                   | Description                          |
| ------------------------- | ------------------------------------ |
| `npm run dev`             | Next.js development mode (Turbopack) |
| `npm run build`           | Build for production                 |
| `npm run start`           | Start production server              |
| `npm run lint`            | Run ESLint                           |
| `npm run prisma:generate` | Generate Prisma client               |
| `npm run prisma:push`     | Apply Prisma schema to the database  |
| `npm run prisma:seed`     | Run the TypeScript seed script       |

---

## 📁 Project Structure

```
/app                     – Next.js App Router pages & layouts
/components              – Reusable React components
/actions                 – Server & client actions (auth, content)
/lib                     – Utilities: database client, auth helpers
/prisma                  – Prisma schema & seed script
/public                  – Static assets (images, icons)
```

---

## ❓ Troubleshooting

- **PrismaClientInitializationError** in browser  
  → Use Prisma only in Server Components or [`actions`](actions).

- Seed script TypeScript errors  
  → Ensure `ts-node` is installed and you ran `npm install`.

- Images not loading  
  → Put them in `/public/images` and reference via `/images/...`.

---

## ☁️ Deployment

1. Push to GitHub
2. Import into Vercel (https://vercel.com/new)
3. Add the same environment variables in Vercel dashboard
4. Vercel auto-builds & deploys your app

Enjoy building with **FocusFlare**!
