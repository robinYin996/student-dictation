import { vocabularyStorage } from '../services/storage'
import sampleData from '../data/sample-data'

export const initializeSampleData = () => {
  // 检查是否已有数据
  const existingData = vocabularyStorage.getAll()
  
  if (existingData.length === 0) {
    console.log('正在初始化示例数据...')
    
    // 添加示例数据
    vocabularyStorage.addBatch(sampleData)
    
    console.log('✅ 示例数据初始化完成！')
    console.log('📊 已添加:')
    console.log('- 英文单词: 5个')
    console.log('- 古诗词: 5首')
    console.log('- 汉字词语: 5个')
  } else {
    console.log('💡 数据库中已有数据，跳过示例数据初始化')
  }
}