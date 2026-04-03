# 后端 Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --production=false

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 启动脚本（迁移 + 启动服务）
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["/docker-entrypoint.sh"]
