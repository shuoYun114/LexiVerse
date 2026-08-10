import React, { useState, useEffect, useRef } from 'react';
import { Word } from '../types';
import { recordDailyActivity } from '../utils/storage';
import { speakWord, getWordAccent } from '../utils/tts';
import confetti from 'canvas-confetti';
import { Gamepad2, Zap, RefreshCw, Trophy, ShieldAlert } from 'lucide-react';

interface CyberShooterGameProps {
  words: Word[];
  soundEnabled: boolean;
}

interface FallingWord {
  id: string;
  word: Word;
  x: number;
  y: number;
  speed: number;
}

export const CyberShooterGame: React.FC<CyberShooterGameProps> = ({ words, soundEnabled }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameSpeed, setGameSpeed] = useState<'easy' | 'normal' | 'hard'>('easy'); // 默认轻松休闲模式，调慢速度
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [health, setHealth] = useState(100);
  const [inputVal, setInputVal] = useState('');
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const requestRef = useRef<number>();
  const lastSpawnTime = useRef<number>(0);

  // 根据当前难度获取下落速度与间隔
  const getSpeedConfig = () => {
    switch (gameSpeed) {
      case 'easy':
        return { baseSpeed: 0.045, randomSpeed: 0.02, spawnInterval: 4000, damage: 10 }; // 轻松模式：大大减慢，20秒掉落到底
      case 'hard':
        return { baseSpeed: 0.12, randomSpeed: 0.06, spawnInterval: 2200, damage: 15 };
      case 'normal':
      default:
        return { baseSpeed: 0.075, randomSpeed: 0.03, spawnInterval: 3000, damage: 12 };
    }
  };

  // 开始新游戏
  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHealth(100);
    setInputVal('');
    setFallingWords([]);
    setGameOver(false);
    lastSpawnTime.current = Date.now();
  };

  // 生成新单词掉落
  const spawnWord = () => {
    if (words.length === 0) return;
    const config = getSpeedConfig();
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const newFallingWord: FallingWord = {
      id: Math.random().toString(),
      word: randomWord,
      x: Math.random() * 70 + 15, // 15% 到 85% 视口宽度
      y: 0,
      speed: config.baseSpeed + Math.random() * config.randomSpeed,
    };
    setFallingWords((prev) => [...prev, newFallingWord]);
  };

  // 主循环
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const updateGame = () => {
      const now = Date.now();
      const config = getSpeedConfig();

      // 根据设置的间隔生成新单词
      if (now - lastSpawnTime.current > config.spawnInterval) {
        spawnWord();
        lastSpawnTime.current = now;
      }

      setFallingWords((prevWords) => {
        const nextWords: FallingWord[] = [];
        let damage = 0;

        prevWords.forEach((fw) => {
          const newY = fw.y + fw.speed;
          if (newY >= 85) {
            // 掉落到底部扣血
            damage += config.damage;
          } else {
            nextWords.push({ ...fw, y: newY });
          }
        });

        if (damage > 0) {
          setHealth((h) => {
            const nextH = h - damage;
            if (nextH <= 0) {
              setGameOver(true);
              setIsPlaying(false);
            }
            return Math.max(0, nextH);
          });
          setCombo(0);
        }

        return nextWords;
      });

      requestRef.current = requestAnimationFrame(updateGame);
    };

    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, gameOver, words]);

  // 处理玩家击键输入匹配
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typed = e.target.value.trim();
    setInputVal(typed);

    // 匹配是否有落下的单词被成功打出
    const matchedIndex = fallingWords.findIndex(
      (fw) => fw.word.word.toLowerCase() === typed.toLowerCase()
    );

    if (matchedIndex !== -1) {
      const matched = fallingWords[matchedIndex];
      // 击碎！加分加 Combo
      const comboBonus = Math.min(5, combo + 1);
      const points = 10 * comboBonus;
      const newScore = score + points;
      const newCombo = combo + 1;

      setScore(newScore);
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      if (soundEnabled) {
        speakWord(matched.word.word, getWordAccent(matched.word));
      }

      // 剔除击中的单词
      setFallingWords((prev) => prev.filter((_, idx) => idx !== matchedIndex));
      setInputVal('');

      // 打卡分数记录
      recordDailyActivity(0, 0, 0, newScore);

      confetti({
        particleCount: 20,
        origin: { x: matched.x / 100, y: matched.y / 100 },
      });
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '20px' }}>
      
      {/* 顶部控制与得分看板 */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Gamepad2 size={24} color="var(--color-pink)" />
          <h2 style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: 800 }}>
            赛博打字速记游戏
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.9rem' }}>
          <span style={{ color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Trophy size={18} /> 得分: {score}
          </span>
          <span style={{ color: '#ec4899', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={18} /> Combo: x{combo}
          </span>
          <div style={{ width: '120px', background: 'rgba(255,255,255,0.1)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ width: `${health}%`, height: '100%', background: health > 30 ? '#10b981' : '#ef4444', transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* 游戏战场主区域 */}
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          width: '100%',
          height: '420px',
          overflow: 'hidden',
          border: '1px solid var(--glass-border)',
          background: 'radial-gradient(circle at 50% 50%, rgba(17, 24, 39, 0.9) 0%, rgba(9, 13, 22, 0.95) 100%)',
        }}
      >
        {!isPlaying && !gameOver && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '80%' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>
              准备好测试你的英文盲打速度了吗？
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '18px' }}>
              单词会从星云降落，快速输入正确拼写击碎它们！
            </p>

            {/* 速度调节按钮组 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
              <button
                onClick={() => setGameSpeed('easy')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: gameSpeed === 'easy' ? 'rgba(52, 211, 153, 0.25)' : 'rgba(31, 41, 61, 0.6)',
                  color: gameSpeed === 'easy' ? '#34d399' : 'var(--text-muted)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🐢 轻松休闲 (较慢)
              </button>
              <button
                onClick={() => setGameSpeed('normal')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: gameSpeed === 'normal' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(31, 41, 61, 0.6)',
                  color: gameSpeed === 'normal' ? '#38bdf8' : 'var(--text-muted)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🏃 标准挑战
              </button>
              <button
                onClick={() => setGameSpeed('hard')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: gameSpeed === 'hard' ? 'rgba(236, 72, 153, 0.25)' : 'rgba(31, 41, 61, 0.6)',
                  color: gameSpeed === 'hard' ? '#ec4899' : 'var(--text-muted)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ⚡ 极限竞速
              </button>
            </div>

            <button onClick={startGame} className="cyber-button cyber-button-primary" style={{ padding: '12px 36px', fontSize: '1.1rem' }}>
              🚀 开始打字速记
            </button>
          </div>
        )}

        {gameOver && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <ShieldAlert size={48} color="#ef4444" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', marginBottom: '8px' }}>
              Game Over!
            </h3>
            <p style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '4px' }}>
              最终得分: <span style={{ color: '#fbbf24', fontWeight: 800 }}>{score}</span>
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              最高连击 Combo: {maxCombo}
            </p>
            <button onClick={startGame} className="cyber-button cyber-button-primary" style={{ padding: '10px 24px' }}>
              <RefreshCw size={18} /> 重新挑战
            </button>
          </div>
        )}

        {/* 正在降落的单词列表 */}
        {isPlaying &&
          fallingWords.map((fw) => (
            <div
              key={fw.id}
              style={{
                position: 'absolute',
                left: `${fw.x}%`,
                top: `${fw.y}%`,
                background: 'rgba(99, 102, 241, 0.25)',
                border: '1px solid var(--color-primary-glow)',
                padding: '6px 14px',
                borderRadius: '8px',
                color: '#ffffff',
                fontWeight: 700,
                fontFamily: 'var(--font-code)',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)',
                transform: 'translateX(-50%)',
                transition: 'top 0.05s linear',
              }}
            >
              <div>{fw.word.word}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-accent)', fontWeight: 400 }}>
                {fw.word.translation}
              </div>
            </div>
          ))}

        {/* 底部警戒防线 */}
        <div style={{ position: 'absolute', bottom: '0', width: '100%', height: '4px', background: 'linear-gradient(90deg, #ef4444, #ec4899, #ef4444)' }} />
      </div>

      {/* 底部打字输入框 */}
      {isPlaying && (
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            placeholder="在此盲打输入掉落的单词拼写..."
            autoFocus
            style={{
              flex: 1,
              padding: '14px 20px',
              fontSize: '1.2rem',
              fontFamily: 'var(--font-code)',
              background: 'rgba(17, 24, 39, 0.9)',
              border: '2px solid var(--color-primary)',
              borderRadius: '12px',
              color: '#ffffff',
              outline: 'none',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)',
            }}
          />
        </div>
      )}

    </div>
  );
};
