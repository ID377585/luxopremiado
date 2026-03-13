import { NextResponse, type NextRequest } from "next/server";

function hasSupabaseSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/app/vip" && !hasSupabaseSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "Faça login para acessar sua área VIP");
    loginUrl.searchParams.set("next", "/app/vip");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/vip"],
};
