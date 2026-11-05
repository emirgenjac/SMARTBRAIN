const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'token';
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: TWELVE_HOURS_MS
});

const signToken = (userId) => jwt.sign(
  { sub: String(userId) },
  process.env.JWT_SECRET,
  { expiresIn: '12h' }
);

const setAuthCookie = (res, userId) => {
  res.cookie(COOKIE_NAME, signToken(userId), cookieOptions());
};

const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
};

const requireAuth = (req, res, next) => {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json('unauthorized');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json('unauthorized');
    }
    req.userId = userId;
    return next();
  } catch (err) {
    return res.status(401).json('unauthorized');
  }
};

module.exports = {
  setAuthCookie,
  clearAuthCookie,
  requireAuth
};
