// src/index.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { handleSocketConnection } from './socket'; // 导入你现有的 socket.ts

const app = express();
const server = createServer(app);

// 配置 Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // 生产环境替换为你的前端域名
    methods: ['GET', 'POST']
  },
  transports: ['websocket'] // 兼容 Cloudflare Workers
});

// 处理 Socket 连接
io.on('connection', (socket) => {
  console.log('用户已连接');
  // 这里调用你 socket.ts 中的处理逻辑
  handleSocketConnection(socket);
});

// 简单的健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Cloudflare Workers 入口
export default {
  async fetch(request: Request, env: any, ctx: any) {
    // 将请求转发给 Express 应用
    // 注意：这需要适配 Cloudflare Workers 环境
    return new Response('Hello from Romantic Journey Backend!', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};