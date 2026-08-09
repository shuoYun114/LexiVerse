import { UserAccount, SyncPayload, UserWordRecord, DailyActivity, Badge } from '../types';

const AUTH_KEYS = {
  CURRENT_USER: 'lexiverse_auth_user_v1',
  USERS_DB: 'lexiverse_users_db_v1',
  SYNC_PREFIX: 'lexiverse_user_sync_',
};

/** 获取当前局域网 API 服务器地址 (例如 http://192.168.48.156:3001) */
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

/** 注册账号 */
export async function registerAccount(username: string, password: string): Promise<{ success: boolean; message: string }> {
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

  try {
    // 优先尝试向局域网 3001 API 服务器注册
    const res = await fetch(`${getApiHost()}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanName, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      const userAccount: UserAccount = { username: cleanName, createdAt: new Date().toISOString() };
      setCurrentUser(userAccount);
      return { success: true, message: '🎉 局域网真账号注册成功并已自动登录！' };
    }
    return { success: false, message: data.message || '注册失败' };
  } catch (err) {
    // 平滑降级至 LocalStorage
    const db = getUsersDb();
    if (db[cleanName.toLowerCase()]) {
      return { success: false, message: '该用户名已被注册' };
    }
    db[cleanName.toLowerCase()] = {
      username: cleanName,
      passwordHash: btoa(password),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(AUTH_KEYS.USERS_DB, JSON.stringify(db));
    setCurrentUser({ username: cleanName, createdAt: new Date().toISOString() });
    return { success: true, message: '🎉 本地账号注册成功并已登录！' };
  }
}

/** 登录账号 */
export async function loginAccount(username: string, password: string): Promise<{ success: boolean; message: string }> {
  const cleanName = username.trim();

  try {
    // 优先向局域网 3001 API 服务器校验登录
    const res = await fetch(`${getApiHost()}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanName, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setCurrentUser(data.user);
      if (data.syncData) {
        // 如果服务器上有最新打卡数据，同步保存到浏览器并恢复
        if (data.syncData.records) localStorage.setItem('lexiverse_word_records_v1', JSON.stringify(data.syncData.records));
        if (data.syncData.activities) localStorage.setItem('lexiverse_daily_activities_v1', JSON.stringify(data.syncData.activities));
        if (data.syncData.badges) localStorage.setItem('lexiverse_badges_v1', JSON.stringify(data.syncData.badges));
      }
      return { success: true, message: `Welcome back, ${data.user.username}!` };
    }
    return { success: false, message: data.message || '登录失败' };
  } catch (err) {
    // 平滑降级至 LocalStorage
    const db = getUsersDb();
    const found = db[cleanName.toLowerCase()];
    if (!found) {
      return { success: false, message: '账号不存在，请先注册账号' };
    }
    if (found.passwordHash !== btoa(password)) {
      return { success: false, message: '密码错误' };
    }
    setCurrentUser({ username: found.username, createdAt: found.createdAt });
    loadUserSyncedData(found.username);
    return { success: true, message: `Welcome back, ${found.username}!` };
  }
}

/** 将当前学习进度保存到服务器与本地 */
export async function saveUserSyncedData(
  username: string,
  records: Record<string, UserWordRecord>,
  activities: Record<string, DailyActivity>,
  badges: Badge[]
): Promise<void> {
  if (!username) return;

  // 本地离线备份
  const payload: SyncPayload = {
    username,
    records,
    activities,
    badges,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(`${AUTH_KEYS.SYNC_PREFIX}${username.toLowerCase()}`, JSON.stringify(payload));

  // 向局域网 Server 同步
  try {
    await fetch(`${getApiHost()}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {}
}

function getUsersDb(): Record<string, { username: string; passwordHash: string; createdAt: string }> {
  try {
    const raw = localStorage.getItem(AUTH_KEYS.USERS_DB);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
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
