import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/auth/login", "/auth/callback"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 공개 라우트면 통과 (인증 체크는 Server Component에서 수행)
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
