import { useEffect, useState, useRef } from "react";
import { Modal, Button, Tooltip, Avatar, message, Spin } from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  ToolOutlined,
  FolderOpenOutlined,
  CommentOutlined,
  ReadOutlined,
  CalendarOutlined,
  RobotOutlined,
  ApiOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
  getSiteContent,
  getTodayCheckins,
  doCheckIn,
  getActiveNotifications,
} from "../api/admin";
import { getEquipment } from "../api/equipment";
import { getResources } from "../api/resources";
import { getPosts } from "../api/posts";
import useAuthStore from "../store/useAuthStore";

/* ═══════════════════════════════════════════════════════════════════
   CSS — 参照 mobo.html 的风格系统
═══════════════════════════════════════════════════════════════════ */
const STYLES = `
/* ── 基础动画 ── */
@keyframes hm-shine   { to { background-position: 200% center; } }
@keyframes hm-pulse   { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.6)} }
@keyframes hm-glow    { 0%,100%{text-shadow:0 0 12px #38bdf8,0 0 24px #38bdf8} 50%{text-shadow:0 0 28px #8b5cf6,0 0 56px #8b5cf6} }
@keyframes hm-blob    { 0%{transform:translate(0,0) scale(1) rotate(0deg)} 100%{transform:translate(80px,40px) scale(1.4) rotate(180deg)} }
@keyframes hm-float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes hm-reveal  { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
@keyframes hm-scan    { 0%{background-position:0 0} 100%{background-position:0 100%} }
@keyframes hm-ring    { 0%{box-shadow:0 0 0 0 rgba(56,189,248,.6)} 70%{box-shadow:0 0 0 12px rgba(56,189,248,0)} 100%{box-shadow:0 0 0 0 rgba(56,189,248,0)} }
@keyframes hm-badge   { from{opacity:0;transform:scale(.6)} to{opacity:1;transform:scale(1)} }
@keyframes hm-border  { 0%,100%{border-color:rgba(14,165,233,.4)} 50%{border-color:rgba(139,92,246,.7)} }
@keyframes hm-rotate  { 100%{transform:rotate(1turn)} }

/* ── 毛玻璃面板 ── */
.hm-glass {
  background: linear-gradient(135deg,rgba(30,41,59,.72) 0%,rgba(15,23,42,.45) 100%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,.09);
  box-shadow: 0 8px 32px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.1);
  transition: transform .45s cubic-bezier(.175,.885,.32,1.275), box-shadow .45s ease, border-color .45s ease;
}
.hm-glass:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 18px 40px rgba(14,165,233,.22), inset 0 1px 0 rgba(255,255,255,.18);
  border-color: rgba(14,165,233,.5);
}

/* ── 3D倾斜卡片（JS控制transform，CSS只管box-shadow / border） ── */
.hm-tilt-card {
  background: linear-gradient(135deg,rgba(30,41,59,.72) 0%,rgba(15,23,42,.45) 100%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,.09);
  box-shadow: 0 8px 32px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.1);
  transition: box-shadow .45s ease, border-color .45s ease, transform .35s ease;
  will-change: transform;
}
.hm-tilt-card:hover {
  box-shadow: 0 20px 40px rgba(14,165,233,.25), inset 0 1px 0 rgba(255,255,255,.2);
  border-color: rgba(14,165,233,.5);
}

/* ── 按钮扫光 ── */
.hm-btn-shiny { position:relative; overflow:hidden; }
.hm-btn-shiny::after {
  content:''; position:absolute; top:0; left:-150%; width:50%; height:100%;
  background:linear-gradient(to right,transparent,rgba(255,255,255,.35),transparent);
  transform:skewX(-25deg); transition:all .6s ease;
}
.hm-btn-shiny:hover::after { left:200%; }

/* ── 渐变文字 + 流光 ── */
.hm-text-gradient {
  background: linear-gradient(to right,#38bdf8,#818cf8,#c084fc,#38bdf8);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: hm-shine 3s linear infinite;
}

/* ── 入场动画 ── */
.hm-reveal { animation: hm-reveal .8s cubic-bezier(.25,.46,.45,.94) both; }
.hm-reveal-1 { animation-delay:.1s; }
.hm-reveal-2 { animation-delay:.2s; }
.hm-reveal-3 { animation-delay:.3s; }
.hm-reveal-4 { animation-delay:.4s; }

/* ── 滚动揭示（IntersectionObserver 驱动） ── */
.hm-scroll-reveal {
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.hm-scroll-reveal.hm-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ── 卡片悬浮光晕 ── */
.hm-card-glow {
  position: relative;
  overflow: hidden;
}
.hm-card-glow::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%; width: 200%; height: 200%;
  background: conic-gradient(transparent, rgba(14, 165, 233, 0.15), transparent 30%);
  animation: hm-rotate 4s linear infinite;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}
.hm-card-glow:hover::before {
  opacity: 1;
}

.hm-stat-card:hover .hm-stat-num { text-shadow: 0 0 18px currentColor; }
`;

/* ═══════════════════════════════════════════════════════════════════
   计数器动画组件
═══════════════════════════════════════════════════════════════════ */
function Counter({ to, color }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!to) { setV(0); return; }
    const steps = 36, dur = 1000;
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + to / steps, to);
      setV(Math.round(cur));
      if (cur >= to) clearInterval(t);
    }, dur / steps);
    return () => clearInterval(t);
  }, [to]);
  return <span className="hm-stat-num" style={{ color }}>{v}</span>;
}

/* ═══════════════════════════════════════════════════════════════════
   粒子画布 — 保持原有实现
═══════════════════════════════════════════════════════════════════ */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf, particles = [];
    const mouse = { x: null, y: null, r: 140 };

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    class P {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.r = Math.random() * 1.8 + 0.4;
      }
      update() {
        if (mouse.x !== null) {
          const dx = this.x - mouse.x, dy = this.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < mouse.r) {
            const f = (mouse.r - d) / mouse.r;
            this.x += (dx / d) * f * 2.5;
            this.y += (dy / d) * f * 2.5;
          }
        }
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56,189,248,.75)";
        ctx.fill();
      }
    }

    const n = Math.min(90, Math.floor((canvas.width * canvas.height) / 12000));
    for (let i = 0; i < n; i++) particles.push(new P());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) { p.update(); p.draw(); }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56,189,248,${0.18 * (1 - d / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onMove = (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const onLeave = () => { mouse.x = null; mouse.y = null; };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas ref={ref} style={{
      position: "fixed", inset: 0,
      width: "100vw", height: "100vh",
      zIndex: 0, pointerEvents: "none",
    }} />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   背景流光球
═══════════════════════════════════════════════════════════════════ */
function Blob({ color, size, top, left, right, bottom, delay = 0 }) {
  return (
    <div style={{
      position: "absolute", width: size, height: size, borderRadius: "50%",
      background: color, filter: "blur(80px)", opacity: 0.28,
      top, left, right, bottom,
      animation: `hm-blob 9s infinite alternate cubic-bezier(.4,0,.2,1)`,
      animationDelay: `${delay}s`, zIndex: 0, pointerEvents: "none",
    }} />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   主组件
═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const user = useAuthStore((s) => s.user);
  const [siteContent, setSiteContent] = useState(null);
  const [stats, setStats] = useState({ equipment: 0, resources: 0, posts: 0 });
  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState([]);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [notices, setNotices] = useState([]);
  const [noticeIdx, setNoticeIdx] = useState(0);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const shownRef = useRef(false);

  /* ── 数据加载 ─────────────────────────────────────────────── */
  useEffect(() => {
    Promise.all([
      getSiteContent().then((r) => setSiteContent(r.data)).catch(() => {}),
      getEquipment().then((r) => setStats((s) => ({ ...s, equipment: r.data.length }))).catch(() => {}),
      getResources().then((r) => setStats((s) => ({ ...s, resources: r.data.length }))).catch(() => {}),
      getPosts().then((r) => setStats((s) => ({ ...s, posts: r.data.length }))).catch(() => {}),
      getTodayCheckins().then((r) => { setCheckins(r.data.list || []); setCheckedIn(r.data.checkedIn || false); }).catch(() => {}),
      getActiveNotifications().then((r) => setNotices(r.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  /* ── 通知弹窗（每会话每条只弹一次） ────────────────────────── */
  useEffect(() => {
    if (!loading && notices.length > 0 && !shownRef.current) {
      const key = `hm_notice_${notices[0].id}`;
      if (!sessionStorage.getItem(key)) {
        setNoticeOpen(true);
        shownRef.current = true;
      }
    }
  }, [loading, notices]);

  /* ── 滚动揭示动画（IntersectionObserver） ──────────────────── */
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("hm-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".hm-scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const closeNotice = () => {
    if (notices[noticeIdx]) sessionStorage.setItem(`hm_notice_${notices[noticeIdx].id}`, "1");
    if (noticeIdx < notices.length - 1) { setNoticeIdx((i) => i + 1); }
    else { setNoticeOpen(false); setNoticeIdx(0); }
  };

  /* ── 打卡 ──────────────────────────────────────────────────── */
  const handleCheckIn = async () => {
    setCheckLoading(true);
    try {
      await doCheckIn();
      message.success("打卡成功！");
      const r = await getTodayCheckins();
      setCheckins(r.data.list || []);
      setCheckedIn(true);
    } catch (err) {
      message.error(err.response?.data?.message || "打卡失败");
    } finally { setCheckLoading(false); }
  };

  /* ── 3D 倾斜交互处理 ──────────────────────────────────────── */
  const handleTiltMove = (e) => {
    if (window.innerWidth < 768) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -8;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
  };
  const handleTiltLeave = (e) => {
    e.currentTarget.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  /* ── 日期 ──────────────────────────────────────────────────── */
  const dateStr = new Date().toLocaleDateString("zh-CN", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  if (loading) return (
    <div style={{ background: "#030712", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spin size="large" />
    </div>
  );

  /* ── 数据卡片 ──────────────────────────────────────────────── */
  const statCards = [
    { label: "器材种类", value: stats.equipment, icon: <ToolOutlined />, color: "#10b981", glow: "rgba(16,185,129,.35)" },
    { label: "共享资料", value: stats.resources, icon: <FolderOpenOutlined />, color: "#a78bfa", glow: "rgba(167,139,250,.35)" },
    { label: "讨论帖数", value: stats.posts, icon: <CommentOutlined />, color: "#fb923c", glow: "rgba(251,146,60,.35)" },
    { label: "教程笔记", value: 0, icon: <ReadOutlined />, color: "#38bdf8", glow: "rgba(56,189,248,.35)" },
  ];

  /* ── 4 研究方向卡片（参照 mobo.html） ─────────────────────── */
  const researchCards = [
    {
      icon: <RobotOutlined />,
      color: "#38bdf8",
      bgGlow: "rgba(56,189,248,.12)",
      gradientFrom: "from-sky-500",
      title: "人工智能与深度学习",
      desc: "研究先进的机器学习模型、计算机视觉与自然语言处理技术，赋予机器理解世界的能力。",
    },
    {
      icon: <ApiOutlined />,
      color: "#818cf8",
      bgGlow: "rgba(129,140,248,.12)",
      gradientFrom: "from-indigo-500",
      title: "物联网与边缘计算",
      desc: "构建万物互联的智能网络，研究传感器融合技术及低延迟、高可靠的边缘计算架构。",
    },
    {
      icon: <DatabaseOutlined />,
      color: "#c084fc",
      bgGlow: "rgba(192,132,252,.12)",
      gradientFrom: "from-purple-500",
      title: "大数据分析",
      desc: "从海量异构数据中挖掘有价值的信息，开发高效的数据存储、检索与可视化系统。",
    },
    {
      icon: <SafetyCertificateOutlined />,
      color: "#34d399",
      bgGlow: "rgba(52,211,153,.12)",
      gradientFrom: "from-emerald-500",
      title: "网络与信息安全",
      desc: "研究密码学应用、入侵检测与系统防护，为数字世界构筑坚不可摧的安全防线。",
    },
  ];

  return (
    <div style={{
      background: "#030712", minHeight: "100vh",
      position: "relative", overflowX: "hidden",
    }}>
      <style>{STYLES}</style>

      {/* 粒子背景 */}
      <ParticleCanvas />

      {/* 科技网格背景 */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",
        backgroundSize: "52px 52px",
        maskImage: "linear-gradient(to bottom,black 30%,transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom,black 30%,transparent 100%)",
      }} />

      {/* 扫描线 */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(to bottom,transparent 50%,rgba(56,189,248,.018) 50%)",
        backgroundSize: "100% 4px",
        animation: "hm-scan 10s linear infinite",
      }} />

      {/* ══════════════════════════════════════════════════════════════
         HERO — 全屏首屏
      ══════════════════════════════════════════════════════════════ */}
      <section style={{
        position: "relative", zIndex: 1,
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "80px 32px 60px", overflow: "hidden",
      }}>
        <Blob color="#0ea5e9" size="380px" top="60px" left="40px" delay={0} />
        <Blob color="#8b5cf6" size="440px" bottom="40px" right="60px" delay={-4} />
        <Blob color="#6366f1" size="300px" top="50%" left="50%" delay={-2} />

        <div style={{ textAlign: "center", maxWidth: 780, position: "relative", zIndex: 2 }}>
          {/* 标签 */}
          <div className="hm-reveal" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            marginBottom: 24, padding: "6px 18px", borderRadius: 999,
            border: "1px solid rgba(14,165,233,.35)", background: "rgba(14,165,233,.1)",
            color: "#7dd3fc", fontSize: 13, fontWeight: 600, letterSpacing: 2, cursor: "default",
            animation: "hm-reveal .6s both, hm-border 3s ease-in-out infinite",
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: "#10b981",
              animation: "hm-pulse 2s ease-in-out infinite", display: "inline-block",
            }} />
            探索 · 创新 · 突破
          </div>

          {/* 主标题 */}
          <h1 className="hm-reveal hm-reveal-1" style={{
            fontSize: "clamp(2.4rem, 6vw, 4.5rem)", fontWeight: 900,
            lineHeight: 1.15, color: "#f1f5f9", margin: "0 0 20px",
            animation: "hm-reveal .8s .1s both, hm-glow 4s 1s infinite alternate",
          }}>
            {siteContent?.introTitle || "信息与通信技术"}<br />
            <span className="hm-text-gradient">前沿实验室</span>
          </h1>

          {/* 副标题 */}
          <p className="hm-reveal hm-reveal-2" style={{
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)", color: "#94a3b8",
            fontWeight: 300, maxWidth: 600, margin: "0 auto 16px", lineHeight: 1.8,
          }}>
            {siteContent?.introSubtitle || "信息与通信工程学院 · 创新创业实践基地"}
          </p>

          {/* 日期 + 欢迎 */}
          <div className="hm-reveal hm-reveal-2" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, color: "#475569", fontSize: 13, marginBottom: 40,
          }}>
            <CalendarOutlined style={{ color: "#38bdf8" }} />
            {dateStr}
            <span style={{
              marginLeft: 8, padding: "2px 12px", borderRadius: 20,
              background: "rgba(56,189,248,.1)", color: "#38bdf8",
              border: "1px solid rgba(56,189,248,.25)", fontSize: 12, fontWeight: 600,
            }}>
              欢迎，{user?.name || "同学"}
            </span>
          </div>

          {/* CTA */}
          <div className="hm-reveal hm-reveal-3" style={{
            display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap",
          }}>
            <button className="hm-btn-shiny" onClick={() =>
              document.getElementById("hm-about")?.scrollIntoView({ behavior: "smooth" })
            } style={{
              padding: "14px 32px", borderRadius: 14,
              background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
              color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer",
              boxShadow: "0 0 20px rgba(14,165,233,.4)", transition: "all .3s",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 0 36px rgba(99,102,241,.6)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 0 20px rgba(14,165,233,.4)"; }}
            >
              探索更多 →
            </button>
            <button className="hm-glass hm-btn-shiny" onClick={() =>
              document.getElementById("hm-checkin")?.scrollIntoView({ behavior: "smooth" })
            } style={{
              padding: "14px 32px", borderRadius: 14, color: "#94a3b8",
              fontWeight: 700, fontSize: 15, border: "1px solid rgba(255,255,255,.12)",
              cursor: "pointer", background: "transparent",
              display: "inline-flex", alignItems: "center", gap: 8, transition: "all .3s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
            >
              <ClockCircleOutlined style={{ color: "#10b981" }} /> 今日打卡
            </button>
          </div>
        </div>

        {/* 滚动提示 */}
        <div style={{
          position: "absolute", bottom: 28, left: "50%",
          transform: "translateX(-50%)", color: "#475569", fontSize: 20,
          animation: "hm-float 2s ease-in-out infinite",
        }}>↓</div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         统计数据
      ══════════════════════════════════════════════════════════════ */}
      <section id="hm-stats" className="hm-scroll-reveal"
        style={{ position: "relative", zIndex: 1, padding: "20px 48px 40px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{
              display: "inline-block", width: 64, height: 3, borderRadius: 2,
              background: "linear-gradient(to right,#0ea5e9,#8b5cf6)", marginBottom: 14,
            }} />
            <h2 style={{ color: "#f1f5f9", fontSize: "1.9rem", fontWeight: 800, margin: 0 }}>
              实验室<span className="hm-text-gradient"> 数据总览</span>
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
          }}>
            {statCards.map((sc) => (
              <div key={sc.label} className="hm-glass hm-stat-card"
                style={{
                  borderRadius: 16, padding: "26px 22px",
                  position: "relative", overflow: "hidden", textAlign: "center",
                }}
              >
                <div style={{
                  position: "absolute", right: -6, top: -4, fontSize: 72,
                  color: sc.color, opacity: 0.05, pointerEvents: "none",
                }}>{sc.icon}</div>
                <div style={{ fontSize: 28, color: sc.color, marginBottom: 12 }}>{sc.icon}</div>
                <div style={{
                  fontSize: 42, fontWeight: 900, lineHeight: 1, marginBottom: 8,
                  filter: `drop-shadow(0 0 10px ${sc.glow})`,
                }}>
                  <Counter to={sc.value} color={sc.color} />
                </div>
                <div style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>{sc.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         关于 ICT 实验室 — 4 张研究方向卡片（参照 mobo.html）
      ══════════════════════════════════════════════════════════════ */}
      <section id="hm-about" className="hm-scroll-reveal"
        style={{ position: "relative", zIndex: 1, padding: "20px 48px 48px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* 标题区 */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{
              display: "inline-block", width: 64, height: 3, borderRadius: 2,
              background: "linear-gradient(to right,#6366f1,#c084fc)", marginBottom: 14,
            }} />
            <h2 style={{ color: "#f1f5f9", fontSize: "1.9rem", fontWeight: 800, margin: "0 0 12px" }}>
              什么是 <span className="hm-text-gradient">ICT 实验室</span>？
            </h2>
            <p style={{
              color: "#64748b", maxWidth: 700, margin: "0 auto", fontSize: 14, lineHeight: 1.85,
            }}>
              {siteContent?.introBox1 ||
                "ICT（信息与通信技术）实验室是一个集科研、教学、产学研合作为一体的创新平台。我们不仅关注底层硬件与网络协议，更致力于应用层的智能算法与数据分析。"}
            </p>
          </div>

          {/* 4 卡片网格 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            marginTop: 32,
          }}>
            {researchCards.map((card, idx) => (
              <div
                key={card.title}
                className="hm-tilt-card hm-card-glow hm-scroll-reveal"
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
                style={{
                  borderRadius: 18, padding: "28px 24px",
                  position: "relative", overflow: "hidden",
                  cursor: "default",
                  transitionDelay: `${idx * 0.1}s`,
                }}
              >
                {/* 角落光晕 */}
                <div style={{
                  position: "absolute", top: -12, right: -12,
                  width: 120, height: 120, borderRadius: "50%",
                  background: card.bgGlow, filter: "blur(24px)",
                  pointerEvents: "none", transition: "all .5s",
                }} />

                {/* 悬浮渐变边框 */}
                <div style={{
                  position: "absolute", inset: -1, borderRadius: 18,
                  background: `linear-gradient(135deg, ${card.color}, transparent)`,
                  opacity: 0, transition: "opacity .5s",
                  filter: "blur(4px)", pointerEvents: "none",
                }}
                  className="hm-glow-border"
                />

                {/* 图标 */}
                <div style={{
                  fontSize: 42, color: card.color, marginBottom: 18,
                  filter: `drop-shadow(0 0 15px ${card.bgGlow})`,
                  transition: "transform .5s",
                }}>
                  {card.icon}
                </div>

                {/* 标题 */}
                <h3 style={{
                  color: "#e2e8f0", fontWeight: 700, fontSize: 17,
                  marginBottom: 10, position: "relative", zIndex: 1,
                }}>
                  {card.title}
                </h3>

                {/* 描述 */}
                <p style={{
                  color: "#64748b", fontSize: 13.5, lineHeight: 1.85,
                  margin: 0, position: "relative", zIndex: 1,
                }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         核心赛事 + 今日打卡
      ══════════════════════════════════════════════════════════════ */}
      <section className="hm-scroll-reveal"
        style={{ position: "relative", zIndex: 1, padding: "0 48px 48px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}>
            {/* ── 核心赛事卡片 ── */}
            <div className="hm-glass" style={{
              borderRadius: 18, padding: "28px 24px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -12, right: -12,
                width: 100, height: 100, borderRadius: "50%",
                background: "rgba(139,92,246,.18)", filter: "blur(24px)", pointerEvents: "none",
              }} />
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "rgba(139,92,246,.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, color: "#a78bfa", marginBottom: 16,
                boxShadow: "0 0 16px rgba(139,92,246,.25)",
              }}>
                <TrophyOutlined />
              </div>
              <h3 style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 17, marginBottom: 10 }}>
                核心赛事
              </h3>
              <p style={{ color: "#64748b", fontSize: 13.5, lineHeight: 1.85, margin: "0 0 16px" }}>
                {siteContent?.introBox2 || "全国大学生嵌入式设计大赛、光电设计竞赛、大唐杯。"}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["嵌入式大赛", "光电竞赛", "大唐杯"].map((t) => (
                  <span key={t} style={{
                    padding: "3px 10px", borderRadius: 5, fontSize: 11, fontWeight: 600,
                    color: "#a78bfa", background: "rgba(139,92,246,.1)",
                    border: "1px solid rgba(139,92,246,.25)",
                  }}>{t}</span>
                ))}
              </div>
            </div>

            {/* ── 今日打卡卡片 ── */}
            <div id="hm-checkin" className="hm-glass" style={{
              borderRadius: 18, padding: "28px 24px",
              display: "flex", flexDirection: "column",
              border: checkedIn
                ? "1px solid rgba(16,185,129,.45)"
                : "1px solid rgba(255,255,255,.09)",
            }}>
              {/* 头部 */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: "rgba(16,185,129,.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, color: "#10b981",
                    boxShadow: "0 0 16px rgba(16,185,129,.25)",
                  }}>
                    <ClockCircleOutlined />
                  </div>
                  <div>
                    <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 16 }}>今日打卡</div>
                    <div style={{ color: "#475569", fontSize: 12 }}>{dateStr.split("星期")[0]}</div>
                  </div>
                </div>
                <span style={{
                  padding: "4px 12px", borderRadius: 20,
                  background: "rgba(16,185,129,.12)", color: "#10b981",
                  border: "1px solid rgba(16,185,129,.3)", fontSize: 13, fontWeight: 700,
                }}>
                  {checkins.length} 人
                </span>
              </div>

              {/* 头像列表 */}
              <div style={{ flex: 1, marginBottom: 18, minHeight: 40 }}>
                {checkins.length === 0 ? (
                  <p style={{ color: "#334155", fontSize: 13, textAlign: "center", margin: "8px 0" }}>
                    今天还没有人打卡，来第一个吧
                  </p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {checkins.slice(0, 12).map((c, i) => (
                      <Tooltip key={c.id} title={c.user?.name}>
                        <Avatar size={32} style={{
                          background: `hsl(${(i * 43) % 360},55%,42%)`,
                          fontSize: 12, fontWeight: 700, cursor: "default",
                          animation: "hm-badge .3s ease both",
                          animationDelay: `${i * 0.04}s`,
                          boxShadow: `0 0 8px hsl(${(i * 43) % 360},55%,42%)`,
                        }}>
                          {c.user?.name?.[0] ?? "?"}
                        </Avatar>
                      </Tooltip>
                    ))}
                    {checkins.length > 12 && (
                      <Avatar size={32} style={{ background: "#1e293b", color: "#64748b", fontSize: 11 }}>
                        +{checkins.length - 12}
                      </Avatar>
                    )}
                  </div>
                )}
              </div>

              {/* 打卡按钮 */}
              <button
                disabled={checkedIn || checkLoading}
                onClick={handleCheckIn}
                className="hm-btn-shiny"
                style={{
                  width: "100%", height: 44, borderRadius: 10,
                  fontWeight: 700, fontSize: 14, border: "none",
                  cursor: checkedIn ? "default" : "pointer",
                  background: checkedIn ? "rgba(16,185,129,.15)" : "linear-gradient(135deg,#059669,#10b981)",
                  color: checkedIn ? "#10b981" : "#fff",
                  boxShadow: checkedIn ? "none" : "0 0 0 0 rgba(16,185,129,.5)",
                  animation: checkedIn ? "none" : "hm-ring 2s ease-in-out infinite",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 8, transition: "all .3s", opacity: checkLoading ? 0.7 : 1,
                }}
              >
                {checkLoading ? <Spin size="small" /> : checkedIn ? (
                  <><CheckCircleOutlined /> 今日已打卡</>
                ) : (
                  <><ThunderboltOutlined /> 今日打卡</>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         入驻须知
      ══════════════════════════════════════════════════════════════ */}
      {siteContent?.introRules && (
        <section className="hm-scroll-reveal"
          style={{ position: "relative", zIndex: 1, padding: "0 48px 60px" }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="hm-glass" style={{
              borderRadius: 18, padding: "28px 28px",
              borderLeft: "4px solid #2563eb",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "rgba(37,99,235,.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <BellOutlined style={{ color: "#60a5fa", fontSize: 16 }} />
                </div>
                <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 16 }}>入驻须知</span>
              </div>
              <pre style={{
                whiteSpace: "pre-wrap", color: "#64748b", fontSize: 13.5,
                lineHeight: 1.9, margin: 0, fontFamily: "inherit",
              }}>
                {siteContent.introRules}
              </pre>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
         页脚
      ══════════════════════════════════════════════════════════════ */}
      <footer style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,.06)",
        background: "rgba(0,0,0,.3)", backdropFilter: "blur(12px)",
        padding: "28px 48px", textAlign: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <ExperimentOutlined style={{ color: "#38bdf8", fontSize: 18 }} />
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: 2, color: "#94a3b8" }}>
            ICT<span style={{ color: "#38bdf8" }}>Lab</span>
          </span>
        </div>
        <p style={{ color: "#334155", fontSize: 12, margin: 0 }}>
          &copy; {new Date().getFullYear()} 信息与通信技术实验室 · 构建于前沿网络技术之上
        </p>
      </footer>

      {/* ══════════════════════════════════════════════════════════════
         通知弹窗
      ══════════════════════════════════════════════════════════════ */}
      <Modal
        open={noticeOpen} onCancel={closeNotice}
        footer={null} centered closable={false} width={500}
        styles={{
          content: {
            background: "#0d1117", border: "1px solid rgba(56,189,248,.28)",
            borderRadius: 18, padding: 0,
            boxShadow: "0 0 60px rgba(14,165,233,.15)",
          },
          mask: { backdropFilter: "blur(6px)", background: "rgba(0,0,0,.7)" },
        }}
      >
        {notices[noticeIdx] && (
          <div style={{ padding: "28px 28px 22px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 18,
              paddingBottom: 16, borderBottom: "1px solid rgba(56,189,248,.1)",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "rgba(56,189,248,.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 18px rgba(56,189,248,.25)",
              }}>
                <BellOutlined style={{ color: "#38bdf8", fontSize: 18 }} />
              </div>
              <div>
                <div style={{
                  color: "#38bdf8", fontSize: 10, letterSpacing: 2.5,
                  textTransform: "uppercase", fontFamily: "monospace",
                }}>
                  ICT Lab · Notification
                  {notices.length > 1 ? ` ${noticeIdx + 1}/${notices.length}` : ""}
                </div>
                <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 17, marginTop: 3 }}>
                  {notices[noticeIdx].title}
                </div>
              </div>
            </div>
            <p style={{
              color: "#94a3b8", fontSize: 14, lineHeight: 1.9,
              margin: "0 0 22px", whiteSpace: "pre-wrap",
            }}>
              {notices[noticeIdx].content}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={closeNotice} className="hm-btn-shiny" style={{
                background: "linear-gradient(135deg,#2563eb,#0ea5e9)",
                border: "none", color: "#fff", fontWeight: 700,
                borderRadius: 10, height: 38, padding: "0 28px",
                boxShadow: "0 0 16px rgba(14,165,233,.35)",
              }}>
                {noticeIdx < notices.length - 1 ? "下一条 →" : "我知道了"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
