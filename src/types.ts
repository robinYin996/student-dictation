export type DictationType = 'english' | 'poetry' | 'chinese'

export interface VocabularyItem {
  id: string
  type: DictationType
  unit: string
  content: string
  pronunciation?: string
  translation?: string
  createdAt: Date
}

export interface DictationSettings {
  interval: number // 播放间隔（秒）
  repeatCount: number // 重复次数
  autoPlay: boolean // 是否自动播放
  autoRepeatInListenMode: boolean // 监听模式下是否自动重复
}

export interface VoiceRecognitionResult {
  text: string
  confidence: number
  isFinal: boolean
}