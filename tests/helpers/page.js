const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

// Let's wrap puppeteers Page class so we can add some custom functions
class CustomPage {
  // Static function
  static async build () {
    const browser = await puppeteer.launch({
        headless: false
      })
    const page = await browser.newPage();
    const customPage = new CustomPage(page);
    
    // So now basically when you call a function it will first look at customPage then page then browser to see if the method exists or not
    return new Proxy(customPage, {
      get: function(target, property) {
        return customPage[property] || browser[property] || page[property]
      }
    })
  }
  
  constructor(page) {
    this.page = page;
  }
  
  // Extract our login functionionality
  async login (page) {
    // =========== FAKING AUTH ===========
    const user = await userFactory();
    const {session, sig} = sessionFactory(user); // Pull out our session stuff from the factory

    // Finally set the fake cookies
    await this.page.setCookie({
      name: 'session',
      value: session
    })

    await this.page.setCookie({
      name: 'session.sig',
      value: sig
    })

    await this.page.goto('localhost:3000/blogs') // Finally just call a refresh because now the cookies are set you login
    await this.page.waitFor('a[href="/auth/logout"]');
  }
  
  // Making $eval easier to use
  async getContentsOf(selector) {
    return await this.page.$eval(selector, el => el.innerHTML);
  }
}

module.exports = CustomPage;