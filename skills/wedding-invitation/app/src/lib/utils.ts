export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const weekday = weekdays[d.getDay()]
  return `${year}年${month}月${day}日（${weekday}）`
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h, 10)
  const minute = m
  const period = hour < 12 ? '午前' : '午後'
  const displayHour = hour <= 12 ? hour : hour - 12
  return `${period}${displayHour}時${minute !== '00' ? minute + '分' : ''}`
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}
