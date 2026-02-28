import { VocabularyItem, DictationType } from '../types'

const STORAGE_KEY = 'dictation_vocabulary'

export const vocabularyStorage = {
  getAll: (): VocabularyItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('读取词库数据失败:', error)
      return []
    }
  },

  getByType: (type: DictationType): VocabularyItem[] => {
    const allItems = vocabularyStorage.getAll()
    return allItems.filter(item => item.type === type)
  },

  add: (item: Omit<VocabularyItem, 'id' | 'createdAt'>): VocabularyItem => {
    const newItem: VocabularyItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    }
    
    const allItems = vocabularyStorage.getAll()
    allItems.push(newItem)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allItems))
    
    return newItem
  },

  addBatch: (items: Omit<VocabularyItem, 'id' | 'createdAt'>[]): VocabularyItem[] => {
    const newItems = items.map(item => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    }))
    
    const allItems = vocabularyStorage.getAll()
    allItems.push(...newItems)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allItems))
    
    return newItems
  },

  update: (id: string, updates: Partial<VocabularyItem>): boolean => {
    const allItems = vocabularyStorage.getAll()
    const index = allItems.findIndex(item => item.id === id)
    
    if (index !== -1) {
      allItems[index] = { ...allItems[index], ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allItems))
      return true
    }
    
    return false
  },

  delete: (id: string): boolean => {
    const allItems = vocabularyStorage.getAll()
    const filteredItems = allItems.filter(item => item.id !== id)
    
    if (filteredItems.length !== allItems.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredItems))
      return true
    }
    
    return false
  },

  deleteBatch: (ids: string[]): number => {
    const allItems = vocabularyStorage.getAll()
    const filteredItems = allItems.filter(item => !ids.includes(item.id))
    const deletedCount = allItems.length - filteredItems.length
    
    if (deletedCount > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredItems))
    }
    
    return deletedCount
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEY)
  }
}