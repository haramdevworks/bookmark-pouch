import { NextRequest, NextResponse } from "next/server";
import { getTags } from "@/services/tagService";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const tags = await getTags(userId);
    return NextResponse.json(tags);
  } catch (error) {
    console.error("[/api/tags] 태그 불러오기 실패:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
