import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/auth/login", "/auth/callback"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 쿠키에서 인증 토큰 확인
  const authToken = request.cookies.get("sb-access-token");
  const isAuthenticated = !!authToken;

  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (isAuthenticated && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
