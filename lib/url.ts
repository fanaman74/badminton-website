import { type NextRequest } from "next/server";

export function getPublicOrigin(request: NextRequest): string {
  // 1. Check reverse-proxy forwarded headers (Railway, Cloudflare, Nginx, Docker)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) {
    const host = forwardedHost.split(",")[0].trim();
    return `${forwardedProto}://${host}`;
  }

  // 2. Check Host header if it's not internal localhost:8080/0.0.0.0
  const host = request.headers.get("host");
  if (host && !host.includes("localhost:8080") && !host.includes("0.0.0.0")) {
    const proto = host.includes("localhost")
      ? "http"
      : request.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
  }

  // 3. Check environment variables
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }

  return request.nextUrl.origin;
}
