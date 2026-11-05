const crypto = require('crypto');
const normalizeUser = require('./normalizeUser');
const { setAuthCookie } = require('./auth');
const { validateSignin } = require('./validate');

const DUMMY_HASH = require('bcryptjs').hashSync(crypto.randomBytes(16).toString('hex'), 12);

const handleSignin = (req, res, db, bcrypt) => {
  const parsed = validateSignin(req.body || {});
  if (parsed.error) {
    return res.status(400).json(parsed.error);
  }

  const { email, password } = parsed;

  db.select('email', 'hash')
    .from('login')
    .whereRaw('lower(email) = ?', [email])
    .then((data) => {
      const hash = data.length ? data[0].hash : DUMMY_HASH;
      let isValid = false;
      try {
        isValid = bcrypt.compareSync(password, hash);
      } catch (err) {
        isValid = false;
      }
      if (!data.length || !isValid) {
        return res.status(400).json('wrong credentials');
      }
      return db.select('*')
        .from('users')
        .whereRaw('lower(email) = ?', [email])
        .then((user) => {
          if (!user.length) {
            return res.status(400).json('wrong credentials');
          }
          setAuthCookie(res, user[0].id);
          res.json(normalizeUser(user[0]));
        });
    })
    .catch(() => res.status(400).json('wrong credentials'));
};

module.exports = {
  handleSignin
};
