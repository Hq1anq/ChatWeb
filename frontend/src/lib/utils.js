// Format thời gian HH:MM
export const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const hours = date.getUTCHours().toString().padStart(2, '0')
  const minutes = date.getUTCMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
