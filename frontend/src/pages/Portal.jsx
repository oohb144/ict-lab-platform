import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Share2, User, Activity, Database, BookOpen,
  ChevronRight, Lock, Terminal, ShieldAlert, FileText, Globe
} from 'lucide-react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700;900&display=swap');

  :root {
    --ark-cyan: #00e5ff;
    --ark-yellow: #fde047;
    --ark-dark: #111111;
    --ark-gray: #1a1a1a;
    --bg-light: #d1d5db;
  }

  .portal-root {
    font-family: 'Noto Sans SC', sans-serif;
    overflow: hidden;
  }

  .font-teko {
    font-family: 'Teko', sans-serif;
  }

  .bg-blueprint {
    background-color: #cbd5e1;
    background-image:
      linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    position: relative;
  }

  .blueprint-circle {
    position: absolute;
    border: 1px solid rgba(0,0,0,0.05);
    border-radius: 50%;
  }

  .btn-ark {
    position: relative;
    overflow: hidden;
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%);
  }
  .btn-ark::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    background-color: var(--ark-cyan);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .btn-ark:hover::after {
    opacity: 1;
  }

  .btn-ark-yellow {
    position: relative;
    overflow: hidden;
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%);
  }
  .btn-ark-yellow::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    background-color: var(--ark-yellow);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .btn-ark-yellow:hover::after {
    opacity: 1;
  }

  .ease-ark {
    transition-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }

  .bg-dots {
    background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 10px 10px;
  }

  .bg-stripes-cyan {
    background-image: repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0, 229, 255, 0.05) 10px, rgba(0, 229, 255, 0.05) 20px);
  }
  .bg-stripes-yellow {
    background-image: repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(253, 224, 71, 0.05) 10px, rgba(253, 224, 71, 0.05) 20px);
  }

  @keyframes terminalBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  .animate-cursor-blink {
    animation: terminalBlink 1s step-end infinite;
  }
`;

export default function Portal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(0);
  const [activeTab, setActiveTab] = useState('index');
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (loading < 100) {
      const timer = setTimeout(() => {
        setLoading(prev => {
          const jump = Math.floor(Math.random() * 15) + 5;
          return prev + jump > 100 ? 100 : prev + jump;
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleTabClick = (tab) => {
    if (tab === 'index') {
      setPanelOpen(false);
      setTimeout(() => setActiveTab(tab), 500);
    } else {
      setActiveTab(tab);
      setPanelOpen(true);
    }
  };

  const navItems = [
    { id: 'index', en: 'INDEX', zh: '首页' },
    { id: 'all', en: 'OVERVIEW', zh: '全部系统' },
    { id: 'lab', en: 'LABORATORY', zh: '实验室' },
    { id: 'blog', en: 'ARCHIVES', zh: '个人博客' },
  ];

  return (
    <div className="portal-root w-screen h-screen overflow-hidden relative text-black">
      <style>{styles}</style>

      {/* 1. Loading 屏幕 */}
      <div
        className={`fixed inset-0 bg-[#222222] z-50 flex flex-col items-center justify-center transition-opacity duration-1000 ${loading >= 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="text-white font-teko text-7xl font-bold tracking-[0.2em] flex flex-col items-center mb-20 relative">
          <span className="relative z-10">WORKSPACE</span>
          <div className="text-xs tracking-[0.5em] mt-2 text-gray-400 font-sans border-t border-gray-600 pt-1">
            - SYSTEM ONLINE -
          </div>
          <div className="absolute top-1/2 left-[-20%] right-[-20%] h-[1px] bg-white/20 -rotate-6"></div>
        </div>
        <div className="absolute bottom-16 left-16 right-16">
          <div className="h-[2px] bg-white/20 w-full mb-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-gray-300 transition-all duration-200 ease-out" style={{ width: `${loading}%` }}></div>
            <div className="absolute top-[-2px] left-0 w-[6px] h-[6px] bg-white rounded-full"></div>
            <div className="absolute top-[-2px] right-0 w-[6px] h-[6px] bg-white rounded-full"></div>
          </div>
          <div className="flex justify-between text-gray-400 text-xs font-teko tracking-widest">
            <div className="flex items-center gap-2">
              <span>© ICT LAB</span>
              <span className="ml-10">» LOADING - {loading}% ......</span>
            </div>
            <span>WORKSPACE // {window.location.host}</span>
          </div>
        </div>
      </div>

      {/* 2. 底层主界面 */}
      <div className="absolute inset-0 bg-blueprint z-0">
        <div className="blueprint-circle w-[600px] h-[600px] top-[10%] left-[20%]"></div>
        <div className="blueprint-circle w-[400px] h-[400px] top-[20%] left-[25%] border-black/10"></div>
        <div className="absolute top-[30%] left-[40%] w-[200px] h-[1px] bg-black/20 transform -rotate-45"></div>
        <div className="absolute top-[50%] left-[30%] w-[1px] h-[300px] bg-black/20"></div>

        <div className="absolute top-32 left-16 font-teko text-[11px] leading-tight text-black/40 tracking-widest hidden md:block">
          <div>NODE_CONNECT: ESTABLISHED [0x00A1F]</div>
          <div>SERVER_PING: 12ms</div>
          <div>DATA_STREAM: ACTIVE <span className="inline-block w-1.5 h-1.5 bg-cyan-500 animate-cursor-blink ml-1"></span></div>
          <div className="mt-2 opacity-50">
            01001000 01100101 01101100 01101100 01101111<br/>
            0x4F 0x70 0x65 0x72 0x61 0x74 0x6F 0x72
          </div>
        </div>

        <div className="absolute top-32 right-32 text-right font-teko text-[12px] text-black/50 tracking-[0.2em] hidden lg:block">
          <div className="border-b border-black/20 pb-1 mb-1">ICT_LAB_SYSTEM // V1.0.0</div>
          <div>MEM_CAPACITY: 8192 TB / ALLOCATED: 2048 TB</div>
          <div>SECURITY_LEVEL: <span className="text-cyan-600 font-bold">OMEGA</span></div>
          <div className="mt-2 text-[9px] tracking-[0.4em] opacity-60">AUTHORIZED PERSONNEL ONLY</div>
        </div>

        <div className="absolute top-1/2 right-24 -translate-y-1/2 origin-right -rotate-90 text-[10px] font-bold tracking-[0.4em] text-black/20 hidden xl:block">
          WARNING: UNREGISTERED NEURAL LINK DETECTED. PROCEED WITH CAUTION.
        </div>

        <div className="absolute bottom-16 right-32 flex flex-col items-end opacity-30">
          <div className="flex gap-[2px] h-8 mb-1 items-end">
            <div className="w-1 bg-black h-full"></div>
            <div className="w-[2px] bg-black h-3/4"></div>
            <div className="w-1.5 bg-black h-full"></div>
            <div className="w-[1px] bg-black h-full"></div>
            <div className="w-2 bg-black h-4/5"></div>
            <div className="w-[1px] bg-black h-full"></div>
            <div className="w-1 bg-black h-3/4"></div>
            <div className="w-[3px] bg-black h-full"></div>
            <div className="w-[1px] bg-black h-full"></div>
          </div>
          <div className="font-teko text-[10px] tracking-widest">UID: 894-ALPHA-0X99</div>
        </div>

        <div className="absolute left-[-2%] bottom-[-5%] font-teko text-[35rem] font-bold text-black/[0.04] leading-none tracking-tighter select-none pointer-events-none flex">
          <span className="text-cyan-500/[0.08]">R</span>HO
        </div>

        <div className="absolute left-16 bottom-16 z-10">
          <div className="font-teko text-7xl font-bold text-black tracking-wider leading-none">
            WORKSPACE
          </div>
          <div className="text-xs font-bold text-black mt-2 tracking-widest flex items-center gap-4">
            <span>© ICT LAB</span>
            <span className="text-gray-500 uppercase">{window.location.hostname}</span>
          </div>
        </div>
      </div>

      {/* 3. 顶部导航栏 */}
      <header className="fixed top-0 w-full z-40 flex justify-between items-start px-16 pt-8 mix-blend-difference text-white">
        <div
          onClick={() => handleTabClick('index')}
          className="font-teko text-4xl font-bold tracking-widest cursor-pointer hover:text-cyan-400 transition-colors"
        >
          W<span className="text-xl">ORKSPACE</span>
        </div>

        <nav className="flex gap-12 ml-32">
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className="group cursor-pointer flex flex-col items-center"
            >
              <div className={`font-teko text-2xl font-bold tracking-widest transition-colors ${
                (activeTab === item.id && (item.id === 'index' || panelOpen)) ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'
              }`}>
                {item.en}
              </div>
              <div className="text-[10px] font-bold tracking-widest mt-[-4px] text-gray-400">
                {item.zh}
              </div>
              <div className={`h-[2px] bg-cyan-400 mt-2 transition-all duration-300 ${
                (activeTab === item.id && (item.id === 'index' || panelOpen)) ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></div>
            </div>
          ))}
        </nav>

        <div className="flex gap-6 items-center">
          <Share2 className="w-5 h-5 cursor-pointer hover:text-cyan-400 transition-colors" />
          <div className="w-[1px] h-4 bg-white/30"></div>
          <User
            className="w-5 h-5 cursor-pointer hover:text-cyan-400 transition-colors"
            onClick={() => navigate('/login')}
          />
        </div>
      </header>

      {/* 4. 右侧悬浮工具条 */}
      <div className="fixed right-0 top-1/4 z-30 flex flex-col gap-2 w-16 items-end group">
        <div
          onClick={() => navigate('/lab')}
          className="bg-black text-white p-3 font-teko text-center w-32 translate-x-16 transition-transform duration-300 group-hover:translate-x-0 cursor-pointer hover:bg-cyan-500"
        >
          <div className="text-2xl leading-none">LAB</div>
          <div className="text-[10px]">ENTER</div>
        </div>
        <div
          onClick={() => navigate('/blog')}
          className="bg-[#8cc63f] text-black p-3 font-teko text-center w-32 translate-x-16 transition-transform duration-300 delay-75 group-hover:translate-x-0 cursor-pointer hover:brightness-110"
        >
          <div className="text-xl leading-none">BLOG</div>
        </div>
        <div
          onClick={() => navigate('/login')}
          className="bg-black text-white p-3 font-teko text-center w-32 translate-x-16 transition-transform duration-300 delay-150 group-hover:translate-x-0 cursor-pointer hover:bg-cyan-500"
        >
          <div className="text-xl leading-none">LOGIN</div>
        </div>
      </div>

      {/* 5. 滑动抽屉面板 */}
      <div
        className={`fixed top-0 right-0 h-full w-[80vw] bg-[#0a0a0a] z-20 text-white shadow-[-20px_0_50px_rgba(0,0,0,0.5)] transform ease-ark duration-[800ms] flex overflow-hidden
          ${panelOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="w-16 h-full bg-black/50 border-r border-white/5 flex flex-col justify-end pb-16 items-center shrink-0">
          <div className="font-teko text-gray-600 -rotate-90 text-2xl tracking-[0.3em] whitespace-nowrap">
            {activeTab === 'all' ? 'SYSTEM OVERVIEW' : activeTab === 'lab' ? 'LABORATORY SYSTEM' : 'PERSONAL ARCHIVES'}
          </div>
        </div>

        <div className="flex-1 h-full relative bg-dots overflow-y-auto">
          <div className="absolute right-0 bottom-0 font-teko text-[15rem] font-bold text-white/[0.02] leading-none pointer-events-none">
            {activeTab === 'all' ? 'SYSTEM' : activeTab === 'lab' ? 'LAB' : 'BLOG'}
          </div>

          <div className="absolute top-12 right-12 text-right pointer-events-none">
            <div className={`font-teko text-6xl font-bold opacity-5 ${activeTab === 'blog' ? 'text-yellow-400' : 'text-cyan-400'}`}>
              CONFIDENTIAL
            </div>
            <div className="text-[10px] font-teko tracking-[0.3em] text-white/20 mt-[-10px]">
              RESTRICTED ACCESS AREA
            </div>
          </div>

          <div className="absolute bottom-20 left-12 font-teko text-[10px] text-white/10 tracking-[0.2em] pointer-events-none">
            [SYS_LOG] INITIALIZING DATA DECRYPTION...<br/>
            [SYS_LOG] BYPASSING FIREWALL PROT_09... SUCCESS<br/>
            [SYS_LOG] LOADING USER INTERFACE... COMPLETE
          </div>

          <div className="p-20 h-full flex flex-col relative z-10">

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-2">
                <div className={`w-8 h-8 flex items-center justify-center text-black ${activeTab === 'blog' ? 'bg-yellow-400' : 'bg-cyan-400'}`}>
                  {activeTab === 'all' ? <Globe size={20} /> : activeTab === 'lab' ? <Activity size={20} /> : <Terminal size={20} />}
                </div>
                <h2 className="font-teko text-5xl font-bold tracking-widest text-white uppercase">
                  {activeTab === 'all' ? 'System Overview' : activeTab === 'lab' ? 'Laboratory System' : 'Personal Archives'}
                </h2>
              </div>
              <p className="text-gray-400 text-sm pl-12 max-w-xl">
                {activeTab === 'all' && '全系统节点总览。请选择您要进入的工作空间。'}
                {activeTab === 'lab' && '访问核心实验室数据。管理器材借阅、共享资料、讨论区、教程笔记。权限级别：Lv.4'}
                {activeTab === 'blog' && '访问个人技术记录与知识库。包含技术笔记、项目复盘、以及生活随笔和备忘录。'}
              </p>
            </div>

            {/* OVERVIEW 面板 */}
            {activeTab === 'all' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-12 max-w-5xl">
                <div
                  onClick={() => navigate('/lab')}
                  className="btn-ark group block bg-[#151515] border border-gray-800 hover:border-cyan-400 transition-all duration-300 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-stripes-cyan opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-8 relative z-10">
                    <div className="flex justify-between items-start mb-16">
                      <div className="w-16 h-16 bg-gray-900 flex items-center justify-center border border-gray-700 group-hover:bg-cyan-400 group-hover:text-black transition-colors">
                        <Activity className="w-8 h-8" />
                      </div>
                      <span className="font-teko text-5xl text-gray-800 group-hover:text-cyan-400/20 font-bold">01</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2 tracking-widest group-hover:text-cyan-400">
                      实验室系统
                    </h3>
                    <div className="font-teko text-gray-500 text-lg mb-6 tracking-widest uppercase">Laboratory Management</div>
                    <div className="flex items-center gap-2 text-cyan-400 font-bold mt-8">
                      ENTER SYSTEM <ChevronRight className="transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/blog')}
                  className="btn-ark-yellow group block bg-[#151515] border border-gray-800 hover:border-yellow-400 transition-all duration-300 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-stripes-yellow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-8 relative z-10">
                    <div className="flex justify-between items-start mb-16">
                      <div className="w-16 h-16 bg-gray-900 flex items-center justify-center border border-gray-700 group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                        <Terminal className="w-8 h-8" />
                      </div>
                      <span className="font-teko text-5xl text-gray-800 group-hover:text-yellow-400/20 font-bold">02</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2 tracking-widest group-hover:text-yellow-400">
                      个人博客
                    </h3>
                    <div className="font-teko text-gray-500 text-lg mb-6 tracking-widest uppercase">Personal Archives</div>
                    <div className="flex items-center gap-2 text-yellow-400 font-bold mt-8">
                      ENTER ARCHIVES <ChevronRight className="transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 实验室详情面板 */}
            {activeTab === 'lab' && (
              <div className="grid grid-cols-2 gap-6 pl-12 max-w-4xl">
                <div
                  onClick={() => navigate('/lab')}
                  className="btn-ark bg-[#1a1a1a] border border-gray-800 p-6 cursor-pointer hover:border-cyan-400 group transition-colors"
                >
                  <div className="flex justify-between items-start mb-6">
                    <Database className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                    <span className="font-teko text-2xl text-gray-700 group-hover:text-cyan-400/30">01</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">数据中枢与归档</h3>
                  <p className="text-sm text-gray-500">器材借阅管理、共享资料库、实验室通知公告。</p>
                  <div className="mt-6 flex justify-end">
                    <ChevronRight className="text-cyan-400 opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>

                <div className="btn-ark bg-[#1a1a1a] border border-gray-800 p-6 cursor-pointer hover:border-red-400 group transition-colors relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20"></div>
                  <div className="flex justify-between items-start mb-6">
                    <ShieldAlert className="text-gray-500 group-hover:text-red-400 transition-colors" />
                    <span className="font-teko text-2xl text-gray-700 group-hover:text-red-400/30">02</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-red-400">管理员后台</h3>
                  <p className="text-sm text-gray-500">人员审核、器材库存、借阅审批。需要管理员权限。</p>
                  <div className="mt-6 flex justify-end text-red-400 text-xs font-bold items-center gap-1">
                    <Lock size={12} /> ADMIN ONLY
                  </div>
                </div>
              </div>
            )}

            {/* 博客详情面板 */}
            {activeTab === 'blog' && (
              <div className="flex flex-col gap-4 pl-12 max-w-4xl">
                <div
                  onClick={() => navigate('/blog')}
                  className="flex items-center group cursor-pointer border-b border-gray-800 pb-4 hover:border-yellow-400 transition-colors"
                >
                  <div className="bg-gray-800 text-[10px] px-2 py-1 font-bold tracking-widest text-gray-400 mr-6 w-24 text-center group-hover:bg-yellow-900 group-hover:text-yellow-400 transition-colors">
                    BLOG
                  </div>
                  <div className="text-gray-300 font-medium flex-1 group-hover:text-white transition-colors">
                    进入博客首页 →
                  </div>
                  <FileText className="text-gray-600 group-hover:text-yellow-400 transition-colors w-5 h-5" />
                </div>
                <div
                  onClick={() => navigate('/blog/about')}
                  className="flex items-center group cursor-pointer border-b border-gray-800 pb-4 hover:border-yellow-400 transition-colors"
                >
                  <div className="bg-gray-800 text-[10px] px-2 py-1 font-bold tracking-widest text-gray-400 mr-6 w-24 text-center group-hover:bg-yellow-900 group-hover:text-yellow-400 transition-colors">
                    ABOUT
                  </div>
                  <div className="text-gray-300 font-medium flex-1 group-hover:text-white transition-colors">关于我</div>
                  <FileText className="text-gray-600 group-hover:text-yellow-400 transition-colors w-5 h-5" />
                </div>
                <div
                  onClick={() => navigate('/blog/archive')}
                  className="flex items-center group cursor-pointer border-b border-gray-800 pb-4 hover:border-yellow-400 transition-colors"
                >
                  <div className="bg-gray-800 text-[10px] px-2 py-1 font-bold tracking-widest text-gray-400 mr-6 w-24 text-center group-hover:bg-yellow-900 group-hover:text-yellow-400 transition-colors">
                    ARCHIVE
                  </div>
                  <div className="text-gray-300 font-medium flex-1 group-hover:text-white transition-colors">文章归档</div>
                  <FileText className="text-gray-600 group-hover:text-yellow-400 transition-colors w-5 h-5" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
