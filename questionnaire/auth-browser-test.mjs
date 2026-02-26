import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: false, args: ['--window-size=1400,900'] });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 900 });

// Test 1: Login with callbackUrl → /dashboard → should land on /dashboard (not /sessions)
console.log('=== Test 1: callbackUrl redirect ===');
await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle2' });
console.log('Redirected to login:', page.url().includes('/prihlaseni'));

await page.waitForSelector('input#email');
await page.type('input#email', 'admin@halakrasovska.cz');
await page.type('input#password', 'HalaKrasovska2024!');
await page.click('button[type=submit]');
await page.waitForFunction(() => !window.location.pathname.includes('/prihlaseni'), { timeout: 10000 });
await new Promise(r => setTimeout(r, 2000));
const afterLoginUrl = page.url();
console.log('After login URL:', afterLoginUrl);
const onDashboard = afterLoginUrl.includes('/dashboard');
console.log('Landed on /dashboard:', onDashboard, onDashboard ? '✅' : '❌');
await page.screenshot({ path: '/tmp/auth-fix-1.png' });

// Test 2: Nav links — each should stay on the right page (no redirect to /sessions)
console.log('\n=== Test 2: Navigation links ===');
const pages = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Projekty', path: '/projects' },
  { name: 'Analýza', path: '/analysis' },
  { name: 'Relace', path: '/sessions' },
  { name: 'Audit', path: '/audit' },
];

for (const p of pages) {
  await page.goto('http://localhost:3001' + p.path, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const finalPath = new URL(page.url()).pathname;
  const ok = finalPath.startsWith(p.path);
  console.log(`  ${p.name} → ${p.path} → ${finalPath} ${ok ? '✅' : '❌'}`);
}

// Test 3: Dashboard/Projects/Analysis should show "Žádný dotazník" instead of spinning
console.log('\n=== Test 3: Empty state messages ===');
for (const p of ['/dashboard', '/projects', '/analysis']) {
  await page.goto('http://localhost:3001' + p, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  const hasEmptyState = await page.evaluate(() => {
    return document.body.textContent.includes('Žádný dotazník');
  });
  console.log(`  ${p}: shows "Žádný dotazník": ${hasEmptyState ? '✅' : '❌'}`);
}

// Test 4: After selecting questionnaire, nav links should work with ?id=
console.log('\n=== Test 4: With questionnaire ID ===');
await page.goto('http://localhost:3001/sessions', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1000));
// Click first questionnaire
const clicked = await page.evaluate(() => {
  const btn = document.querySelector('button[class*="flex min-w-0"]');
  if (btn) { btn.click(); return true; }
  return false;
});
console.log('Clicked questionnaire:', clicked);
if (clicked) {
  await new Promise(r => setTimeout(r, 2000));
  console.log('After click URL:', page.url());

  // Now try Dashboard — should have ?id= and show data
  await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  const dashUrl = page.url();
  console.log('Dashboard URL:', dashUrl);
  const hasId = dashUrl.includes('?id=');
  console.log('Has ?id=:', hasId ? '✅' : '❌');
  await page.screenshot({ path: '/tmp/auth-fix-2.png' });
}

// Test 5: callbackUrl for /projects
console.log('\n=== Test 5: callbackUrl → /projects ===');
const cookies = await page.cookies();
await page.deleteCookie(...cookies);
await page.goto('http://localhost:3001/projects', { waitUntil: 'networkidle2' });
await page.waitForSelector('input#email');
await page.type('input#email', 'admin@halakrasovska.cz');
await page.type('input#password', 'HalaKrasovska2024!');
await page.click('button[type=submit]');
await page.waitForFunction(() => !window.location.pathname.includes('/prihlaseni'), { timeout: 10000 });
await new Promise(r => setTimeout(r, 2000));
const projectsUrl = page.url();
console.log('After login URL:', projectsUrl);
console.log('On /projects:', projectsUrl.includes('/projects') ? '✅' : '❌');

console.log('\n=== ALL DONE ===');
await browser.close();
