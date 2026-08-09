import React, { useState, useEffect, useMemo } from 'react';
import { ActiveTab, BookCategory, Word, UserWordRecord, StudyStats } from './types';
import { Header } from './components/Header';
import { WordNebula3D } from './components/WordNebula3D';
import { FlashcardEngine } from './components/FlashcardEngine';
import { HeatmapDashboard } from './components/HeatmapDashboard';
import { CyberShooterGame } from './components/CyberShooterGame';
import { WordBookManager } from './components/WordBookManager';
import { getUserWordRecords, getStudyStats, getCurrentBookId, setCurrentBookId } from './utils/storage';

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

  // 初始化加载
  useEffect(() => {
    const savedBook = getCurrentBookId() as BookCategory;
    if (savedBook) setCurrentBookState(savedBook);
    refreshState();
  }, []);

  const refreshState = () => {
    setUserRecords(getUserWordRecords());
    setStats(getStudyStats());
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

    </div>
  );
};

export default App;
