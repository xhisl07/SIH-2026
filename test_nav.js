const fs = require('fs');
let appJs = fs.readFileSync('b:/code/sih-claude/app.js', 'utf8');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html>
<html><head></head><body>
<div id="topbar-title"></div>
<div id="topbar-crumb"></div>
<div id="view-root"></div>
<div class="sb-group"></div>
<div class="main"></div>
</body></html>`);
const window = dom.window;
const document = window.document;
const localStorage = { getItem: () => 'en', setItem: () => {} };

// Evaluate app.js
appJs = appJs.replace(/localStorage\.getItem/g, '(()=>"en")');
appJs = appJs.replace(/localStorage\.setItem/g, '(()=>null)');
appJs = appJs.replace(/document\.querySelectorAll/g, 'window.document.querySelectorAll');
// Execute in global scope
eval(appJs);

// Simulate login
S = { currentView: 'landing', auditLog: [], apiCallLog: [], notifications: [], applications: [], consents: [] };
S.citizenId = 'MH-CIT-99999';
S.role = 'citizen';

// Try nav to c-schemes
try {
  nav('c-schemes');
  console.log('Nav c-schemes OK');
} catch (e) {
  console.error('Error nav c-schemes:', e);
}

// Simulate runEligibility logic
try {
  S.eligibilityChecked = true;
  const panel = document.getElementById('eligibility-panel');
  panel.innerHTML += renderEligibilityResult();
  console.log('Eligibility result OK');
} catch (e) {
  console.error('Error eligibility:', e);
}

// Try nav to another tab
try {
  nav('c-documents');
  console.log('Nav c-documents OK');
} catch (e) {
  console.error('Error nav c-documents:', e);
}
