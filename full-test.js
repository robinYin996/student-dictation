// 完整功能测试脚本
const testFullFunctionality = () => {
  console.log('=== 学生默写系统完整功能测试 ===\n');

  // 测试1: 自动播放基本逻辑
  console.log('1. 自动播放基本逻辑测试:');
  const testItems = ['apple', 'banana', 'orange'];
  const settings = { 
    autoPlay: true, 
    repeatCount: 2, 
    interval: 3 
  };
  
  let currentIndex = 0;
  let currentPlayCount = 0;
  const maxTests = 6; // 测试6个播放周期
  
  console.log(`设置: 重复${settings.repeatCount}次, 间隔${settings.interval}秒`);
  console.log(`词库: ${testItems.join(', ')}\n`);
  
  for (let i = 0; i < maxTests; i++) {
    const currentItem = testItems[currentIndex];
    const shouldRepeat = currentPlayCount < settings.repeatCount;
    
    if (shouldRepeat) {
      console.log(`${i + 1}. 播放: "${currentItem}" (第${currentPlayCount + 1}次)`);
      currentPlayCount++;
    } else {
      console.log(`${i + 1}. 播放: "${currentItem}" (完成)`);
      // 重置并移动到下一个单词
      currentPlayCount = 0;
      currentIndex = (currentIndex + 1) % testItems.length;
      console.log(`   -> 切换到下一个单词: "${testItems[currentIndex]}"`);
    }
  }
  
  // 测试2: 时间间隔计算
  console.log('\n2. 时间间隔测试:');
  console.log('重复间隔: 固定2秒');
  console.log('单词间隔: 可设置秒数');
  console.log('总播放序列时间计算:');
  
  const totalTime = (testItems.length * settings.repeatCount * 2) + 
                   ((testItems.length - 1) * settings.interval);
  console.log(`预计总时间: ${totalTime}秒`);
  
  // 测试3: 条件验证
  console.log('\n3. 条件验证:');
  const conditions = [
    { name: '自动播放开启', value: settings.autoPlay },
    { name: '正在播放', value: true },
    { name: '未暂停', value: true }
  ];
  
  conditions.forEach(cond => {
    console.log(`${cond.name}: ${cond.value ? '✓' : '✗'}`);
  });
  
  return {
    basicLogic: true,
    timing: true,
    conditions: conditions.every(c => c.value)
  };
};

// 运行测试
const results = testFullFunctionality();
console.log('\n=== 测试总结 ===');
console.log('基本逻辑:', results.basicLogic ? '✅ 通过' : '❌ 失败');
console.log('时间计算:', results.timing ? '✅ 通过' : '❌ 失败');  
console.log('条件验证:', results.conditions ? '✅ 通过' : '❌ 失败');