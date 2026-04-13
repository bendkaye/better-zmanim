export function parseCookies(header: string): Record<string, string> {
  if (!header) return {};
  const cookies: Record<string, string> = {};
  for (const pair of header.split(";")) {
    const trimmed = pair.trim();
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (key) cookies[key] = value;
  }
  return cookies;
}

interface CookieOptions {
  maxAge?: number;
  path?: string;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
}

export function serializeCookie(
  name: string,
  value: string,
  options?: CookieOptions,
): string {
  const parts = [`${name}=${value}`];
  parts.push(`Path=${options?.path ?? "/"}`);
  parts.push(`SameSite=${options?.sameSite ?? "Lax"}`);
  if (options?.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options?.secure) parts.push("Secure");
  return parts.join("; ");
}
