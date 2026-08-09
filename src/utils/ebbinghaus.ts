import { UserWordRecord, WordStatus } from '../types';

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * SuperMemo 2 (SM-2) 算法计算
 * @param existingRecord 现有记录（若为新词可为 undefined）
 * @param quality 评分 0-5
 * @returns 更新后的 UserWordRecord 记录
 */
export function calculateSM2(
  wordId: string,
  existingRecord: UserWordRecord | undefined,
  quality: number // 0-5
): UserWordRecord {
  const now = new Date();
  const todayStr = getLocalDateString(now);

  let repetition = existingRecord ? existingRecord.repetition : 0;
  let interval = existingRecord ? existingRecord.interval : 0;
  let ef = existingRecord ? existingRecord.easinessFactor : 2.5;
  const totalReviews = (existingRecord ? existingRecord.totalReviews : 0) + 1;
  const isCorrect = quality >= 3;
  const correctReviews = (existingRecord ? existingRecord.correctReviews : 0) + (isCorrect ? 1 : 0);

  // 计算新的 EF
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ef < 1.3) ef = 1.3;

  // 计算新的间隔 days 与 repetition
  if (quality >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  // 推导下一次复习时间
  const nextDate = new Date();
  nextDate.setDate(now.getDate() + interval);
  const nextReviewDateStr = getLocalDateString(nextDate);

  // 计算词汇状态
  let status: WordStatus = 'reviewing';
  if (repetition >= 5 || interval >= 21) {
    status = 'mastered';
  } else if (repetition === 0 && !isCorrect) {
    status = 'reviewing';
  }

  return {
    wordId,
    repetition,
    interval,
    easinessFactor: Number(ef.toFixed(2)),
    nextReviewDate: nextReviewDateStr,
    lastReviewedDate: todayStr,
    status,
    totalReviews,
    correctReviews,
  };
}

/**
 * 计算艾宾浩斯理论记忆留存率 (%)
 * 基于时间 t (天数) 预测记忆保留百分比
 * R(t) = 100 * e^(-0.28 * t^0.45)
 */
export function calculateTheoreticalRetention(daysPast: number): number {
  if (daysPast <= 0) return 100;
  const retention = 100 * Math.exp(-0.28 * Math.pow(daysPast, 0.45));
  return Math.max(15, Math.min(100, Math.round(retention)));
}

/**
 * 格式化距离下次复习的相对时间描述
 */
export function formatNextReviewLabel(intervalDays: number): string {
  if (intervalDays <= 1) return '明天复习';
  if (intervalDays < 7) return `${intervalDays} 天后复习`;
  if (intervalDays < 30) return `${Math.round(intervalDays / 7)} 周后复习`;
  return `${Math.round(intervalDays / 30)} 个月后复习`;
}
