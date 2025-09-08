import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "../../../../base";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = {
      id: req.headers.get("x-user-id"),
      role: req.headers.get("x-user-role"),
      room_id: req.headers.get("x-user-room_id"),
    };
    
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roomId = params.id;
    
    // Fetch room data from backend
    const response = await fetch(`${API_BASE}/hotel-rooms?id=${roomId}`);
    
    if (!response.ok) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const rooms = await response.json();
    
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const room = rooms[0];
    
    return NextResponse.json(room);
  } catch (err) {
    console.error("Get room error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
