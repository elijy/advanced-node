const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/sessionFactory');
const userFactory = require('./factories/userFactory');

let browser, page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false
  }) // How to launch a browser in puppeteer
  page = await browser.newPage(); // how to create a new tab

  await page.goto('localhost:3000'); // Navigation fam
})

afterEach(async () => {
  await browser.close(); // Close the browser
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

test('Logged in should show logout button', async () => {

  // =========== FAKING AUTH ===========
  const user = await userFactory();
  const {session, sig} = sessionFactory(user); // Pull out our session stuff from the factory

  // Finally set the fake cookies
  await page.setCookie({
    name: 'session',
    value: session
  })

  await page.setCookie({
    name: 'session.sig',
    value: sig
  })

  await page.goto('localhost:3000') // Finally just call a refresh because now the cookies are set you login
  // =========== FAKING AUTH ===========

  await page.waitFor('a[href="/auth/logout"]');
  const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);
  expect(text).toEqual('Logout')

})
