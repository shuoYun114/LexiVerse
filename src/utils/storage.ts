import { UserWordRecord, DailyActivity, Badge, StudyStats } from '../types';
import { getLocalDateString } from './ebbinghaus';

const STORAGE_KEYS = {
  RECORDS: 'lexiverse_word_records_v1',
  ACTIVITIES: 'lexiverse_daily_activities_v1',
  BADGES: 'lexiverse_badges_v1',
  CURRENT_BOOK: 'lexiverse_current_book_v1',
};

// 预定义勋章模板
const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_word',
    name: '初入词域',
    description: '完成第一次单词打卡学习',
    icon: '🚀',
    category: 'learning',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'streak_7',
    name: '七日连胜',
    description: '连续打卡 7 天',
    icon: '🔥',
    category: 'streak',
    unlocked: false,
    progress: 0,
    maxProgress: 7,
  },
  {
    id: 'streak_30',
    name: '月度星轨',
    description: '连续打卡 30 天',
    icon: '⚡',
    category: 'streak',
    unlocked: false,
    progress: 0,
    maxProgress: 30,
  },
  {
    id: 'master_50',
    name: '半百破壁',
    description: '累计掌握 50 个单词',
    icon: '🛡️',
    category: 'mastery',
    unlocked: false,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: 'master_200',
    name: '星云探索者',
    description: '累计掌握 200 个单词',
    icon: '🌌',
    category: 'mastery',
    unlocked: false,
    progress: 0,
    maxProgress: 200,
  },
  {
    id: 'game_combo_50',
    name: '极速盲打',
    description: '打字速记模式获得单局 500 分以上',
    icon: '⌨️',
    category: 'game',
    unlocked: false,
    progress: 0,
    maxProgress: 500,
  },
  {
    id: 'ebbinghaus_geek',
    name: '艾宾浩斯极客',
    description: '累计完成 100 次间隔复习',
    icon: '🧠',
    category: 'learning',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'legend_master',
    name: '全域高能',
    description: '词汇总量准确率超过 85%',
    icon: '👑',
    category: 'mastery',
    unlocked: false,
    progress: 0,
    maxProgress: 85,
  },
];

/** 获取所有用户单词复习记录 */
export function getUserWordRecords(): Record<string, UserWordRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to parse word records', e);
    return {};
  }
}

/** 保存单个单词复习记录 */
export function saveUserWordRecord(record: UserWordRecord): void {
  const records = getUserWordRecords();
  records[record.wordId] = record;
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
}

/** 获取每日活动记录 */
export function getDailyActivities(): Record<string, DailyActivity> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to parse daily activities', e);
    return {};
  }
}

/** 记录今天的打卡与学习活动 */
export function recordDailyActivity(
  addedCount: number,
  reviewCount: number,
  masteredCount: number,
  gameScore: number = 0
): void {
  const activities = getDailyActivities();
  const todayStr = getLocalDateString(new Date());

  const existing = activities[todayStr] || {
    date: todayStr,
    count: 0,
    reviewCount: 0,
    masteredCount: 0,
    gameScore: 0,
  };

  activities[todayStr] = {
    date: todayStr,
    count: existing.count + addedCount,
    reviewCount: existing.reviewCount + reviewCount,
    masteredCount: existing.masteredCount + masteredCount,
    gameScore: Math.max(existing.gameScore, gameScore),
  };

  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  checkAndUpdateBadges();
}

/** 生成近 365 天补全的打卡数据列表 (供 GitHub 热力图使用) */
export function get365DaysHeatmapData(): DailyActivity[] {
  const activities = getDailyActivities();
  const result: DailyActivity[] = [];

  const today = new Date();
  // 364 天以前
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364);

  // 调整为所在周的周日开始（与 GitHub 贡献图星期对齐一致）
  const dayOfWeek = startDate.getDay(); // 0 是周日
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const curr = new Date(startDate);
  while (curr <= today) {
    const dateStr = getLocalDateString(curr);
    if (activities[dateStr]) {
      result.push(activities[dateStr]);
    } else {
      result.push({
        date: dateStr,
        count: 0,
        reviewCount: 0,
        masteredCount: 0,
        gameScore: 0,
      });
    }
    curr.setDate(curr.getDate() + 1);
  }

  return result;
}

/** 计算连胜 Streak (当前连续打卡天数与历史最高) */
export function calculateStreaks(): { currentStreak: number; longestStreak: number } {
  const activities = getDailyActivities();
  const today = new Date();
  const todayStr = getLocalDateString(today);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // 检查今天或昨天是否有打卡
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const hasToday = activities[todayStr] && activities[todayStr].count > 0;
  const hasYesterday = activities[yesterdayStr] && activities[yesterdayStr].count > 0;

  if (!hasToday && !hasYesterday) {
    currentStreak = 0;
  } else {
    // 从今天或昨天往前倒推
    let checkDate = hasToday ? new Date(today) : new Date(yesterday);
    while (true) {
      const dStr = getLocalDateString(checkDate);
      if (activities[dStr] && activities[dStr].count > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // 计算历史最长 streak
  const dates = Object.keys(activities)
    .filter((d) => activities[d].count > 0)
    .sort();

  if (dates.length > 0) {
    tempStreak = 1;
    longestStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
}

/** 获取并更新勋章列表 */
export function getBadges(): Badge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BADGES);
    if (!raw) return INITIAL_BADGES;

    const savedBadges: Badge[] = JSON.parse(raw);
    // 合并初始勋章（防止新增加勋章缺失）
    return INITIAL_BADGES.map((b) => {
      const found = savedBadges.find((s) => s.id === b.id);
      return found ? { ...b, ...found } : b;
    });
  } catch (e) {
    return INITIAL_BADGES;
  }
}

/** 检查并自动解锁勋章 */
export function checkAndUpdateBadges(): Badge[] {
  const badges = getBadges();
  const records = getUserWordRecords();
  const activities = getDailyActivities();
  const { currentStreak } = calculateStreaks();

  const recordValues = Object.values(records);
  const totalMastered = recordValues.filter((r) => r.status === 'mastered').length;
  const totalReviewsCount = recordValues.reduce((acc, r) => acc + r.totalReviews, 0);

  let totalCorrect = 0;
  let totalReviewsSum = 0;
  recordValues.forEach((r) => {
    totalCorrect += r.correctReviews;
    totalReviewsSum += r.totalReviews;
  });
  const accuracy = totalReviewsSum > 0 ? Math.round((totalCorrect / totalReviewsSum) * 100) : 0;

  const maxGameScore = Math.max(0, ...Object.values(activities).map((a) => a.gameScore || 0));

  const updatedBadges = badges.map((badge) => {
    let progress = badge.progress;
    let unlocked = badge.unlocked;

    switch (badge.id) {
      case 'first_word':
        progress = recordValues.length > 0 ? 1 : 0;
        break;
      case 'streak_7':
        progress = Math.min(7, currentStreak);
        break;
      case 'streak_30':
        progress = Math.min(30, currentStreak);
        break;
      case 'master_50':
        progress = Math.min(50, totalMastered);
        break;
      case 'master_200':
        progress = Math.min(200, totalMastered);
        break;
      case 'game_combo_50':
        progress = Math.min(500, maxGameScore);
        break;
      case 'ebbinghaus_geek':
        progress = Math.min(100, totalReviewsCount);
        break;
      case 'legend_master':
        progress = totalReviewsSum >= 20 ? Math.min(85, accuracy) : 0;
        break;
    }

    if (!unlocked && progress >= badge.maxProgress) {
      unlocked = true;
    }

    return {
      ...badge,
      progress,
      unlocked,
      unlockedAt: unlocked && !badge.unlockedAt ? getLocalDateString() : badge.unlockedAt,
    };
  });

  localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(updatedBadges));
  return updatedBadges;
}

/** 获取总体统计指标 */
export function getStudyStats(): StudyStats {
  const records = getUserWordRecords();
  const activities = getDailyActivities();
  const { currentStreak, longestStreak } = calculateStreaks();

  const recordValues = Object.values(records);
  const totalLearned = recordValues.length;
  const totalMastered = recordValues.filter((r) => r.status === 'mastered').length;

  const todayStr = getLocalDateString(new Date());
  const todayLearned = activities[todayStr] ? activities[todayStr].count : 0;

  let totalCorrect = 0;
  let totalReviews = 0;
  recordValues.forEach((r) => {
    totalCorrect += r.correctReviews;
    totalReviews += r.totalReviews;
  });
  const accuracyRate = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 100;

  return {
    totalLearned,
    totalMastered,
    todayLearned,
    currentStreak,
    longestStreak,
    totalTimeMinutes: Math.round(totalLearned * 1.5),
    accuracyRate,
  };
}

/** 保存与获取当前选中的词库 ID */
export function getCurrentBookId(): string {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_BOOK) || 'cet4';
}

export function setCurrentBookId(bookId: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_BOOK, bookId);
}

/** 导出用户 JSON 数据备份 */
export function exportUserData(): string {
  const data = {
    version: '1.0',
    exportAt: new Date().toISOString(),
    records: getUserWordRecords(),
    activities: getDailyActivities(),
    badges: getBadges(),
  };
  return JSON.stringify(data, null, 2);
}

/** 一键快捷初始化/恢复打卡体验数据 (无需手动选择文件) */
export function loadDemoData(): void {
  const activities: Record<string, DailyActivity> = {};
  const records: Record<string, UserWordRecord> = {};

  const today = new Date();
  // 过去 14 天填充打卡数据
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);
    const count = 5 + Math.floor(Math.random() * 15);
    activities[dateStr] = {
      date: dateStr,
      count,
      reviewCount: Math.floor(count * 0.6),
      masteredCount: Math.floor(count * 0.4),
      gameScore: 350 + Math.floor(Math.random() * 200),
    };
  }

  // 示例掌握记录
  const demoWords = ['nebula', 'algorithm', 'horizon', 'cyberpunk', 'retention', 'luminous', 'resilience', 'velocity'];
  demoWords.forEach((wId) => {
    records[`cet4-00${demoWords.indexOf(wId) + 1}`] = {
      wordId: `cet4-00${demoWords.indexOf(wId) + 1}`,
      repetition: 5,
      interval: 21,
      easinessFactor: 2.5,
      nextReviewDate: getLocalDateString(new Date(Date.now() + 86400000 * 21)),
      lastReviewedDate: getLocalDateString(),
      status: 'mastered',
      totalReviews: 6,
      correctReviews: 6,
    };
  });

  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  checkAndUpdateBadges();
}

/** 导入用户 JSON 数据 */
export function importUserData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.records) localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(parsed.records));
    if (parsed.activities) localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(parsed.activities));
    if (parsed.badges) localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(parsed.badges));
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
}
