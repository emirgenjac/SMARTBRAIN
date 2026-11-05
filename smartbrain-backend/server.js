require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const { requireAuth, clearAuthCookie } = require('./controllers/auth');

const production = process.env.NODE_ENV === 'production';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be set to a random string of at least 32 characters');
  process.exit(1);
}

if (production && process.env.JWT_SECRET === 'replace-with-a-long-random-string') {
  console.error('Set JWT_SECRET to a new random string before starting in production');
  process.exit(1);
}

const PORT = process.env.PORT || 3030;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || (production ? '' : 'http://localhost:3000');

if (production && !CLIENT_ORIGIN.startsWith('https://')) {
  console.error('CLIENT_ORIGIN must be the https address of the site');
  process.exit(1);
}

const databaseConnection = () => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    };
  }

  if (production) {
    console.error('DATABASE_URL must be set in production');
    process.exit(1);
  }

  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5433,
    user: process.env.DB_USER || 'smartbrain',
    password: process.env.DB_PASSWORD || 'smartbrain',
    database: process.env.DB_NAME || 'smartbrain'
  };
};

const db = knex({
  client: 'pg',
  connection: databaseConnection()
});

const app = express();
app.set('trust proxy', 1);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'too many attempts'
});
const proxyLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'too many image requests'
});

app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false
}));
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true
}));

app.get('/', (req, res) => {
  res.json('smartbrain api is running');
});

app.post('/signin', authLimiter, (req, res) => { signin.handleSignin(req, res, db, bcrypt); });
app.post('/register', authLimiter, (req, res) => { register.handleRegister(req, res, db, bcrypt); });
app.post('/signout', (req, res) => {
  clearAuthCookie(res);
  res.json('signed out');
});
app.get('/profile/:id', requireAuth, (req, res) => { profile.handleProfileGet(req, res, db); });
app.put('/image', requireAuth, (req, res) => { image.handleImage(req, res, db); });
app.get('/image-proxy', requireAuth, proxyLimiter, (req, res) => { image.handleImageProxy(req, res); });

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json('invalid request');
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json('request too large');
  }
  return res.status(500).json('server error');
});

db.raw('select 1')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`app is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('database connection failed:', err.message);
    process.exit(1);
  });
