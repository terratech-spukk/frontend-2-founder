import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "../../base";

// Shared handler for all HTTP methods
async function handleRequest(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;

  // Build target URL (preserve path + query string)
  const targetUrl = `${API_BASE}/${params.path.join("/")}${req.nextUrl.search}`;

  // Prepare options
  const options: RequestInit = {
    method: req.method,
    headers: {
      "Content-Type": req.headers.get("content-type") || "application/json",
    },
  };

  // If method has a body → forward it
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    options.body = await req.text(); // raw body passthrough
  }

  // Forward request to backend
  const response = await fetch(targetUrl, options);

  // Try to return JSON if possible
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  }

  // Fallback: return raw text
  const text = await response.text();
  return new NextResponse(text, { status: response.status });
}

// Hook up all CRUD verbs
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
