import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { session } = await request.json();

  if (!session?.access_token || !session?.refresh_token) {
    console.error("[set-session] 유효하지 않은 세션:", session);
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();

    // Supabase 프로젝트 ID 추출
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const projectId = supabaseUrl.replace("https://", "").split(".")[0];

    // 인증 토큰 객체
    const authToken = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
      expires_at: session.expires_at,
      token_type: session.token_type,
      type: session.type,
    };

    // 쿠키에 직접 저장
    const tokenCookieName = `sb-${projectId}-auth-token`;
    cookieStore.set(tokenCookieName, JSON.stringify(authToken), {
      maxAge: session.expires_in,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    console.log(`[set-session] ✅ 쿠키 설정 완료: ${tokenCookieName}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[set-session] 쿠키 설정 실패:", error);
    return NextResponse.json(
      { error: "Failed to set session" },
      { status: 500 }
    );
  }
}
