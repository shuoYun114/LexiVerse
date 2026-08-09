import React, { useState, useEffect, useMemo } from 'react';
import { ActiveTab, BookCategory, Word, UserWordRecord, StudyStats, UserAccount } from './types';
import { Header } from './components/Header';
import { WordNebula3D } from './components/WordNebula3D';
import { FlashcardEngine } from './components/FlashcardEngine';
import { HeatmapDashboard } from './components/HeatmapDashboard';
import { CyberShooterGame } from './components/CyberShooterGame';
import { WordBookManager } from './components/WordBookManager';
import { AuthModal } from './components/AuthModal';
import { getUserWordRecords, getDailyActivities, getBadges, getStudyStats, getCurrentBookId, setCurrentBookId, loadDemoData } from './utils/storage';
import { getCurrentUser, setCurrentUser, saveUserSyncedData, fetchUserSyncedData } from './utils/auth';

// 动态导入 JSON 词库数据
import cet4Data from './data/cet4.json';
import cet6Data from './data/cet6.json';
import ieltsData from './data/ielts.json';
import devEnglishData from './data/dev_english.json';
import bnuCompulsory1Data from './data/bnu_compulsory1.json';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('nebula');
  const [currentBook, setCurrentBookState] = useState<BookCategory>('bnu_compulsory1');
  const [userRecords, setUserRecords] = useState<Record<string, UserWordRecord>>({});
  const [currentUser, setCurrentUserState] = useState<UserAccount | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [stats, setStats] = useState<StudyStats>({
    totalLearned: 0,
    totalMastered: 0,
    todayLearned: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalTimeMinutes: 0,
    accuracyRate: 100,
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 初始化加载与 4 秒双向无感自动轮询同步
  useEffect(() => {
    const savedBook = getCurrentBookId() as BookCategory;
    if (savedBook) setCurrentBookState(savedBook);
    const user = getCurrentUser();
    if (user) {
      setCurrentUserState(user);
      // 挂载时主动拉取远端数据
      fetchUserSyncedData(user.username).then(() => refreshState());
    } else {
      refreshState();
    }

    // 4 秒无感自动后台双向同步定时器
    const interval = setInterval(async () => {
      const activeUser = getCurrentUser();
      if (activeUser) {
        const hasNew = await fetchUserSyncedData(activeUser.username);
        if (hasNew) {
          const records = getUserWordRecords();
          setUserRecords(records);
          setStats(getStudyStats());
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const refreshState = () => {
    const records = getUserWordRecords();
    setUserRecords(records);
    setStats(getStudyStats());

    // 如果当前有登录用户，将最新打卡与复习记录同步保存到该用户专属数据区
    const user = getCurrentUser();
    if (user) {
      saveUserSyncedData(user.username, records, getDailyActivities(), getBadges());
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
    refreshState();
  };

  const handleAuthSuccess = async (user: UserAccount) => {
    setCurrentUserState(user);
    await fetchUserSyncedData(user.username);
    refreshState();
  };

  const handleLoadDemoData = () => {
    loadDemoData();
    refreshState();
  };

  const handleSetCurrentBook = (book: BookCategory) => {
    setCurrentBookState(book);
    setCurrentBookId(book);
  };

  // 获取当前所选词库的单词列表
  const currentWords: Word[] = useMemo(() => {
    switch (currentBook) {
      case 'bnu_compulsory1':
        return bnuCompulsory1Data as Word[];
      case 'cet6':
        return cet6Data as Word[];
      case 'ielts':
        return ieltsData as Word[];
      case 'dev_english':
        return devEnglishData as Word[];
      case 'cet4':
      default:
        return cet4Data as Word[];
    }
  }, [currentBook]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 顶部赛博控制与导航栏 */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentBook={currentBook}
        setCurrentBook={handleSetCurrentBook}
        stats={stats}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onLoadDemoData={handleLoadDemoData}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 主视图区域 */}
      <main style={{ flex: 1, position: 'relative', zIndex: 10 }}>
        {activeTab === 'nebula' && (
          <WordNebula3D
            words={currentWords}
            userRecords={userRecords}
            onSelectWord={(word) => console.log('Selected 3D word:', word)}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardEngine
            words={currentWords}
            userRecords={userRecords}
            onRecordUpdated={refreshState}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'heatmap' && (
          <HeatmapDashboard stats={stats} />
        )}

        {activeTab === 'game' && (
          <CyberShooterGame words={currentWords} soundEnabled={soundEnabled} />
        )}

        {activeTab === 'wordbook' && (
          <WordBookManager
            words={currentWords}
            userRecords={userRecords}
            currentBook={currentBook}
            onRefreshData={refreshState}
          />
        )}
      </main>

      {/* 账号登录/注册模态框 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
};

export default App;
