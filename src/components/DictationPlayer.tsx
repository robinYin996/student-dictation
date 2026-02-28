import React, { useState, useEffect, useRef } from 'react'
import { VocabularyItem, DictationType, DictationSettings } from '../types'
import useVoiceRecognition from '../hooks/useVoiceRecognition'

interface Props {
  type: DictationType
  items: VocabularyItem[]
  onBack: () => void
}

const DictationPlayer: React.FC<Props> = ({ type, items, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [shuffledItems, setShuffledItems] = useState<VocabularyItem[]>([]) // 随机打乱后的播放列表
  const [settings, setSettings] = useState<DictationSettings>({
    interval: 6,
    repeatCount: 2,
    autoPlay: false, // 默认关闭自动播放
    autoRepeatInListenMode: false
  })
  const [isPaused, setIsPaused] = useState(false)
  const [waitingForCommand, setWaitingForCommand] = useState(false)
  const [currentPlayCount, setCurrentPlayCount] = useState(0) // 当前单词已播放次数
  
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceRecognition()
  
  // 用于在 TTS 播放期间暂停语音识别
  const isSpeakingRef = useRef(false)

  // Fisher-Yates 洗牌算法
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // 当前播放的项目（使用打乱后的列表）
  const currentItem = shuffledItems[currentIndex]

  // 获取要播放的文本（英文单词播放中文翻译，其他类型播放内容）
  const getTextToSpeak = (item: VocabularyItem): string => {
    if (type === 'english' && item.translation) {
      return item.translation
    }
    return item.content
  }

  // 基础文字转语音功能（只播放单段文字）
  const speakSingleText = (text: string, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      // TTS 播放期间暂停语音识别，防止干扰
      isSpeakingRef.current = true
      if (isListening) {
        stopListening()
      }
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.7
      utterance.pitch = 1
      utterance.volume = 1
      
      const voices = window.speechSynthesis.getVoices()
      const chineseVoice = voices.find(voice => 
        voice.lang.startsWith('zh') || 
        voice.name.includes('Chinese') ||
        voice.name.includes('普通话')
      )
      if (chineseVoice) {
        utterance.voice = chineseVoice
      }
      
      if (onEnd) {
        utterance.onend = onEnd
      }
      
      window.speechSynthesis.speak(utterance)
    }
  }

  // 文字转语音功能
  const speakText = (text: string, shouldWaitForCommand: boolean = true) => {
    if ('speechSynthesis' in window) {
      console.log('开始播放语音:', text)
      
      // TTS 播放期间暂停语音识别，防止干扰
      isSpeakingRef.current = true
      if (isListening) {
        stopListening()
      }
      
      // 停止之前的语音
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      
      // 设置语音参数
      utterance.rate = 0.7
      utterance.pitch = 1
      utterance.volume = 1
      
      // 获取并选择中文语音
      const voices = window.speechSynthesis.getVoices()
      console.log('可用语音:', voices.map(v => v.name))
      
      const chineseVoice = voices.find(voice => 
        voice.lang.startsWith('zh') || 
        voice.name.includes('Chinese') ||
        voice.name.includes('普通话')
      )
      
      if (chineseVoice) {
        utterance.voice = chineseVoice
        console.log('使用语音:', chineseVoice.name)
      }
      
      // 播放完成后的回调
      utterance.onend = () => {
        console.log('语音播放完成:', text)
        console.log('当前播放次数:', currentPlayCount)
        console.log('是否等待指令:', shouldWaitForCommand)
        
        // TTS 播放完成，标记为不在播放
        isSpeakingRef.current = false
        
        // 更新播放次数
        setCurrentPlayCount(prev => {
          const newCount = prev + 1
          console.log('更新播放次数到:', newCount)
          return newCount
        })
        // 只有当shouldWaitForCommand为true时才设置等待状态
        if (shouldWaitForCommand) {
          setWaitingForCommand(true)
          // 监听模式下，播放完成后恢复语音识别
          setTimeout(() => {
            startListening()
          }, 200)
        }
      }
      
      utterance.onerror = (error) => {
        console.error('语音播放错误:', error)
        isSpeakingRef.current = false
      }
      
      window.speechSynthesis.speak(utterance)
    }
  }

  // 播放词条（汉字词语特殊处理：先播内容，停顿1秒，再播解释）
  const speakItem = (item: VocabularyItem, shouldWaitForCommand: boolean = true) => {
    window.speechSynthesis.cancel()
    
    if (type === 'chinese' && item.translation) {
      // 汉字词语：先播成语，停顿1秒，再播解释
      console.log('播放汉字词语:', item.content, '->', item.translation)
      speakSingleText(item.content, () => {
        setTimeout(() => {
          speakText(item.translation!, shouldWaitForCommand)
        }, 1000)
      })
    } else {
      // 英文或古诗词：直接播放
      speakText(getTextToSpeak(item), shouldWaitForCommand)
    }
  }

  // 播放下一个项目
  const playNext = () => {
    console.log('播放下一个项目')
    if (currentIndex < shuffledItems.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setWaitingForCommand(false)
      setCurrentPlayCount(0) // 重置播放次数
      // 延迟播放，让用户有准备时间
      setTimeout(() => {
        if (settings.autoPlay) {
          // 自动播放模式，播放后继续下一个
          speakItem(shuffledItems[currentIndex + 1], false)
        } else {
          // 监听模式，播放后等待指令
          speakItem(shuffledItems[currentIndex + 1], true)
        }
      }, 800)
    } else {
      // 默写完成
      setIsPlaying(false)
      setWaitingForCommand(false)
      setCurrentPlayCount(0)
      if (!settings.autoPlay) {
        stopListening() // 停止语音监听
      }
      alert('🎉 默写完成！')
    }
  }

  // 重复播放当前项目
  const repeatCurrent = () => {
    console.log('重复播放当前项目')
    if (currentItem) {
      setWaitingForCommand(false)
      if (settings.autoPlay) {
        // 自动播放模式，重复后继续
        speakItem(currentItem, false)
      } else {
        // 监听模式，重复后等待指令
        speakItem(currentItem, true)
      }
    }
  }

  // 开始默写
  const startDictation = () => {
    if (items.length === 0) return
    
    console.log('开始默写')
    // 随机打乱播放顺序
    const shuffled = shuffleArray(items)
    setShuffledItems(shuffled)
    
    setIsPlaying(true)
    setCurrentIndex(0)
    setWaitingForCommand(false)
    setCurrentPlayCount(-1) // 设置为 -1，让 useEffect 触发首次播放
    
    // 根据自动播放设置决定是否启动语音识别
    if (!settings.autoPlay) {
      // 非自动播放模式，启动语音监听
      startListening()
      // 监听模式下直接播放第一个
      setTimeout(() => {
        speakItem(shuffled[0], true)
      }, 1000)
    }
  }

  // 暂停/继续
  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false)
      if (isPlaying && currentItem) {
        speakItem(currentItem, false) // 暂停后继续播放不等待指令
      }
    } else {
      setIsPaused(true)
      window.speechSynthesis.cancel()
    }
  }

  // 停止默写
  const stopDictation = () => {
    console.log('停止默写')
    setIsPlaying(false)
    setIsPaused(false)
    setWaitingForCommand(false)
    setCurrentIndex(0)
    stopListening()
    window.speechSynthesis.cancel()
    resetTranscript()
  }

  // 处理语音命令
  useEffect(() => {
    if (!transcript.trim()) return
    
    const lowerTranscript = transcript.toLowerCase().trim()
    console.log('识别到语音命令:', transcript)
    
    // 下一个命令
    if (lowerTranscript.includes('下一个') || 
        lowerTranscript.includes('next') || 
        lowerTranscript.includes('下一页') ||
        lowerTranscript.includes('继续')) {
      if (isPlaying && !isPaused && waitingForCommand) {
        console.log('执行"下一个"命令')
        playNext()
        resetTranscript()
      }
    }
    // 重复播放命令
    else if (lowerTranscript.includes('重复') || 
             lowerTranscript.includes('再来一遍') ||
             lowerTranscript.includes('repeat')) {
      if (isPlaying && !isPaused && waitingForCommand) {
        console.log('执行"重复"命令')
        repeatCurrent()
        resetTranscript()
      }
    }
  }, [transcript, isPlaying, isPaused, waitingForCommand])

  // 改进的自动播放逻辑
  useEffect(() => {
    if (!isPlaying || isPaused || !settings.autoPlay) {
      return;
    }

    console.log('自动播放激活:', { 
      currentIndex, 
      currentPlayCount, 
      repeatCount: settings.repeatCount,
      isLastItem: currentIndex === shuffledItems.length - 1,
      itemsLength: shuffledItems.length
    });

    // 检查是否已完成所有播放
    if (currentIndex >= shuffledItems.length) {
      console.log('所有单词播放完成');
      setIsPlaying(false);
      return;
    }

    const currentItem = shuffledItems[currentIndex];
    
    // currentPlayCount = -1 表示首次播放，需要初始化
    if (currentPlayCount === -1) {
      console.log(`首次播放 "${currentItem.content}"`);
      const timer = setTimeout(() => {
        setCurrentPlayCount(0);
        speakItem(currentItem, false);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // currentPlayCount = 0 表示首次语音正在播放中，等待 onend 回调递增
    if (currentPlayCount === 0) {
      return;
    }
    
    if (currentPlayCount < settings.repeatCount) {
      // 重复播放当前单词（固定间隔 2 秒）
      console.log(`重复播放 "${currentItem.content}" (第${currentPlayCount + 1}次)`);
      const timer = setTimeout(() => {
        speakItem(currentItem, false);
        // 注意：不在这里增加 currentPlayCount，由 speakText 的 onend 回调处理
      }, 2000); // 同一单词重复间隔固定 2 秒
      
      return () => clearTimeout(timer);
    } else {
      // 当前单词播放完成
      console.log(`"${currentItem.content}" 播放完成`);
      
      if (currentIndex === shuffledItems.length - 1) {
        // 最后一个单词，结束播放
        console.log('最后一个单词播放完成，结束自动播放');
        setIsPlaying(false);
      } else {
        // 播放下一个单词
        console.log('准备播放下一个单词');
        const timer = setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setCurrentPlayCount(-1); // 设置为 -1 触发下一个单词的首次播放
        }, settings.interval * 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isPlaying, isPaused, settings.autoPlay, currentIndex, currentPlayCount, shuffledItems, settings.repeatCount, settings.interval]);

  // 监听模式下的自动重复逻辑
  useEffect(() => {
    if (isPlaying && !isPaused && !settings.autoPlay && settings.autoRepeatInListenMode && waitingForCommand) {
      // 检查是否需要自动重复当前单词
      if (currentPlayCount < settings.repeatCount) {
        console.log('监听模式下自动重复播放');
        const repeatTimer = setTimeout(() => {
          speakItem(currentItem, true); // 重复播放后继续等待指令
        }, 2000);
        return () => clearTimeout(repeatTimer);
      }
    }
  }, [isPlaying, isPaused, settings.autoPlay, settings.autoRepeatInListenMode, waitingForCommand, currentPlayCount, settings.repeatCount, currentItem]);

  const getTypeLabel = (type: DictationType) => {
    switch (type) {
      case 'english': return '英文单词'
      case 'poetry': return '古诗词'
      case 'chinese': return '汉字词语'
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 控制面板 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {getTypeLabel(type)}默写
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              进度: {currentIndex + 1}/{items.length}
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 播放控制按钮 */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {!isPlaying ? (
            <button
              onClick={startDictation}
              className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg font-semibold"
            >
              ▶️ 开始默写
            </button>
          ) : (
            <>
              <button
                onClick={togglePause}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                {isPaused ? '▶️ 继续' : '⏸️ 暂停'}
              </button>
              <button
                onClick={stopDictation}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                ⏹️ 停止
              </button>
              {waitingForCommand && (
                <button
                  onClick={playNext}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  🔊 播放下一个
                </button>
              )}
            </>
          )}
        </div>

        {/* 设置面板 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              播放间隔 (秒)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.interval}
              onChange={(e) => setSettings({...settings, interval: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPlaying}
            />
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoPlay}
                onChange={(e) => setSettings({...settings, autoPlay: e.target.checked})}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isPlaying}
              />
              <span className="text-sm font-medium text-gray-700">自动播放</span>
            </label>
          </div>
        </div>
      </div>

      {/* 当前播放内容显示 */}
      {isPlaying && currentItem && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
          <div className="mb-6">
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {currentItem.content}
            </div>
            {currentItem.pronunciation && (
              <div className="text-xl text-gray-600 mb-2">
                {currentItem.pronunciation}
              </div>
            )}
            {currentItem.translation && (
              <div className="text-lg text-gray-500">
                {currentItem.translation}
              </div>
            )}
          </div>
          
          <div className={`text-lg ${
            waitingForCommand ? 'text-green-600' : 'text-gray-600'
          }`}>
            {waitingForCommand ? '🎤 等待语音指令...' : '🔊 正在播放...'}
          </div>
        </div>
      )}

      {/* 语音识别显示 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">语音识别</h3>
        <div className={`p-4 rounded-lg mb-4 ${
          isListening ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {isListening ? '🎤 正在监听...' : '🔇 已停止监听'}
            </span>
            <span className="text-xs text-gray-500">
              说出"下一个"或"重复"
            </span>
          </div>
          <div className="text-gray-800 min-h-[2rem]">
            {transcript || '等待语音输入...'}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            状态: {waitingForCommand ? '等待指令' : '播放中'}
          </div>
        </div>
        
        <div className="flex gap-2">
          {!isListening ? (
            <button
              onClick={startListening}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              开始监听
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              停止监听
            </button>
          )}
          <button
            onClick={resetTranscript}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            清空文本
          </button>
        </div>
      </div>

      {/* 返回按钮 */}
      <div className="mt-8 text-center">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← 返回词库管理
        </button>
      </div>
    </div>
  )
}

export default DictationPlayer
