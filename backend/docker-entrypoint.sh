#!/bin/sh
set -e

echo ">>> 等待数据库就绪..."
sleep 2

echo ">>> 同步数据库表结构..."
npx prisma db push --accept-data-loss

echo ">>> 启动后端服务..."
exec node src/index.js
