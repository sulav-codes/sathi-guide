import { Request } from 'express';

/**
 * Extract the real client IP address from a request.
 *
 * Checks headers in priority order:
 * 1. X-Forwarded-For (set by load balancers / reverse proxies)
 * 2. X-Real-IP (set by nginx)
 * 3. socket.remoteAddress (direct TCP connection)
 * 4. req.ip (Express built-in)
 */
export function extractIpAddress(request: Request): string {
  const forwardedFor = request.headers['x-forwarded-for'];

  if (forwardedFor) {
    // X-Forwarded-For can be a comma-separated list: "client, proxy1, proxy2"
    // The first entry is always the original client IP
    const raw = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;

    const firstIp = raw.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0].trim() : realIp.trim();
  }

  return request.socket?.remoteAddress ?? request.ip ?? 'unknown';
}

/**
 * Extract User-Agent string from request headers.
 * Returns 'unknown' if not present.
 */
export function extractUserAgent(request: Request): string {
  return request.headers['user-agent'] ?? 'unknown';
}
