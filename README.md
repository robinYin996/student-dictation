# 学生自动默写系统

一个现代化的学生自动默写网站，支持英文单词、古诗词、汉字词语的录入和自动播放默写功能。

## 功能特点

### 📚 词库管理
- 支持英文单词、古诗词、汉字词语三种类型
- 单个添加和批量导入功能
- CSV格式导出/导入
- 全选/批量删除操作

### 🎯 自动默写
- 文字转语音自动播放
- 可调节播放间隔和重复次数
- 语音控制"下一个"切换项目
- 进度条显示默写进度

### 🎤 语音识别
- 浏览器原生语音识别（Web Speech API）
- 阿里云语音识别SDK集成（可选）
- 语音命令控制播放

### 💄 现代化界面
- 响应式设计，支持移动端
- 简约清新的UI风格
- 流畅的动画效果
- 直观的操作体验

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: CSS3 + 自定义设计系统
- **语音**: Web Speech API + 阿里云语音识别
- **存储**: localStorage

## 快速开始

### 环境要求
- Node.js 16+
- npm 8+

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd student-dictation
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 访问应用
打开浏览器访问 `http://localhost:3000`

### 构建生产版本
```bash
npm run build
```

## 使用指南

### 1. 词库管理
- 选择词库类型（英文/古诗/汉字）
- 点击"添加项目"录入单个词条
- 使用"批量导入"快速添加多个词条
- 支持全选和批量删除操作

### 2. 批量导入格式
```
apple|/ˈæpəl/|苹果
banana|/bəˈnænə/|香蕉
orange|/ˈɒrɪndʒ/|橙子
```
格式：内容|发音|翻译（用|分隔）

### 3. 开始默写
- 选择要默写的词条
- 点击"开始默写"按钮
- 系统会自动朗读词条
- 说出"下一个"切换到下一项
- 可随时暂停、停止或调整设置

### 4. 语音控制
- 点击"开始监听"启用语音识别
- 说出"下一个"或"next"切换项目
- 系统实时显示识别结果

## 配置说明

### 阿里云语音识别（可选）
如需使用阿里云语音识别，在 `src/config/aliyun-asr.ts` 中配置：
```typescript
const config = {
  accessKeyId: 'your-access-key-id',
  accessKeySecret: 'your-access-key-secret',
  region: 'cn-shanghai',
  endpoint: 'http://nls-meta.cn-shanghai.aliyuncs.com'
}
```

## 项目结构

```
student-dictation/
├── src/
│   ├── components/          # React组件
│   │   ├── VocabularyManager.tsx    # 词库管理
│   │   └── DictationPlayer.tsx      # 默写播放器
│   ├── hooks/               # 自定义Hooks
│   │   ├── useVoiceRecognition.ts   # 语音识别Hook
│   │   └── useAliyunVoiceRecognition.ts # 阿里云语音Hook
│   ├── services/            # 业务服务
│   │   └── storage.ts       # 本地存储服务
│   ├── utils/               # 工具函数
│   │   └── helpers.ts       # 辅助函数
│   ├── config/              # 配置文件
│   │   └── aliyun-asr.ts    # 阿里云配置
│   ├── styles/              # 样式文件
│   │   └── globals.css      # 全局样式
│   ├── types.ts             # TypeScript类型定义
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 入口样式
├── public/                  # 静态资源
├── index.html               # HTML模板
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript配置
└── vite.config.ts           # Vite配置
```

## 浏览器兼容性

- Chrome 60+ ✅
- Firefox 60+ ✅
- Safari 12+ ✅
- Edge 79+ ✅

注意：语音识别功能需要HTTPS环境或localhost

## 开发计划

- [ ] 添加用户账户系统
- [ ] 支持更多语音识别服务商
- [ ] 添加默写统计和分析
- [ ] 支持离线模式
- [ ] 移动端APP版本

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交issue或联系开发者。