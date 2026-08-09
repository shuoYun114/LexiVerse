import { UserAccount, SyncPayload, UserWordRecord, DailyActivity, Badge } from '../types';

const AUTH_KEYS = {
  CURRENT_USER: 'lexiverse_auth_user_v1',
  USERS_DB: 'lexiverse_users_db_v1',
  SYNC_PREFIX: 'lexiverse_user_sync_',
};

/** 获取当前局域网 API 服务器地址 */
function getApiHost(): string {
  if (typeof window === 'undefined') return 'http://localhost:3001';
  const hostname = window.location.hostname;
  return `http://${hostname}:3001`;
}

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

/** 获取本地账号数据库 */
function getUsersDb(): Record<string, { username: string; passwordHash: string; createdAt: string }> {
  try {
    const raw = localStorage.getItem(AUTH_KEYS.USERS_DB);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/** 注册账号 (双写机制：本地 LocalStorage + 局域网 3001 API) */
export async function registerAccount(username: string, password: string): Promise<{ success: boolean; message: string }> {
  const cleanName = username.trim();
  if (!cleanName || cleanName.length < 2) {
    return { success: false, message: '用户名至少需要 2 个字符' };
  }

  if (!password || password.length < 3) {
    return { success: false, message: '密码至少需要 3 位字符' };
  }

  const lowerName = cleanName.toLowerCase();
  const db = getUsersDb();

  if (db[lowerName]) {
    return { success: false, message: '该用户名已被注册，请直接登录' };
  }

  // 1. 先写入本地 LocalStorage，保障本地与手机端 100% 账号存在
  const newUser = {
    username: cleanName,
    passwordHash: btoa(password),
    createdAt: new Date().toISOString(),
  };
  db[lowerName] = newUser;
  localStorage.setItem(AUTH_KEYS.USERS_DB, JSON.stringify(db));

  // 2. 尝试向局域网 3001 端口服务同步注册
  if (!isDemoEnv()) {
    try {
      await fetch(`${getApiHost()}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanName, password }),
      });
    } catch (e) {
      // 忽略 3001 失败，依赖本地存根
    }
  }

  // 自动登录
  const userAccount: UserAccount = { username: cleanName, createdAt: newUser.createdAt };
  setCurrentUser(userAccount);

  return { success: true, message: '🎉 账号注册成功并已自动登录！' };
}

/** 登录账号 (多重校验与备份恢复) */
export async function loginAccount(username: string, password: string): Promise<{ success: boolean; message: string }> {
  const cleanName = username.trim();
  if (!cleanName) {
    return { success: false, message: '请输入用户名' };
  }

  const lowerName = cleanName.toLowerCase();
  const db = getUsersDb();
  let foundUser = db[lowerName];

  // 1. 尝试从局域网 3001 API 获取最新账号与数据
  if (!isDemoEnv()) {
    try {
      const res = await fetch(`${getApiHost()}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanName, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        if (data.syncData) {
          if (data.syncData.records) localStorage.setItem('lexiverse_word_records_v1', JSON.stringify(data.syncData.records));
          if (data.syncData.activities) localStorage.setItem('lexiverse_daily_activities_v1', JSON.stringify(data.syncData.activities));
          if (data.syncData.badges) localStorage.setItem('lexiverse_badges_v1', JSON.stringify(data.syncData.badges));
        }
        // 反向写入本地数据库补全存根
        db[lowerName] = { username: data.user.username, passwordHash: btoa(password), createdAt: data.user.createdAt };
        localStorage.setItem(AUTH_KEYS.USERS_DB, JSON.stringify(db));
        return { success: true, message: `Welcome back, ${data.user.username}!` };
      }
    } catch (e) {
      // 忽略 API 报错，走下面的 LocalStorage 兜底
    }
  }

  // 2. 本地数据库兜底校验
  if (!foundUser) {
    return { success: false, message: '账号不存在，请先点击【注册账号】' };
  }

  if (foundUser.passwordHash !== btoa(password)) {
    return { success: false, message: '密码错误，请重新输入' };
  }

  const userAccount: UserAccount = { username: foundUser.username, createdAt: foundUser.createdAt };
  setCurrentUser(userAccount);
  loadUserSyncedData(foundUser.username);

  return { success: true, message: `Welcome back, ${foundUser.username}!` };
}

/** 保存当前数据 */
export async function saveUserSyncedData(
  username: string,
  records: Record<string, UserWordRecord>,
  activities: Record<string, DailyActivity>,
  badges: Badge[]
): Promise<void> {
  if (!username) return;

  const payload: SyncPayload = {
    username,
    records,
    activities,
    badges,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(`${AUTH_KEYS.SYNC_PREFIX}${username.toLowerCase()}`, JSON.stringify(payload));

  if (!isDemoEnv()) {
    try {
      await fetch(`${getApiHost()}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {}
  }
}

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
