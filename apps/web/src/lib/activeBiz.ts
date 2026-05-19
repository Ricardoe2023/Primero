// Reads the active business cookie on the client side
export function getActiveBizId(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)biz=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}
