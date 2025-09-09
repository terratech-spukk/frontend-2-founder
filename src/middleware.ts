import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET, API_BASE } from "./app/api/base";

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/protected")) return NextResponse.next();

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 1️⃣ Verify JWT
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    const userId = payload.id;
    console.log("userId", userId);

    // 2️⃣ Fetch account from backend to check expire
    const res = await fetch(`${API_BASE}/finance-accounts?id=${userId}`);
    if (!res.ok) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const accounts = await res.json();
    const account = accounts[0];

    if (!account) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // 3️⃣ Check expire
    if (account.expire) {
      return NextResponse.json({ error: "Account expired" }, { status: 403 });
    }

    // 4️⃣ Forward user info via headers
    const response = NextResponse.next();
    response.headers.set("x-user-id", account.id);
    response.headers.set("x-user-role", account.role);
    response.headers.set("x-user-room_id", String(account.room_id ?? ""));
    return response;
  } catch (err) {
    console.error("JWT verify error:", err);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/protected/:path*"],
};
