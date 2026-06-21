import { NextResponse, type NextRequest } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return redirectToSignIn(request);
  }

  try {
    // checkRevoked=true rejects a disabled or signed-out-everywhere account,
    // not just an expired cookie — this is what makes it a real server-side
    // verification rather than a client-spoofable "does a cookie exist" check.
    await getAdminAuth().verifySessionCookie(sessionCookie, true);
    return NextResponse.next();
  } catch {
    return redirectToSignIn(request);
  }
}

function redirectToSignIn(request: NextRequest) {
  const signInUrl = new URL("/auth/sign-in", request.url);
  signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  // Node.js middleware runtime became stable in Next.js 15.5 — required
  // here since the Firebase Admin SDK needs Node APIs, not the Edge runtime.
  // (Next.js 16 renames this whole convention to proxy.ts / a `proxy()`
  // export, worth knowing if this project upgrades later.)
  runtime: "nodejs",
  matcher: ["/dashboard/:path*", "/owner/:path*", "/booking/:path*"],
};
