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
  // Smart sökning på protein
  await page.fill('#search', 'fisk');
  const fisk = await page.locator('#recipeList .rname').allTextContents();
  ok(fisk.length === 4 && fisk.every((n) => /lax|torsk|fisk/i.test(n)), `sök "fisk": ${fisk.join(', ')}`);
  await page.fill('#search', 'färs');
  ok(!(await page.locator('#recipeList .rname').allTextContents()).some((n) => /curry|soppa|tortellini/i.test(n)), '"färs" ger inte "färsk basilika"-rätter');
  await page.fill('#search', 'kyckling och ris');
  ok(await page.locator('#recipeList .rcard').count() === 2, 'sök "kyckling och ris": båda måste finnas');
  await page.fill('#search', '');
  await page.click('[data-protein="kyckling"]');
  ok(await page.locator('#recipeList .rcard').count() === 6 && (await page.inputValue('#search')) === 'kyckling', 'proteinknapp 🐔 Kyckling: 6 recept');
  ok((await page.textContent('#searchInfo')).includes('6 recept med kyckling'), 'sökrubrik: ' + (await page.textContent('#searchInfo')).replace('rensa', '').trim());
  ok((await page.locator('#recipeList .hit').first().textContent()).includes('kyckling'), 'träff visas på kortet: ' + await page.locator('#recipeList .hit').first().textContent());
  await page.click('[data-tag="matlåda"]');
  ok(await page.locator('#recipeList .rcard').count() === 4, 'kyckling + matlåda kombineras: 4 recept');
  await shot('11-sok');
  await page.click('[data-tag="alla"]');
  await page.click('#clearSearch');
  ok(await page.locator('#recipeList .rcard').count() === 40 && (await page.inputValue('#search')) === '', '"rensa" visar alla 40 igen');

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

  // ---- Omgång 2 ----
  // Budget + portioner
  await page.click('[data-view="vecka"]');
  const kr = async () => +(await page.textContent('#budgetTotal')).replace(/\D/g, '');
  const b4 = await kr();
  ok(b4 > 200 && b4 < 2000, `budget för veckan: ${b4} kr`);
  await page.click('#portionWeek [data-port="1"]'); await page.click('#portionWeek [data-port="1"]');
  const b6 = await kr();
  ok(Math.abs(b6 / b4 - 1.5) < 0.05, `6 portioner -> budget ×1,5 (${b4} -> ${b6} kr)`);
  const filled = await page.locator('.day-card .rname').count();
  ok(await page.locator('#soundtrack .dj-day').count() === filled, `veckans soundtrack: en låt per planerad dag (${filled})`);
  await page.evaluate(() => openRecipe(1));
  const pasta = await page.locator('#sheet .ing-list li', { hasText: 'Pasta' }).locator('.qty').textContent();
  ok(pasta === '600 g', `carbonara för 6: pasta ${pasta}`);
  const eggs = await page.locator('#sheet .ing-list li', { hasText: 'Ägg' }).locator('.qty').textContent();
  ok(eggs === '6 st', `carbonara för 6: ägg ${eggs}`);
  await page.click('#sheet [data-port="-1"]'); await page.click('#sheet [data-port="-1"]');
  ok((await page.locator('#sheet .ing-list li', { hasText: 'Pasta' }).locator('.qty').textContent()) === '400 g', 'tillbaka till 4 portioner i receptvyn');
  const songs = await page.locator('#sheet .dj-song').evaluateAll((a) => a.map((x) => x.href));
  ok(songs.length === 3 && songs.every((h) => h.startsWith('https://open.spotify.com/search/')), 'DJ: 3 låttips med Spotify-länk');
  ok((await page.textContent('#sheet .dj-head')).includes('Italiensk'), 'carbonara får italiensk DJ');

  // Matlagningsläge
  await page.evaluate(() => openRecipe(21));
  await page.click('#sheet [data-cook]');
  ok(await page.isVisible('#cook'), 'matlagningsläge öppnas');
  ok((await page.textContent('#cookCard h2')) === 'Plocka fram', 'första steget: plocka fram');
  await page.locator('[data-cooking="0"]').click();
  ok(await page.locator('[data-cooking="0"].got').count() === 1, 'bocka av ingrediens i matlagningsläget');
  await page.click('[data-cooknav="1"]'); await page.click('[data-cooknav="1"]');
  ok(await page.locator('#cookCard').textContent().then((t) => t.includes('Lägg torsken')), 'steg 2 visar texten stort');
  await drag('#cookCard', -200); await page.waitForTimeout(300);
  ok((await page.textContent('#cookCard h2')).startsWith('Steg 3'), 'swipe till nästa steg');
  ok((await page.textContent('[data-timer]')).includes('15 min'), 'timerknapp läser av "15 min" ur steget');
  await shot('9-laga');
  await page.click('[data-timer]');
  ok(await page.isVisible('#timerPill'), 'timer: ' + await page.textContent('#timerText'));
  await page.evaluate(() => { timer.end = Date.now() - 10; });
  await page.waitForSelector('#timerPill.ringing', { timeout: 2000 });
  ok(true, 'timern ringer när tiden är slut');
  await page.click('#timerPill', { force: true }); ok(!(await page.isVisible('#timerPill')), 'tryck stänger timern');
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
  ok(await page.locator('.cook-done').count() === 1, 'sista steget: smaklig måltid 🎉');
  await shot('10-klar');
  await page.click('.cook-x');
  ok(!(await page.isVisible('#cook')), 'stäng matlagningsläget');

  // Skaka mobilen
  await page.click('[data-view="recept"]');
  await ctx.grantPermissions(['accelerometer', 'gyroscope'], { origin: 'http://localhost:8765' });
  await page.click('#shakeHint');
  await page.waitForFunction(() => document.getElementById('shakeHint').textContent.includes('är på'), null, { timeout: 3000 });
  ok(true, 'skaka-läge påslaget (efter "Tillåt rörelse")');
  await page.evaluate(() => { for (let i = 0; i < 8; i++) window.dispatchEvent(new DeviceMotionEvent('devicemotion', { accelerationIncludingGravity: { x: i % 2 ? 20 : -20, y: 0, z: 9.8 } })); });
  ok(await page.isVisible('#surprise'), 'skaka -> överraska mig snurrar');
  await page.waitForSelector('#surpriseResult .oracle', { timeout: 4000 });
  ok(true, 'åtta-bollen säger: ' + await page.textContent('#surpriseResult .oracle'));
  await page.click('#surpriseResult .btn.ghost[data-closesurprise]');
  await page.click('[data-view="vecka"]');

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
