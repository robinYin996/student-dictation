// 最后一个单词播放测试
const testLastWordPlayback = () => {
  const testItems = ['apple', 'banana', 'orange'];
  const settings = { repeatCount: 2 };
  
  console.log('=== 最后一个单词播放测试 ===');
  console.log('测试词库:', testItems);
  console.log('重复次数:', settings.repeatCount);
  console.log('');
  
  // 模拟播放过程
  let currentIndex = 0;
  let currentPlayCount = 0;
  let playbackLog = [];
  
  const logPlayback = (action, word, count, index) => {
    const message = `${action}: "${word}" (第${count}次播放, 索引${index})`;
    playbackLog.push(message);
    console.log(message);
  };
  
  // 模拟完整的播放循环
  while (currentIndex < testItems.length) {
    const currentItem = testItems[currentIndex];
    
    // 重复播放当前单词
    while (currentPlayCount < settings.repeatCount) {
      logPlayback('播放', currentItem, currentPlayCount + 1, currentIndex);
      currentPlayCount++;
    }
    
    // 检查是否是最后一个单词
    if (currentIndex === testItems.length - 1) {
      logPlayback('完成', '所有单词播放完毕', '', '');
      break;
    }
    
    // 移动到下一个单词
    logPlayback('切换', '-> 下一个单词', '', currentIndex + 1);
    currentIndex++;
    currentPlayCount = 0;
  }
  
  console.log('\n=== 播放日志 ===');
  playbackLog.forEach(log => console.log(log));
  
  // 验证结果
  const expectedTotalPlays = testItems.length * settings.repeatCount;
  const actualTotalPlays = playbackLog.filter(log => log.includes('播放:')).length;
  
  console.log(`\n=== 验证结果 ===`);
  console.log(`期望播放次数: ${expectedTotalPlays}`);
  console.log(`实际播放次数: ${actualTotalPlays}`);
  console.log(`最后一个单词是否播放: ${playbackLog.some(log => log.includes('"orange"')) ? '✅ 是' : '❌ 否'}`);
  
  return {
    totalExpected: expectedTotalPlays,
    totalActual: actualTotalPlays,
    lastWordPlayed: playbackLog.some(log => log.includes('"orange"')),
    success: actualTotalPlays === expectedTotalPlays && playbackLog.some(log => log.includes('"orange"'))
  };
};

// 运行测试
const result = testLastWordPlayback();
console.log(`\n测试结果: ${result.success ? '✅ 通过' : '❌ 失败'}`);