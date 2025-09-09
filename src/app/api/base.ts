export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "super-secret-key";

// For production, we might need to handle cases where the backend is not accessible
export const isProduction = process.env.NODE_ENV === "production";