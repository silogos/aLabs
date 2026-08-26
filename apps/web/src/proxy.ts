import { NextResponse, type NextRequest } from "next/server";

/** Route gate — cookie presence only (cheap). Real session validation happens
 *  in the API (/auth/me) and auth pages re-check on submit. */
const PUBLIC_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("alabs_session");

  const isPublicPage = PUBLIC_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!hasSession && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (hasSession && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // everything except static assets, the API mount, uploads and internals
    "/((?!_next/static|_next/image|api(?:/|$)|uploads(?:/|$)|icon.svg|favicon.ico).*)",
  ],
};
