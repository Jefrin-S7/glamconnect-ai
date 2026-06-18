import "server-only";

// All the real logic lives in admin-core.ts, which has no `server-only`
// import — that package throws unconditionally outside Next.js's own
// bundler, so it can't be in anything a standalone script (scripts/seed.ts)
// also needs to import. This file is the guarded entry point for app code
// (Server Actions, middleware, Server Components); scripts import
// admin-core.ts directly.
export { getAdminAuth, getAdminDb } from "./admin-core";
