export interface Room {
  id: string;
  room_number: number;
  description: string;
  status: "available" | "reserve" | "unavailable";
  price: number;
  current_guest: string | null;
  qrcode_base64?: string | null;
  qr_code_data?: string | null;
}

export interface ReserveRoomRequest {
  room_id: number;
}