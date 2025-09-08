// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; // your real HTTP API

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const url = `${API_BASE}/${params.path.join("/")}${req.nextUrl.search}`;
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const url = `${API_BASE}/${params.path.join("/")}`;
  const body = await req.json();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}
