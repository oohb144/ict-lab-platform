# 宝塔面板 Nginx 反向代理配置

## 说明

本项目使用 Docker Compose 在服务器上运行：
- 前端容器 → 监听 8080 端口
- 后端容器 → 监听 3001 端口
- PostgreSQL  → 内部网络，不暴露端口

宝塔 Nginx 作为统一入口，将 `/api` 代理到后端，其余请求代理到前端。

---

## 宝塔面板配置步骤

### 1. 安装 Docker

在宝塔面板 → 软件商店 → 搜索 Docker → 安装

或 SSH 终端执行：
```bash
curl -fsSL https://get.docker.com | bash -s docker
# 安装 docker-compose
pip3 install docker-compose
```

### 2. 上传代码到服务器

```bash
# 方式一：Git 拉取
cd /www/wwwroot
git clone https://gitee.com/你的账号/ict-lab-platform.git

# 方式二：宝塔文件管理器直接上传压缩包解压
```

### 3. 配置环境变量

```bash
cd /www/wwwroot/ict-lab-platform
cp .env.example .env
# 编辑 .env，填入实际密码和密钥
nano .env
```

### 4. 启动 Docker 容器

```bash
cd /www/wwwroot/ict-lab-platform
docker-compose up -d --build
```

首次启动会自动执行数据库迁移，大约需要 1-2 分钟。

### 5. 宝塔面板创建网站

在宝塔面板 → 网站 → 添加站点：
- 域名：your-domain.com
- 根目录：随意（反正要配置代理）
- PHP：纯静态

### 6. 配置 Nginx 反向代理

进入网站设置 → 配置文件，将 server 块内容替换为：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 后端 API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # 上传文件下载代理（让用户能下载服务器上的文件）
    location /uploads/ {
        proxy_pass http://127.0.0.1:3001/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Content-Disposition "attachment";
    }

    # 前端代理（React SPA）
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 7. 申请 SSL 证书（HTTPS）

宝塔面板 → 网站 → SSL → 免费证书（Let's Encrypt）→ 申请

申请成功后，Nginx 会自动添加 443 端口监听，并开启强制 HTTPS。

---

## 常用运维命令

```bash
# 查看容器状态
docker-compose ps

# 查看后端日志
docker-compose logs -f backend

# 重启服务
docker-compose restart

# 更新代码后重新构建部署
git pull
docker-compose up -d --build

# 进入后端容器执行命令
docker-compose exec backend sh

# 手动执行数据库迁移
docker-compose exec backend npx prisma migrate deploy

# 备份数据库
docker-compose exec postgres pg_dump -U ictlab ictlab > backup_$(date +%Y%m%d).sql
```

---

## 数据库迁移说明（从 Supabase 迁移）

如果你之前有 Supabase 的数据需要迁移：

1. 在 Supabase 控制台导出数据（SQL 格式）
2. 将 SQL 文件传到服务器
3. 导入到 Docker PostgreSQL：
```bash
cat your-backup.sql | docker-compose exec -T postgres psql -U ictlab ictlab
```

新部署如果是全新开始，直接执行 `docker-compose up -d --build` 即可，迁移脚本会自动创建表结构。

---

## CORS 配置更新

新服务器部署后，需要在 `backend/src/index.js` 的 CORS 白名单中添加你的域名：

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-domain.com',  // ← 添加你的域名
    'http://your-domain.com',
  ],
  credentials: true,
}));
```

然后重新构建：`docker-compose up -d --build backend`
