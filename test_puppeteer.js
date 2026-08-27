const puppeteer = require('puppeteer');
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('file:///b:/code/sih-claude/index.html');
  
  await wait(1000);
  
  console.log("Clicking 'Launch Demo'");
  await page.evaluate(() => launchDemo());
  await wait(500);
  
  console.log("Clicking 'Sign in as Citizen'");
  await page.evaluate(() => openApp('citizen', 'c-overview'));
  await wait(500);
  
  console.log("Going to schemes view");
  await page.evaluate(() => nav('c-schemes'));
  await wait(500);

  console.log("Clicking 'Check My Eligibility'");
  await page.evaluate(() => runEligibility());
  
  console.log("Waiting for 6 seconds for animation to finish...");
  await wait(6000);
  
  console.log("Clicking 'Document Vault' tab");
  await page.evaluate(() => nav('c-documents'));
  
  console.log("Checking if document vault rendered");
  const html = await page.evaluate(() => document.getElementById('view-root').innerHTML);
  if (html.includes('Income Certificate')) {
    console.log("Success! Document Vault loaded.");
  } else {
    console.log("Failed to load Document Vault.");
  }

  await browser.close();
})();
