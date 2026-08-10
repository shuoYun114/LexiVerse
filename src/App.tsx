import React, { useState, useEffect, useMemo } from 'react';
import { ActiveTab, BookCategory, Word, UserWordRecord, StudyStats, UserAccount, CustomWordBook } from './types';
import { Header } from './components/Header';
import { WordNebula3D } from './components/WordNebula3D';
import { FlashcardEngine } from './components/FlashcardEngine';
import { HeatmapDashboard } from './components/HeatmapDashboard';
import { CyberShooterGame } from './components/CyberShooterGame';
import { WordBookManager } from './components/WordBookManager';
import { AuthModal } from './components/AuthModal';
import { CustomBookModal } from './components/CustomBookModal';
import { getUserWordRecords, getDailyActivities, getBadges, getStudyStats, getCurrentBookId, setCurrentBookId } from './utils/storage';
import { getCurrentUser, setCurrentUser, saveUserSyncedData, fetchUserSyncedData } from './utils/auth';
import { getCustomWordBooks } from './utils/customBooks';

// 动态导入 JSON 词库数据
import cet4Data from './data/cet4.json';
import cet6Data from './data/cet6.json';
import ieltsData from './data/ielts.json';
import devEnglishData from './data/dev_english.json';
import bnuCompulsory1Data from './data/bnu_compulsory1.json';
import pepSenior1Data from './data/pep_senior_compulsory1.json';
import pepSenior2Data from './data/pep_senior_compulsory2.json';
import fltrpSenior1Data from './data/fltrp_senior_compulsory1.json';
import pepJunior7aData from './data/pep_junior_7a.json';
import pepJunior8aData from './data/pep_junior_8a.json';
import pepJunior9Data from './data/pep_junior_9.json';
import bnuJunior7aData from './data/bnu_junior_7a.json';
import bnuJunior8aData from './data/bnu_junior_8a.json';
import bnuJunior9Data from './data/bnu_junior_9.json';
import zhongkaoCoreData from './data/zhongkao_core.json';
import gaokaoCoreData from './data/gaokao_core.json';
import kaoyanCoreData from './data/kaoyan_core.json';
import spanishBeginnerData from './data/spanish_beginner.json';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('nebula');
  const [currentBook, setCurrentBookState] = useState<BookCategory>('bnu_compulsory1');
  const [customBooks, setCustomBooks] = useState<CustomWordBook[]>([]);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
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

  // 初始化加载自建词库与双向无感自动同步
  useEffect(() => {
    setCustomBooks(getCustomWordBooks());
    const savedBook = getCurrentBookId() as BookCategory;
    if (savedBook) setCurrentBookState(savedBook);

    const user = getCurrentUser();
    if (user) {
      setCurrentUserState(user);
      fetchUserSyncedData(user.username).then(() => refreshState());
    } else {
      refreshState();
    }

    const handleCustomSynced = () => {
      const records = getUserWordRecords();
      setUserRecords(records);
      setStats(getStudyStats());
    };

    const handleCustomBooksUpdated = () => {
      setCustomBooks(getCustomWordBooks());
    };

    window.addEventListener('lexiverse_data_synced', handleCustomSynced);
    window.addEventListener('lexiverse_custom_books_updated', handleCustomBooksUpdated);

    // 3 秒双向后台轮询引擎
    const interval = setInterval(async () => {
      const activeUser = getCurrentUser();
      if (activeUser) {
        await fetchUserSyncedData(activeUser.username);
      }
    }, 3000);

    return () => {
      window.removeEventListener('lexiverse_data_synced', handleCustomSynced);
      window.removeEventListener('lexiverse_custom_books_updated', handleCustomBooksUpdated);
      clearInterval(interval);
    };
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

  const handleSetCurrentBook = (book: BookCategory) => {
    setCurrentBookState(book);
    setCurrentBookId(book);
  };

  // 获取当前所选词库的单词列表
  const currentWords: Word[] = useMemo(() => {
    if (currentBook === 'spanish_beginner') return spanishBeginnerData as Word[];
    if (currentBook === 'bnu_compulsory1') return bnuCompulsory1Data as Word[];
    if (currentBook === 'pep_senior_compulsory1') return pepSenior1Data as Word[];
    if (currentBook === 'pep_senior_compulsory2') return pepSenior2Data as Word[];
    if (currentBook === 'fltrp_senior_compulsory1') return fltrpSenior1Data as Word[];
    if (currentBook === 'pep_junior_7a') return pepJunior7aData as Word[];
    if (currentBook === 'pep_junior_8a') return pepJunior8aData as Word[];
    if (currentBook === 'pep_junior_9') return pepJunior9Data as Word[];
    if (currentBook === 'bnu_junior_7a') return bnuJunior7aData as Word[];
    if (currentBook === 'bnu_junior_8a') return bnuJunior8aData as Word[];
    if (currentBook === 'bnu_junior_9') return bnuJunior9Data as Word[];
    if (currentBook === 'zhongkao_core') return zhongkaoCoreData as Word[];
    if (currentBook === 'gaokao_core') return gaokaoCoreData as Word[];
    if (currentBook === 'kaoyan_core') return kaoyanCoreData as Word[];
    if (currentBook === 'cet6') return cet6Data as Word[];
    if (currentBook === 'ielts') return ieltsData as Word[];
    if (currentBook === 'dev_english') return devEnglishData as Word[];
    if (currentBook === 'cet4') return cet4Data as Word[];

    // 查找自建/导入的个性化词库
    const customMatch = customBooks.find((b) => b.id === currentBook);
    if (customMatch && customMatch.words.length > 0) {
      return customMatch.words;
    }

    return cet4Data as Word[];
  }, [currentBook, customBooks]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 顶部赛博控制与导航栏 */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentBook={currentBook}
        setCurrentBook={handleSetCurrentBook}
        customBooks={customBooks}
        onOpenCustomBookModal={() => setIsCustomModalOpen(true)}
        stats={stats}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
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

      {/* 自建/导入词库模态框 */}
      <CustomBookModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onBookCreated={(newBook) => {
          handleSetCurrentBook(newBook.id);
          refreshState();
        }}
      />

    </div>
  );
};

export default App;
