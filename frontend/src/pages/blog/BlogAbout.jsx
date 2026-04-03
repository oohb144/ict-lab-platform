import Sidebar from '../../components/blog/Sidebar';

const skills = [
  { name: '人工智能 & 深度学习', icon: '🤖', desc: 'PyTorch · TensorFlow · 计算机视觉' },
  { name: '物联网 & 边缘计算', icon: '📡', desc: 'MQTT · Raspberry Pi · 嵌入式系统' },
  { name: '大数据分析', icon: '📊', desc: 'Spark · Hadoop · 数据可视化' },
  { name: '网络与信息安全', icon: '🔐', desc: '渗透测试 · 密码学 · 安全审计' },
  { name: 'Web 开发', icon: '🌐', desc: 'React · Node.js · 全栈开发' },
];

export default function BlogAbout() {
  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-4">

        {/* ── 个人介绍卡 ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
        >
          {/* 顶部横幅 */}
          <div
            className="h-28 w-full relative"
            style={{ background: 'linear-gradient(135deg,#1e1b4b,#4c1d95,#6d28d9)' }}
          >
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, #a78bfa 0%, transparent 50%), radial-gradient(circle at 80% 20%, #818cf8 0%, transparent 40%)',
              }}
            />
          </div>

          <div className="px-8 pb-8" style={{ marginTop: '-36px' }}>
            {/* 头像 */}
            <div
              className="w-18 h-18 w-16 h-16 rounded-2xl border-4 border-white flex items-center justify-center text-white text-2xl font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
              }}
            >
              👨‍💻
            </div>

            <h1 className="text-2xl font-bold mb-1" style={{ color: '#1e293b' }}>关于我</h1>
            <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>ICT Lab · 技术探索者</p>

            <div className="space-y-3 text-sm leading-relaxed" style={{ color: '#475569' }}>
              <p>
                你好！这里是 <span className="font-semibold text-indigo-600">ICT 实验室</span>的个人博客空间。
                我热衷于探索前沿技术，并在这里记录学习旅途中的点滴收获。
              </p>
              <p>
                这个博客记录着我在技术领域的成长历程——包括踩过的坑、解决的难题、以及那些让人眼前一亮的发现。
                希望这些文字能对你有所帮助。
              </p>
              <p style={{ color: '#94a3b8' }}>
                如有问题或建议，欢迎通过实验室平台与我联系。
              </p>
            </div>
          </div>
        </div>

        {/* ── 技术领域 ── */}
        <div
          className="rounded-2xl p-6"
          style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#1e293b' }}>
            <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom,#6366f1,#8b5cf6)' }} />
            技术领域
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skills.map(skill => (
              <div
                key={skill.name}
                className="flex items-start gap-3 p-4 rounded-xl transition-all hover:shadow-md"
                style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#c7d2fe';
                  e.currentTarget.style.background = '#faf5ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#f1f5f9';
                  e.currentTarget.style.background = '#f8fafc';
                }}
              >
                <span className="text-2xl">{skill.icon}</span>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#334155' }}>{skill.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{skill.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 联系方式 ── */}
        <div
          className="rounded-2xl p-6"
          style={{ background: 'linear-gradient(135deg,#ede9fe,#e0e7ff)', border: '1px solid #c7d2fe' }}
        >
          <h2 className="text-base font-bold mb-2" style={{ color: '#4338ca' }}>联系我</h2>
          <p className="text-sm" style={{ color: '#6366f1' }}>
            欢迎通过实验室平台发送消息，或者在文章下方留言交流。
          </p>
        </div>
      </div>

      {/* ── 侧边栏 ── */}
      <div className="w-64 shrink-0 hidden lg:block">
        <Sidebar />
      </div>
    </div>
  );
}
