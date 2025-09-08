export interface Room {
  id: string;
  room_number: number;
  description: string;
  status: "available" | "reserve" | "unavailable" | "checkin" | "checkout";
  price: number;
  current_guest: string | null;
  qrcode_base64?: string | null;
  qr_code_data?: string | null;
  booking_id?: string | null;
  available_actions?: "checkout" | "cancel" | null;
  checkin_at?: string | null;
  available_at?: string | null;
}

export interface Booking {
  id?: string;
  room_number: number;
  reserve_by: string;
  reserve_name: string;
  reserve_at: string;
  checkin_at: string | null;
  available_actions: "checkout" | "cancel" | null;
  available_at: string | null;
  price: number;
}

export interface ReserveRoomRequest {
  room_id: number;
}