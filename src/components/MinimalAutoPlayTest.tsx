// 最小化自动播放测试
import React, { useState, useEffect } from 'react';

const MinimalAutoPlayTest = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [count, setCount] = useState(0);
  const [messages, setMessages] = useState([]);

  const logMessage = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    setMessages(prev => [...prev, `[${timestamp}] ${msg}`]);
    console.log(msg);
  };

  // 简化的自动播放逻辑
  useEffect(() => {
    if (isPlaying) {
      logMessage(`useEffect触发 - count: ${count}`);
      
      const timer = setTimeout(() => {
        logMessage(`定时器执行 - 播放第${count + 1}次`);
        setCount(prev => prev + 1);
      }, 2000);

      return () => {
        logMessage('清理定时器');
        clearTimeout(timer);
      };
    }
  }, [isPlaying, count]);

  const startTest = () => {
    logMessage('=== 开始测试 ===');
    setIsPlaying(true);
    setCount(0);
  };

  const stopTest = () => {
    logMessage('=== 停止测试 ===');
    setIsPlaying(false);
    setCount(0);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>最小化自动播放测试</h2>
      <div>
        <button onClick={startTest} style={{ marginRight: '10px' }}>
          开始测试
        </button>
        <button onClick={stopTest}>
          停止测试
        </button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <strong>状态:</strong> isPlaying={isPlaying.toString()}, count={count}
      </div>
      <div style={{ marginTop: '20px' }}>
        <strong>日志:</strong>
        <div style={{ 
          height: '300px', 
          overflowY: 'scroll', 
          border: '1px solid #ccc', 
          padding: '10px',
          backgroundColor: '#f5f5f5'
        }}>
          {messages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MinimalAutoPlayTest;