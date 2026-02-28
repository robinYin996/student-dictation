import { VocabularyItem, DictationType } from '../types'

const API_URL = '/api/vocabulary'

// 内存缓存，避免频繁读取文件
let cache: VocabularyItem[] | null = null

export const vocabularyStorage = {
  getAll: async (): Promise<VocabularyItem[]> => {
    try {
      if (cache !== null) {
        return cache
      }
      const response = await fetch(API_URL)
      const data = await response.json()
      cache = data
      return data
    } catch (error) {
      console.error('读取词库数据失败:', error)
      return []
    }
  },

  getByType: async (type: DictationType): Promise<VocabularyItem[]> => {
    const allItems = await vocabularyStorage.getAll()
    return allItems.filter(item => item.type === type)
  },

  add: async (item: Omit<VocabularyItem, 'id' | 'createdAt'>): Promise<VocabularyItem> => {
    const newItem: VocabularyItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    }
    
    const allItems = await vocabularyStorage.getAll()
    allItems.push(newItem)
    await vocabularyStorage.saveAll(allItems)
    
    return newItem
  },

  addBatch: async (items: Omit<VocabularyItem, 'id' | 'createdAt'>[]): Promise<VocabularyItem[]> => {
    const newItems = items.map(item => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    }))
    
    const allItems = await vocabularyStorage.getAll()
    allItems.push(...newItems)
    await vocabularyStorage.saveAll(allItems)
    
    return newItems
  },

  update: async (id: string, updates: Partial<VocabularyItem>): Promise<boolean> => {
    const allItems = await vocabularyStorage.getAll()
    const index = allItems.findIndex(item => item.id === id)
    
    if (index !== -1) {
      allItems[index] = { ...allItems[index], ...updates }
      await vocabularyStorage.saveAll(allItems)
      return true
    }
    
    return false
  },

  delete: async (id: string): Promise<boolean> => {
    const allItems = await vocabularyStorage.getAll()
    const filteredItems = allItems.filter(item => item.id !== id)
    
    if (filteredItems.length !== allItems.length) {
      await vocabularyStorage.saveAll(filteredItems)
      return true
    }
    
    return false
  },

  deleteBatch: async (ids: string[]): Promise<number> => {
    const allItems = await vocabularyStorage.getAll()
    const filteredItems = allItems.filter(item => !ids.includes(item.id))
    const deletedCount = allItems.length - filteredItems.length
    
    if (deletedCount > 0) {
      await vocabularyStorage.saveAll(filteredItems)
    }
    
    return deletedCount
  },

  clear: async (): Promise<void> => {
    await vocabularyStorage.saveAll([])
  },

  // 保存所有数据到文件
  saveAll: async (items: VocabularyItem[]): Promise<void> => {
    try {
      cache = items // 更新缓存
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(items)
      })
    } catch (error) {
      console.error('保存词库数据失败:', error)
    }
  }
}
