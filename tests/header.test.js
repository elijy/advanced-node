const puppeteer = require('puppeteer');

let browser, page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false
  }) // How to launch a browser in puppeteer
  page = await browser.newPage(); // how to create a new tab

  await page.goto('localhost:3000'); // Navigation fam
})

afterEach(async () => {
  // await browser.close(); // Close the browser
})

test('Check header text', async () => {
  const text = await page.$eval('a.brand-logo', el => el.innerHTML);
  expect(text).toEqual('Blogster');
})

test('Start login', async () => {
  await page.click('.right a');
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/)
})

test.only('Logged in should show logout button', async () => {

  // =========== FAKING AUTH ===========
  const id ='5c21207c602abe3f9d4e2fd2'; // Our user id from mongo

  const Buffer = require('safe-buffer').Buffer;
  // The format that our auth flow is looking for
  const sessionObject = {
    passport: {
      user: id
    }
  }
  // Then convert that object into base64
  const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString('base64');

  // Now generate a signature as well
  const Keygrip = require('keygrip');
  const keys = require('../config/keys'); // Here is where our secret key lives (Remember you need one to generate a signature)
  const keygrip = new Keygrip([keys.cookieKey]);
  const sig = keygrip.sign('session=' + sessionString);

  // Finally set the fake cookies
  await page.setCookie({
    name: 'session',
    value: sessionString
  })

  await page.setCookie({
    name: 'session.sig',
    value: sig
  })

  // =========== FAKING AUTH ===========
  await page.goto('localhost:3000')

})
