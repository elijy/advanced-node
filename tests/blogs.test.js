const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  // Now all the browser and page init is wrapped in our custom Page class;
  page = await Page.build();
  await page.goto('http://localhost:3000'); // Navigation fam
})

afterEach(async () => {
  await page.close(); // Close the browser
})


describe('When logged in', async() => {
  // Only run before each test inside this describe
  beforeEach(async () => {
    await page.login() // Now this function is moved to the helper
    await page.click('a.btn-floating')
  })
  
  test('can see new blog form', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title')
  })
  
  // Nested describe statement
  describe('And using valid inputs', async() => {
    beforeEach(async () => {
      await page.type('.title input', 'My test title') // How you type in puppeteer
      await page.type('.content input', 'My test content')
      await page.click('form button') // Try and submit the form
    })
    
    test('submit leads to review screen', async () => {
      const title = await page.getContentsOf('h5');
      expect(title).toEqual('Please confirm your entries')
    })
    
    test('can see the blog post submitted', async () => {
      await page.click('button.green'); // Confirm the submission and submit
      await page.waitFor('.card'); // Make sure everything loads on the page after our submit
      const title = await page.getContentsOf('.card-title');
      expect(title).toEqual('My test title')
    })
    
  })
  
  // Nested describe statement
  describe('And using invalid inputs', async() => {
    beforeEach(async () => {
      await page.click('form button') // Try and submit the form
    })
    
    test('the form shows an error', async () => {
      const titleErr = await page.getContentsOf('.title .red-text');
      expect(titleErr).toEqual('You must provide a value')
    })
    
  })
})

describe('When user is not logged in', async() => {
  test('User can not make a blog post', async() => {
    // This evaluate function is a way to run things in the chromium console
    const result = await page.evaluate(
      () => {
        return fetch('/api/blogs', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: 'My Title',
            content: 'My content'
          })
        }).then(res => res.json()); // This is an ism of the fetch api
      }
    )
    expect(result).toEqual({error: 'You must log in!'})
  })
  test('User can not get a list of blog posts', async() => {
    // This evaluate function is a way to run things in the chromium console
    const result = await page.evaluate(
      () => {
        return fetch('/api/blogs', {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(res => res.json()); // This is an ism of the fetch api
      }
    )
    expect(result).toEqual({error: 'You must log in!'})
  })
})