// 注意：这只是一个示例配置文件
// 实际使用时需要替换为真实的阿里云AccessKey和相关配置

interface AliyunASRConfig {
  accessKeyId: string
  accessKeySecret: string
  region: string
  endpoint: string
}

// 配置信息（请替换成实际的阿里云凭证）
const config: AliyunASRConfig = {
  accessKeyId: 'your-access-key-id',
  accessKeySecret: 'your-access-key-secret',
  region: 'cn-shanghai',
  endpoint: 'http://nls-meta.cn-shanghai.aliyuncs.com'
}

export default config