// Firebase Admin SDK — server-only. Never import this from a Client
// Component; it uses a service account and has full read/write access.
//
// Used by Server Actions and the seed script to bypass Firestore security
// rules for trusted server-side operations.
//
// See Claude Code Prompt 2 (Firebase + auth) and Prompt 3 (seed script).
export {};
