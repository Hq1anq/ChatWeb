// Format thời gian HH:MM
export const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const hours = date.getUTCHours().toString().padStart(2, '0')
  const minutes = date.getUTCMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export function formatTimeAgo(isoUTCString) {
  if (!isoUTCString) return '' // No timestamp

  // force parse as local time if backend incorrectly uses Z
  const safeString = isoUTCString.replace('Z', '')

  const now = new Date() // current local time
  const timestamp = new Date(safeString) // parsed from server (UTC ISO string)

  const diffMs = now.getTime() - timestamp.getTime() // ms difference
  if (diffMs < 0) return '0m' // Future-safe fallback

  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  // Minutes
  if (diffMinutes < 60) return `${diffMinutes || 1}m` // show 1m minimum

  // Hours
  if (diffHours < 24) return `${diffHours}h`

  // Days
  if (diffDays < 7) return `${diffDays}d`

  // Weeks
  if (diffWeeks < 4) return `${diffWeeks}w`

  // Months
  return `${diffMonths}m`
}
