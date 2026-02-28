const TWO_MINUTES_MS = 2 * 60 * 1000

export function formatTimestamp(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  return `${days}d ago`
}

export function formatConversationTimestamp(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < TWO_MINUTES_MS) return "Just now"
  return d.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  })
}
