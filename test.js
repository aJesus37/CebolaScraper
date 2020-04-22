#!/bin/env node
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function main() {
    const browser = await puppeteer.launch({
      /**
       * Use the default headless mode (don't show the browser).
       */
      headless: false,
      args: ['--proxy-server=socks5://127.0.0.1:9050']
    });
  
    const page = await browser.newPage();
  
    await page.goto('https://google.com');
  
    /**
     * Get page content as HTML.
     */
    const content = await page.content();
  
    /**
     * Load content in cheerio.
     */
    const $ = cheerio.load(content);
  
    browser.close();
    
    /**
     * Log the array of titles.
     */
    console.log(content);
  }
  
  main();