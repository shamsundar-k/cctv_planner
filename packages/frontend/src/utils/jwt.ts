/*
 * FILE SUMMARY — src/utils/jwt.ts
 *
 * Lightweight JWT decoding utility. Does NOT verify signatures — it is used
 * only for reading claims from a trusted token received from the server.
 *
 * decodeJwt(token) — Accepts a JWT string, extracts the base64url-encoded
 *   payload segment (the second "."-delimited part), decodes it with atob(),
 *   and returns the parsed object as JwtPayload.
 *   JwtPayload shape: { sub: string, role: string, exp: number }.
 *   Throws if the token is malformed or the payload is not valid JSON.
 *   Used in LoginPage and AcceptInvitePage to extract the user's id and role
 *   immediately after login without an extra API call.
 */
interface JwtPayload {
  sub: string
  role: string
  exp: number
}

export function decodeJwt(token: string): JwtPayload {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64)) as JwtPayload
}
