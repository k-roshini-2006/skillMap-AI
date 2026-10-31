import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import path from 'path';

const usersDbPath = path.resolve('users.db');
const udb = new Database(usersDbPath);

udb.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    target_role TEXT DEFAULT 'Software Engineer',
    phone TEXT DEFAULT '',
    location TEXT DEFAULT '',
    created_at TEXT NOT NULL
  )
`);

export const register = async (req, res) => {
  try {
    const { name, email, password, targetRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = udb.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();
    const target = targetRole || 'Software Engineer';

    const info = udb.prepare(`
      INSERT INTO users (name, email, password_hash, role, target_role, phone, location, created_at)
      VALUES (?, ?, ?, 'user', ?, '', '', ?)
    `).run(name.trim(), cleanEmail, hashedPassword, target, createdAt);

    const userId = info.lastInsertRowid;
    const token = jwt.sign(
      { id: userId, email: cleanEmail, name, role: 'user' },
      process.env.JWT_SECRET || 'skillmap_ai_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: userId,
        name,
        email: cleanEmail,
        role: 'user',
        targetRole: target,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = udb.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || 'skillmap_ai_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetRole: user.target_role || 'Software Engineer',
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const getProfile = (req, res) => {
  const user = udb.prepare('SELECT id, name, email, role, target_role, phone, location FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    targetRole: user.target_role,
    phone: user.phone,
    location: user.location
  });
};