#!/bin/bash

echo "🚀 学生自动默写系统启动脚本"
echo "=============================="

# 检查Node.js是否已安装
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到Node.js"
    echo "请先安装Node.js:"
    echo "1. 访问 https://nodejs.org/"
    echo "2. 下载并安装LTS版本"
    echo "3. 重新运行此脚本"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo "✅ npm版本: $(npm --version)"

# 进入项目目录
cd "$(dirname "$0")"

# 检查node_modules是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装项目依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
fi

echo "🎯 启动开发服务器..."
echo "🌐 访问地址: http://localhost:3000"
echo "กด Ctrl+C 停止服务器"

# 启动开发服务器
npm run dev