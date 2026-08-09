import React, { useState } from 'react';
import { Word, UserWordRecord, BookCategory } from '../types';
import { exportUserData, importUserData, resetAllData } from '../utils/storage';
import { speakWord, getWordAccent } from '../utils/tts';
import { Search, Download, Upload, Volume2, Database, CheckCircle, Clock } from 'lucide-react';

interface WordBookManagerProps {
  words: Word[];
  userRecords: Record<string, UserWordRecord>;
  currentBook: BookCategory;
  onRefreshData: () => void;
}

export const WordBookManager: React.FC<WordBookManagerProps> = ({
  words,
  userRecords,
  currentBook,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'mastered' | 'reviewing' | 'new'>('all');

  // 搜索与过滤逻辑
  const filteredWords = words.filter((w) => {
    const matchesSearch =
      w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.translation.includes(searchTerm);

    const rec = userRecords[w.id];
    const status = rec ? rec.status : 'new';

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && status === filterStatus;
  });

  // 导出 JSON 文件下载
  const handleExport = () => {
    const jsonStr = exportUserData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lexiverse_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入 JSON 数据
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importUserData(content)) {
        alert('🎉 学习进度与热力图打卡记录导入成功！');
        onRefreshData();
      } else {
        alert('❌ 文件格式解析失败，请检查是否为 LexiVerse JSON 备份。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px 20px 60px' }}>
      
      {/* 顶部工具栏：导入导出与搜素 */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={22} color="var(--color-accent)" />
            <h2 style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: 800 }}>
              词库全景管理 ({currentBook.toUpperCase()}) & 数据中心 ({words.length} 词)
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleExport} className="cyber-button" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              <Download size={16} /> 导出 JSON 备份
            </button>

            <label className="cyber-button cyber-button-primary" style={{ padding: '8px 14px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <Upload size={16} /> 导入 JSON 进度
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>

            <button
              onClick={() => {
                if (window.confirm('⚠️ 确定要清空重置所有打卡天数、学习进度与勋章吗？')) {
                  resetAllData();
                  onRefreshData();
                  alert('✨ 所有打卡记录已重置为干净初始状态！');
                }
              }}
              className="cyber-button cyber-button-danger"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              🗑️ 重置所有打卡
            </button>
          </div>

        </div>

        {/* 筛选与搜索输入框 */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索英文单词或中文释义..."
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                background: 'rgba(17, 24, 39, 0.6)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: '#ffffff',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setFilterStatus('all')}
              className={`cyber-button ${filterStatus === 'all' ? 'cyber-button-primary' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              全部 ({words.length})
            </button>
            <button
              onClick={() => setFilterStatus('mastered')}
              className={`cyber-button ${filterStatus === 'mastered' ? 'cyber-button-primary' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              已掌握
            </button>
            <button
              onClick={() => setFilterStatus('reviewing')}
              className={`cyber-button ${filterStatus === 'reviewing' ? 'cyber-button-primary' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              复习中
            </button>
            <button
              onClick={() => setFilterStatus('new')}
              className={`cyber-button ${filterStatus === 'new' ? 'cyber-button-primary' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              未开始
            </button>
          </div>
        </div>
      </div>

      {/* 单词表格 List */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'rgba(31, 41, 61, 0.8)', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '14px 16px' }}>单词 & 音标</th>
              <th style={{ padding: '14px 16px' }}>中文释义</th>
              <th style={{ padding: '14px 16px' }}>例句与例译</th>
              <th style={{ padding: '14px 16px' }}>艾宾浩斯状态</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredWords.map((word) => {
              const rec = userRecords[word.id];
              return (
                <tr key={word.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                  
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1.05rem' }}>{word.word}</div>
                    <div style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-code)', fontSize: '0.8rem' }}>{word.phonetic}</div>
                  </td>

                  <td style={{ padding: '14px 16px', color: '#e5e7eb', fontWeight: 600 }}>
                    {word.translation}
                  </td>

                  <td style={{ padding: '14px 16px', maxWidth: '320px' }}>
                    <div style={{ color: '#d1d5db', fontSize: '0.85rem' }}>"{word.example}"</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>{word.exampleTranslation}</div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    {rec?.status === 'mastered' && (
                      <span style={{ color: '#39d353', background: 'rgba(57, 211, 83, 0.1)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={12} /> 阶段性掌握 (间隔 {rec.interval} 天)
                      </span>
                    )}
                    {rec?.status === 'reviewing' && (
                      <span style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> 间隔复习中 (已答对 {rec.repetition} 次)
                      </span>
                    )}
                    {(!rec || rec.status === 'new') && (
                      <span style={{ color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem' }}>
                        未打卡新词
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => speakWord(word.word, getWordAccent(word))}
                      className="cyber-button"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                    >
                      <Volume2 size={14} /> 朗读
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
