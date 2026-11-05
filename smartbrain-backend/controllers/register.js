const normalizeUser = require('./normalizeUser');
const { setAuthCookie } = require('./auth');
const { validateRegister } = require('./validate');

const column = (rows, name) => {
  if (!rows || !rows.length) return undefined;
  const row = rows[0];
  if (row && typeof row === 'object' && Object.prototype.hasOwnProperty.call(row, name)) {
    return row[name];
  }
  return row;
};

const handleRegister = (req, res, db, bcrypt) => {
  const parsed = validateRegister(req.body || {});
  if (parsed.error) {
    return res.status(400).json(parsed.error);
  }

  const { email, name, password } = parsed;
  const hash = bcrypt.hashSync(password, 12);

  db.transaction((trx) =>
    trx('login')
      .insert({ hash, email })
      .returning('email')
      .then((loginEmail) =>
        trx('users')
          .insert({
            email: column(loginEmail, 'email'),
            name,
            joined: new Date()
          })
          .returning('*')
      )
  )
    .then((user) => {
      if (!user || !user[0]) {
        return res.status(400).json('unable to register');
      }
      setAuthCookie(res, user[0].id);
      res.json(normalizeUser(user[0]));
    })
    .catch(() => res.status(400).json('unable to register'));
};

module.exports = {
  handleRegister
};
