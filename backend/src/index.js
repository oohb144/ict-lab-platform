import express from "express";
import cors from "cors";
import config from "./config.js";
import authRoutes from "./routes/auth.js";
import equipmentRoutes from "./routes/equipment.js";
import borrowRoutes from "./routes/borrows.js";
import postRoutes from "./routes/posts.js";
import resourceRoutes from "./routes/resources.js";
import uploadRoutes from "./routes/upload.js";
import siteContentRoutes from "./routes/siteContent.js";
import adminRoutes from "./routes/admin.js";
import tutorialRoutes from "./routes/tutorials.js";
import checkinsRoutes from "./routes/checkins.js";
import notificationsRoutes from "./routes/notifications.js";

const app = express();

app.use(cors());
app.use(express.json());

// 健康检查
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// 路由挂载
app.use("/api/auth", authRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/borrows", borrowRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/site-content", siteContentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tutorials", tutorialRoutes);
app.use("/api/checkins", checkinsRoutes);
app.use("/api/notifications", notificationsRoutes);

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "服务器内部错误" });
});

app.listen(config.port, () => {
  console.log(`后端服务已启动: http://localhost:${config.port}`);
});
