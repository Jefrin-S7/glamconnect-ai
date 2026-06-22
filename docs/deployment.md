# GlamConnect AI — Deployment Guide

## 0. Prerequisites

| Dependency | Where to get it | Takes |
|---|---|---|
| Firebase project | console.firebase.google.com | 5 min |
| Firebase Admin service account key | Project Settings → Service accounts | 2 min |
| NVIDIA NIM API key | build.nvidia.com → Settings → API Keys | 3 min |
| Vercel account | vercel.com | 2 min |

---

## 1. Firebase Project Setup

### 1.1 Enable services

In the Firebase console for your project:
- **Authentication** → Sign-in methods → Enable **Google**
- **Firestore Database** → Create database → **Production mode** → choose `asia-south1` (Mumbai, closest to Chennai)
- Leave Firebase Storage disabled for now (gallery images use gradient accents in this build, no uploads yet)

### 1.2 Authorised domains

Authentication → Settings → Authorised domains → Add:
- `your-project.vercel.app`
- Your custom domain if you have one

### 1.3 Firestore security rules

Replace the default rules with these. They enforce server-side ownership
checks at the DB layer as a second line of defence behind the Server Actions:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Salons — public read, owner-only write
    match /salons/{salonId} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.uid == resource.data.ownerId;
    }

    // Reviews — public read, authenticated users can create (once per booking, enforced app-side)
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.customerId;
      allow update, delete: if false;
    }

    // Bookings — owner of the booking can read and cancel
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null
                          && request.auth.uid == resource.data.customerId;
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.customerId;
    }

    // Users — only the matching user can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null
                          && request.auth.uid == userId;
    }

    // Favorites
    match /favorites/{docId} {
      allow read, write: if request.auth != null
                          && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 1.4 Get the Admin SDK service account key

Project Settings → Service accounts → Generate new private key → download JSON.

You'll need three values from this file:
- `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
- `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
- `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (the full string including `-----BEGIN...END-----`)

---

## 2. Environment Variables

Set **all** of these in Vercel under **Settings → Environment Variables**,
checking both **Preview** and **Production** for every variable.

> ⚠️ The `private_key` value contains literal newlines. Paste it as-is into
> Vercel's UI — Vercel preserves them correctly. If you're using the Vercel
> CLI, wrap the value in single quotes: `'-----BEGIN...\n...END-----'`.

| Variable | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | From Firebase Console → Project settings → Web app → SDK config | Preview + Production |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-project-id.firebaseapp.com` | Preview + Production |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your Firebase project ID | Preview + Production |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-project-id.appspot.com` | Preview + Production |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | From SDK config | Preview + Production |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | From SDK config | Preview + Production |
| `FIREBASE_ADMIN_PROJECT_ID` | From service account JSON | Preview + Production |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | From service account JSON | Preview + Production |
| `FIREBASE_ADMIN_PRIVATE_KEY` | From service account JSON (full PEM string) | Preview + Production |
| `NVIDIA_API_KEY` | From build.nvidia.com, format `nvapi-…` | Preview + Production |

### Vercel-specific notes

- Variables prefixed `NEXT_PUBLIC_` are bundled into the client JS — only ever put
  non-secret values there. Firebase client config is safe to expose (access is
  controlled by Firestore rules, not by keeping the key secret).
- Server-only variables (`FIREBASE_ADMIN_*`, `NVIDIA_API_KEY`) are **never**
  prefixed `NEXT_PUBLIC_` and are never sent to the browser.
- If you add a new env var to a Vercel project that already has a live deployment,
  you need to **Redeploy** (without cache) for it to take effect.

---

## 3. Seed the Database

Run this **once** against your production Firestore after environment variables
are set locally. It's idempotent — re-running overwrites the same document IDs
rather than creating duplicates.

```bash
# From the project root, with .env.local populated:
npm run seed
```

This writes:
- 12 salon documents across Anna Nagar, Adyar, Velachery, T Nagar, OMR
- 28 reviews across those salons
- 28 seed customer user documents
- One NVIDIA NIM call per salon → precomputed `reviewSummary` written onto each salon doc

Expected runtime: ~3–4 minutes (12 serial NVIDIA API calls, each ~10–15 s).

---

## 4. Deploy to Vercel

```bash
# Install Vercel CLI if you don't have it
npm i -g vercel

# From project root — follow the interactive prompts
vercel

# After the first deploy, all subsequent pushes to main auto-deploy
# Push to any other branch → Preview deployment with its own URL
```

Or via the Vercel dashboard: **Add New Project → Import Git Repository →
select glamconnect-ai → Deploy** (env vars must already be set).

### Build settings (auto-detected, verify these match)
- Framework: **Next.js**
- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install`
- Node.js version: **20.x** (matches dev environment)

---

## 5. Production Smoke Test

Walk this exact path on the **live production URL** (not localhost) after
every significant deploy. It covers the entire critical user journey.

### Step 1 — Sign in

1. Open `https://your-project.vercel.app`
2. Click **Get started** in the navbar
3. On `/auth/sign-in`, click **Continue with Google**
4. Complete the Google OAuth popup
5. ✅ You should land on `/dashboard` with your name displayed
6. ✅ Open DevTools → Application → Cookies → confirm `__session` cookie is set,
   `httpOnly: true`, `sameSite: Lax`

### Step 2 — Discover

1. Navigate to `/discover`
2. ✅ All 12 seeded salons should render as cards with match scores
3. Type "Anna Nagar" in the area field → click Search
4. ✅ Results filter to Anna Nagar salons only
5. Toggle the **₹₹** price tier chip
6. ✅ Only ₹₹ salons remain visible
7. Clear filters

### Step 3 — Salon profile

1. Click any salon card
2. ✅ Profile page loads with gradient header, service list, and review summary card
3. ✅ Strengths and "Worth knowing" sections are populated (means seed + NVIDIA ran)
4. Click **Book now**
5. ✅ Redirect to `/booking/[salonId]/new` (middleware confirms you're signed in)

### Step 4 — Booking

1. ✅ Service selection grid shows all embedded services
2. Select a service, pick tomorrow's date
3. ✅ Slot grid loads within 2 seconds and shows available time slots
4. Pick a slot → click **Continue**
5. ✅ Confirm step shows service name, date, time, price
6. Click **Confirm booking**
7. ✅ Success state shows booking reference in format `GCA-XXXXXX`
8. In Firebase Console → Firestore → `bookings` collection → confirm the document exists with `status: "confirmed"`

### Step 5 — AI Beauty Assistant

1. Navigate to `/ai-assistant`
2. Click the **"Curly hair, oval face…"** preset chip
3. ✅ Loading indicator appears with rotating messages
4. ✅ Within 15 seconds, results render: hairstyle suggestions, haircare tip, recommended services
5. ✅ "Salons that fit" section shows real salon names linking to `/salon/[id]` — **not** illustrative text
6. Click a salon link → ✅ correct salon profile loads
7. Type a custom query in the input field → ✅ works end-to-end

### Step 6 — Owner dashboard

1. Navigate to `/owner`
2. ✅ Loads with "Demo mode" badge (you're signed in as a customer, not a real salon owner)
3. ✅ Jasmine & Jade Studio's services are listed
4. Click **Add service** → fill in all fields → **Save**
5. ✅ New service appears in the list; check Firestore to confirm the write
6. Fill in the Marketing Assistant: service = "Bridal Makeup", discount = 20, tone = Festive
7. Click **Generate copy**
8. ✅ Within 15 s, a draft Instagram caption appears in the textarea
9. Click **Copy** → ✅ clipboard contains the draft text

### Step 7 — Keyboard navigation

1. Refresh any page and don't touch the mouse
2. Press **Tab** once → ✅ "Skip to main content" link becomes visible
3. Press **Enter** → ✅ focus jumps past the header to the page's main content
4. Tab through the page → ✅ every interactive element gets a visible violet focus ring
5. On `/ai-assistant`, Tab to the preset chips → press **Enter** → ✅ query fires
6. On `/discover`, Tab to the price tier chips → press **Space/Enter** → ✅ filter toggles

### Step 8 — Mobile (375px)

1. Open DevTools → Device Toolbar → set width to 375
2. ✅ All pages scroll vertically without horizontal overflow
3. `/discover`: search inputs stack vertically, filter chips wrap
4. `/salon/[id]`: services list is readable, Book now button is full-width
5. `/booking/[id]/new`: service grid is single-column, slot chips wrap
6. `/owner`: service manager and marketing assistant stack vertically
7. `/ai-assistant`: preset chips wrap onto multiple lines

---

## 6. Known Limitations (state at launch)

Document these in the pitch if asked — judges respect honesty about scope:

| Limitation | Production fix |
|---|---|
| Booking uses a single optimistic write, not a Firestore transaction | Swap `createBooking` for the transactional lock design in the Technical Architecture doc (Section 9) |
| No real payment gateway | Integrate Razorpay — add a `/api/webhooks/payment` Route Handler, update booking status to `confirmed` on webhook |
| Slot availability ignores multiple team members | Add `teamMemberId` to the booking model and per-member slot queries |
| NVIDIA NIM free tier has rate limits and model rotation | Add a Redis-backed request queue; fall back to a paid tier for production |
| `prefers-reduced-motion` kills all transitions including the loading spinner | Replace `animation: none` on `.animate-spin` specifically with a static icon so loading state is still visible |
