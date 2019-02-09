const puppeteer = require('puppeteer');
const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  // Now all the browser and page init is wrapped in our custom Page class;
  page = await Page.build();
  await page.goto('https://localhost:3000'); // Navigation fam
})

afterEach(async () => {
  await page.close(); // Close the browser
})

test('Check header text', async () => {
  const text = await page.getContentsOf('a.brand-logo');
  expect(text).toEqual('Blogster');
})

test('Start login', async () => {
  await page.click('.right a');
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/)
})

test('Logged in should show logout button', async () => {
  await page.login() // Now this function is moved to the helper
  const text = await page.getContentsOf('a[href="/auth/logout"]');
  expect(text).toEqual('Logout')

})
