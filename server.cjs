const http = require('http');
const fs = require('fs');
const path = require('path');

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
  // CORS 头支持局域网全网访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
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

    // 1. 注册 API
    if (req.url === '/api/register' && req.method === 'POST') {
      const { username, password } = parsedBody;
      const cleanName = (username || '').trim().toLowerCase();
      if (!cleanName || cleanName.length < 3) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '用户名至少 3 个字符' }));
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

    // 2. 登录 API
    if (req.url === '/api/login' && req.method === 'POST') {
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

      // 获取该用户在服务端的最新同步数据
      const userSync = db.syncData[cleanName] || null;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: '登录成功！', user: { username: user.username, createdAt: user.createdAt }, syncData: userSync }));
      return;
    }

    // 3. 同步 API
    if (req.url === '/api/sync' && req.method === 'POST') {
      const { username, records, activities, badges } = parsedBody;
      const cleanName = (username || '').trim().toLowerCase();
      if (cleanName && db.users[cleanName]) {
        db.syncData[cleanName] = {
          records,
          activities,
          badges,
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
  console.log(`🌌 LexiVerse LAN Sync Server running on http://0.0.0.0:${PORT}`);
});
