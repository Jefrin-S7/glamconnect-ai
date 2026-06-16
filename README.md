# GlamConnect AI

Chennai's AI-matched beauty salon marketplace — discover, compare, and book
salons matched to your hair, budget, and schedule, with an AI layer that
explains *why* a salon fits instead of just showing a star rating.

## Problem → Solution

Salon discovery in Chennai is fragmented across Google, Instagram, and
WhatsApp, customers can't tell which listing is trustworthy, and independent
salon owners have no digital storefront or marketing capacity. GlamConnect AI
is a two-sided marketplace with an AI Beauty Assistant, an explainable Match
Score, and AI-generated marketing tools for salon owners.

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn-style UI
primitives · Firebase (Auth + Firestore) · Server Actions · an LLM provider
behind an internal `AIProvider` interface (`lib/ai/provider.ts`) · deployed on
Vercel.

## Project structure

```
app/        App Router pages, grouped by role (public / customer / owner / admin)
actions/    Server Actions, one file per domain
lib/        firebase/ (client + admin SDK), ai/ (provider interface + prompts)
components/ ui/ holds the shadcn-style primitives; feature folders added as built
types/      Shared TypeScript types mirroring the Firestore schema
scripts/    One-off scripts (seed data, precomputed AI review summaries)
```

See `docs/` (or the original PRD / Technical Architecture / 48-Hour Buildathon
Roadmap documents) for the full feature breakdown, Firestore schema, and the
module-by-module build plan.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Firebase + Anthropic API credentials
npm run dev
```

## What's intentionally not built yet

Payment gateway integration, transactional double-booking prevention,
multi-city support, and full admin moderation tooling are designed in the
Technical Architecture doc but scoped out of the current build — see that
document's roadmap section for the path from here to production.
