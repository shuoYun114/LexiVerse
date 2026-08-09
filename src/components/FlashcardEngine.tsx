import React, { useState, useEffect } from 'react';
import { Word, UserWordRecord } from '../types';
import { calculateSM2, formatNextReviewLabel } from '../utils/ebbinghaus';
import { recordDailyActivity, saveUserWordRecord } from '../utils/storage';
import { speakWord, getWordAccent } from '../utils/tts';
import confetti from 'canvas-confetti';
import { Volume2, RotateCw, CheckCircle2, Eye, ChevronRight } from 'lucide-react';

interface FlashcardEngineProps {
  words: Word[];
  userRecords: Record<string, UserWordRecord>;
  onRecordUpdated: () => void;
  soundEnabled: boolean;
}

export const FlashcardEngine: React.FC<FlashcardEngineProps> = ({
  words,
  userRecords,
  onRecordUpdated,
  soundEnabled,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showExampleMask, setShowExampleMask] = useState(true);

  const currentWord = words[currentIndex] || null;
  const currentRecord = currentWord ? userRecords[currentWord.id] : undefined;

  // 自动播放音频
  useEffect(() => {
    if (currentWord && soundEnabled && !isFlipped) {
      speakWord(currentWord.word, getWordAccent(currentWord));
    }
  }, [currentIndex, soundEnabled]);

  // 键盘快捷键响应
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped && ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(e.code)) {
        const quality = parseInt(e.code.replace('Digit', ''), 10);
        handleRateWord(quality);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentWord]);

  if (!currentWord) {
    return (
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', maxWidth: '540px', margin: '40px auto' }}>
        <CheckCircle2 size={48} color="var(--color-success)" style={{ margin: '0 auto 16px' }} />
        <h2>当前词库所有单词已完成本轮打卡！</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>您可以切换词库或在热力图看板中查看今日成果。</p>
      </div>
    );
  }

  // 执行打分与 SM-2 算法推导
  const handleRateWord = (quality: number) => {
    const updatedRecord = calculateSM2(currentWord.id, currentRecord, quality);
    saveUserWordRecord(updatedRecord);

    const isMastered = updatedRecord.status === 'mastered';
    recordDailyActivity(1, currentRecord ? 1 : 0, isMastered ? 1 : 0);

    if (quality === 5) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }

    onRecordUpdated();
    setIsFlipped(false);
    setShowExampleMask(true);

    // 延迟 250ms 切换到下一个词，等卡片翻回正面或转过 90 度遮挡视角，彻底消除背面闪现下一个词中文的问题
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCurrentIndex(0); // 循环回到第一个
      }
    }, 250);
  };

  // 屏蔽例句中的原词 (挖空测试)
  const renderMaskedExample = (example: string, targetWord: string) => {
    if (!showExampleMask) return example;
    const regex = new RegExp(targetWord, 'gi');
    return example.replace(regex, '____');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      
      {/* 进度指示条 */}
      <div style={{ width: '100%', maxWidth: '540px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'var(--font-code)' }}>
          Word {currentIndex + 1} / {words.length}
        </span>
        <span style={{ color: 'var(--color-accent)', fontSize: '0.85rem' }}>
          {currentRecord ? `已复习 ${currentRecord.totalReviews} 次` : '新词卡片'}
        </span>
      </div>

      {/* 3D 翻转卡片 */}
      <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
        <div className="flip-card-inner">
          
          {/* 正面卡片 */}
          <div className="flip-card-front glass-panel">
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.2)', color: 'var(--color-primary-glow)', padding: '4px 10px', borderRadius: '12px' }}>
                {currentWord.tags?.[0] || '核心词汇'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(currentWord.word, getWordAccent(currentWord));
                }}
                className="cyber-button"
                style={{ padding: '6px 12px', borderRadius: '20px' }}
              >
                <Volume2 size={18} color="var(--color-accent)" />
              </button>
            </div>

            <div style={{ margin: '20px 0' }}>
              <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#ffffff', letterSpacing: '1px' }}>
                {currentWord.word}
              </h2>
              <p style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-code)', fontSize: '1.2rem', marginTop: '6px' }}>
                {currentWord.phonetic}
              </p>
            </div>

            <div style={{ width: '100%', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '12px' }}>
              <p style={{ color: '#d1d5db', fontSize: '0.95rem', fontStyle: 'italic' }}>
                "{renderMaskedExample(currentWord.example, currentWord.word)}"
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExampleMask(!showExampleMask);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Eye size={12} /> {showExampleMask ? '显示填空词汇' : '隐藏填空词汇'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <RotateCw size={14} /> 点击卡片或按 <kbd style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>Space</kbd> 翻转看释义
            </div>
          </div>

          {/* 背面卡片 */}
          <div className="flip-card-back glass-panel" style={{ border: '1px solid var(--color-primary)' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                {currentWord.word}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(currentWord.word, getWordAccent(currentWord));
                }}
                className="cyber-button"
                style={{ padding: '6px 12px' }}
              >
                <Volume2 size={16} />
              </button>
            </div>

            <div style={{ margin: '14px 0', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#38bdf8', fontWeight: 700 }}>
                {currentWord.definition}
              </h3>
              <p style={{ color: 'var(--text-main)', marginTop: '8px', fontSize: '0.95rem' }}>
                {currentWord.example}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                {currentWord.exampleTranslation}
              </p>
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {currentRecord ? `复习计划: ${formatNextReviewLabel(currentRecord.interval)}` : '新词: 打分推算艾宾浩斯复习计划'} (按数字键 1-5)：
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 5 阶艾宾浩斯熟练度评分控制按钮组 */}
      {isFlipped && (
        <div
          className="glass-panel"
          style={{
            marginTop: '24px',
            width: '100%',
            maxWidth: '540px',
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <button
            onClick={() => handleRateWord(1)}
            className="cyber-button cyber-button-danger"
            style={{ flexDirection: 'column', padding: '10px 4px', fontSize: '0.75rem' }}
          >
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>1</span>
            <span>完全遗忘</span>
          </button>

          <button
            onClick={() => handleRateWord(2)}
            className="cyber-button"
            style={{ flexDirection: 'column', padding: '10px 4px', fontSize: '0.75rem', borderColor: '#f59e0b', color: '#fbbf24' }}
          >
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>2</span>
            <span>印象模糊</span>
          </button>

          <button
            onClick={() => handleRateWord(3)}
            className="cyber-button"
            style={{ flexDirection: 'column', padding: '10px 4px', fontSize: '0.75rem', borderColor: '#3b82f6', color: '#60a5fa' }}
          >
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>3</span>
            <span>艰难记起</span>
          </button>

          <button
            onClick={() => handleRateWord(4)}
            className="cyber-button"
            style={{ flexDirection: 'column', padding: '10px 4px', fontSize: '0.75rem', borderColor: '#10b981', color: '#34d399' }}
          >
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>4</span>
            <span>熟练掌握</span>
          </button>

          <button
            onClick={() => handleRateWord(5)}
            className="cyber-button cyber-button-primary"
            style={{ flexDirection: 'column', padding: '10px 4px', fontSize: '0.75rem' }}
          >
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>5</span>
            <span>脱口而出</span>
          </button>
        </div>
      )}

      {/* 下一个单词导航提示 */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
        <button
          onClick={() => {
            setIsFlipped(false);
            setTimeout(() => {
              setCurrentIndex((prev) => (prev + 1) % words.length);
            }, isFlipped ? 250 : 0);
          }}
          className="cyber-button"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          跳过此词 <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
};
