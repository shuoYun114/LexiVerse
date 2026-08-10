import React, { useState } from 'react';
import { Word, CustomWordBook } from '../types';
import { saveCustomWordBook, importCustomWordBookFromJSON } from '../utils/customBooks';
import { Plus, Upload, X, Trash2, FileText, BookOpen } from 'lucide-react';

interface CustomBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookCreated: (newBook: CustomWordBook) => void;
}

export const CustomBookModal: React.FC<CustomBookModalProps> = ({
  isOpen,
  onClose,
  onBookCreated,
}) => {
  const [activeMode, setActiveMode] = useState<'presets' | 'create' | 'import'>('presets');

  const presetBooksList = [
    {
      category: '🎓 国内高中英语教材',
      color: '#818cf8',
      items: [
        { id: 'bnu_compulsory1', name: '北师大版 高中英语必修一', tags: '高中必修', desc: '北师大版高中英语必修一核心词汇与单元例句' },
        { id: 'pep_senior_compulsory1', name: '人教版 高中英语必修一', tags: '高中必修', desc: '人教版 PEP 高中英语必修一全单元考点集' },
        { id: 'pep_senior_compulsory2', name: '人教版 高中英语必修二', tags: '高中必修', desc: '人教版 PEP 高中英语必修二文化遗产与自然保护' },
        { id: 'fltrp_senior_compulsory1', name: '外研版 高中英语必修一', tags: '高中必修', desc: '外研版 FLTRP 高中英语必修一新起点词汇' },
      ],
    },
    {
      category: '🏫 国内初中英语教材',
      color: '#34d399',
      items: [
        { id: 'pep_junior_7a', name: '人教版 初中英语七年级上册', tags: '初中基础', desc: '人教版 PEP 初一英语词汇与日常习惯' },
        { id: 'pep_junior_8a', name: '人教版 初中英语八年级上册', tags: '初中进阶', desc: '人教版 PEP 初二英语词汇与拓展表达' },
        { id: 'pep_junior_9', name: '人教版 初中英语九年级全一册', tags: '中考冲刺', desc: '人教版 PEP 初三全一册中考高频核心词汇' },
      ],
    },
    {
      category: '🌐 权威等级 / 多语种 / 专业词库',
      color: '#fbbf24',
      items: [
        { id: 'spanish_beginner', name: '西班牙语入门 (Spanish Beginner)', tags: '多语种', desc: '包含 Hola, Gracias 等入门西语与标准弹舌音' },
        { id: 'cet4', name: 'CET-4 大学英语四级核心', tags: '大学英语', desc: '大学英语四级高频考点词汇' },
        { id: 'cet6', name: 'CET-6 大学英语六级核心', tags: '大学英语', desc: '大学英语六级核心词汇与长难句' },
        { id: 'ielts', name: 'IELTS 雅思高频学术词库', tags: '出国留学', desc: '雅思考试听力与阅读高频词汇' },
      ],
    },
  ];
  
  // 自建模式状态
  const [bookName, setBookName] = useState('');
  const [bookDesc, setBookDesc] = useState('');
  const [wordList, setWordList] = useState<Word[]>([]);
  
  // 当前正在填写的单词表单
  const [inputWord, setInputWord] = useState('');
  const [inputPhonetic, setInputPhonetic] = useState('');
  const [inputDefinition, setInputDefinition] = useState('');
  const [inputExample, setInputExample] = useState('');
  const [inputExampleTrans, setInputExampleTrans] = useState('');

  // 批量快捷粘贴文本
  const [batchText, setBatchText] = useState('');
  const [showBatchInput, setShowBatchInput] = useState(false);

  // 导入模式状态
  const [importJsonText, setImportJsonText] = useState('');
  const [importName, setImportName] = useState('');

  if (!isOpen) return null;

  // 添加单个单词到临时列表
  const handleAddWordToList = () => {
    if (!inputWord.trim() || !inputDefinition.trim()) {
      alert('请填写单词与中文释义！');
      return;
    }
    const newWord: Word = {
      id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      word: inputWord.trim(),
      phonetic: inputPhonetic.trim() || `/${inputWord.trim()}/`,
      definition: inputDefinition.trim(),
      translation: inputDefinition.trim(),
      example: inputExample.trim() || `${inputWord.trim()} is an important word.`,
      exampleTranslation: inputExampleTrans.trim() || `${inputWord.trim()} 是一个重要词汇。`,
      tags: [bookName || '自建词库'],
      difficulty: 1,
    };
    setWordList((prev) => [...prev, newWord]);
    setInputWord('');
    setInputPhonetic('');
    setInputDefinition('');
    setInputExample('');
    setInputExampleTrans('');
  };

  // 批量解析文本并生成单词列表
  const handleBatchParse = () => {
    if (!batchText.trim()) return;
    const lines = batchText.split('\n');
    const parsedWords: Word[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        parsedWords.push({
          id: `w_batch_${Date.now()}_${idx}`,
          word: parts[0],
          phonetic: parts[2] ? parts[2] : `/${parts[0]}/`,
          definition: parts[1],
          translation: parts[1],
          example: parts[3] || `${parts[0]} is useful.`,
          exampleTranslation: parts[4] || `${parts[0]} 很实用。`,
          tags: [bookName || '批量自建词库'],
          difficulty: 1,
        });
      }
    });

    if (parsedWords.length === 0) {
      alert('未识别到格式正确的文本！格式格式为：单词 | 释义 | 音标 | 例句');
      return;
    }

    setWordList((prev) => [...prev, ...parsedWords]);
    setBatchText('');
    setShowBatchInput(false);
  };

  // 保存自建词库
  const handleSaveCustomBook = () => {
    if (!bookName.trim()) {
      alert('请输入词库名称！');
      return;
    }
    if (wordList.length === 0) {
      alert('请至少添加一个单词后再保存！');
      return;
    }

    const newBook: CustomWordBook = {
      id: `custom_${Date.now()}`,
      name: bookName.trim(),
      description: bookDesc.trim() || `共包含 ${wordList.length} 个自建单词`,
      icon: '✍️',
      createdAt: new Date().toISOString(),
      words: wordList,
    };

    saveCustomWordBook(newBook);
    onBookCreated(newBook);
    onClose();
  };

  // 处理文件导入
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJsonText(content);
        if (!importName) {
          setImportName(file.name.replace(/\.json$/i, ''));
        }
      }
    };
    reader.readAsText(file);
  };

  // 确认导入 JSON 词库
  const handleConfirmImport = () => {
    if (!importJsonText.trim()) {
      alert('请上传 JSON 文件或粘贴 JSON 内容！');
      return;
    }
    try {
      const importedBook = importCustomWordBookFromJSON(
        importName || '导入词库',
        importJsonText
      );
      onBookCreated(importedBook);
      onClose();
    } catch (err: any) {
      alert(`导入失败: ${err.message}`);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '20px',
          border: '1px solid var(--color-primary)',
          boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)',
        }}
      >
        {/* Modal 头部 */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                创建与导入自定义词库
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                构建属于您自己的个性化词库，支持 3D 赛博星云与艾宾浩斯多端同步打卡
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Mode 切换 Tab */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--glass-border)',
            background: 'rgba(31, 41, 61, 0.4)',
          }}
        >
          <button
            onClick={() => setActiveMode('presets')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeMode === 'presets' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: activeMode === 'presets' ? '#38bdf8' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              borderBottom: activeMode === 'presets' ? '2px solid #38bdf8' : '2px solid transparent',
            }}
          >
            <BookOpen size={16} /> 🏫 初高中/官方教材专区
          </button>
          <button
            onClick={() => setActiveMode('create')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeMode === 'create' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: activeMode === 'create' ? '#38bdf8' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              borderBottom: activeMode === 'create' ? '2px solid #38bdf8' : '2px solid transparent',
            }}
          >
            <Plus size={16} /> ✍️ 手动自建词库
          </button>
          <button
            onClick={() => setActiveMode('import')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeMode === 'import' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: activeMode === 'import' ? '#38bdf8' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              borderBottom: activeMode === 'import' ? '2px solid #38bdf8' : '2px solid transparent',
            }}
          >
            <Upload size={16} /> 📥 导入 JSON 词库
          </button>
        </div>

        {/* Modal 内容区 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {activeMode === 'presets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {presetBooksList.map((group, gIdx) => (
                <div key={gIdx}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: group.color, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {group.category}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: 'rgba(30, 41, 59, 0.6)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '12px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '10px',
                          transition: 'border 0.2s',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{item.name}</span>
                            <span style={{ fontSize: '0.7rem', background: 'rgba(99,102,241,0.2)', color: group.color, padding: '2px 8px', borderRadius: '10px' }}>
                              {item.tags}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                            {item.desc}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            onBookCreated({ id: item.id } as CustomWordBook);
                            onClose();
                          }}
                          className="cyber-button cyber-button-primary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', width: '100%', marginTop: '4px' }}
                        >
                          ⚡ 立即加载此教材
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeMode === 'create' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* 词库基础信息 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    词库名称 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={bookName}
                    onChange={(e) => setBookName(e.target.value)}
                    placeholder="如：DELE 西语 B1 口语词汇 / 考研核心库"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--glass-border)',
                      color: '#fff',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    词库简短描述
                  </label>
                  <input
                    type="text"
                    value={bookDesc}
                    onChange={(e) => setBookDesc(e.target.value)}
                    placeholder="如：个人精选高频避错词集"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--glass-border)',
                      color: '#fff',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* 单词录入表单 */}
              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>
                    添加词条 (当前已录入 {wordList.length} 词)
                  </h4>
                  <button
                    onClick={() => setShowBatchInput(!showBatchInput)}
                    style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <FileText size={14} /> {showBatchInput ? '切换单词输入' : '⚡ 批量粘贴模式'}
                  </button>
                </div>

                {showBatchInput ? (
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      每行格式：<code style={{ background: '#1e293b', padding: '2px 6px', color: '#38bdf8' }}>单词 | 释义 | 音标(可选) | 例句(可选)</code>
                    </p>
                    <textarea
                      value={batchText}
                      onChange={(e) => setBatchText(e.target.value)}
                      rows={5}
                      placeholder={`hablar | v. 说话，讲话 | /aˈblaɾ/ | Me gusta hablar español.\ngracias | n. 谢谢 | /ˈɡɾa.sjas/ | Muchas gracias.`}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid var(--glass-border)',
                        color: '#fff',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                      }}
                    />
                    <button
                      onClick={handleBatchParse}
                      className="cyber-button cyber-button-primary"
                      style={{ marginTop: '10px', padding: '6px 16px', fontSize: '0.85rem' }}
                    >
                      批量导入解析文本
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        value={inputWord}
                        onChange={(e) => setInputWord(e.target.value)}
                        placeholder="单词/短语 (如: resilience)"
                        style={{ padding: '8px 12px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                      />
                      <input
                        type="text"
                        value={inputPhonetic}
                        onChange={(e) => setInputPhonetic(e.target.value)}
                        placeholder="音标 (如: /rɪˈzɪliəns/)"
                        style={{ padding: '8px 12px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                      />
                      <input
                        type="text"
                        value={inputDefinition}
                        onChange={(e) => setInputDefinition(e.target.value)}
                        placeholder="中文释义 (如: n. 恢复力)"
                        style={{ padding: '8px 12px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        value={inputExample}
                        onChange={(e) => setInputExample(e.target.value)}
                        placeholder="双语例句 (英文/西文)"
                        style={{ padding: '8px 12px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                      />
                      <input
                        type="text"
                        value={inputExampleTrans}
                        onChange={(e) => setInputExampleTrans(e.target.value)}
                        placeholder="例句中文翻译"
                        style={{ padding: '8px 12px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                      />
                    </div>
                    <button
                      onClick={handleAddWordToList}
                      className="cyber-button"
                      style={{ padding: '6px 16px', fontSize: '0.85rem', background: 'rgba(6, 182, 212, 0.2)', border: '1px solid #06b6d4', color: '#38bdf8' }}
                    >
                      ➕ 添加词条到本库
                    </button>
                  </div>
                )}
              </div>

              {/* 已录入单词列表预览 */}
              {wordList.length > 0 && (
                <div style={{ maxHeight: '200px', overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px' }}>单词</th>
                        <th style={{ padding: '8px 12px' }}>音标</th>
                        <th style={{ padding: '8px 12px' }}>中文释义</th>
                        <th style={{ padding: '8px 12px' }}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wordList.map((w, idx) => (
                        <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#fff' }}>{w.word}</td>
                          <td style={{ padding: '8px 12px', color: '#38bdf8' }}>{w.phonetic}</td>
                          <td style={{ padding: '8px 12px', color: '#cbd5e1' }}>{w.translation}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <button
                              onClick={() => setWordList((prev) => prev.filter((_, i) => i !== idx))}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  自定义词库显示名称
                </label>
                <input
                  type="text"
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  placeholder="如：外部下载的考研英语词库"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--glass-border)',
                    color: '#fff',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  选择上传 JSON 词库文件 (.json)
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ color: '#94a3b8', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  或直接粘贴 JSON 词库内容
                </label>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  rows={8}
                  placeholder={`[\n  {\n    "word": "resilience",\n    "phonetic": "/rɪˈzɪliəns/",\n    "translation": "恢复力"，\n    "example": "Developing resilience is key."\n  }\n]`}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--glass-border)',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal 底部按钮 */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--glass-border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            background: 'rgba(15, 23, 42, 0.8)',
          }}
        >
          <button
            onClick={onClose}
            className="cyber-button"
            style={{ padding: '8px 18px', background: 'transparent' }}
          >
            取消
          </button>
          {activeMode === 'create' ? (
            <button
              onClick={handleSaveCustomBook}
              className="cyber-button cyber-button-primary"
              style={{ padding: '8px 24px' }}
            >
              💾 保存并发布为新词库
            </button>
          ) : (
            <button
              onClick={handleConfirmImport}
              className="cyber-button cyber-button-primary"
              style={{ padding: '8px 24px' }}
            >
              🚀 确认导入并加载
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
