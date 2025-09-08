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
}