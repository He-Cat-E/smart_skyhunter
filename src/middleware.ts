import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pre-launch: the sign-up page is the front door. A visitor who isn't signed in
// hitting the root is sent straight to /signup. Signed-in members keep landing
// on the home page (and can navigate anywhere as usual). We only check for the
// session cookie's presence here — real auth is still enforced per route/page.
export function middleware(req: NextRequest) {
  const signedIn = req.cookies.has("sky_session");
  if (!signedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/signup";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// Only run on the root path.
export const config = {
  matcher: "/",
};
