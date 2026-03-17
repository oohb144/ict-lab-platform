# ICT 实验室管理平台

中北大学信息与通信工程学院实验室管理系统，支持器材借阅、讨论区、共享资料等功能。

## 技术栈

- 前端：React 18 + Vite + Ant Design 5 + Tailwind CSS
- 后端：Node.js + Express + Prisma
- 数据库：PostgreSQL (Supabase)
- 文件存储：Supabase Storage

## 本地开发

```bash
# 后端
cd backend
npm install
cp .env.example .env  # 填写数据库连接等配置
npx prisma db push
npx prisma db seed
npm run dev

# 前端
cd frontend
npm install
npm run dev
```

## 部署

- 前端 → Vercel
- 后端 → Render
- 数据库 → Supabase PostgreSQL
- 文件存储 → Supabase Storage

## 管理员账号

- 账号：mstxdict
- 密码：000144
