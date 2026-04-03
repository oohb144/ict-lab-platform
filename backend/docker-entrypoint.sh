#!/bin/sh
set -e

echo ">>> 等待数据库就绪..."
sleep 2

echo ">>> 执行数据库迁移..."
npx prisma migrate deploy

echo ">>> 启动后端服务..."
exec node src/index.js
