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
  const [selectedUnit, setSelectedUnit] = useState<string>('')
  const [units, setUnits] = useState<string[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showAddUnitForm, setShowAddUnitForm] = useState(false)
  const [newUnitName, setNewUnitName] = useState('')
  const [bulkImportText, setBulkImportText] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    content: '',
    pronunciation: '',
    translation: ''
  })

  useEffect(() => {
    loadUnits()
  }, [selectedType])

  useEffect(() => {
    if (selectedUnit) {
      loadItems()
    } else {
      setItems([])
    }
  }, [selectedType, selectedUnit])

  const loadUnits = async () => {
    try {
      const typeUnits = await vocabularyStorage.getUnitsByType(selectedType)
      setUnits(typeUnits)
      if (selectedUnit && !typeUnits.includes(selectedUnit)) {
        setSelectedUnit('')
      }
    } catch (error) {
      console.error('加载单元失败:', error)
    }
  }

  const loadItems = async () => {
    if (!selectedUnit) return
    setLoading(true)
    try {
      const typeItems = await vocabularyStorage.getByTypeAndUnit(selectedType, selectedUnit)
      setItems(typeItems)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUnit = () => {
    if (!newUnitName.trim()) return
    if (units.includes(newUnitName.trim())) {
      alert('该单元已存在')
      return
    }
    setSelectedUnit(newUnitName.trim())
    setUnits([...units, newUnitName.trim()].sort())
    setNewUnitName('')
    setShowAddUnitForm(false)
  }

  const handleAddItem = async () => {
    if (!formData.content.trim()) return
    if (!selectedUnit) {
      alert('请先选择或创建一个单元')
      return
    }

    await vocabularyStorage.add({
      type: selectedType,
      unit: selectedUnit,
      content: formData.content.trim(),
      pronunciation: formData.pronunciation.trim() || undefined,
      translation: formData.translation.trim() || undefined
    })

    setFormData({ content: '', pronunciation: '', translation: '' })
    setShowAddForm(false)
    await loadItems()
  }

  const handleBulkImport = async () => {
    if (!bulkImportText.trim()) return
    if (!selectedUnit) {
      alert('请先选择或创建一个单元')
      return
    }

    try {
      const lines = bulkImportText.split('\n').filter(line => line.trim())
      const newItems = lines.map(line => {
        if (selectedType === 'english') {
          // 用第一个中文字符的位置来分割英文和中文
          const chineseMatch = line.trim().match(/[\u4e00-\u9fa5]/)
          if (chineseMatch && chineseMatch.index) {
            const content = line.trim().substring(0, chineseMatch.index).trim()
            const translation = line.trim().substring(chineseMatch.index).trim()
            return {
              type: selectedType,
              unit: selectedUnit,
              content: content,
              pronunciation: undefined,
              translation: translation || undefined
            }
          }
          return {
            type: selectedType,
            unit: selectedUnit,
            content: line.trim(),
            pronunciation: undefined,
            translation: undefined
          }
        } else if (selectedType === 'chinese') {
          // 汉字词语用冒号分隔：成语：解释
          const colonIndex = line.indexOf('：') !== -1 ? line.indexOf('：') : line.indexOf(':')
          if (colonIndex !== -1) {
            return {
              type: selectedType,
              unit: selectedUnit,
              content: line.substring(0, colonIndex).trim(),
              pronunciation: undefined,
              translation: line.substring(colonIndex + 1).trim() || undefined
            }
          }
          return {
            type: selectedType,
            unit: selectedUnit,
            content: line.trim(),
            pronunciation: undefined,
            translation: undefined
          }
        } else {
          // 古诗词用 | 分隔
          const parts = line.split('|').map(part => part.trim())
          return {
            type: selectedType,
            unit: selectedUnit,
            content: parts[0],
            pronunciation: parts[1] || undefined,
            translation: parts[2] || undefined
          }
        }
      })

      await vocabularyStorage.addBatch(newItems)
      setBulkImportText('')
      await loadItems()
      await loadUnits()
    } catch (error) {
      alert('批量导入格式错误，请检查输入格式')
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return
    
    if (confirm(`确定要删除选中的 ${selectedItems.length} 个项目吗？`)) {
      await vocabularyStorage.deleteBatch(selectedItems)
      setSelectedItems([])
      await loadItems()
      await loadUnits()
    }
  }

  const handleExport = async () => {
    const allItems = await vocabularyStorage.getAll()
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
      {/* 类型和单元选择器 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">词库管理</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* 词库类型下拉列表 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              词库类型
            </label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as DictationType)
                setSelectedUnit('')
                setSelectedItems([])
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="english">英文单词</option>
              <option value="poetry">古诗词</option>
              <option value="chinese">汉字词语</option>
            </select>
          </div>

          {/* 单元下拉列表 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择单元
            </label>
            <div className="flex gap-2">
              <select
                value={selectedUnit}
                onChange={(e) => {
                  setSelectedUnit(e.target.value)
                  setSelectedItems([])
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- 请选择单元 --</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              <button
                onClick={() => setShowAddUnitForm(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
              >
                + 新建
              </button>
            </div>
          </div>
        </div>

        {/* 新建单元表单 */}
        {showAddUnitForm && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入单元名称，如：Unit 1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddUnit()}
              />
              <button
                onClick={handleAddUnit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                创建
              </button>
              <button
                onClick={() => {
                  setShowAddUnitForm(false)
                  setNewUnitName('')
                }}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* 操作按钮 - 选择单元后显示 */}
        {selectedUnit && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleStartDictation}
              disabled={items.length === 0}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              开始默写 ({selectedItems.length > 0 ? selectedItems.length : items.length}项)
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              添加项目
            </button>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {selectedItems.length === items.length ? '取消全选' : '全选'}
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedItems.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              删除选中
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              导出词库
            </button>
          </div>
        )}
      </div>

      {/* 添加表单 - 选择单元后显示 */}
      {showAddForm && selectedUnit && (
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
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
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
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量导入区域 - 选择单元后显示 */}
      {selectedUnit && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">批量导入</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedType === 'english' 
                ? '格式说明：每行一个单词，英文和中文翻译用空格分隔' 
                : selectedType === 'chinese'
                ? '格式说明：每行一个词语，词语和解释用冒号分隔'
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
factory worker 工厂工人
ice cream 冰淇淋`
                : selectedType === 'chinese'
                ? `示例格式：
守株待兔：比喻不想努力，而希望通过侥幸获得成功。
掩耳盗铃：比喻自己欺骗自己。
画蛇添足：比喻做了多余的事。`
                : `示例格式：
静夜思|李白|床前明月光，疑是地上霜。
春晓|孟浩然|春眠不觉晓，处处闻啼鸟。`
              }
            />
          </div>
          <button
            onClick={handleBulkImport}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            批量导入
          </button>
        </div>
      )}

      {/* 项目列表 - 选择单元后显示 */}
      {selectedUnit && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium">
              {getTypeLabel(selectedType)} - {selectedUnit} ({items.length}项)
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                加载中...
              </div>
            ) : items.length === 0 ? (
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
      )}
    </div>
  )
}

export default VocabularyManager
