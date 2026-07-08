import { NextRequest, NextResponse } from "next/server";
import { getFolders } from "@/services/folderService";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const folders = await getFolders(userId);
    return NextResponse.json(folders);
  } catch (error) {
    console.error("[/api/folders] 폴더 불러오기 실패:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}
