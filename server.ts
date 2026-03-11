import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('portfolio.db');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT
  );

  CREATE TABLE IF NOT EXISTS semesters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    year INTEGER,
    term TEXT,
    sort_order INTEGER
  );

  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    semester_id INTEGER,
    title TEXT,
    description TEXT,
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER,
    title TEXT,
    description TEXT,
    thumbnail TEXT,
    images TEXT, -- JSON array
    tools TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'published', -- 'draft' or 'published'
    is_featured BOOLEAN DEFAULT 0,
    FOREIGN KEY (class_id) REFERENCES classes(id)
  );

  CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Create default admin if not exists
const adminCount = db.prepare('SELECT count(*) as count FROM admins').get() as { count: number };
if (adminCount.count === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hash);
  console.log('Default admin created: admin / admin123');
}

// Set default site content
const contentCount = db.prepare('SELECT count(*) as count FROM site_content').get() as { count: number };
if (contentCount.count === 0) {
  db.prepare('INSERT INTO site_content (key, value) VALUES (?, ?)').run('home_intro', '안녕하세요, 디자인 아카이브 포트폴리오입니다.');
  db.prepare('INSERT INTO site_content (key, value) VALUES (?, ?)').run('about_bio', '저는 디자인과 개발을 공부하는 학생입니다.');
}

const app = express();
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.use('/uploads', express.static('uploads'));

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log(`[AUTH] Missing token for ${req.method} ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(`[AUTH] Invalid token for ${req.method} ${req.path}`);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- API Routes ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM admins WHERE username = ?').get(username) as any;
  if (user && bcrypt.compareSync(password, user.password_hash)) {
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Semesters
app.get(['/api/semesters', '/api/semesters/'], (req, res) => {
  const semesters = db.prepare('SELECT * FROM semesters ORDER BY year DESC, sort_order ASC').all();
  res.json(semesters);
});

app.post(['/api/semesters', '/api/semesters/'], authenticate, (req, res) => {
  const { title, year, term, sort_order } = req.body;
  const result = db.prepare('INSERT INTO semesters (title, year, term, sort_order) VALUES (?, ?, ?, ?)').run(title, year, term, sort_order);
  res.json({ id: result.lastInsertRowid });
});

app.put(['/api/semesters/:id', '/api/semesters/:id/'], authenticate, (req, res) => {
  const { title, year, term, sort_order } = req.body;
  db.prepare('UPDATE semesters SET title = ?, year = ?, term = ?, sort_order = ? WHERE id = ?').run(title, year, term, sort_order, req.params.id);
  res.json({ success: true });
});

app.delete(['/api/semesters/:id', '/api/semesters/:id/'], authenticate, (req, res) => {
  db.prepare('DELETE FROM semesters WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Classes
app.get(['/api/classes', '/api/classes/'], (req, res) => {
  const classes = db.prepare('SELECT * FROM classes').all();
  res.json(classes);
});

app.get(['/api/semesters/:id/classes', '/api/semesters/:id/classes/'], (req, res) => {
  const classes = db.prepare('SELECT * FROM classes WHERE semester_id = ?').all(req.params.id);
  res.json(classes);
});

app.post(['/api/classes', '/api/classes/'], authenticate, (req, res) => {
  const { semester_id, title, description } = req.body;
  const result = db.prepare('INSERT INTO classes (semester_id, title, description) VALUES (?, ?, ?)').run(semester_id, title, description);
  res.json({ id: result.lastInsertRowid });
});

app.put(['/api/classes/:id', '/api/classes/:id/'], authenticate, (req, res) => {
  const { semester_id, title, description } = req.body;
  db.prepare('UPDATE classes SET semester_id = ?, title = ?, description = ? WHERE id = ?').run(semester_id, title, description, req.params.id);
  res.json({ success: true });
});

app.delete(['/api/classes/:id', '/api/classes/:id/'], authenticate, (req, res) => {
  db.prepare('DELETE FROM classes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Assignments
app.get(['/api/assignments', '/api/assignments/'], (req, res) => {
  const { featured, status } = req.query;
  let query = 'SELECT * FROM assignments';
  const params = [];
  const conditions = [];
  
  if (featured) {
    conditions.push('is_featured = 1');
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY created_at DESC';
  const assignments = db.prepare(query).all(...params);
  res.json(assignments);
});

app.get(['/api/assignments/:id', '/api/assignments/:id/'], (req, res) => {
  const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
  res.json(assignment);
});

app.post(['/api/assignments', '/api/assignments/'], authenticate, (req, res) => {
  try {
    const { class_id, title, description, thumbnail, images, tools, status, is_featured } = req.body;
    const imagesJson = Array.isArray(images) ? JSON.stringify(images) : (typeof images === 'string' ? images : '[]');
    
    const result = db.prepare('INSERT INTO assignments (class_id, title, description, thumbnail, images, tools, status, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      class_id ? Number(class_id) : null, 
      title, 
      description, 
      thumbnail, 
      imagesJson, 
      tools, 
      status || 'published', 
      is_featured ? 1 : 0
    );
    res.json({ id: result.lastInsertRowid });
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put(['/api/assignments/:id', '/api/assignments/:id/'], authenticate, (req, res) => {
  try {
    const { class_id, title, description, thumbnail, images, tools, status, is_featured } = req.body;
    const imagesJson = Array.isArray(images) ? JSON.stringify(images) : (typeof images === 'string' ? images : '[]');

    db.prepare('UPDATE assignments SET class_id = ?, title = ?, description = ?, thumbnail = ?, images = ?, tools = ?, status = ?, is_featured = ? WHERE id = ?').run(
      class_id ? Number(class_id) : null, 
      title, 
      description, 
      thumbnail, 
      imagesJson, 
      tools, 
      status || 'published', 
      is_featured ? 1 : 0, 
      req.params.id
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete(['/api/assignments/:id', '/api/assignments/:id/'], authenticate, (req, res) => {
  db.prepare('DELETE FROM assignments WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Content
app.get(['/api/content', '/api/content/'], (req, res) => {
  const content = db.prepare('SELECT * FROM site_content').all();
  const result = content.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
  res.json(result);
});

app.post(['/api/content', '/api/content/'], authenticate, (req, res) => {
  const { key, value } = req.body;
  db.prepare('INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)').run(key, value);
  res.json({ success: true });
});

// File Upload
app.post(['/api/upload', '/api/upload/'], authenticate, upload.single('file'), (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// API 404 Handler - Catch any unmatched /api/* requests
// This MUST be defined before Vite middleware
app.all('/api/*', (req, res) => {
  console.log(`[API 404] ${req.method} ${req.originalUrl} - Not Found`);
  res.status(404).json({ 
    error: 'API route not found',
    method: req.method,
    path: req.originalUrl 
  });
});

// Global Error Handler for API
app.use('/api', (err: any, req: any, res: any, next: any) => {
  console.error('[API ERROR]', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
