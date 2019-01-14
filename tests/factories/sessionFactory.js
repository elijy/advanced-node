const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys'); // Here is where our secret key lives (Remember you need one to generate a signature)
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {
  // The format that our auth flow is looking for
  const sessionObject = {
    passport: {
      user: user._id.toString() // This is because of mongoose objects
    }
  }
  // Then convert that object into base64
  const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');

  // Now generate a signature as well
  const sig = keygrip.sign('session=' + session);

  // Export it
  return { session, sig }

}
