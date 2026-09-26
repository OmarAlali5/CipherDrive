/** Shared formatting helpers for file metadata shown across the app. */

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  const formatted = unitIndex === 0 ? String(size) : size.toFixed(1)
  return `${formatted} ${units[unitIndex]}`
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function formatDate(date: Date): string {
  return dateFormatter.format(date)
}
