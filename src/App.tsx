import React, { useState, useEffect } from 'react'
import VocabularyManager from './components/VocabularyManager'
import DictationPlayer from './components/DictationPlayer'
import { VocabularyItem, DictationType } from './types'
import { initializeSampleData } from './utils/init-sample-data'

function App() {
  const [currentView, setCurrentView] = useState<'manager' | 'dictation'>('manager')
  const [selectedType, setSelectedType] = useState<DictationType>('english')
  const [selectedItems, setSelectedItems] = useState<VocabularyItem[]>([])

  useEffect(() => {
    // 初始化示例数据
    initializeSampleData()
  }, [])

  const handleStartDictation = (type: DictationType, items: VocabularyItem[]) => {
    setSelectedType(type)
    setSelectedItems(items)
    setCurrentView('dictation')
  }

  const handleBackToManager = () => {
    setCurrentView('manager')
    setSelectedItems([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">学生自动默写系统</h1>
            {currentView === 'dictation' && (
              <button
                onClick={handleBackToManager}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ← 返回词库管理
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentView === 'manager' ? (
          <VocabularyManager onStartDictation={handleStartDictation} />
        ) : (
          <DictationPlayer 
            type={selectedType}
            items={selectedItems}
            onBack={handleBackToManager}
          />
        )}
      </main>
    </div>
  )
}

export default App