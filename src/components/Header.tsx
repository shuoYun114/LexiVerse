import React from 'react';
import { ActiveTab, BookCategory, StudyStats, UserAccount, CustomWordBook } from '../types';
import { isDemoEnv, fetchUserSyncedData } from '../utils/auth';
import { Sparkles, Flame, Layers, Brain, LayoutDashboard, Gamepad2, BookOpen, Volume2, VolumeX, User, LogOut, ShieldCheck, RefreshCw, PlusCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentBook: BookCategory;
  setCurrentBook: (book: BookCategory) => void;
  customBooks: CustomWordBook[];
  onOpenCustomBookModal: () => void;
  stats: StudyStats;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentBook,
  setCurrentBook,
  customBooks,
  onOpenCustomBookModal,
  stats,
  soundEnabled,
  setSoundEnabled,
  currentUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const isDemo = isDemoEnv();

  return (
    <header className="glass-panel header-container" style={{ margin: '16px 24px', padding: '12px 24px', position: 'relative', zIndex: 50 }}>
      <div className="header-content-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Logo 标志与 Demo 徽章 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.6)',
              flexShrink: 0,
            }}
          >
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="text-gradient" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                LexiVerse
              </h1>
              {isDemo ? (
                <span style={{ fontSize: '0.7rem', background: 'rgba(236, 72, 153, 0.2)', border: '1px solid #ec4899', color: '#f472b6', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  🚀 Demo 版
                </span>
              ) : (
                <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldCheck size={10} /> 本地/局域网多端同步
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>
              3D Cyber Nebula & Ebbinghaus
            </span>
          </div>
        </div>

        {/* 词库选择器与控制挂件组 */}
        <div className="header-mid-group" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          
          {/* 词库选择器 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(31, 41, 61, 0.6)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <Layers size={15} color="var(--color-accent)" style={{ flexShrink: 0 }} />
            <select
              value={currentBook}
              onChange={(e) => setCurrentBook(e.target.value as BookCategory)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-main)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <optgroup label="🎓 国内高中英语教材" style={{ background: '#111827', color: '#818cf8' }}>
                <option value="bnu_compulsory1" style={{ background: '#111827' }}>🎓 北师大版 高中英语必修一</option>
                <option value="pep_senior_compulsory1" style={{ background: '#111827' }}>📘 人教版 高中英语必修一</option>
                <option value="pep_senior_compulsory2" style={{ background: '#111827' }}>📘 人教版 高中英语必修二</option>
                <option value="fltrp_senior_compulsory1" style={{ background: '#111827' }}>📗 外研版 高中英语必修一</option>
              </optgroup>

              <optgroup label="🏫 国内初中英语教材" style={{ background: '#111827', color: '#34d399' }}>
                <option value="bnu_junior_7a" style={{ background: '#111827' }}>🏫 北师大版 初中英语七年级上册</option>
                <option value="bnu_junior_8a" style={{ background: '#111827' }}>🏫 北师大版 初中英语八年级上册</option>
                <option value="bnu_junior_9" style={{ background: '#111827' }}>🏫 北师大版 初中英语九年级全一册</option>
                <option value="pep_junior_7a" style={{ background: '#111827' }}>🏫 人教版 初中英语七年级上册</option>
                <option value="pep_junior_8a" style={{ background: '#111827' }}>🏫 人教版 初中英语八年级上册</option>
                <option value="pep_junior_9" style={{ background: '#111827' }}>🏫 人教版 初中英语九年级全一册</option>
              </optgroup>

              <optgroup label="🎯 全国中考 / 高考 / 考研英语冲刺" style={{ background: '#111827', color: '#ec4899' }}>
                <option value="zhongkao_core" style={{ background: '#111827' }}>📝 全国中考核心高频词汇</option>
                <option value="gaokao_core" style={{ background: '#111827' }}>🎯 全国高考核心冲刺词汇</option>
                <option value="kaoyan_core" style={{ background: '#111827' }}>🎓 考研英语一/二 核心词库</option>
              </optgroup>

              <optgroup label="🌐 权威等级/多语种/专业词库" style={{ background: '#111827', color: '#fbbf24' }}>
                <option value="spanish_beginner" style={{ background: '#111827' }}>🇪🇸 西班牙语入门 (Spanish Beginner)</option>
                <option value="cet4" style={{ background: '#111827' }}>CET-4 大学英语四级核心</option>
                <option value="cet6" style={{ background: '#111827' }}>CET-6 大学英语六级核心</option>
                <option value="ielts" style={{ background: '#111827' }}>IELTS 雅思高频词汇</option>
                <option value="dev_english" style={{ background: '#111827' }}>💻 程序员英文专业词库</option>
              </optgroup>

              {customBooks.length > 0 && (
                <optgroup label="📚 自建与导入词库" style={{ background: '#111827', color: '#38bdf8' }}>
                  {customBooks.map((b) => (
                    <option key={b.id} value={b.id} style={{ background: '#111827' }}>
                      {b.icon || '📚'} {b.name} ({b.words.length} 词)
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* ➕ 自建/导入词库按钮 */}
          <button
            onClick={onOpenCustomBookModal}
            className="cyber-button"
            style={{ padding: '6px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid #06b6d4', color: '#38bdf8' }}
            title="点击自建词库或导入外部 JSON 词库"
          >
            <PlusCircle size={14} /> 自建/导入词库
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* 连胜火花 Widget */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '6px 12px',
                borderRadius: '8px',
                color: '#fbbf24',
                fontWeight: 700,
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
              }}
              title={`当前连续打卡 ${stats.currentStreak} 天 (最高连胜 ${stats.longestStreak} 天)`}
            >
              <Flame size={16} className="streak-fire-icon" />
              <span>{stats.currentStreak} 天连胜</span>
            </div>

            {/* 云端多端同步手动刷新按钮 */}
            {currentUser && (
              <button
                onClick={async () => {
                  if (isDemoEnv()) {
                    let savedIp = localStorage.getItem('lexiverse_lan_ip');
                    if (!savedIp) {
                      savedIp = window.prompt('【GitHub Pages 跨端同步】\\n检测到您正使用在线演示版。若需与电脑同步，请输入运行 LexiVerse 的电脑局域网 IP (例如 192.168.1.100)：');
                      if (savedIp) {
                        localStorage.setItem('lexiverse_lan_ip', savedIp.trim());
                      } else {
                        return; // 取消
                      }
                    } else {
                      const changeIp = window.confirm(`【GitHub Pages 跨端同步】\\n当前绑定的电脑局域网 IP 为: ${savedIp}\\n是否需要修改？`);
                      if (changeIp) {
                        const newIp = window.prompt('请输入新的电脑局域网 IP：', savedIp);
                        if (newIp) {
                          localStorage.setItem('lexiverse_lan_ip', newIp.trim());
                        } else {
                          return;
                        }
                      }
                    }
                  }

                  const btn = document.getElementById('manual-sync-btn');
                  if (btn) btn.classList.add('spin-anim');

                  try {
                    // 动态获取工具方法避免循环依赖或其他导入问题
                    const { saveUserSyncedData } = await import('../utils/auth');
                    const { getUserWordRecords, getDailyActivities, getBadges } = await import('../utils/storage');
                    
                    // 先推送本地最新进度到局域网服务端
                    await saveUserSyncedData(currentUser.username, getUserWordRecords(), getDailyActivities(), getBadges());
                    
                    // 然后再拉取合并服务端的最新进度
                    const success = await fetchUserSyncedData(currentUser.username);
                    
                    setTimeout(() => {
                      if (btn) btn.classList.remove('spin-anim');
                      if (success) {
                        alert(`🎉 [${currentUser.username}] 数据已成功双向同步！`);
                      } else {
                        alert(`⚠️ 同步失败！请确保局域网服务端 (3001端口) 已启动，或检查 IP 地址是否正确。`);
                      }
                    }, 600);
                  } catch (e) {
                    if (btn) btn.classList.remove('spin-anim');
                    alert(`⚠️ 同步发生异常，请检查网络连接！`);
                  }
                }}
                className="cyber-button"
                style={{ padding: '6px 10px', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399' }}
                title="点此立即强制双向同步打卡与连胜进度"
              >
                <RefreshCw id="manual-sync-btn" size={14} /> 双向数据同步
              </button>
            )}

            {/* 账号挂件 */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.15)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--color-primary)' }}>
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} color="var(--color-accent)" /> {currentUser.username}
                </span>
                <button
                  onClick={onLogout}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="退出登录"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="cyber-button"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <User size={14} /> 登录/注册
              </button>
            )}

            {/* 发音开关 */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="cyber-button"
              style={{ padding: '8px 12px' }}
              title={soundEnabled ? '发音音效: 开启' : '发音音效: 静音'}
            >
              {soundEnabled ? <Volume2 size={16} color="var(--color-accent)" /> : <VolumeX size={16} color="var(--text-muted)" />}
            </button>
          </div>

        </div>

        {/* 视图 Tab 切换导航 (电脑端精致排列，手机端横向滑动) */}
        <nav className="nav-tabs-wrapper" style={{ display: 'flex', gap: '6px', background: 'rgba(17, 24, 39, 0.8)', padding: '4px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <button
            onClick={() => setActiveTab('nebula')}
            className={`cyber-button ${activeTab === 'nebula' ? 'cyber-button-primary' : ''}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Sparkles size={15} /> 3D星云
          </button>
          
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`cyber-button ${activeTab === 'flashcards' ? 'cyber-button-primary' : ''}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Brain size={15} /> 艾宾浩斯背词
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`cyber-button ${activeTab === 'heatmap' ? 'cyber-button-primary' : ''}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <LayoutDashboard size={15} /> 打卡看板
          </button>

          <button
            onClick={() => setActiveTab('game')}
            className={`cyber-button ${activeTab === 'game' ? 'cyber-button-primary' : ''}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Gamepad2 size={15} /> 打字速记
          </button>

          <button
            onClick={() => setActiveTab('wordbook')}
            className={`cyber-button ${activeTab === 'wordbook' ? 'cyber-button-primary' : ''}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <BookOpen size={15} /> 词库管理
          </button>
        </nav>

      </div>
    </header>
  );
};
