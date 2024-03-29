export type CalendarDto = {
  id: string
  category: string
  yearMonth: string
  entries: CalendarEntry[]
  fetchedAt: string
}

export type CalendarEntry = {
  title: string
  badges: string[]
  alert: string | null
  authors: string
  date: string // yyyy-MM-dd
}

export const BADGES: {[key: string]: {char: string, color: string}} = {
  'RIDI ONLY': {
    char: 'R',
    color: '#478aea',
  },
  '세트전': {
    char: 'S',
    color: '#ff6c9a',
  },
  '후속권 업데이트': {
    char: '▶',
    color: '#5cc66d',
  },
  '신작': {
    char: 'N',
    color: '#ff7166',
  }
}
  