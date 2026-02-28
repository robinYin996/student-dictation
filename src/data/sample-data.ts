// 示例词库数据
const sampleData = [
  // 英文单词
  {
    type: 'english',
    content: 'apple',
    pronunciation: '/ˈæpəl/',
    translation: '苹果'
  },
  {
    type: 'english',
    content: 'banana',
    pronunciation: '/bəˈnænə/',
    translation: '香蕉'
  },
  {
    type: 'english',
    content: 'computer',
    pronunciation: '/kəmˈpjuːtər/',
    translation: '计算机'
  },
  {
    type: 'english',
    content: 'beautiful',
    pronunciation: '/ˈbjuːtɪfl/',
    translation: '美丽的'
  },
  {
    type: 'english',
    content: 'education',
    pronunciation: '/ˌedʒuˈkeɪʃn/',
    translation: '教育'
  },

  // 古诗词
  {
    type: 'poetry',
    content: '春眠不觉晓，处处闻啼鸟。',
    pronunciation: 'chūn mián bù jué xiǎo, chù chù wén tí niǎo.',
    translation: '春天睡醒不觉天已大亮，到处是鸟儿清脆的叫声。'
  },
  {
    type: 'poetry',
    content: '床前明月光，疑是地上霜。',
    pronunciation: 'chuáng qián míng yuè guāng, yí shì dì shàng shuāng.',
    translation: '床前洒满了明亮的月光，怀疑是地上铺了一层白霜。'
  },
  {
    type: 'poetry',
    content: '锄禾日当午，汗滴禾下土。',
    pronunciation: 'chú hé rì dāng wǔ, hàn dī hé xià tǔ.',
    translation: '农民在正午烈日下锄禾，汗水滴入禾下的泥土中。'
  },
  {
    type: 'poetry',
    content: '白日依山尽，黄河入海流。',
    pronunciation: 'bái rì yī shān jìn, huáng hé rù hǎi liú.',
    translation: '夕阳依傍着西山慢慢地沉没，滔滔黄河朝着东海汹涌奔流。'
  },
  {
    type: 'poetry',
    content: '举头望明月，低头思故乡。',
    pronunciation: 'jǔ tóu wàng míng yuè, dī tóu sī gù xiāng.',
    translation: '我抬起头来，看那天窗外空中的明月，不由得低头沉思，想起远方的家乡。'
  },

  // 汉字词语
  {
    type: 'chinese',
    content: '阳光',
    pronunciation: 'yáng guāng',
    translation: '太阳发出的光'
  },
  {
    type: 'chinese',
    content: '快乐',
    pronunciation: 'kuài lè',
    translation: '心情愉悦，感到幸福'
  },
  {
    type: 'chinese',
    content: '学习',
    pronunciation: 'xué xí',
    translation: '通过练习、训练获得知识技能'
  },
  {
    type: 'chinese',
    content: '友谊',
    pronunciation: 'yǒu yì',
    translation: '朋友间的情谊'
  },
  {
    type: 'chinese',
    content: '梦想',
    pronunciation: 'mèng xiǎng',
    translation: '对未来美好生活的愿望'
  }
]

export default sampleData