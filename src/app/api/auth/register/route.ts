import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { API_BASE } from "../../base";
import { RegisterRequest } from "@/types/user";

const SALT_ROUNDS = 10;

export async function POST(req: NextRequest) {
  try {
    const {
      username,
      password,
      role,
      room_id,
      full_name,
      phone_number,
    }: RegisterRequest = await req.json();
    if (!username || !password || !role)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );

    // 1️⃣ Check if user already exists
    const checkResponse = await fetch(
      `${API_BASE}/finance-accounts?id=${username}`,
    );
    if (!checkResponse.ok)
      return NextResponse.json({ error: "Backend error" }, { status: 500 });

    const existingUsers = await checkResponse.json();
    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 3️⃣ Create user
    const createResponse = await fetch(`${API_BASE}/finance-accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: username,
        password: hashedPassword,
        role,
        expire: false,
        room_id: room_id || null,
        full_name: full_name || null,
        phone_number: phone_number || null,
      }),
    });

    if (!createResponse.ok) {
      const errText = await createResponse.text();
      return NextResponse.json(
        { error: errText },
        { status: createResponse.status },
      );
    }

    const data = await createResponse.json();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
