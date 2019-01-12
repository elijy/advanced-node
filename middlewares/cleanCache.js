const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
  await next(); // This is a great way of saying hey do the route handler first THEN run this middleware
  // Clear the cache once you added a new blog
  clearHash(req.user.id);
}
