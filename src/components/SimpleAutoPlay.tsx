// 全新简化的自动播放实现
import React, { useState, useEffect, useRef } from 'react';

const SimpleAutoPlay = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [items] = useState(['apple', 'banana', 'orange', 'grape']);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 清理定时器
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // 播放函数
  const playWord = (word: string) => {
    console.log(`播放单词: ${word}`);
    // 这里可以调用实际的文字转语音功能
    // speakText(word, false);
  };

  // 核心自动播放逻辑
  useEffect(() => {
    if (!isPlaying) {
      clearTimer();
      return;
    }

    console.log(`自动播放状态: currentIndex=${currentIndex}, playCount=${playCount}`);

    // 检查是否需要重复播放当前单词
    if (playCount < 2) { // 重复2次
      console.log('安排重复播放');
      timerRef.current = setTimeout(() => {
        playWord(items[currentIndex]);
        setPlayCount(prev => prev + 1);
      }, 2000); // 2秒间隔
    } else {
      // 当前单词播放完成，播放下一个
      console.log('安排播放下一个单词');
      timerRef.current = setTimeout(() => {
        if (currentIndex < items.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setPlayCount(0); // 重置播放计数
          playWord(items[currentIndex + 1]);
          setPlayCount(1); // 新单词的第一次播放
        } else {
          // 播放完成
          console.log('播放完成');
          setIsPlaying(false);
        }
      }, 3000); // 3秒间隔到下一个单词
    }

    // 清理函数
    return clearTimer;
  }, [isPlaying, currentIndex, playCount]);

  const startPlay = () => {
    console.log('=== 开始自动播放 ===');
    setIsPlaying(true);
    setCurrentIndex(0);
    setPlayCount(0);
    // 立即播放第一个单词
    setTimeout(() => {
      playWord(items[0]);
      setPlayCount(1);
    }, 1000);
  };

  const stopPlay = () => {
    console.log('=== 停止自动播放 ===');
    setIsPlaying(false);
    setCurrentIndex(0);
    setPlayCount(0);
    clearTimer();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>简化自动播放测试</h2>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={startPlay}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          开始播放
        </button>
        <button 
          onClick={stopPlay}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          停止播放
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>当前状态:</strong><br/>
        播放中: {isPlaying ? '是' : '否'}<br/>
        当前单词: {items[currentIndex]}<br/>
        播放次数: {playCount}<br/>
        进度: {currentIndex + 1}/{items.length}
      </div>

      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '4px'
      }}>
        <strong>播放序列预期:</strong><br/>
        apple (1次) → apple (2次) → [3秒] → banana (1次) → banana (2次) → [3秒] → orange (1次) → orange (2次) → [3秒] → grape (1次) → grape (2次)
      </div>
    </div>
  );
};

export default SimpleAutoPlay;