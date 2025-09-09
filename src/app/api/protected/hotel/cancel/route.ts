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
    const { hotel_room_id } = z
      .object({
        hotel_room_id: z.string(),
      })
      .parse(await req.json());

    const getRoomStatus = await fetch(
      `${API_BASE}/hotel-rooms?id=${hotel_room_id}`,
    );
    if (!getRoomStatus.ok) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    const roomStatus = await getRoomStatus.json();
    const room = roomStatus[0];

    if (room.status !== "reserve") {
      return NextResponse.json({ error: "Room not reserve" }, { status: 400 });
    }

    const getAccount = await fetch(
      `${API_BASE}/finance-accounts?id=${room.current_guest}`,
    );
    let account = await getAccount.json();
    if (!account) {
      return NextResponse.json(
        { error: "current guest account not found" },
        { status: 404 },
      );
    }
    account = account[0];

    const updateAccount = await fetch(
      `${API_BASE}/finance-accounts/${account.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expire: true,
        }),
      },
    );

    if (!updateAccount.ok) {
      return NextResponse.json(
        { error: "Failed to update account expire" },
        { status: 500 },
      );
    }

    const cancelRoom = await fetch(`${API_BASE}/hotel-rooms/${hotel_room_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "available",
        current_guest: null,
        qrcode_base64: null,
        qr_code_data: null,
        booking_id: null,
      }),
    });

    if (!cancelRoom.ok) {
      return NextResponse.json(
        { error: "Failed to cancel room" },
        { status: 500 },
      );
    }

    // Update booking record to mark as cancelled using booking ID
    if (room.booking_id) {
      const bookingUpdate = {
        unreserve_at: new Date().toISOString(),
        unreserve_cause: "cancel",
      };

      const updateBooking = await fetch(
        `${API_BASE}/hotel-bookings/${room.booking_id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingUpdate),
        },
      );

      if (!updateBooking.ok) {
        console.warn("Failed to update booking record");
      }
    } else {
      console.warn("No booking ID found for room");
    }

    const data = await cancelRoom.json();
    return NextResponse.json({ success: true, data });
    // return NextResponse.json({ message: `Hello ${user.id}`, user, data });
  } catch (err) {
    console.error("Reserve room error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
