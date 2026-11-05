const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (value) => (
  typeof value === 'string' ? value.trim().toLowerCase() : ''
);

const validateRegister = ({ email, name, password }) => {
  const cleanEmail = normalizeEmail(email);
  const cleanName = typeof name === 'string' ? name.trim() : '';

  if (!cleanName || cleanName.length > 100 || /[\u0000-\u001F]/.test(cleanName)) {
    return { error: 'Name must be 1-100 characters.' };
  }
  if (!EMAIL.test(cleanEmail) || cleanEmail.length > 254) {
    return { error: 'Enter a valid email.' };
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return { error: 'Password must be 8-72 characters.' };
  }

  return { email: cleanEmail, name: cleanName, password };
};

const validateSignin = ({ email, password }) => {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail || typeof password !== 'string' || !password || password.length > 72) {
    return { error: 'incorrect form submission' };
  }
  return { email: cleanEmail, password };
};

module.exports = {
  validateRegister,
  validateSignin
};
