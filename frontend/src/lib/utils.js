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

  // Minutes
  if (diffMinutes < 60) return `${diffMinutes || 1}m` // show 1m minimum

  // Hours
  if (diffHours < 24) return `${diffHours}h`

  // Days
  if (diffDays < 7) return `${diffDays}d`

  // Weeks
  return `${diffWeeks}w`
}

export const isImageFile = (filePath) => {
  // Check ảnh/gif
  if (!filePath) return false

  // Danh các đuôi file ảnh phổ biến
  const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.avif',
    '.tiff',
  ]
  return imageExtensions.some((ext) => filePath.toLowerCase().endsWith(ext))
}

// '/messages/251201.1112.1.3-abc.png' -> 'abc.png'
export const getFileName = (filePath) => {
  const fullFileName = filePath
    ? filePath.substring(filePath.lastIndexOf('/') + 1)
    : ''
  // Tách chuỗi theo '-', loại bỏ phần tử đầu tiên (metadata), và nối phần còn lại
  const parts = fullFileName.split('-')
  return parts.length > 1 ? parts.slice(1).join('-') : fullFileName
}

// ========== MỚI: Các hàm cho Date Separator ==========

// Format ngày để hiển thị separator
export const formatDateSeparator = (timestamp) => {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Reset time để so sánh chỉ ngày
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )
  const yesterdayOnly = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate()
  )

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Hôm nay'
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Hôm qua'
  } else {
    // Format: "Thứ Hai, 15/01/2025"
    const options = {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
    return date.toLocaleDateString('vi-VN', options)
  }
}

// Lấy date string để so sánh (YYYY-MM-DD)
export const getDateKey = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export const getProfilePic = (user) => {
  if (!user) return '';
  return user.profilepic ? `${import.meta.env.VITE_SERVER_URL}${user.profilepic}` : `https://placehold.co/600x600/E5E7EB/333333?text=${user.fullname?.charAt(0)}`
}