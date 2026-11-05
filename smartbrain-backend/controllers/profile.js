const normalizeUser = require('./normalizeUser');

const handleProfileGet = (req, res, db) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id !== req.userId) {
    return res.status(403).json('forbidden');
  }

  db.select('*')
    .from('users')
    .where({ id })
    .then((user) => {
      if (user.length) {
        res.json(normalizeUser(user[0]));
      } else {
        res.status(404).json('not found');
      }
    })
    .catch(() => res.status(400).json('error getting user'));
};

module.exports = {
  handleProfileGet
};
