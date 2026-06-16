# Server Actions

One file per domain, matching the API design in the Technical Architecture doc:

- `auth.ts` — sign-in/out, user doc creation (Claude Code Prompt 2)
- `discovery.ts` — `searchSalons` (Prompt 4)
- `salons.ts` — `getSalonProfile`
- `bookings.ts` — `getAvailableSlots`, `createBooking` (Prompt 6)
- `favorites.ts` — `toggleFavorite`
- `reviews.ts` — `submitReview`
- `ai.ts` — `askBeautyAssistant`, `generateMarketingCopy` (Prompts 7 & 8)
- `admin.ts` — `approveSalon`, `rejectSalon`
