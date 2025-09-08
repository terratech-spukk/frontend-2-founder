import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { API_BASE , JWT_SECRET } from "../../base";
import { SignJWT } from "jose";

interface Account {
  id: string;
  password: string;
  role: "admin" | "kitchen" | "user";
  expire: boolean;
  room_id: number | null;
}

interface LoginRequest {
  username: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const { username, password }: LoginRequest = await req.json();
    if (!username || !password)
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });

    // Fetch user from backend
    const response = await fetch(`${API_BASE}/finance-accounts?id=${username}`);
    if (!response.ok) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const users: Account[] = await response.json();
    const account = users[0];
    if (!account) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    if (account.expire) return NextResponse.json({ error: "Account expired" }, { status: 403 });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    // Issue JWT
    const token = await new SignJWT({ id: account.id, user: account.id, role: account.role, room_id: account.room_id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(JWT_SECRET));

    return NextResponse.json({
      success: true,
      token,
      user: { id: account.id, role: account.role, room_id: account.room_id },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
