/* End-to-end-test. Kör: node tests/e2e.js  (startar egen server på port 8765) */
const { chromium, devices } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const SHOTS = process.env.SHOTS || '';
const root = path.resolve(__dirname, '..');
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '✅ ' : '❌ ') + msg); if (!cond) fails++; };

(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8765'], { cwd: root, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 800));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: false, isMobile: false });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const shot = async (n) => SHOTS && page.screenshot({ path: `${SHOTS}/${n}.png` });
  const drag = async (sel, dx) => {
    const b = await page.locator(sel).boundingBox();
    const x = b.x + b.width / 2, y = b.y + b.height / 2;
    await page.mouse.move(x, y); await page.mouse.down();
    for (let i = 1; i <= 10; i++) await page.mouse.move(x + (dx * i) / 10, y + 2);
    await page.mouse.up();
  };

  await page.goto('http://localhost:8765/');
  await page.waitForSelector('.rcard', { state: 'attached' });
  ok(await page.locator('#recipeList .rcard').count() === 40, '40 recept visas');
  await shot('1-recept');

  await page.click('[data-tag="veg"]');
  const veg = await page.locator('#recipeList .rcard').count();
  ok(veg > 10 && veg < 40, `veg-filter: ${veg} recept`);
  await page.click('[data-tag="alla"]');
  await page.fill('#search', 'lax');
  ok(await page.locator('#recipeList .rcard').count() >= 2, 'sök "lax" hittar recept');
  await page.fill('#search', '');
  await page.locator('#search').dispatchEvent('input');

  // Kylskåp
  await page.click('[data-view="kyl"]');
  await page.fill('#fridgeInput', 'ägg, pasta, bacon, Parmesan');
  await page.click('#fridgeForm button');
  ok(await page.locator('#fridgeChips .chip').count() === 4, 'kylskåp: 4 råvaror tillagda');
  const first = await page.locator('#fridgeMatches .rname').first().textContent();
  ok(first.includes('carbonara'), `bästa match: ${first}`);
  await page.click('#offersPanel summary');
  await page.fill('#offersText', 'Kycklingbröstfilé 89:-/kg\nLaxfilé 2 för 100:-\nPaprika röd 25:-/kg\nKaffe 49:-');
  await page.click('#offersParse');
  const offers = await page.locator('#offerChips .chip').allTextContents();
  ok(offers.some((t) => t.includes('kycklingfilé')) && offers.some((t) => t.includes('laxfilé')) && offers.some((t) => t.includes('paprika')) && offers.length === 3,
    `erbjudanden igenkända: ${offers.join(' | ')}`);
  await shot('2-kyl');

  // Veckomeny
  await page.click('[data-view="vecka"]');
  await page.click('#makeWeek');
  ok(await page.locator('.day-card .rname').count() === 7, 'veckomeny: 7 rätter');
  const before = await page.locator('.day-card').nth(1).locator('.rname').textContent();
  await drag('.day-card >> nth=1', -200);
  await page.waitForTimeout(600);
  const after = await page.locator('.day-card').nth(1).locator('.rname').textContent();
  ok(before !== after, `swipe byter rätt: ${before} -> ${after}`);
  const names = await page.locator('.day-card .rname').allTextContents();
  ok(new Set(names).size === 7, 'inga dubletter i veckan');
  await shot('3-vecka');

  // Inköpslista
  await page.click('[data-view="inkop"]');
  const groups = await page.locator('.shop-group h3').allTextContents();
  const order = ['Frukt & grönt', 'Bröd', 'Mejeri & ägg', 'Kött & fisk', 'Vegetariskt kylt', 'Fryst', 'Skafferi', 'Kryddor & såser'];
  ok(groups.length >= 3 && groups.every((g, i) => i === 0 || order.indexOf(g) > order.indexOf(groups[i - 1])), `avdelningar i butiksordning: ${groups.join(', ')}`);
  ok(!(await page.locator('.si-name').allTextContents()).some((t) => /^(Salt|Peppar|Olja)/.test(t)), 'basvaror (salt/peppar/olja) ej med');
  const badge1 = +(await page.textContent('#shopBadge'));
  await page.locator('.shop-item:not(.home)').first().click();
  const badge2 = +(await page.textContent('#shopBadge'));
  ok(badge2 === badge1 - 1, `bocka av: badge ${badge1} -> ${badge2}`);
  await page.fill('#extraInput', 'kaffe'); await page.click('#extraForm button');
  ok((await page.locator('.shop-group h3').allTextContents()).includes('Övrigt'), 'extra vara hamnar i Övrigt');
  await shot('4-inkop');

  // Middagsdejt
  await page.click('[data-view="dejt"]');
  const card = await page.locator('.dcard').last().locator('h2').textContent();
  await page.click('#likeBtn');
  await page.waitForSelector('#sheet:not([hidden]) .match-banner');
  ok((await page.textContent('#sheet h2')) === card, `gilla -> recept visas: ${card}`);
  await shot('5-match');
  await page.click('#sheet .btn[data-close]');
  const card2 = await page.locator('.dcard').last().locator('h2').textContent();
  await drag('.dcard >> nth=-1', -220);
  await page.waitForTimeout(500);
  ok((await page.locator('.dcard').last().locator('h2').textContent()) !== card2, 'swipe vänster = nej, nästa kort');
  ok(await page.locator('#matchList .rcard').count() === 1, '1 match i listan');
  await shot('6-dejt');

  // Överraska mig
  await page.click('#surpriseBtn');
  await page.waitForTimeout(900); await shot('7-snurr');
  await page.waitForSelector('#surpriseResult h2', { timeout: 4000 });
  ok(true, 'överraska mig: ' + await page.textContent('#surpriseResult h2'));
  await page.waitForTimeout(500); await shot('8-overraska');
  await page.click('#surpriseResult [data-addday]');
  ok(await page.locator('#view-vecka.active').count() === 1, '"Vi äter det idag" -> veckovyn');

  // Sparat lokalt
  const weekBefore = await page.locator('.day-card .rname').allTextContents();
  await page.reload(); await page.waitForSelector('.rcard', { state: 'attached' });
  await page.click('[data-view="vecka"]');
  ok(JSON.stringify(await page.locator('.day-card .rname').allTextContents()) === JSON.stringify(weekBefore), 'veckomenyn finns kvar efter omladdning');
  await page.click('[data-view="kyl"]');
  ok(await page.locator('#fridgeChips .chip').count() === 4, 'kylskåpet finns kvar efter omladdning');

  // Offline
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); await page.waitForTimeout(500);
  await ctx.setOffline(true);
  await page.reload(); await page.waitForSelector('.rcard', { state: 'attached', timeout: 5000 });
  ok(await page.locator('#recipeList .rcard').count() === 40, 'funkar offline (40 recept)');
  await ctx.setOffline(false);

  ok(errors.length === 0, 'inga JS-fel' + (errors.length ? ': ' + errors.join(' / ') : ''));
  await browser.close(); srv.kill();
  console.log(fails ? `\n${fails} FEL` : '\nALLT GRÖNT 🎉');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
