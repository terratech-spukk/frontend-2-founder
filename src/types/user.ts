export interface CreateUserRequest {
  username: string;
  password: string;
  role: "admin" | "kitchen" | "user";
  room_id?: number | null;
}

export interface Account {
  id: string;
  password: string;
  role: "admin" | "kitchen" | "user";
  expire: boolean;
  room_id: number | null;
  full_name?: string | null;
  phone_number?: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: "admin" | "kitchen" | "user";
  room_id?: number | null;
  full_name?: string;
  phone_number?: string;
}
