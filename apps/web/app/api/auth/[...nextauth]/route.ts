import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ message: "NextAuth route not configured yet" }, { status: 501 });
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ message: "NextAuth route not configured yet" }, { status: 501 });
}
