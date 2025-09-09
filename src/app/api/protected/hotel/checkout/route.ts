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

    // Get room information first
    const getRoomStatus = await fetch(
      `${API_BASE}/hotel-rooms?id=${hotel_room_id}`,
    );
    if (!getRoomStatus.ok) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    const roomStatus = await getRoomStatus.json();

    if (!Array.isArray(roomStatus) || roomStatus.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const room = roomStatus[0];

    if (!room || typeof room.status === "undefined") {
      return NextResponse.json({ error: "Invalid room data" }, { status: 500 });
    }

    if (room.status !== "checkin") {
      return NextResponse.json(
        { error: "Room is not checked in" },
        { status: 400 },
      );
    }

    // Update room status to available and clear guest
    const checkoutRoom = await fetch(
      `${API_BASE}/hotel-rooms/${hotel_room_id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "available",
          current_guest: null,
          qrcode_base64: null,
          qr_code_data: null,
          booking_id: null,
        }),
      },
    );

    if (!checkoutRoom.ok) {
      return NextResponse.json(
        { error: "Failed to checkout room" },
        { status: 500 },
      );
    }

    // Update booking record with checkout time using booking ID
    if (room.booking_id) {
      const bookingUpdate = {
        unreserve_at: new Date().toISOString(),
        unreserve_cause: "checkout",
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

    const data = await checkoutRoom.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Checkout room error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
