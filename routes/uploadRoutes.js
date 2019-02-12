const AWS = require('aws-sdk');
const uuid = require('uuid/v1');
const requireLogin = require('../middlewares/requireLogin');
const keys = require('../config/keys');

// Define s3 access
const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey
})

module.exports = app => {
  app.get('/api/upload', requireLogin, async (req, res) => {
    
    // The actual file name for s3
    const key = `${req.user.id}/${uuid()}.jpeg`;
    
    s3.getSignedUrl(
      'putObject',
      {
        Bucket: 'eli-blog-bucket',
        ContentType: 'image/jpeg',
        Key: key
      },
      (err, url) => {
        res.send({key, url})
      }
    )
  });

};
