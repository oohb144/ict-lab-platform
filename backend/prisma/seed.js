import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 创建管理员账号
  const adminPassword = await bcrypt.hash('000144', 10);
  await prisma.user.upsert({
    where: { studentId: 'mstxdict' },
    update: {},
    create: {
      studentId: 'mstxdict',
      name: '系统管理员',
      password: adminPassword,
      college: '信息与通信工程学院',
      grade: '',
      phone: '',
      role: 'admin',
      status: 'approved',
    },
  });

  // 示例用户
  const pw = await bcrypt.hash('123456', 10);
  const user1 = await prisma.user.upsert({
    where: { studentId: '2401010101' },
    update: {},
    create: {
      studentId: '2401010101',
      name: '张小明',
      password: pw,
      college: '信息与通信工程学院',
      grade: '大三',
      phone: '138xxxx1234',
      role: 'student',
      status: 'approved',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { studentId: '2402030405' },
    update: {},
    create: {
      studentId: '2402030405',
      name: '李华',
      password: pw,
      college: '计算机科学与技术学院',
      grade: '大二',
      phone: '139xxxx5678',
      role: 'student',
      status: 'pending',
    },
  });

  // 示例器材
  const eqData = [
    { name: '正点原子精英STM32F103ZET6套件', category: 'stm32', total: 5, available: 3 },
    { name: '亚博智能k210', category: '视觉开发板', total: 2, available: 0 },
    { name: 'ESP32-S3-N16R8', category: '物联网', total: 4, available: 4 },
    { name: 'Jetson Nano 开发套件', category: 'AI开发板', total: 2, available: 2 },
    { name: '示波器 DS1054Z', category: '仪器仪表', total: 3, available: 2 },
  ];
  for (const eq of eqData) {
    await prisma.equipment.create({ data: eq });
  }

  // 示例帖子
  const post = await prisma.post.create({
    data: {
      authorId: user1.id,
      title: '嵌入式大赛组队',
      content: '目前队伍已有硬件设计和底层驱动开发，急需一名熟悉Linux开发和机器视觉（OpenCV/YOLO）的同学加入，有意向请在下面回复！',
    },
  });
  await prisma.reply.create({
    data: {
      postId: post.id,
      authorId: user2.id,
      content: '我对机器视觉比较感兴趣，可以聊聊吗？',
    },
  });

  // 示例资料
  const resData = [
    { name: '大唐杯备赛笔记整理', type: 'pdf', description: '包含5G技术基础原理及历年真题解析。', uploaderId: user1.id },
    { name: 'STM32 电机底层库', type: 'code', description: '封装好的驱动库，含PID算法。', uploaderId: user1.id },
    { name: 'YOLO目标检测入门教程', type: 'video', description: '从零开始学习YOLOv5/v8目标检测。', uploaderId: user2.id },
  ];
  for (const r of resData) {
    await prisma.resource.create({ data: r });
  }

  // 站点内容（单行）
  await prisma.siteContent.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      introTitle: '欢迎来到 ICT 实验室',
      introSubtitle: '信息与通信工程学院创新创业实践基地',
      introBox1: '嵌入式系统开发、机器视觉（OpenCV/YOLO）、5G无线通信技术、物联网应用开发。',
      introBox2: '全国大学生嵌入式设计大赛、全国大学生光电设计竞赛、\u201c大唐杯\u201d全国大学生新一代信息通信技术大赛。',
      introRules: '1. 请先在平台完成实名认证，待管理员审核通过后方可借用器材。\n2. 遵守实验室卫生及安全管理规定，离开工位请断电。\n3. 公共器材借用需在\u201c器材借阅大厅\u201d发起申请，归还时需经管理员确认。\n4. 共享资料仅供内部学习使用，请勿外传。\n5. 讨论区请文明发言，禁止发布无关内容。',
    },
  });

  console.log('Seed 完成');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
