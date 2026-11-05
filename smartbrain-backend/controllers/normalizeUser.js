const normalizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  entries: Number(user.entries) || 0,
  joined: user.joined
});

module.exports = normalizeUser;
