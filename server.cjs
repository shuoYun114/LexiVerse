const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3001;
const DB_FILE = path.join(__dirname, 'server_db.json');

// 初始化数据库文件
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: {}, syncData: {} }, null, 2));
}

function readDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { users: {}, syncData: {} };
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 1. GET /api/sync 拉取远端最新合并数据
  if (pathname === '/api/sync' && req.method === 'GET') {
    const username = (parsedUrl.query.username || '').toString().trim().toLowerCase();
    const db = readDb();
    const userSync = db.syncData[username] || null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, syncData: userSync }));
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    let parsedBody = {};
    try {
      if (body) parsedBody = JSON.parse(body);
    } catch (e) {}

    const db = readDb();

    // 2. 注册 API
    if (pathname === '/api/register' && req.method === 'POST') {
      const { username, password } = parsedBody;
      const cleanName = (username || '').trim().toLowerCase();
      if (!cleanName || cleanName.length < 2) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '用户名至少 2 个字符' }));
        return;
      }
      if (db.users[cleanName]) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '该用户名已被注册' }));
        return;
      }

      db.users[cleanName] = {
        username: (username || '').trim(),
        passwordHash: Buffer.from(password || '').toString('base64'),
        createdAt: new Date().toISOString(),
      };
      writeDb(db);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: '注册成功！' }));
      return;
    }

    // 3. 登录 API
    if (pathname === '/api/login' && req.method === 'POST') {
      const { username, password } = parsedBody;
      const cleanName = (username || '').trim().toLowerCase();
      const user = db.users[cleanName];

      if (!user) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '账号不存在，请检查用户名' }));
        return;
      }

      if (user.passwordHash !== Buffer.from(password || '').toString('base64')) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '密码错误' }));
        return;
      }

      const userSync = db.syncData[cleanName] || null;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: '登录成功！', user: { username: user.username, createdAt: user.createdAt }, syncData: userSync }));
      return;
    }

    // 4. POST /api/sync 智能并发合并 (Smart Merge - 只打卡累加不覆盖)
    if (pathname === '/api/sync' && req.method === 'POST') {
      const { username, records, activities, badges } = parsedBody;
      const cleanName = (username || '').trim().toLowerCase();
      if (cleanName) {
        const existingSync = db.syncData[cleanName] || { records: {}, activities: {}, badges: [] };
        
        // 智能合并背词记录 (以最新评分为准)
        const mergedRecords = { ...existingSync.records, ...(records || {}) };

        // 智能合并每日打卡 (取最大打卡次数与最大学习单词数)
        const mergedActivities = { ...existingSync.activities };
        if (activities) {
          Object.keys(activities).forEach(dateKey => {
            const newAct = activities[dateKey];
            const oldAct = mergedActivities[dateKey];
            if (!oldAct) {
              mergedActivities[dateKey] = newAct;
            } else {
              mergedActivities[dateKey] = {
                date: dateKey,
                count: Math.max(oldAct.count || 0, newAct.count || 0),
                reviewCount: Math.max(oldAct.reviewCount || 0, newAct.reviewCount || 0),
                masteredCount: Math.max(oldAct.masteredCount || 0, newAct.masteredCount || 0),
                gameScore: Math.max(oldAct.gameScore || 0, newAct.gameScore || 0),
              };
            }
          });
        }

        db.syncData[cleanName] = {
          records: mergedRecords,
          activities: mergedActivities,
          badges: Array.from(new Set([...(existingSync.badges || []), ...(badges || [])])),
          updatedAt: new Date().toISOString(),
        };
        writeDb(db);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌌 LexiVerse Smart Merge Sync Server running on http://0.0.0.0:${PORT}`);
});
