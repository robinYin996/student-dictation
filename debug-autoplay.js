// 调试自动播放逻辑
const debugAutoPlay = () => {
  const testScenario = {
    isPlaying: true,
    isPaused: false,
    settings: { autoPlay: true, repeatCount: 2 },
    currentPlayCount: 1,
    currentIndex: 0,
    items: ['apple', 'banana', 'orange']
  };

  console.log('=== 自动播放逻辑调试 ===');
  console.log('当前状态:', testScenario);
  
  // 模拟当前的判断逻辑
  const shouldRepeat = testScenario.currentPlayCount < testScenario.settings.repeatCount - 1;
  console.log(`重复条件: ${testScenario.currentPlayCount} < ${testScenario.settings.repeatCount - 1} = ${shouldRepeat}`);
  
  if (shouldRepeat) {
    console.log('✅ 应该重复播放当前单词');
  } else {
    console.log('❌ 应该播放下一个单词');
    if (testScenario.currentIndex < testScenario.items.length - 1) {
      console.log(`✅ 播放下一个: ${testScenario.items[testScenario.currentIndex + 1]}`);
    } else {
      console.log('⚠️ 已经是最后一个单词');
    }
  }

  // 正确的逻辑应该是
  console.log('\n=== 正确逻辑应该是 ===');
  const correctShouldRepeat = testScenario.currentPlayCount < testScenario.settings.repeatCount;
  console.log(`正确重复条件: ${testScenario.currentPlayCount} < ${testScenario.settings.repeatCount} = ${correctShouldRepeat}`);
  
  if (correctShouldRepeat) {
    console.log('✅ 应该重复播放当前单词');
  } else {
    console.log('❌ 应该播放下一个单词');
  }

  return !shouldRepeat && correctShouldRepeat; // 返回是否存在问题
};

// 运行调试
const hasIssue = debugAutoPlay();
console.log(`\n发现问题: ${hasIssue ? '✅ 是的，逻辑有误' : '❌ 逻辑正确'}`);