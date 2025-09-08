import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "../../../base";
import z from "zod";

export async function POST(req: NextRequest) {
    const user = {
      id: req.headers.get("x-user-id"),
      role: req.headers.get("x-user-role"),
      room_id: req.headers.get("x-user-room_id"),
    };
    if (user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { hotel_room_id, username } = z.object({ 
            hotel_room_id: z.string(),
            username: z.string()
        }).parse(await req.json());
        
        const getAccount = await fetch(`${API_BASE}/finance-accounts?id=${username}`);
        const accountData = await getAccount.json();
        let account = accountData[0];
        
        if (!account) {
            const createAccount = await fetch(`${req.nextUrl.origin}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username,
                    password: "123",
                    role: "user"
                }),
            });
            
            if (!createAccount.ok) {
                const errorData = await createAccount.json();
                return NextResponse.json({ error: `Failed to create account: ${errorData.error}` }, { status: 500 });
            }

            const newAccountData = await createAccount.json();
            account = newAccountData.data;
        }

        const getRoomStatus = await fetch(`${API_BASE}/hotel-rooms?id=${hotel_room_id}`);
        if (!getRoomStatus.ok) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }
        const roomStatus = await getRoomStatus.json();
        
        // Check if roomStatus is an array and has at least one room
        if (!Array.isArray(roomStatus) || roomStatus.length === 0) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }
        
        const room = roomStatus[0];
        
        // Check if room object exists and has required properties
        if (!room || typeof room.status === 'undefined') {
            return NextResponse.json({ error: "Invalid room data" }, { status: 500 });
        }

        if (room.status !== "available") {
            return NextResponse.json({ error: "Room not available" }, { status: 400 });
        }

        const reserveRoom = await fetch(`${API_BASE}/hotel-rooms/${hotel_room_id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                status: "reserve",
                current_guest: username
            }),
        });

        if (!reserveRoom.ok) {
            return NextResponse.json({ error: "Failed to reserve room" }, { status: 500 });
        }
        
        const updateAccount = await fetch(`${API_BASE}/finance-accounts/${account.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                room_id: room.room_number
            }),
        });
        
        if (!updateAccount.ok) {
            return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
        }
        
        const data = await reserveRoom.json();
        return NextResponse.json({ success: true, data });
        // return NextResponse.json({ message: `Hello ${user.id}`, user, data });

    } catch (err) {
        console.error("Reserve room error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
  