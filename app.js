/* Middagsmaskinen – allt körs lokalt i webbläsaren. */
'use strict';

const DAGAR = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
const TAGGAR = ['snabb', 'billig', 'veg', 'matlåda'];
const STORE_KEY = 'middagsmaskinen:v1';

// Vardagliga ord -> råvaror i receptdatan (används för kylskåp och erbjudanden)
const SYNONYMER = {
  'kyckling': 'kycklingfilé', 'kycklingbröst': 'kycklingfilé', 'kycklingbröstfilé': 'kycklingfilé',
  'kycklinglår': 'kycklinglårfilé', 'lax': 'laxfilé', 'torsk': 'torskfilé', 'färs': 'nötfärs',
  'blandfärs': 'nötfärs', 'köttfärs': 'nötfärs', 'spaghetti': 'pasta', 'penne': 'pasta',
  'fusilli': 'pasta', 'tagliatelle': 'pasta', 'lök': 'gul lök', 'gullök': 'gul lök',
  'tortilla': 'tortillabröd', 'ost': 'riven ost', 'hushållsost': 'riven ost', 'präst': 'riven ost',
  'herrgård': 'riven ost', 'vispgrädde': 'grädde', 'korv': 'falukorv', 'sidfläsk': 'rimmat sidfläsk',
  'fläsk': 'rimmat sidfläsk', 'svamp': 'champinjoner', 'ärtor': 'frysta ärtor', 'pommes': 'ugnspommes',
  'yoghurt': 'turkisk yoghurt', 'nudlar': 'äggnudlar', 'bönor': 'kidneybönor', 'linser': 'röda linser',
  'feta': 'fetaost', 'räka': 'räkor', 'pesto': 'grön pesto', 'tortellini': 'färsk tortellini',
  'kokos': 'kokosmjölk', 'curry': 'currypulver', 'krossade': 'krossade tomater', 'cocktailtomater': 'körsbärstomater',
  'babyspenat': 'spenat', 'isbergssallad': 'sallad', 'romansallad': 'sallad', 'salladsmix': 'sallad',
  'hamburgerbrod': 'hamburgerbröd', 'burgare': 'hamburgare', 'mjöl': 'vetemjöl', 'basmatiris': 'ris',
  'långkornigt ris': 'ris', 'citroner': 'citron', 'limefrukt': 'lime', 'chilipeppar': 'chili',
  'vitkålshuvud': 'vitkål', 'ägg': 'ägg', 'mozzarellaost': 'mozzarella', 'cheddarost': 'cheddar',
  'majonäs': 'majonnäs', 'tacosås': 'salsa', 'fiskpinne': 'fiskpinnar',
};

const PITCHAR = {
  snabb: ['Klar innan du hunnit scrolla klart.', 'Snabbare än en matleverans.', 'Noll väntan, full mage.'],
  billig: ['Plånboken skickar en tumme upp.', 'Lyx-känsla, budgetpris.', 'Snål? Nej, smart.'],
  veg: ['Grönsakerna har tagit på sig finkläderna.', 'Gott för dig och planeten.', 'Ingen saknar köttet. Lovar.'],
  matlåda: ['Smakar ännu bättre i morgon.', 'Framtida du säger tack.', 'Lunchen är redan fixad.'],
  '': ['En riktig vardagsklassiker.', 'Trygg, god och lite fin.', 'Den här vill träffa dig ikväll.'],
};

let DATA = null;       // { avdelningar, basvaror, ingredienser, recept }
let BY_ID = new Map();
let state = loadState();

/* ---------- Lagring ---------- */
function defaultState() {
  return { fridge: [], offers: [], offersText: '', week: Array(7).fill(null), checked: {}, extras: [],
           likes: [], nopes: [], tag: 'alla', query: '' };
}
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (s && typeof s === 'object') return Object.assign(defaultState(), s);
  } catch (e) { /* tom eller blockerad lagring – kör vidare */ }
  return defaultState();
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignoreras */ }
}

/* ---------- Hjälpare ---------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtNum = (n) => (Math.round(n * 10) / 10).toString().replace('.', ',');
const todayIdx = () => (new Date().getDay() + 6) % 7;
const isLetter = (c) => !!c && /[a-zåäöéü]/i.test(c);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

function coreIngr(r) { return r.ingredienser.filter((g) => !DATA.basvaror.includes(g.namn)); }
function fmtQty(g) { return g.mangd == null ? '' : `${fmtNum(g.mangd)} ${g.enhet}`.trim(); }

/* Hittar alla kända råvaror i en fritext ("Kycklingfilé 89:-/kg" -> ["kycklingfilé"]) */
function findIngredients(text) {
  let s = ' ' + text.toLowerCase() + ' ';
  const found = [];
  const dict = [
    ...Object.keys(DATA.ingredienser).filter((n) => !DATA.basvaror.includes(n)).map((n) => [n, n]),
    ...Object.entries(SYNONYMER),
  ].sort((a, b) => b[0].length - a[0].length);
  for (const [word, name] of dict) {
    let i = s.indexOf(word);
    while (i !== -1) {
      if (!isLetter(s[i - 1])) {
        if (!found.includes(name)) found.push(name);
        // Maskera ordet (inkl. ändelse) så "kycklingfilé" inte också blir "kyckling"
        let end = i + word.length;
        while (isLetter(s[end])) end++;
        s = s.slice(0, i) + ' '.repeat(end - i) + s.slice(end);
      }
      i = s.indexOf(word, i + 1);
    }
  }
  return found;
}
function canonOne(text) {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (DATA.ingredienser[t]) return t;
  if (SYNONYMER[t]) return SYNONYMER[t];
  const f = findIngredients(t);
  if (f.length) return f[0];
  // prova början av ordet: "champ" -> champinjoner
  const pre = Object.keys(DATA.ingredienser).find((n) => t.length >= 3 && n.startsWith(t));
  return pre || t;
}

/* Hur bra matchar ett recept kylskåp + erbjudanden? */
function matchInfo(r) {
  const core = coreIngr(r);
  const have = core.filter((g) => state.fridge.includes(g.namn));
  const offer = core.filter((g) => state.offers.includes(g.namn) && !state.fridge.includes(g.namn));
  return { total: core.length, have: have.length, offer: offer.length, offerNames: offer.map((g) => g.namn),
           missing: core.length - have.length, score: have.length + 0.8 * offer.length + have.length / core.length };
}

function weightFor(r) {
  let w = 1;
  if (state.likes.includes(r.id)) w *= 3;
  if (state.nopes.includes(r.id)) w *= 0.3;
  const m = matchInfo(r);
  w *= 1 + m.have * 0.6 + m.offer * 0.5;
  return w;
}
function weightedPick(list) {
  const total = list.reduce((a, r) => a + weightFor(r), 0);
  let x = Math.random() * total;
  for (const r of list) { x -= weightFor(r); if (x <= 0) return r; }
  return list[list.length - 1];
}
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/* ---------- Receptkort ---------- */
function tagsHtml(r) {
  return r.taggar.map((t) => `<span class="tag ${t}">${t}</span>`).join('');
}
function cardHtml(r, opts = {}) {
  let extra = '';
  if (opts.match) {
    const m = matchInfo(r);
    const pct = Math.round((m.have / m.total) * 100);
    extra = `<div class="rmeta"><span class="have-txt">🧊 ${m.have}/${m.total} hemma</span>` +
      (m.offer ? `<span class="offer-txt">🏷️ ${m.offer} på erbjudande</span>` : '') +
      `</div><div class="match-bar"><i style="width:${pct}%"></i></div>`;
  }
  const liked = state.likes.includes(r.id) ? ' ❤️' : '';
  return `<button class="rcard" data-open="${r.id}">
    <span class="remoji">${r.emoji}</span>
    <span class="rbody"><span class="rname">${esc(r.namn)}${liked}</span>
      <span class="rmeta"><span>⏱ ${r.tid} min</span>${tagsHtml(r)}</span>${extra}</span>
  </button>`;
}

/* ---------- Vy: Recept ---------- */
function renderFilter() {
  const opts = ['alla', ...TAGGAR, 'favoriter'];
  $('#tagFilter').innerHTML = opts.map((t) =>
    `<button class="chip" data-tag="${t}" aria-pressed="${state.tag === t}">${t === 'favoriter' ? '❤️ favoriter' : cap(t)}</button>`).join('');
}
function renderRecipes() {
  const q = state.query.trim().toLowerCase();
  let list = DATA.recept.filter((r) => {
    if (state.tag === 'favoriter') { if (!state.likes.includes(r.id)) return false; }
    else if (state.tag !== 'alla' && !r.taggar.includes(state.tag)) return false;
    if (!q) return true;
    return r.namn.toLowerCase().includes(q) || r.ingredienser.some((g) => g.namn.includes(q));
  });
  $('#recipeList').innerHTML = list.length ? list.map((r) => cardHtml(r)).join('')
    : `<p class="empty">${state.tag === 'favoriter' ? 'Inga favoriter än – gå på Middagsdejt och swipea höger! 💘' : 'Inga recept hittades 🤷'}</p>`;
}

/* ---------- Vy: Kylskåp & erbjudanden ---------- */
function renderFridge() {
  $('#fridgeChips').innerHTML = state.fridge.length
    ? state.fridge.map((n) => `<button class="chip" data-unfridge="${esc(n)}">${esc(n)}</button>`).join('')
    : '<p class="empty">Kylskåpet är tomt. Skriv vad du har, eller bocka i nedan 👇</p>';
  $('#offerChips').innerHTML = state.offers.map((n) => `<button class="chip" data-unoffer="${esc(n)}">🏷️ ${esc(n)}</button>`).join('');
  $('#offersText').value = state.offersText;
  if (state.offers.length) $('#offersPanel').open = true;

  // Bocka-i-lista, per avdelning
  const groups = {};
  for (const [n, avd] of Object.entries(DATA.ingredienser)) {
    if (DATA.basvaror.includes(n)) continue;
    (groups[avd] ||= []).push(n);
  }
  $('#ingPicker').innerHTML = DATA.avdelningar.filter((a) => groups[a]).map((a) =>
    `<div class="picker-group"><h3>${a}</h3><div class="chips">${groups[a].sort((x, y) => x.localeCompare(y, 'sv')).map((n) =>
      `<button class="chip" data-toggle="${esc(n)}" aria-pressed="${state.fridge.includes(n)}">${esc(n)}</button>`).join('')}</div></div>`).join('');

  // Matchningar
  const any = state.fridge.length || state.offers.length;
  $('#matchTitle').textContent = state.fridge.length ? 'Recept som använder mest av det du har'
    : state.offers.length ? 'Recept med veckans erbjudanden' : 'Recept som passar';
  if (!any) { $('#fridgeMatches').innerHTML = '<p class="empty">Lägg till råvaror så letar maskinen fram recept. 🔍</p>'; return; }
  const list = DATA.recept.map((r) => [r, matchInfo(r)])
    .filter(([, m]) => m.have + m.offer > 0)
    .sort((a, b) => b[1].score - a[1].score || a[1].missing - b[1].missing)
    .slice(0, 15);
  $('#fridgeMatches').innerHTML = list.length ? list.map(([r]) => cardHtml(r, { match: true })).join('')
    : '<p class="empty">Inga recept använder det där… dags att handla? 🛒</p>';
}
function addToFridge(text) {
  const parts = text.split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean);
  const added = [];
  for (const p of parts) {
    const n = canonOne(p);
    if (n && !state.fridge.includes(n)) { state.fridge.push(n); added.push(n); }
  }
  save(); renderFridge(); renderShop();
  if (added.length) {
    const unknown = added.filter((n) => !DATA.ingredienser[n]);
    toast(unknown.length ? `Sparat! (${unknown.join(', ')} finns inte i några recept än)` : `In i kylen: ${added.join(', ')} 🧊`);
  }
}

/* ---------- Vy: Veckomeny ---------- */
function makeWeek() {
  const pool = DATA.recept.slice();
  const week = [];
  for (let d = 0; d < 7; d++) {
    const r = weightedPick(pool);
    week.push(r.id);
    pool.splice(pool.indexOf(r), 1);
  }
  state.week = week;
  save(); renderWeek(); renderShop();
  toast('Veckan är fixad! 🎉 Swipea för att byta.');
}
function swapDay(i) {
  const pool = DATA.recept.filter((r) => !state.week.includes(r.id));
  const r = weightedPick(pool);
  state.week[i] = r.id;
  save(); renderShop();
  return r;
}
function dayCardInner(i) {
  const r = BY_ID.get(state.week[i]);
  const today = i === todayIdx() ? ' • idag' : '';
  if (!r) return `<span class="day-name">${DAGAR[i]}</span><span class="rbody muted">Inget planerat${today}</span><button class="swap-btn" data-swap="${i}" aria-label="Slumpa rätt">🎲</button>`;
  return `<span class="day-name">${DAGAR[i]}${today ? '<br>idag' : ''}</span>
    <span class="remoji">${r.emoji}</span>
    <span class="rbody" data-open="${r.id}"><span class="rname">${esc(r.namn)}</span>
      <span class="rmeta"><span>⏱ ${r.tid} min</span>${tagsHtml(r)}</span></span>
    <button class="swap-btn" data-swap="${i}" aria-label="Byt rätt">🔄</button>`;
}
function renderWeek() {
  const has = state.week.some(Boolean);
  $('#makeWeek').textContent = has ? '🎲 Ny vecka, tack!' : '✨ Fixa veckan åt mig';
  $('#weekHint').hidden = !has;
  $('#week').innerHTML = DAGAR.map((_, i) => `<div class="day">
      <div class="day-under"><span>🔄 Byt</span><span>Byt 🔄</span></div>
      <div class="day-card${state.week[i] ? '' : ' empty-day'}" data-day="${i}">${dayCardInner(i)}</div>
    </div>`).join('');
  bindWeekSwipes();
}
function animateSwap(card, dir) {
  const i = +card.dataset.day;
  card.classList.remove('dragging');
  card.style.transform = `translateX(${dir * 110}%)`;
  setTimeout(() => {
    swapDay(i);
    card.classList.add('dragging');
    card.style.transform = `translateX(${-dir * 110}%)`;
    card.innerHTML = dayCardInner(i);
    card.classList.remove('empty-day');
    void card.offsetWidth;
    card.classList.remove('dragging');
    card.style.transform = '';
  }, 220);
}

/* Generell drag-hanterare (swipe) */
function makeDraggable(el, { onMove, onEnd, axis = 'x' }) {
  let sx = 0, sy = 0, dx = 0, dy = 0, active = false, locked = null;
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('button')) return;
    active = true; locked = null; sx = e.clientX; sy = e.clientY; dx = dy = 0;
  });
  el.addEventListener('pointermove', (e) => {
    if (!active) return;
    dx = e.clientX - sx; dy = e.clientY - sy;
    if (locked === null && Math.abs(dx) + Math.abs(dy) > 8) {
      locked = axis === 'free' || Math.abs(dx) > Math.abs(dy) ? 'drag' : 'scroll';
      if (locked === 'drag') { el.setPointerCapture(e.pointerId); el.classList.add('dragging'); }
    }
    if (locked === 'drag') { e.preventDefault(); onMove(dx, dy); }
  });
  const end = () => {
    if (!active) return;
    active = false;
    el.classList.remove('dragging');
    if (locked === 'drag') { el._dragged = true; setTimeout(() => (el._dragged = false), 50); onEnd(dx, dy); }
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}
function bindWeekSwipes() {
  document.querySelectorAll('.day-card').forEach((card) => {
    makeDraggable(card, {
      onMove: (dx) => { card.style.transform = `translateX(${dx}px) rotate(${dx / 40}deg)`; },
      onEnd: (dx) => {
        if (Math.abs(dx) > 80) animateSwap(card, Math.sign(dx));
        else card.style.transform = '';
      },
    });
  });
}

/* ---------- Vy: Inköpslista ---------- */
function shopItems() {
  const map = new Map(); // namn -> { namn, avd, qty: {enhet: summa}, recipes:Set }
  for (const id of state.week) {
    const r = BY_ID.get(id);
    if (!r) continue;
    for (const g of coreIngr(r)) {
      if (!map.has(g.namn)) map.set(g.namn, { namn: g.namn, avd: DATA.ingredienser[g.namn], qty: {}, recipes: new Set() });
      const it = map.get(g.namn);
      it.recipes.add(r.namn);
      if (g.mangd != null) it.qty[g.enhet] = (it.qty[g.enhet] || 0) + g.mangd;
    }
  }
  const items = [...map.values()].map((it) => ({
    key: 'r:' + it.namn, namn: it.namn, avd: it.avd,
    qty: Object.entries(it.qty).map(([e, n]) => `${fmtNum(n)} ${e}`).join(' + '),
    home: state.fridge.includes(it.namn), offer: state.offers.includes(it.namn),
    note: [...it.recipes].join(', '),
  }));
  for (const x of state.extras) {
    const known = DATA.ingredienser[x] ? x : null;
    items.push({ key: 'x:' + x, namn: x, avd: known ? DATA.ingredienser[known] : 'Övrigt', qty: '', extra: true,
                 home: false, offer: state.offers.includes(x), note: 'extra' });
  }
  return items;
}
function renderShop() {
  const items = shopItems();
  const toBuy = items.filter((i) => !i.home);
  const done = toBuy.filter((i) => state.checked[i.key]).length;
  const left = toBuy.length - done;
  const badge = $('#shopBadge');
  badge.hidden = left === 0; badge.textContent = left;

  if (!items.length) {
    $('#shopProgress').innerHTML = '';
    $('#shopList').innerHTML = '<p class="empty">Listan fylls på automatiskt när du gör en veckomeny. 📅</p>';
    $('#clearChecked').hidden = true;
    return;
  }
  $('#clearChecked').hidden = done === 0;
  const pct = toBuy.length ? Math.round((done / toBuy.length) * 100) : 100;
  $('#shopProgress').innerHTML = `${left === 0 ? 'Allt i korgen! 🎉 Hem och laga mat.' : `${done} av ${toBuy.length} i korgen`}
    <div class="match-bar"><i style="width:${pct}%"></i></div>`;

  const order = [...DATA.avdelningar, 'Övrigt'];
  const groups = order.map((avd) => [avd, items.filter((i) => i.avd === avd)]).filter(([, l]) => l.length);
  $('#shopList').innerHTML = groups.map(([avd, list]) => {
    list.sort((a, b) => (a.home - b.home) || (!!state.checked[a.key] - !!state.checked[b.key]) || a.namn.localeCompare(b.namn, 'sv'));
    return `<div class="shop-group"><h3>${avd}</h3>${list.map((i) => {
      const note = i.home ? '<span class="si-note have-txt">🧊 har hemma</span>'
        : i.offer ? '<span class="si-note offer-txt">🏷️ erbjudande!</span>' : '';
      return `<button class="shop-item${state.checked[i.key] ? ' checked' : ''}${i.home ? ' home' : ''}" data-check="${esc(i.key)}" title="${esc(i.note)}">
        <span class="box">${state.checked[i.key] ? '✓' : ''}</span>
        <span class="si-name">${esc(cap(i.namn))}${note}</span><span class="si-qty">${esc(i.qty)}</span></button>`;
    }).join('')}</div>`;
  }).join('');
}

/* ---------- Receptvy (sheet) ---------- */
function openRecipe(id, banner = '') {
  const r = BY_ID.get(+id);
  if (!r) return;
  const liked = state.likes.includes(r.id);
  const inWeek = state.week.indexOf(r.id);
  $('#sheet').innerHTML = `<div class="grab"></div>
    <button class="close" data-close aria-label="Stäng">✕</button>
    ${banner}
    <div class="hero">${r.emoji}</div>
    <h2>${esc(r.namn)}</h2>
    <div class="rmeta"><span>⏱ ${r.tid} min</span><span>🍽 ${r.portioner} port</span>${tagsHtml(r)}</div>
    <h3>Ingredienser</h3>
    <ul class="ing-list">${r.ingredienser.map((g) => `<li class="${state.fridge.includes(g.namn) ? 'has' : ''}">
      <span>${esc(cap(g.namn))}${state.offers.includes(g.namn) ? ' <span class="offer-txt">🏷️</span>' : ''}</span><span class="qty">${esc(fmtQty(g))}</span></li>`).join('')}</ul>
    <h3>Gör så här</h3>
    <ol class="steps">${r.steg.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
    <h3>${inWeek >= 0 ? `Ligger på ${DAGAR[inWeek].toLowerCase()} 📅 – flytta?` : 'Lägg i veckomenyn'}</h3>
    <div class="chips">${DAGAR.map((d, i) => `<button class="chip" data-addday="${i}" data-id="${r.id}" aria-pressed="${state.week[i] === r.id}">${d}</button>`).join('')}</div>
    <div class="sheet-actions">
      <button class="btn ghost" data-like="${r.id}">${liked ? '💔 Ta bort favorit' : '❤️ Favorit'}</button>
      <button class="btn" data-close>Klar</button>
    </div>`;
  $('#sheet').hidden = false; $('#sheetBackdrop').hidden = false;
  $('#sheet').scrollTop = 0;
}
function closeSheet() { $('#sheet').hidden = true; $('#sheetBackdrop').hidden = true; }

function toggleLike(id) {
  id = +id;
  if (state.likes.includes(id)) state.likes = state.likes.filter((x) => x !== id);
  else { state.likes.push(id); state.nopes = state.nopes.filter((x) => x !== id); }
  save();
}

/* ---------- Middagsdejt (Tinder-läge) ---------- */
let deckQueue = [];
function pitch(r) {
  const tag = r.taggar[r.id % Math.max(1, r.taggar.length)] || '';
  const arr = PITCHAR[tag] || PITCHAR[''];
  return arr[r.id % arr.length];
}
function refillDeck() {
  deckQueue = shuffle(DATA.recept.filter((r) => !state.likes.includes(r.id) && !state.nopes.includes(r.id)).map((r) => r.id));
}
function renderDeck() {
  const deck = $('#deck');
  const top3 = deckQueue.slice(0, 3).reverse(); // sista elementet hamnar överst
  if (!top3.length) {
    deck.innerHTML = `<div class="deck-empty"><div><div style="font-size:4rem">🥲</div>
      <p>Du har swipeat igenom alla rätter!</p><button class="btn" id="deckReset">Ge nej-rätterna en chans till</button></div></div>`;
    $('#nopeBtn').disabled = $('#likeBtn').disabled = true;
  } else {
    $('#nopeBtn').disabled = $('#likeBtn').disabled = false;
    deck.innerHTML = top3.map((id) => {
      const r = BY_ID.get(id);
      return `<div class="dcard" data-card="${id}">
        <span class="stamp yes">MUMS</span><span class="stamp no">NÄÄ</span>
        <div class="big-emoji">${r.emoji}</div><h2>${esc(r.namn)}</h2>
        <p class="pitch">”${pitch(r)}”</p>
        <div class="rmeta"><span>⏱ ${r.tid} min</span>${tagsHtml(r)}</div></div>`;
    }).join('');
    const top = deck.lastElementChild;
    makeDraggable(top, {
      axis: 'free',
      onMove: (dx, dy) => {
        top.style.transform = `translate(${dx}px, ${dy * 0.3}px) rotate(${dx / 14}deg)`;
        top.querySelector('.stamp.yes').style.opacity = Math.max(0, Math.min(1, dx / 90));
        top.querySelector('.stamp.no').style.opacity = Math.max(0, Math.min(1, -dx / 90));
      },
      onEnd: (dx) => {
        if (Math.abs(dx) > 100) decide(dx > 0);
        else { top.style.transform = ''; top.querySelectorAll('.stamp').forEach((s) => (s.style.opacity = 0)); }
      },
    });
  }
  renderMatches();
}
function decide(like) {
  const top = $('#deck').lastElementChild;
  if (!top || !top.dataset.card) return;
  const id = +top.dataset.card;
  top.querySelector(like ? '.stamp.yes' : '.stamp.no').style.opacity = 1;
  top.style.transform = `translateX(${like ? 150 : -150}%) rotate(${like ? 30 : -30}deg)`;
  top.style.opacity = 0;
  deckQueue = deckQueue.filter((x) => x !== id);
  if (like) { if (!state.likes.includes(id)) state.likes.push(id); }
  else if (!state.nopes.includes(id)) state.nopes.push(id);
  save();
  setTimeout(() => {
    renderDeck(); renderRecipes();
    if (like) openRecipe(id, '<div class="match-banner">💘 Det är en match! Här är receptet.</div>');
  }, 280);
}
function renderMatches() {
  const list = state.likes.map((id) => BY_ID.get(id)).filter(Boolean).reverse();
  $('#matchList').innerHTML = list.length ? list.map((r) => cardHtml(r)).join('')
    : '<p class="empty">Inga matcher än. Swipea höger på något gott!</p>';
}

/* ---------- Överraska mig ---------- */
function surprise() {
  const pick = weightedPick(DATA.recept);
  const ov = $('#surprise'), reel = $('#slotReel');
  ov.hidden = false;
  ov.classList.add('spinning');
  $('#surpriseResult').innerHTML = '<p>Maskinen tänker… 🤖</p>';
  $('#confetti').innerHTML = '';
  const emojis = shuffle(DATA.recept.map((r) => r.emoji)).slice(0, 24);
  reel.innerHTML = [...emojis, pick.emoji].map((e) => `<span>${e}</span>`).join('');
  reel.style.transition = 'none';
  reel.style.transform = 'translateY(0)';
  void reel.offsetWidth;
  reel.style.transition = 'transform 1.8s cubic-bezier(.15, .7, .2, 1.05)';
  reel.style.transform = `translateY(-${emojis.length * 160}px)`;
  clearTimeout(surprise._t);
  surprise._t = setTimeout(() => {
    ov.classList.remove('spinning');
    const t = todayIdx();
    $('#surpriseResult').innerHTML = `<h2>${esc(pick.namn)}!</h2><p>⏱ ${pick.tid} min · ${pick.taggar.join(' · ') || 'vardagsklassiker'}</p>
      <button class="btn" data-open="${pick.id}" data-closesurprise>Visa recept</button>
      <button class="btn" data-addday="${t}" data-id="${pick.id}" data-closesurprise>Vi äter det idag!</button><br>
      <button class="btn ghost" id="spinAgain">🎲 Snurra igen</button>
      <button class="btn ghost" data-closesurprise>Stäng</button>`;
    confetti();
  }, 1850);
}
function confetti() {
  const box = $('#confetti');
  const bits = ['🎉', '✨', '🍝', '🌮', '🥕', '🧀', '🍅', '⭐'];
  box.innerHTML = Array.from({ length: 36 }, () =>
    `<i style="left:${Math.random() * 100}%;animation-duration:${1.6 + Math.random() * 1.8}s;animation-delay:${Math.random() * .4}s">${bits[Math.floor(Math.random() * bits.length)]}</i>`).join('');
}

/* ---------- Navigering & händelser ---------- */
function showView(name) {
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + name));
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.view === name));
  window.scrollTo(0, 0);
  try { sessionStorage.setItem('mm:view', name); } catch (e) { /* ok */ }
}

function bindEvents() {
  document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => showView(t.dataset.view)));
  $('#search').addEventListener('input', (e) => { state.query = e.target.value; renderRecipes(); });

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-tag],[data-open],[data-close],[data-like],[data-addday],[data-swap],[data-check],[data-toggle],[data-unfridge],[data-unoffer],[data-closesurprise],#spinAgain,#deckReset');
    if (!el) return;
    if (el.closest('.day-card')?._dragged) return;
    const d = el.dataset;
    if (d.tag) { state.tag = d.tag; save(); renderFilter(); renderRecipes(); return; }
    if ('closesurprise' in d && !d.open && !d.addday) { $('#surprise').hidden = true; return; }
    if (d.open) { if ('closesurprise' in d) $('#surprise').hidden = true; openRecipe(d.open); return; }
    if ('close' in d) { closeSheet(); return; }
    if (d.like) { toggleLike(d.like); openRecipe(d.like); renderRecipes(); renderMatches(); return; }
    if (d.addday) {
      const id = +d.id, i = +d.addday;
      const old = state.week.indexOf(id);
      if (old >= 0) state.week[old] = null;
      state.week[i] = id; save(); renderWeek(); renderShop();
      toast(`${BY_ID.get(id).namn} → ${DAGAR[i].toLowerCase()} 📅`);
      if ('closesurprise' in d) { $('#surprise').hidden = true; showView('vecka'); }
      else openRecipe(id);
      return;
    }
    if (d.swap) { animateSwap(el.closest('.day-card'), 1); return; }
    if (d.check) { state.checked[d.check] = !state.checked[d.check]; if (!state.checked[d.check]) delete state.checked[d.check]; save(); renderShop(); return; }
    if (d.toggle) {
      const n = d.toggle;
      state.fridge = state.fridge.includes(n) ? state.fridge.filter((x) => x !== n) : [...state.fridge, n];
      save(); el.setAttribute('aria-pressed', state.fridge.includes(n));
      renderFridge(); renderShop(); return;
    }
    if (d.unfridge) { state.fridge = state.fridge.filter((x) => x !== d.unfridge); save(); renderFridge(); renderShop(); return; }
    if (d.unoffer) { state.offers = state.offers.filter((x) => x !== d.unoffer); save(); renderFridge(); renderShop(); return; }
    if (el.id === 'spinAgain') { surprise(); return; }
    if (el.id === 'deckReset') { state.nopes = []; save(); refillDeck(); renderDeck(); }
  });

  $('#sheetBackdrop').addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeSheet(); $('#surprise').hidden = true;
  });

  $('#fridgeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addToFridge($('#fridgeInput').value);
    $('#fridgeInput').value = '';
  });
  $('#offersParse').addEventListener('click', () => {
    state.offersText = $('#offersText').value;
    state.offers = findIngredients(state.offersText);
    save(); renderFridge(); renderShop();
    toast(state.offers.length ? `Hittade ${state.offers.length} råvaror på erbjudande 🏷️` : 'Hittade inga kända råvaror i texten 🤔');
  });
  $('#offersClear').addEventListener('click', () => { state.offers = []; state.offersText = ''; save(); renderFridge(); renderShop(); });

  $('#makeWeek').addEventListener('click', makeWeek);
  $('#extraForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#extraInput').value.trim().toLowerCase();
    if (v && !state.extras.includes(v)) { state.extras.push(DATA.ingredienser[canonOne(v)] ? canonOne(v) : v); save(); renderShop(); }
    $('#extraInput').value = '';
  });
  $('#clearChecked').addEventListener('click', () => {
    state.extras = state.extras.filter((x) => !state.checked['x:' + x]);
    state.checked = {}; save(); renderShop(); toast('Listan nollställd – redo för nästa handling 🛒');
  });

  $('#surpriseBtn').addEventListener('click', surprise);
  $('#likeBtn').addEventListener('click', () => decide(true));
  $('#nopeBtn').addEventListener('click', () => decide(false));
}


/* ---------- Start ---------- */
async function init() {
  const res = await fetch('recipes.json');
  DATA = await res.json();
  BY_ID = new Map(DATA.recept.map((r) => [r.id, r]));
  $('#ingList').innerHTML = Object.keys(DATA.ingredienser).filter((n) => !DATA.basvaror.includes(n))
    .map((n) => `<option value="${esc(n)}">`).join('');
  $('#search').value = state.query;
  bindEvents();
  renderFilter(); renderRecipes(); renderFridge(); renderWeek(); renderShop();
  refillDeck(); renderDeck();
  let v = 'recept';
  try { v = sessionStorage.getItem('mm:view') || v; } catch (e) { /* ok */ }
  if (location.hash) v = location.hash.slice(1);
  if (document.getElementById('view-' + v)) showView(v);
}
init().catch((e) => {
  console.error(e);
  $('#main').innerHTML = '<p class="empty" style="padding:40px 0;text-align:center">Hoppsan! Kunde inte ladda recepten 🥲<br>Ladda om sidan.</p>';
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
