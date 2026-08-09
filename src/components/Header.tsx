import React from 'react';
import { ActiveTab, BookCategory, StudyStats, UserAccount } from '../types';
import { isDemoEnv } from '../utils/auth';
import { Sparkles, Flame, Layers, Brain, LayoutDashboard, Gamepad2, BookOpen, Volume2, VolumeX, User, LogOut, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentBook: BookCategory;
  setCurrentBook: (book: BookCategory) => void;
  stats: StudyStats;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onLoadDemoData: () => void;
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentBook,
  setCurrentBook,
  stats,
  soundEnabled,
  setSoundEnabled,
  onLoadDemoData,
  currentUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const isDemo = isDemoEnv();

  return (
    <header className="glass-panel" style={{ margin: '16px 24px', padding: '12px 24px', position: 'relative', zIndex: 50 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Logo 标志与 Demo 徽章 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.6)',
            }}
          >
            <Sparkles size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="text-gradient" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                LexiVerse
              </h1>
              {isDemo ? (
                <span style={{ fontSize: '0.7rem', background: 'rgba(236, 72, 153, 0.2)', border: '1px solid #ec4899', color: '#f472b6', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  🚀 Demo 体验版
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

        {/* 词库切换、Stats Indicator 与 账号 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* 词库选择器 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(31, 41, 61, 0.6)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <Layers size={16} color="var(--color-accent)" />
            <select
              value={currentBook}
              onChange={(e) => setCurrentBook(e.target.value as BookCategory)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-main)',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="bnu_compulsory1" style={{ background: '#111827' }}>🎓 北师大版 高中英语必修一</option>
              <option value="cet4" style={{ background: '#111827' }}>CET-4 四级核心</option>
              <option value="cet6" style={{ background: '#111827' }}>CET-6 六级词汇</option>
              <option value="ielts" style={{ background: '#111827' }}>IELTS 雅思高频</option>
              <option value="dev_english" style={{ background: '#111827' }}>💻 程序员英文词库</option>
            </select>
          </div>

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
              fontSize: '0.9rem',
            }}
            title={`当前连续打卡 ${stats.currentStreak} 天 (最高连胜 ${stats.longestStreak} 天)`}
          >
            <Flame size={18} className="streak-fire-icon" />
            <span>{stats.currentStreak} 天连胜</span>
          </div>

          {/* 顶栏一键充能按钮 */}
          <button
            onClick={onLoadDemoData}
            className="cyber-button cyber-button-primary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            title="点此一键充能打卡与星云记录"
          >
            ⚡ 一键充能打卡
          </button>

          {/* 账号挂件 */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.15)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--color-primary)' }}>
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
            {soundEnabled ? <Volume2 size={18} color="var(--color-accent)" /> : <VolumeX size={18} color="var(--text-muted)" />}
          </button>
        </div>

        {/* 视图 Tab 切换导航 */}
        <nav style={{ display: 'flex', gap: '8px', background: 'rgba(17, 24, 39, 0.8)', padding: '4px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <button
            onClick={() => setActiveTab('nebula')}
            className={`cyber-button ${activeTab === 'nebula' ? 'cyber-button-primary' : ''}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Sparkles size={16} />
            3D 星云
          </button>
          
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`cyber-button ${activeTab === 'flashcards' ? 'cyber-button-primary' : ''}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Brain size={16} />
            艾宾浩斯背词
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`cyber-button ${activeTab === 'heatmap' ? 'cyber-button-primary' : ''}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <LayoutDashboard size={16} />
            打卡看板 & 热力图
          </button>

          <button
            onClick={() => setActiveTab('game')}
            className={`cyber-button ${activeTab === 'game' ? 'cyber-button-primary' : ''}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Gamepad2 size={16} />
            打字速记
          </button>

          <button
            onClick={() => setActiveTab('wordbook')}
            className={`cyber-button ${activeTab === 'wordbook' ? 'cyber-button-primary' : ''}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <BookOpen size={16} />
            词库管理
          </button>
        </nav>

      </div>
    </header>
  );
};
