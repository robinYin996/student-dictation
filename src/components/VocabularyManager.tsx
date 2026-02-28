import React, { useState, useEffect } from 'react'
import { VocabularyItem, DictationType } from '../types'
import { vocabularyStorage } from '../services/storage'
import { generateId, exportToCSV, importFromCSV } from '../utils/helpers'

interface Props {
  onStartDictation: (type: DictationType, items: VocabularyItem[]) => void
}

const VocabularyManager: React.FC<Props> = ({ onStartDictation }) => {
  const [items, setItems] = useState<VocabularyItem[]>([])
  const [selectedType, setSelectedType] = useState<DictationType>('english')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [bulkImportText, setBulkImportText] = useState('')
  const [formData, setFormData] = useState({
    content: '',
    pronunciation: '',
    translation: ''
  })

  useEffect(() => {
    loadItems()
  }, [selectedType])

  const loadItems = () => {
    const typeItems = vocabularyStorage.getByType(selectedType)
    setItems(typeItems)
  }

  const handleAddItem = () => {
    if (!formData.content.trim()) return

    vocabularyStorage.add({
      type: selectedType,
      content: formData.content.trim(),
      pronunciation: formData.pronunciation.trim() || undefined,
      translation: formData.translation.trim() || undefined
    })

    setFormData({ content: '', pronunciation: '', translation: '' })
    setShowAddForm(false)
    loadItems()
  }

  const handleBulkImport = () => {
    if (!bulkImportText.trim()) return

    try {
      const lines = bulkImportText.split('\n').filter(line => line.trim())
      const newItems = lines.map(line => {
        // 对于英文单词类型，支持空格分隔格式
        if (selectedType === 'english') {
          const parts = line.trim().split(/\s+/) // 使用正则表达式按空格分割
          return {
            type: selectedType,
            content: parts[0] || '',
            pronunciation: undefined, // 英文单词不需要发音字段
            translation: parts.slice(1).join(' ') || undefined // 剩余部分作为翻译
          }
        } else {
          // 其他类型保持原有逻辑
          const parts = line.split('|').map(part => part.trim())
          return {
            type: selectedType,
            content: parts[0],
            pronunciation: parts[1] || undefined,
            translation: parts[2] || undefined
          }
        }
      })

      vocabularyStorage.addBatch(newItems)
      setBulkImportText('')
      loadItems()
    } catch (error) {
      alert('批量导入格式错误，请检查输入格式')
    }
  }

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return
    
    if (confirm(`确定要删除选中的 ${selectedItems.length} 个项目吗？`)) {
      vocabularyStorage.deleteBatch(selectedItems)
      setSelectedItems([])
      loadItems()
    }
  }

  const handleExport = () => {
    const allItems = vocabularyStorage.getAll()
    exportToCSV(allItems, `词库导出_${new Date().toISOString().split('T')[0]}`)
  }

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map(item => item.id))
    }
  }

  const handleStartDictation = () => {
    let dictationItems: VocabularyItem[]
    
    if (selectedItems.length > 0) {
      dictationItems = items.filter(item => selectedItems.includes(item.id))
    } else {
      dictationItems = [...items]
    }

    if (dictationItems.length === 0) {
      alert('请选择至少一个项目进行默写')
      return
    }

    onStartDictation(selectedType, dictationItems)
  }

  const getTypeLabel = (type: DictationType) => {
    switch (type) {
      case 'english': return '英文单词'
      case 'poetry': return '古诗词'
      case 'chinese': return '汉字词语'
    }
  }

  return (
    <div className="space-y-6">
      {/* 类型选择器 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">词库管理</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {(['english', 'poetry', 'chinese'] as DictationType[]).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {getTypeLabel(type)}
            </button>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            添加项目
          </button>
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {selectedItems.length === items.length ? '取消全选' : '全选'}
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={selectedItems.length === 0}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 transition-colors"
          >
            删除选中
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            导出词库
          </button>
        </div>
      </div>

      {/* 添加表单 */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">添加新项目</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                内容 *
              </label>
              <input
                type="text"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={selectedType === 'english' ? '请输入英文单词' : 
                           selectedType === 'poetry' ? '请输入古诗词' : '请输入汉字词语'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {selectedType === 'english' ? '音标' : '拼音'}
              </label>
              <input
                type="text"
                value={formData.pronunciation}
                onChange={(e) => setFormData({...formData, pronunciation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={selectedType === 'english' ? '请输入音标' : '请输入拼音'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                翻译/解释
              </label>
              <input
                type="text"
                value={formData.translation}
                onChange={(e) => setFormData({...formData, translation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入翻译或解释"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                添加
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量导入区域 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">批量导入</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {selectedType === 'english' 
              ? '格式说明：每行一个单词，英文和中文翻译用空格分隔' 
              : '格式说明：每行一个项目，用 | 分隔内容、发音、翻译'
            }
          </label>
          <textarea
            value={bulkImportText}
            onChange={(e) => setBulkImportText(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={selectedType === 'english' 
              ? `示例格式：
apple 苹果
banana 香蕉
orange 橙子`
              : `示例格式：
apple|/ˈæpəl/|苹果
banana|/bəˈnænə/|香蕉
orange|/ˈɒrɪndʒ/|橙子`
            }
          />
        </div>
        <button
          onClick={handleBulkImport}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          批量导入
        </button>
      </div>

      {/* 项目列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">
            {getTypeLabel(selectedType)}列表 ({items.length}项)
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              暂无数据，请添加项目
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="p-4 hover:bg-gray-50 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium">{item.content}</div>
                  {(item.pronunciation || item.translation) && (
                    <div className="text-sm text-gray-500 mt-1">
                      {item.pronunciation && <span className="mr-2">{item.pronunciation}</span>}
                      {item.translation && <span>{item.translation}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 开始默写按钮 */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={handleStartDictation}
          disabled={items.length === 0}
          className="px-6 py-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 disabled:bg-gray-300 transition-all transform hover:scale-105"
        >
          🎯 开始默写 ({selectedItems.length > 0 ? selectedItems.length : items.length}项)
        </button>
      </div>
    </div>
  )
}

export default VocabularyManager