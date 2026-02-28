import { VocabularyItem } from '../types'

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export const exportToCSV = (data: VocabularyItem[], filename: string): void => {
  const headers = ['ID', '类型', '内容', '发音', '翻译', '创建时间']
  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      item.id,
      item.type,
      `"${item.content}"`,
      item.pronunciation || '',
      item.translation || '',
      formatDate(item.createdAt)
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const importFromCSV = (csvText: string): VocabularyItem[] => {
  const lines = csvText.split('\n')
  const items: VocabularyItem[] = []
  
  // 跳过标题行
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const values = line.split(',')
    if (values.length >= 4) {
      items.push({
        id: generateId(),
        type: values[1] as any,
        content: values[2]?.replace(/"/g, '') || '',
        pronunciation: values[3] || undefined,
        translation: values[4] || undefined,
        createdAt: new Date()
      })
    }
  }
  
  return items
}