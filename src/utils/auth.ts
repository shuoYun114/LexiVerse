import { UserAccount, SyncPayload, UserWordRecord, DailyActivity, Badge } from '../types';

const AUTH_KEYS = {
  CURRENT_USER: 'lexiverse_auth_user_v1',
  USERS_DB: 'lexiverse_users_db_v1',
  SYNC_PREFIX: 'lexiverse_user_sync_',
};

/** 判断当前是否运行在 GitHub Pages 演示 Demo 环境 */
export function isDemoEnv(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('github.io');
}

/** 获取当前登录的账号信息 */
export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(AUTH_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/** 设置或退出当前登录账号 */
export function setCurrentUser(user: UserAccount | null): void {
  if (user) {
    localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEYS.CURRENT_USER);
  }
}

/** 获取所有本地注册账号库 (用于跨设备/本地模拟存储) */
function getUsersDb(): Record<string, { username: string; passwordHash: string; createdAt: string }> {
  try {
    const raw = localStorage.getItem(AUTH_KEYS.USERS_DB);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/** 注册本地账号 (Demo 环境拦截禁止) */
export function registerAccount(username: string, password: string): { success: boolean; message: string } {
  if (isDemoEnv()) {
    return {
      success: false,
      message: '🚫 GitHub Pages 演示环境为 Demo 体验线，禁止注册账号！请按照 README 在本地/局域网环境运行以解锁全功能账号系统。',
    };
  }

  const cleanName = username.trim();
  if (!cleanName || cleanName.length < 3) {
    return { success: false, message: '用户名至少需要 3 个字符' };
  }

  if (!password || password.length < 4) {
    return { success: false, message: '密码至少需要 4 位字符' };
  }

  const db = getUsersDb();
  if (db[cleanName.toLowerCase()]) {
    return { success: false, message: '该用户名已被注册' };
  }

  db[cleanName.toLowerCase()] = {
    username: cleanName,
    passwordHash: btoa(password), // 简单的安全编码
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(AUTH_KEYS.USERS_DB, JSON.stringify(db));

  // 自动登录
  const userAccount: UserAccount = { username: cleanName, createdAt: new Date().toISOString() };
  setCurrentUser(userAccount);

  return { success: true, message: '🎉 注册成功并已自动登录！' };
}

/** 登录账号 */
export function loginAccount(username: string, password: string): { success: boolean; message: string } {
  const cleanName = username.trim().toLowerCase();
  const db = getUsersDb();
  const found = db[cleanName];

  if (!found) {
    return { success: false, message: '账号不存在，请检查用户名' };
  }

  if (found.passwordHash !== btoa(password)) {
    return { success: false, message: '密码错误' };
  }

  const userAccount: UserAccount = { username: found.username, createdAt: found.createdAt };
  setCurrentUser(userAccount);

  // 加载该账号的专用数据同步包
  loadUserSyncedData(found.username);

  return { success: true, message: `Welcome back, ${found.username}!` };
}

/** 将当前学习进度保存到该账号的专用同步域 */
export function saveUserSyncedData(
  username: string,
  records: Record<string, UserWordRecord>,
  activities: Record<string, DailyActivity>,
  badges: Badge[]
): void {
  if (!username) return;
  const payload: SyncPayload = {
    username,
    records,
    activities,
    badges,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(`${AUTH_KEYS.SYNC_PREFIX}${username.toLowerCase()}`, JSON.stringify(payload));
}

/** 加载该账号的进度并覆写为当前会话进度 */
export function loadUserSyncedData(username: string): boolean {
  if (!username) return false;
  try {
    const raw = localStorage.getItem(`${AUTH_KEYS.SYNC_PREFIX}${username.toLowerCase()}`);
    if (!raw) return false;
    const payload: SyncPayload = JSON.parse(raw);
    if (payload.records) localStorage.setItem('lexiverse_word_records_v1', JSON.stringify(payload.records));
    if (payload.activities) localStorage.setItem('lexiverse_daily_activities_v1', JSON.stringify(payload.activities));
    if (payload.badges) localStorage.setItem('lexiverse_badges_v1', JSON.stringify(payload.badges));
    return true;
  } catch (e) {
    return false;
  }
}
