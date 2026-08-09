import { UserAccount, SyncPayload, UserWordRecord, DailyActivity, Badge } from '../types';

const AUTH_KEYS = {
  CURRENT_USER: 'lexiverse_auth_user_v1',
  USERS_DB: 'lexiverse_users_db_v1',
  SYNC_PREFIX: 'lexiverse_user_sync_',
};

/** 获取当前局域网 API 服务器地址 (动态适应 192.168.x.x 或 localhost) */
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

/** 注册账号 */
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

  const newUser = {
    username: cleanName,
    passwordHash: btoa(password),
    createdAt: new Date().toISOString(),
  };
  db[lowerName] = newUser;
  localStorage.setItem(AUTH_KEYS.USERS_DB, JSON.stringify(db));

  if (!isDemoEnv()) {
    try {
      await fetch(`${getApiHost()}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanName, password }),
      });
    } catch (e) {}
  }

  const userAccount: UserAccount = { username: cleanName, createdAt: newUser.createdAt };
  setCurrentUser(userAccount);

  return { success: true, message: '🎉 账号注册成功并已自动登录！' };
}

/** 登录账号 */
export async function loginAccount(username: string, password: string): Promise<{ success: boolean; message: string }> {
  const cleanName = username.trim();
  if (!cleanName) {
    return { success: false, message: '请输入用户名' };
  }

  const lowerName = cleanName.toLowerCase();
  const db = getUsersDb();
  let foundUser = db[lowerName];

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
          applySyncDataToLocal(data.syncData);
        }
        db[lowerName] = { username: data.user.username, passwordHash: btoa(password), createdAt: data.user.createdAt };
        localStorage.setItem(AUTH_KEYS.USERS_DB, JSON.stringify(db));
        return { success: true, message: `Welcome back, ${data.user.username}!` };
      }
    } catch (e) {}
  }

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

/** 从远端局域网 API 服务器拉取该账号最新进度并合并到本地 */
export async function fetchUserSyncedData(username: string): Promise<boolean> {
  if (!username || isDemoEnv()) return false;
  try {
    const res = await fetch(`${getApiHost()}/api/sync?username=${encodeURIComponent(username)}`);
    if (!res.ok) return false;
    const data = await res.json();
    if (data.success && data.syncData) {
      applySyncDataToLocal(data.syncData);
      return true;
    }
  } catch (e) {}
  return false;
}

/** 应用远端同步数据到本地 */
function applySyncDataToLocal(syncData: any) {
  if (!syncData) return;
  try {
    if (syncData.records) {
      const existing = localStorage.getItem('lexiverse_word_records_v1');
      const localRecords = existing ? JSON.parse(existing) : {};
      const mergedRecords = { ...localRecords, ...syncData.records };
      localStorage.setItem('lexiverse_word_records_v1', JSON.stringify(mergedRecords));
    }
    if (syncData.activities) {
      const existing = localStorage.getItem('lexiverse_daily_activities_v1');
      const localActivities = existing ? JSON.parse(existing) : {};
      const mergedActivities = { ...localActivities, ...syncData.activities };
      localStorage.setItem('lexiverse_daily_activities_v1', JSON.stringify(mergedActivities));
    }
    if (syncData.badges) {
      localStorage.setItem('lexiverse_badges_v1', JSON.stringify(syncData.badges));
    }
  } catch (e) {}
}

/** 推送本地进度到远端服务器与本地备份 */
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
    applySyncDataToLocal(payload);
    return true;
  } catch (e) {
    return false;
  }
}
