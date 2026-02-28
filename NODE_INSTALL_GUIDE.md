# Node.js 安装指南

由于系统尚未安装Node.js，您需要手动安装才能运行学生默写系统。

## 安装步骤

### 方法一：官网下载安装（推荐）
1. 访问 Node.js 官方网站：https://nodejs.org/
2. 点击绿色的 "LTS" 或 "Current" 版本下载按钮
3. 下载适用于 macOS 的 .pkg 安装包
4. 双击下载的 .pkg 文件，按照安装向导完成安装

### 方法二：使用终端命令安装
如果您的系统支持 curl，可以尝试：

```bash
# 下载并安装 Node.js
curl -fsSL https://nodejs.org/dist/latest/node-v21.7.1.pkg -o node-installer.pkg
sudo installer -pkg node-installer.pkg -target /
```

### 验证安装
安装完成后，在终端中验证：

```bash
node --version
npm --version
```

应该能看到类似输出：
```
v21.7.1
10.5.0
```

## 启动项目

安装完成Node.js后，按以下步骤启动学生默写系统：

```bash
# 进入项目目录
cd student-dictation

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

然后在浏览器中访问 http://localhost:3000

## 如果遇到问题

1. 确保系统版本支持Node.js（macOS 10.15+）
2. 检查防火墙设置是否阻止了安装
3. 尝试重启终端后再执行命令