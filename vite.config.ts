import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.resolve(__dirname, 'data/vocabulary.json')

// 确保数据目录存在
const dataDir = path.dirname(DATA_FILE)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// 确保数据文件存在
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf-8')
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vocabulary-api',
      configureServer(server) {
        // GET /api/vocabulary - 获取所有词条
        server.middlewares.use('/api/vocabulary', (req, res, next) => {
          if (req.method === 'GET') {
            try {
              const data = fs.readFileSync(DATA_FILE, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(data)
            } catch (error) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: '读取数据失败' }))
            }
            return
          }
          next()
        })

        // POST /api/vocabulary - 保存所有词条
        server.middlewares.use('/api/vocabulary', (req, res, next) => {
          if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => {
              body += chunk.toString()
            })
            req.on('end', () => {
              try {
                const data = JSON.parse(body)
                fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true }))
              } catch (error) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: '保存数据失败' }))
              }
            })
            return
          }
          next()
        })
      }
    }
  ],
  server: {
    port: 3000,
    strictPort: true, // 强制使用固定端口，被占用时报错
    open: true
  }
})
