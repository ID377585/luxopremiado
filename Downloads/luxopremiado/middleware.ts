import { NextResponse, type NextRequest } from "next/server";

function hasSupabaseSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

function buildLoginRedirect(request: NextRequest, message: string) {
  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  loginUrl.searchParams.set("error", message);
  loginUrl.searchParams.set("next", nextPath);

  return NextResponse.redirect(loginUrl);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = hasSupabaseSessionCookie(request);

  if (pathname.startsWith("/app") && !isLoggedIn) {
    return buildLoginRedirect(request, "Faça login para continuar");
  }

  if (pathname.startsWith("/admin") && !isLoggedIn) {
    return buildLoginRedirect(request, "Faça login para acessar o admin");
  }

  return NextResponse.next({
    headers: {
      "x-robots-tag": pathname.startsWith("/app") || pathname.startsWith("/admin")
        ? "noindex, nofollow"
        : "all",
    },
  });
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};