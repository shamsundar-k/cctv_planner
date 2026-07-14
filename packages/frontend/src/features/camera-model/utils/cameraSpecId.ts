export function createCameraSpecId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0')
  const randomBytes = crypto.getRandomValues(new Uint8Array(8))
  const randomPart = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${timestamp}${randomPart}`
}
