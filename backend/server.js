require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const Joi = require('joi');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'db.sqlite');
const USERS_FILE = path.join(__dirname, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'ibague_secret_2025';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';

// Open SQLite DB
const db = new sqlite3.Database(DB_FILE);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Simple CORS for local testing
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Serve frontend statically
const FRONT_DIR = path.join(__dirname, '..');
app.use('/', express.static(FRONT_DIR));

// Helpers
function loadUsers() {
  try {
    const txt = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(txt || '[]');
  } catch (e) {
    return [];
  }
}

// Basic auth middleware (supports env ADMIN_USER/ADMIN_PASS or users.json hashed passwords)
async function basicAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ error: 'Authentication required' });
  }
  const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString();
  const [user, pass] = credentials.split(':');
  // check env first
  if (process.env.ADMIN_USER === user && process.env.ADMIN_PASS === pass) {
    return next();
  }
  // check users.json (passwords are bcrypt hashes)
  const users = loadUsers();
  const found = users.find(u => u.username === user);
  if (!found) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(pass, found.password);
  if (!match) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  return next();
}

// JWT middleware
function jwtAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Validation schemas
const surveySchema = Joi.object({
  name: Joi.string().min(1).required(),
  age: Joi.number().integer().min(1).required(),
  gender: Joi.string().allow('').optional(),
  q1: Joi.string().allow('').optional(),
  q2: Joi.string().allow('').optional(),
  q3: Joi.string().allow('').optional(),
  q4: Joi.string().allow('').optional(),
  q5: Joi.string().allow('').optional(),
  answers: Joi.object().optional()
});

const userRegisterSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin','user').default('user')
});

// Ensure DB table exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS surveys (
    id TEXT PRIMARY KEY,
    name TEXT,
    age INTEGER,
    gender TEXT,
    q1 TEXT, q2 TEXT, q3 TEXT, q4 TEXT, q5 TEXT,
    createdAt TEXT
  )`);
});

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing username/password' });
  const users = loadUsers();
  const found = users.find(u => u.username === username);
  if (!found) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, found.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username: found.username, role: found.role || 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ token, expiresIn: JWT_EXPIRES });
});

// Admin-only register (protected by JWT with admin role)
app.post('/api/auth/register', jwtAuth, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Admin role required' });
  const { error, value } = userRegisterSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details.map(d=>d.message).join(', ') });
  const users = loadUsers();
  if (users.find(u => u.username === value.username)) return res.status(400).json({ error: 'Username exists' });
  const hash = await bcrypt.hash(value.password, 10);
  users.push({ username: value.username, password: hash, role: value.role });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  res.json({ success: true, username: value.username });
});

// Public: create survey
app.post('/api/survey', async (req, res) => {
  const body = req.body || {};
  const { error, value } = surveySchema.validate(body);
  if (error) return res.status(400).json({ error: error.details.map(d=>d.message).join(', ') });
  const id = String(Date.now());
  const answers = body.answers || {};
  const q1 = body.q1 || answers.q1 || '';
  const q2 = body.q2 || answers.q2 || '';
  const q3 = body.q3 || answers.q3 || '';
  const q4 = body.q4 || answers.q4 || '';
  const q5 = body.q5 || answers.q5 || '';
  const stmt = db.prepare(`INSERT INTO surveys (id,name,age,gender,q1,q2,q3,q4,q5,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  stmt.run(id, String(value.name), Number(value.age), value.gender || '', q1, q2, q3, q4, q5, new Date().toISOString(), function(err){
    if (err) {
      console.error('Insert error', err);
      return res.status(500).json({ error: 'DB error' });
    }
    res.json({ success: true, entry: { id, name: value.name, age: value.age, gender: value.gender, answers: {q1,q2,q3,q4,q5}, createdAt: new Date().toISOString() } });
  });
  stmt.finalize();
});

// Public: migration endpoint - accepts array of survey entries
app.post('/api/migrate', (req, res) => {
  const arr = req.body || [];
  if (!Array.isArray(arr)) return res.status(400).json({ error: 'Expected array' });
  const insert = db.prepare(`INSERT OR IGNORE INTO surveys (id,name,age,gender,q1,q2,q3,q4,q5,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  let count = 0;
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    for (const s of arr) {
      const id = String(s.id || s.createdAt || Date.now());
      const name = s.name || '';
      const age = Number(s.age || 0);
      const gender = s.gender || '';
      const q1 = s.q1 || (s.answers && s.answers.q1) || '';
      const q2 = s.q2 || (s.answers && s.answers.q2) || '';
      const q3 = s.q3 || (s.answers && s.answers.q3) || '';
      const q4 = s.q4 || (s.answers && s.answers.q4) || '';
      const q5 = s.q5 || (s.answers && s.answers.q5) || '';
      const createdAt = s.createdAt || new Date().toISOString();
      insert.run(id, name, age, gender, q1, q2, q3, q4, q5, createdAt);
      count++;
    }
    db.run('COMMIT', () => {
      insert.finalize();
      res.json({ imported: count });
    });
  });
});

// List surveys with pagination and optional search (public)
app.get('/api/surveys', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const page = Math.max(1, parseInt(req.query.page || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '50')));
  const offset = (page-1)*limit;
  let where = '';
  let params = [];
  if (q) {
    where = "WHERE lower(name) LIKE ? OR lower(gender) LIKE ? OR lower(q1||q2||q3||q4||q5) LIKE ?";
    params = ['%'+q+'%','%'+q+'%','%'+q+'%'];
  }
  db.serialize(() => {
    db.get(`SELECT COUNT(*) as cnt FROM surveys ${where}`, params, (err, row) => {
      const total = (row && row.cnt) || 0;
      db.all(`SELECT * FROM surveys ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`, params.concat([limit, offset]), (err2, rows) => {
        if (err2) return res.status(500).json({ error: 'DB error' });
        res.json({ total, page, limit, items: rows });
      });
    });
  });
});

// Admin: delete by id (supports basicAuth or JWT)
app.delete('/api/surveys/:id', (req, res, next) => {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) {
    return jwtAuth(req, res, () => {
      const id = req.params.id;
      db.run(`DELETE FROM surveys WHERE id = ?`, [id], function(err){
        if (err) return res.status(500).json({ error: 'DB error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
      });
    });
  } else {
    return basicAuth(req, res, () => {
      const id = req.params.id;
      db.run(`DELETE FROM surveys WHERE id = ?`, [id], function(err){
        if (err) return res.status(500).json({ error: 'DB error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
      });
    });
  }
});

// Admin: export CSV (jwt or basic)
app.get('/api/surveys/export', (req, res) => {
  const proceed = (userAuthDone) => {
    db.all(`SELECT * FROM surveys ORDER BY createdAt DESC`, [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      const header = ['id','name','age','gender','q1','q2','q3','q4','q5','createdAt'];
      res.setHeader('Content-Type','text/csv');
      res.setHeader('Content-Disposition','attachment; filename="surveys_export.csv"');
      const lines = [header.join(',')].concat(rows.map(r => header.map(h => '"'+String(r[h]||'').replace(/"/g,'""')+'"').join(',')));
      res.send(lines.join('\n'));
    });
  };
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return jwtAuth(req, res, () => proceed(true));
  return basicAuth(req, res, () => proceed(true));
});

// Admin health
app.get('/api/admin/health', (req, res) => {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return jwtAuth(req, res, () => res.json({ ok: true, time: new Date().toISOString() }));
  return basicAuth(req, res, () => res.json({ ok: true, time: new Date().toISOString() }));
});

app.listen(PORT, () => {
  console.log(`Ibagué Digital backend (SQLite + JWT + bcrypt) running on port ${PORT}`);
});
