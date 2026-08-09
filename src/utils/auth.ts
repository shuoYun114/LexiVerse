import { UserAccount, SyncPayload, UserWordRecord, DailyActivity, Badge } from '../types';

const AUTH_KEYS = {
  CURRENT_USER: 'lexiverse_auth_user_v1',
  USERS_DB: 'lexiverse_users_db_v1',
  SYNC_PREFIX: 'lexiverse_user_sync_',
};

/** 局域网备用 3001 端口 API 地址 */
function getLocalApiHost(): string {
  if (typeof window === 'undefined') return 'http://localhost:3001';
  
  if (window.location.hostname.includes('github.io')) {
    const savedIp = localStorage.getItem('lexiverse_lan_ip');
    if (savedIp) {
      return `http://${savedIp.trim()}:3001`;
    }
  }
  
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

function getUsersDb(): Record<string, { username: string; passwordHash: string; createdAt: string }> {
  try {
    const raw = localStorage.getItem(AUTH_KEYS.USERS_DB);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/** 注册账号 (双写：本地 + 云端双通道) */
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

  const newUser = {
    username: cleanName,
    passwordHash: btoa(password),
    createdAt: new Date().toISOString(),
  };
  db[lowerName] = newUser;
  localStorage.setItem(AUTH_KEYS.USERS_DB, JSON.stringify(db));

  // 写入局域网备用 3001
  try {
    fetch(`${getLocalApiHost()}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanName, password }),
    }).catch(() => {});
  } catch (e) {}

  const userAccount: UserAccount = { username: cleanName, createdAt: newUser.createdAt };
  setCurrentUser(userAccount);

  return { success: true, message: '🎉 账号注册成功并已登录！' };
}

/** 登录账号 */
export async function loginAccount(username: string, _password: string): Promise<{ success: boolean; message: string }> {
  const cleanName = username.trim();
  if (!cleanName) {
    return { success: false, message: '请输入用户名' };
  }

  // 只要输入用户名，即许可登录
  const userAccount: UserAccount = { username: cleanName, createdAt: new Date().toISOString() };
  setCurrentUser(userAccount);

  // 登录时立即向云端与局域网抓取最新打卡记录
  await fetchUserSyncedData(cleanName);

  return { success: true, message: `Welcome back, ${cleanName}!` };
}

/** 从【局域网 API】拉取最新打卡记录 */
export async function fetchUserSyncedData(username: string): Promise<boolean> {
  if (!username) return false;
  let hasFetched = false;

  try {
    const res = await fetch(`${getLocalApiHost()}/api/sync?username=${encodeURIComponent(username)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.syncData) {
        applySyncDataToLocal(data.syncData);
        hasFetched = true;
      }
    }
  } catch (e) {}

  return hasFetched;
}

/** 智能应用并无损合并同步数据到本地，触发全局 UI 重绘广播 */
export function applySyncDataToLocal(syncData: any) {
  if (!syncData) return;
  try {
    let hasChanged = false;

    if (syncData.records) {
      const existing = localStorage.getItem('lexiverse_word_records_v1');
      const localRecords = existing ? JSON.parse(existing) : {};
      const mergedRecords = { ...localRecords, ...syncData.records };
      localStorage.setItem('lexiverse_word_records_v1', JSON.stringify(mergedRecords));
      hasChanged = true;
    }

    if (syncData.activities) {
      const existing = localStorage.getItem('lexiverse_daily_activities_v1');
      const localActivities: Record<string, DailyActivity> = existing ? JSON.parse(existing) : {};
      const remoteActivities: Record<string, DailyActivity> = syncData.activities;

      const mergedActivities = { ...localActivities };
      Object.keys(remoteActivities).forEach(dateKey => {
        const rAct = remoteActivities[dateKey];
        const lAct = mergedActivities[dateKey];
        if (!lAct) {
          mergedActivities[dateKey] = rAct;
        } else {
          mergedActivities[dateKey] = {
            date: dateKey,
            count: Math.max(lAct.count || 0, rAct.count || 0),
            reviewCount: Math.max(lAct.reviewCount || 0, rAct.reviewCount || 0),
            masteredCount: Math.max(lAct.masteredCount || 0, rAct.masteredCount || 0),
            gameScore: Math.max(lAct.gameScore || 0, rAct.gameScore || 0),
          };
        }
      });
      localStorage.setItem('lexiverse_daily_activities_v1', JSON.stringify(mergedActivities));
      hasChanged = true;
    }

    if (syncData.badges) {
      const existing = localStorage.getItem('lexiverse_badges_v1');
      const localBadges = existing ? JSON.parse(existing) : [];
      const badgeMap = new Map();
      [...localBadges, ...syncData.badges].forEach(b => badgeMap.set(b.id, b));
      localStorage.setItem('lexiverse_badges_v1', JSON.stringify(Array.from(badgeMap.values())));
      hasChanged = true;
    }

    // 触发 UI 重新计算打卡连胜与热力图
    if (hasChanged && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lexiverse_data_synced'));
    }
  } catch (e) {}
}

/** 推送本地进度到【局域网 API】 */
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

  try {
    fetch(`${getLocalApiHost()}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch (e) {}
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

/** 彻底重置清空远端服务端的该用户数据，防止自动合并恢复旧数据 */
export async function wipeUserSyncedData(username: string): Promise<void> {
  if (!username) return;
  
  localStorage.removeItem(`${AUTH_KEYS.SYNC_PREFIX}${username.toLowerCase()}`);
  
  try {
    fetch(`${getLocalApiHost()}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        isReset: true
      }),
      keepalive: true, // 确保即使页面马上 reload 也能发出去
    }).catch(() => {});
  } catch (e) {}
}
