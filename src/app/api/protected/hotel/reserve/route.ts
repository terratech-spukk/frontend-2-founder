import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "../../../base";
import z from "zod";
import { generateQRCodeData, generateQRCodeImage } from "@/lib/qrcode-utils";

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
    const { hotel_room_id, full_name, phone_number } = z
      .object({
        hotel_room_id: z.string(),
        full_name: z.string(),
        phone_number: z.string(),
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

    // Check if roomStatus is an array and has at least one room
    if (!Array.isArray(roomStatus) || roomStatus.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const room = roomStatus[0];

    // Check if room object exists and has required properties
    if (!room || typeof room.status === "undefined") {
      return NextResponse.json({ error: "Invalid room data" }, { status: 500 });
    }

    if (room.status !== "available") {
      return NextResponse.json(
        { error: "Room not available" },
        { status: 400 },
      );
    }

    // Generate unique username and password for the room
    const generatedUsername = `room_${room.room_number}_${Date.now()}`;
    const generatedPassword = Math.random().toString(36).slice(-8); // 8 character random password

    const getAccount = await fetch(
      `${API_BASE}/finance-accounts?id=${generatedUsername}`,
    );
    const accountData = await getAccount.json();
    let account = accountData[0];

    if (!account) {
      const createAccount = await fetch(
        `${req.nextUrl.origin}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: generatedUsername,
            password: generatedPassword,
            role: "user",
            full_name: full_name,
            phone_number: phone_number,
          }),
        },
      );

      if (!createAccount.ok) {
        const errorData = await createAccount.json();
        return NextResponse.json(
          { error: `Failed to create account: ${errorData.error}` },
          { status: 500 },
        );
      }

      const newAccountData = await createAccount.json();
      account = newAccountData.data;
    }

    const reserveRoom = await fetch(
      `${API_BASE}/hotel-rooms/${hotel_room_id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "reserve",
          current_guest: generatedUsername,
        }),
      },
    );

    if (!reserveRoom.ok) {
      return NextResponse.json(
        { error: "Failed to reserve room" },
        { status: 500 },
      );
    }

    const updateAccount = await fetch(
      `${API_BASE}/finance-accounts/${account.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: room.room_number,
        }),
      },
    );

    if (!updateAccount.ok) {
      return NextResponse.json(
        { error: "Failed to update account" },
        { status: 500 },
      );
    }

    const data = await reserveRoom.json();

    // Create booking data and post to hotel-bookings endpoint first
    const bookingData = {
      room_number: room.room_number,
      reserve_by: generatedUsername,
      reserve_name: full_name,
      reserve_at: new Date().toISOString(),
      checkin_at: null,
      unreserve_cause: null,
      unreserve_at: null,
      price: room.price,
    };

    const createBooking = await fetch(`${API_BASE}/hotel-bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });

    let bookingId = null;
    if (createBooking.ok) {
      const bookingResponse = await createBooking.json();
      bookingId = bookingResponse.id || bookingResponse.data?.id;
    } else {
      console.warn("Failed to create booking record");
    }

    // Generate QR code data
    const baseUrl = req.nextUrl.origin;
    const qrCodeData = generateQRCodeData(
      generatedUsername,
      generatedPassword,
      baseUrl,
      full_name,
      phone_number,
    );

    // Generate QR code image (placeholder for now)
    const qrCodeImage = await generateQRCodeImage(qrCodeData.autoLoginUrl);
    qrCodeData.qrCodeImage = qrCodeImage;

    // Update room with QR code data and booking ID
    const updateRoomWithQR = await fetch(
      `${API_BASE}/hotel-rooms/${hotel_room_id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrcode_base64: qrCodeImage,
          qr_code_data: JSON.stringify(qrCodeData),
          booking_id: bookingId,
        }),
      },
    );

    if (!updateRoomWithQR.ok) {
      console.warn("Failed to update room with QR code data");
    }

    return NextResponse.json({
      success: true,
      data,
      credentials: {
        username: generatedUsername,
        password: generatedPassword,
        autoLoginUrl: qrCodeData.autoLoginUrl,
        qrCodeData: qrCodeData,
      },
    });
  } catch (err) {
    console.error("Reserve room error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
