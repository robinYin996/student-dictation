import { useState, useEffect, useRef } from 'react'

interface VoiceRecognitionHook {
  isListening: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    start: () => void
    stop: () => void
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
    onend: (() => any) | null
  }
}

const useVoiceRecognition = (): VoiceRecognitionHook => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)
  // 控制是否应该自动重启语音识别
  const shouldAutoRestartRef = useRef(false)
  // 使用 ref 跟踪实际的监听状态，避免闭包问题
  const isListeningRef = useRef(false)

  useEffect(() => {
    // 检查浏览器是否支持语音识别
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('当前浏览器不支持语音识别')
      return
    }

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false // 改为非连续模式
    recognitionRef.current.interimResults = false // 不需要中间结果
    recognitionRef.current.lang = 'zh-CN'

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        finalTranscript += transcript
      }
      
      setTranscript(finalTranscript)
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('语音识别错误:', event.error)
      setIsListening(false)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
      isListeningRef.current = false
      // 只有在 shouldAutoRestart 为 true 时才自动重新开始
      if (shouldAutoRestartRef.current && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start()
            setIsListening(true)
            isListeningRef.current = true
          } catch (e) {
            console.error('重启语音识别失败:', e)
          }
        }, 100)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startListening = () => {
    shouldAutoRestartRef.current = true
    if (recognitionRef.current && !isListeningRef.current) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        isListeningRef.current = true
      } catch (e) {
        console.error('启动语音识别失败:', e)
      }
    }
  }

  const stopListening = () => {
    shouldAutoRestartRef.current = false
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // 忽略停止时的错误
      }
      setIsListening(false)
      isListeningRef.current = false
    }
  }

  const resetTranscript = () => {
    setTranscript('')
  }

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  }
}

export default useVoiceRecognition