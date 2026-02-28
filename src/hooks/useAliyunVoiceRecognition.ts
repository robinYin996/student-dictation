import { useState, useEffect, useRef } from 'react'
import config from '../config/aliyun-asr'

interface AliyunVoiceRecognitionHook {
  isRecording: boolean
  transcript: string
  startRecording: () => Promise<void>
  stopRecording: () => void
  resetTranscript: () => void
}

const useAliyunVoiceRecognition = (): AliyunVoiceRecognitionHook => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // 初始化录音设备
  const initRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        audioChunksRef.current = []
        await sendToAliyunASR(audioBlob)
      }

      mediaRecorderRef.current = mediaRecorder
      return true
    } catch (error) {
      console.error('无法访问麦克风:', error)
      alert('请允许访问麦克风权限')
      return false
    }
  }

  // 发送到阿里云语音识别服务
  const sendToAliyunASR = async (audioBlob: Blob) => {
    try {
      // 这里应该实现阿里云语音识别API调用
      // 由于涉及敏感凭证，这里只提供示例框架
      
      /*
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      
      const response = await fetch('/api/asr', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${config.accessKeyId}`
        }
      })
      
      const result = await response.json()
      setTranscript(result.text || '')
      */

      // 模拟识别结果（实际应用中应移除）
      setTimeout(() => {
        setTranscript('模拟识别结果: 下一个')
      }, 1000)

    } catch (error) {
      console.error('语音识别失败:', error)
    }
  }

  const startRecording = async () => {
    if (!mediaRecorderRef.current) {
      const initialized = await initRecorder()
      if (!initialized) return
    }

    if (mediaRecorderRef.current && !isRecording) {
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setTranscript('')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // 停止所有音频轨道
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      mediaRecorderRef.current = null
    }
  }

  const resetTranscript = () => {
    setTranscript('')
  }

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    resetTranscript
  }
}

export default useAliyunVoiceRecognition