export interface Room {
  id: string;
  room_number: number;
  description: string;
  status: "available" | "reserve" | "unavailable";
  price: number;
  current_guest: string | null;
}

export interface ReserveRoomRequest {
  room_id: number;
}