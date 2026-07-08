import { getUserId } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await getUserId();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
