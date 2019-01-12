const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {

    const redis = require('redis')
    const redisUrl = 'redis://127.0.0.1:6379'
    const client = redis.createClient(redisUrl)
    const util = require('util')

    // Used to promisify callback functions
    client.get = util.promisify(client.get)

    // Step 1. is check the cache
    const cachedBlog = await client.get(req.user.id)

    // It was in the cache
    if (cachedBlog) {
      console.log('GOT FROM THE CACHE...')
      return res.send(JSON.parse(cachedBlog))
    }

    // IF not in the cache then call the db
    const blogs = await Blog.find({ _user: req.user.id });
    console.log('NOT IN CACHE...')
    // Send it back to the thing
    res.send(blogs);

    // Set the value in the cache
    client.set(req.user.id, JSON.stringify(blogs))

  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
