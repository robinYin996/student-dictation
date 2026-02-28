// 测试录入功能的简单验证
const testImportFormat = () => {
  const testLines = [
    'apple 苹果',
    'banana 香蕉', 
    'orange 橙子',
    'computer 计算机',
    'beautiful 美丽的'
  ];
  
  const results = testLines.map(line => {
    const parts = line.trim().split(/\s+/);
    return {
      original: line,
      english: parts[0],
      chinese: parts.slice(1).join(' '),
      valid: parts.length >= 2
    };
  });
  
  console.log('录入格式测试结果:');
  console.table(results);
  return results.every(r => r.valid);
};

// 运行测试
const isValid = testImportFormat();
console.log('测试结果:', isValid ? '✅ 通过' : '❌ 失败');