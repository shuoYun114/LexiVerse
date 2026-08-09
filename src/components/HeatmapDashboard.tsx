import React, { useState } from 'react';
import { StudyStats } from '../types';
import { get365DaysHeatmapData, getBadges } from '../utils/storage';
import { Flame, Award, TrendingUp, Zap, Target, CheckCircle, Calendar } from 'lucide-react';

interface HeatmapDashboardProps {
  stats: StudyStats;
}

export const HeatmapDashboard: React.FC<HeatmapDashboardProps> = ({ stats }) => {
  const heatmapData = get365DaysHeatmapData();
  const badges = getBadges();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const [paletteMode, setPaletteMode] = useState<'green' | 'neon'>('green');

  // 将 365 天按周分组 (每周 7 天)
  const weeks: typeof heatmapData[] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  // 根据打卡数计算 0-4 阶梯 level
  const getLevel = (count: number) => {
    if (count === 0) return 0;
    if (count <= 4) return 1;
    if (count <= 9) return 2;
    if (count <= 19) return 3;
    return 4;
  };

  // 生成月份标尺
  const getMonthLabels = () => {
    const labels: { index: number; name: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wIndex) => {
      if (week.length > 0) {
        const d = new Date(week[0].date);
        const m = d.getMonth();
        if (m !== lastMonth) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          labels.push({ index: wIndex, name: monthNames[m] });
          lastMonth = m;
        }
      }
    });
    return labels;
  };

  const monthLabels = getMonthLabels();

  // 计算词汇掌握比例数据 (例：假设总库 300 词)


  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '10px 20px 60px' }}>
      
      {/* 顶部连胜与核心统计 KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* 连胜 Streak 卡片 */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={28} className="streak-fire-icon" color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>当前打卡连胜</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>
              {stats.currentStreak} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>天</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>历史最高连胜: {stats.longestStreak} 天</div>
          </div>
        </div>

        {/* 掌控单词量 */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #10b981' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={28} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>已永久掌握词汇</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
              {stats.totalMastered} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>词</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>学习总词汇: {stats.totalLearned} 词</div>
          </div>
        </div>

        {/* 记忆准确率 */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #6366f1' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={28} color="#818cf8" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>艾宾浩斯记忆准确率</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a5b4fc' }}>
              {stats.accuracyRate}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>今日完成: {stats.todayLearned} 词</div>
          </div>
        </div>

        {/* 学习时长 */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={28} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>专注学习总时长</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>
              {stats.totalTimeMinutes} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>分钟</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>算法有效降噪</div>
          </div>
        </div>

      </div>

      {/* GitHub 风格 365 天打卡热力图 (Contribution Heatmap) */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--color-success)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              GitHub 风格 365 天记忆打卡热力图
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>色阶模式:</span>
            <button
              onClick={() => setPaletteMode(paletteMode === 'green' ? 'neon' : 'green')}
              className="cyber-button"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              {paletteMode === 'green' ? '🟢 赛博极光绿' : '🟣 霓光魅紫蓝'}
            </button>
          </div>
        </div>

        {/* 热力图主体容器 */}
        <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
          
          {/* 月份标尺 Row */}
          <div style={{ display: 'flex', marginLeft: '32px', marginBottom: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {monthLabels.map((lbl, idx) => (
              <div key={idx} style={{ position: 'absolute', left: `${32 + lbl.index * 16}px` }}>
                {lbl.name}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '4px', marginTop: '20px' }}>
            {/* 星期标尺 Col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.7rem', color: 'var(--text-dim)', marginRight: '6px' }}>
              <span style={{ height: '13px', lineHeight: '13px' }}>Sun</span>
              <span style={{ height: '13px', lineHeight: '13px' }}>Mon</span>
              <span style={{ height: '13px', lineHeight: '13px' }}>Tue</span>
              <span style={{ height: '13px', lineHeight: '13px' }}>Wed</span>
              <span style={{ height: '13px', lineHeight: '13px' }}>Thu</span>
              <span style={{ height: '13px', lineHeight: '13px' }}>Fri</span>
              <span style={{ height: '13px', lineHeight: '13px' }}>Sat</span>
            </div>

            {/* 52 周的 Grid */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {week.map((dayItem) => {
                    const level = getLevel(dayItem.count);
                    let bgColor = `var(--heatmap-bg-${level})`;
                    if (paletteMode === 'neon') {
                      const neonColors = ['#161b22', '#312e81', '#4338ca', '#6366f1', '#ec4899'];
                      bgColor = neonColors[level];
                    }

                    return (
                      <div
                        key={dayItem.date}
                        className={`heatmap-cell heatmap-level-${level}`}
                        style={{ backgroundColor: bgColor }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            x: rect.left + window.scrollX,
                            y: rect.top + window.scrollY - 40,
                            content: `${dayItem.date} : 打卡 ${dayItem.count} 词 (复习 ${dayItem.reviewCount} | 掌握 ${dayItem.masteredCount})`,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* 图例 Legend Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Less</span>
            <div className="heatmap-cell heatmap-level-0" style={{ width: '11px', height: '11px' }} />
            <div className="heatmap-cell heatmap-level-1" style={{ width: '11px', height: '11px' }} />
            <div className="heatmap-cell heatmap-level-2" style={{ width: '11px', height: '11px' }} />
            <div className="heatmap-cell heatmap-level-3" style={{ width: '11px', height: '11px' }} />
            <div className="heatmap-cell heatmap-level-4" style={{ width: '11px', height: '11px' }} />
            <span>More</span>
          </div>

        </div>

        {/* 悬浮 Tooltip 弹出框 */}
        {tooltip && (
          <div
            style={{
              position: 'absolute',
              top: `${tooltip.y - 120}px`,
              left: `${tooltip.x - 200}px`,
              background: '#1f293d',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              border: '1px solid var(--color-primary-glow)',
              pointerEvents: 'none',
              zIndex: 100,
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            {tooltip.content}
          </div>
        )}

      </div>

      {/* 下半部分：多维图表对比 + 赛博成就勋章 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px' }}>
        
        {/* 图表 1: 艾宾浩斯理论 vs 实际记忆保留率 SVG 图表 */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TrendingUp size={20} color="var(--color-accent)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              艾宾浩斯理论遗忘 vs 间隔复习 Retention
            </h3>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            虚线紫光为无复习自然的理论遗忘曲线；实线绿光为 SM-2 算法干预后的真实记忆保持率。
          </p>

          {/* SVG 曲线绘制 */}
          <div style={{ width: '100%', height: '200px', position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 180" preserveAspectRatio="none">
              {/* 背景参考线 */}
              <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
              <line x1="40" y1="60" x2="380" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
              <line x1="40" y1="100" x2="380" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
              <line x1="40" y1="140" x2="380" y2="140" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />

              {/* Y轴 Label */}
              <text x="5" y="25" fill="#9ca3af" fontSize="10">100%</text>
              <text x="10" y="75" fill="#9ca3af" fontSize="10">50%</text>
              <text x="15" y="145" fill="#9ca3af" fontSize="10">0%</text>

              {/* 曲线 1: 理论自然遗忘 (紫虚线) */}
              <path
                d="M 40,20 Q 90,110 160,135 T 380,145"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2"
                strokeDasharray="6 4"
              />

              {/* 曲线 2: 实际 SM-2 强化复习 (绿实线 + 光晕) */}
              <path
                d="M 40,20 Q 100,40 160,25 T 260,30 T 380,22"
                fill="none"
                stroke="#39d353"
                strokeWidth="3"
                style={{ filter: 'drop-shadow(0 0 6px #39d353)' }}
              />

              {/* 点标记 */}
              <circle cx="40" cy="20" r="4" fill="#39d353" />
              <circle cx="160" cy="25" r="4" fill="#39d353" />
              <circle cx="260" cy="30" r="4" fill="#39d353" />
              <circle cx="380" cy="22" r="4" fill="#39d353" />
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '0.8rem', marginTop: '12px' }}>
            <span style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: '6px' }}>
              --- 理论自然遗忘曲线
            </span>
            <span style={{ color: '#39d353', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ── LexiVerse SM-2 保持率
            </span>
          </div>
        </div>

        {/* 赛博成就勋章墙 (Cyber Badges Wall) */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Award size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              赛博里程碑成就勋章
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
            {badges.map((badge) => (
              <div
                key={badge.id}
                style={{
                  background: badge.unlocked ? 'rgba(31, 41, 61, 0.9)' : 'rgba(17, 24, 39, 0.4)',
                  border: badge.unlocked ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '12px',
                  textAlign: 'center',
                  opacity: badge.unlocked ? 1 : 0.5,
                  boxShadow: badge.unlocked ? '0 0 12px rgba(245, 158, 11, 0.2)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>
                  {badge.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: badge.unlocked ? '#fbbf24' : 'var(--text-muted)' }}>
                  {badge.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px', height: '24px', overflow: 'hidden' }}>
                  {badge.description}
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--color-accent)' }}>
                  {badge.unlocked ? '已解锁 🎖️' : `${badge.progress} / ${badge.maxProgress}`}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
