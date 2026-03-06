interface JwtPayload {
  sub: string
  role: string
  exp: number
}

export function decodeJwt(token: string): JwtPayload {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64)) as JwtPayload
}
