export type BookCategory =
  | 'bnu_compulsory1'
  | 'pep_senior_compulsory1'
  | 'pep_senior_compulsory2'
  | 'fltrp_senior_compulsory1'
  | 'pep_junior_7a'
  | 'pep_junior_8a'
  | 'pep_junior_9'
  | 'cet4'
  | 'cet6'
  | 'ielts'
  | 'dev_english'
  | 'spanish_beginner'
  | string;

export type WordStatus = 'new' | 'reviewing' | 'mastered';

export interface CustomWordBook {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: string;
  words: Word[];
}

export interface Word {
  id: string;
  word: string;
  phonetic: string;
  definition: string;
  translation: string;
  example: string;
  exampleTranslation: string;
  tags?: string[];
  difficulty?: number; // 1-5
}

export interface UserWordRecord {
  wordId: string;
  repetition: number;        // 连续答对次数 n
  interval: number;          // 当前间隔天数 I
  easinessFactor: number;    // 简易度因子 EF (初始 2.5)
  nextReviewDate: string;    // YYYY-MM-DD
  lastReviewedDate?: string; // YYYY-MM-DD
  status: WordStatus;
  totalReviews: number;
  correctReviews: number;
}

export interface DailyActivity {
  date: string;              // YYYY-MM-DD
  count: number;             // 当天学习/复习总词数
  reviewCount: number;       // 复习词数
  masteredCount: number;     // 掌握新词数
  gameScore: number;         // 赛博打字游戏得分
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;              // Emoji 或 Lucide 图标标识
  category: 'learning' | 'streak' | 'game' | 'mastery';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export type ActiveTab = 'nebula' | 'flashcards' | 'heatmap' | 'game' | 'wordbook';

export interface UserAccount {
  username: string;
  createdAt: string;
}

export interface SyncPayload {
  username: string;
  records: Record<string, UserWordRecord>;
  activities: Record<string, DailyActivity>;
  badges: Badge[];
  updatedAt: string;
}

export interface StudyStats {
  totalLearned: number;
  totalMastered: number;
  todayLearned: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeMinutes: number;
  accuracyRate: number;
}
