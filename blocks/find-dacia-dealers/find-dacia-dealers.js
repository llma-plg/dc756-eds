// codegen:layout-pattern=store-locator
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    location_id: 'ro-cluj-01', name: 'Dacia Cluj-Napoca', location_type: 'sales agent',
    address: 'Calea Turzii 247, Cluj-Napoca', city: 'Cluj-Napoca', distance_km: 3.4,
    latitude: 46.7554, longitude: 23.5895, phone: '+40 264 123 456',
    opening_hours: 'Lun–Vin 09:00–18:00, Sâm 09:00–13:00',
    services: ['sales', 'test drive', 'service'],
    details_url: 'https://www.dacia.ro/reteaua-dacia/lista-agenti.html',
    directions_url: 'https://www.dacia.ro/reteaua-dacia/lista-agenti.html',
  },
  {
    location_id: 'ro-cluj-02', name: 'Autoklass Dacia', location_type: 'combined location',
    address: 'Bulevardul Muncii 18, Cluj-Napoca', city: 'Cluj-Napoca', distance_km: 8.9,
    latitude: 46.7712, longitude: 23.6410, phone: '+40 264 654 321',
    opening_hours: 'Lun–Vin 08:30–19:00, Sâm 09:00–14:00',
    services: ['sales', 'test drive', 'repairs', 'GPL'],
    details_url: 'https://www.dacia.ro/reteaua-dacia/lista-agenti.html',
    directions_url: 'https://www.dacia.ro/reteaua-dacia/lista-agenti.html',
  },
  {
    location_id: 'ro-cluj-03', name: 'Automobile Bavaria / Dacia', location_type: 'repair center',
    address: 'Strada Fabricii 120, Cluj-Napoca', city: 'Cluj-Napoca', distance_km: 12.6,
    latitude: 46.7890, longitude: 23.5620, phone: '+40 264 987 000',
    opening_hours: 'Lun–Vin 08:00–17:00',
    services: ['service', 'repairs'],
    details_url: 'https://www.dacia.ro/reteaua-dacia/lista-agenti.html',
    directions_url: 'https://www.dacia.ro/reteaua-dacia/lista-agenti.html',
  },
];

// Brand palette from DESIGN_TOKENS (Rugged Value Canvas). Olive accent for highlights;
// near-black CTA fill per color.component.button.
const PALETTE = ['#646b52', '#3860be', '#111111'];
const ACCENT = '#646b52';
const PHONE_COLOR = '#dde2ce';
const CTA_BG = '#111111';
const CTA_HOVER = '#2a2a2a';

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  let dealers = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      dealers = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      // structuredContent.dealers — derived from action name "find_dacia_dealers" (bare array outputSchema rule)
      dealers = structuredContent?.dealers || (Array.isArray(structuredContent) ? structuredContent : []);
    }
  } else {
    dealers = SAMPLE_DATA;
  }

  block.textContent = '';
  render(block, dealers || [], bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function render(block, dealers, bridge) {
  const cardBg = theme?.bg ?? '#2c2f24';
  const cardFg = theme?.fg ?? '#ffffff';

  if (!dealers || !dealers.length) {
    renderEmpty(block, bridge, cardBg, cardFg);
    return;
  }

  let activeFilter = 'all';

  const container = document.createElement('div');
  container.className = 'find-dacia-dealers-container';

  const filterBar = document.createElement('div');
  filterBar.className = 'find-dacia-dealers-filters';

  const results = document.createElement('div');
  results.className = 'find-dacia-dealers-results';

  const isRepair = (d) => /repair|reparat|service center/i.test(d.location_type || '');
  const isSales = (d) => /sales|agent|combined|vânz|vanz/i.test(d.location_type || '');

  function matches(d) {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'sales') return isSales(d) || (d.services || []).some((s) => /sales|vânz|vanz|test/i.test(s));
    if (activeFilter === 'repair') return isRepair(d) || (d.services || []).some((s) => /repair|service|reparat/i.test(s));
    return true;
  }

  function paint() {
    results.textContent = '';
    const list = [...dealers]
      .filter(matches)
      .sort((a, b) => (a.distance_km ?? 1e9) - (b.distance_km ?? 1e9))
      .slice(0, 2);

    if (!list.length) {
      const none = document.createElement('div');
      none.className = 'find-dacia-dealers-store-card';
      none.style.background = cardBg;
      none.style.color = cardFg;
      const t = document.createElement('div');
      t.className = 'find-dacia-dealers-store-name';
      t.textContent = 'Nicio locație pentru acest filtru';
      none.appendChild(t);
      results.appendChild(none);
      return;
    }

    list.forEach((d, i) => {
      results.appendChild(buildCard(d, i, bridge, cardBg, cardFg));
    });
  }

  [
    { key: 'all', label: 'Toate' },
    { key: 'sales', label: 'Agenți vânzări' },
    { key: 'repair', label: 'Centre service' },
  ].forEach(({ key, label }) => {
    const b = document.createElement('button');
    b.className = 'find-dacia-dealers-filter-btn';
    b.type = 'button';
    b.textContent = label;
    b.setAttribute('aria-pressed', String(key === activeFilter));
    if (key === activeFilter) b.classList.add('is-active');
    b.addEventListener('click', () => {
      activeFilter = key;
      filterBar.querySelectorAll('.find-dacia-dealers-filter-btn').forEach((el) => {
        el.classList.remove('is-active');
        el.setAttribute('aria-pressed', 'false');
      });
      b.classList.add('is-active');
      b.setAttribute('aria-pressed', 'true');
      paint();
    });
    filterBar.appendChild(b);
  });

  container.appendChild(filterBar);
  container.appendChild(results);
  block.appendChild(container);
  paint();
}

function buildCard(d, i, bridge, cardBg, cardFg) {
  const card = document.createElement('div');
  card.className = 'find-dacia-dealers-store-card';
  card.style.background = cardBg;
  card.style.color = cardFg;

  const head = document.createElement('div');
  head.className = 'find-dacia-dealers-store-head';

  const pin = document.createElement('div');
  pin.className = 'find-dacia-dealers-store-pin';
  pin.textContent = String(i + 1);
  head.appendChild(pin);

  const headText = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'find-dacia-dealers-store-name';
  name.textContent = d.name || '';
  headText.appendChild(name);

  if (d.distance_km != null) {
    const dist = document.createElement('div');
    dist.className = 'find-dacia-dealers-store-dist';
    dist.textContent = `${Number(d.distance_km).toFixed(1)} km`;
    headText.appendChild(dist);
  }
  head.appendChild(headText);
  card.appendChild(head);

  if (d.address) {
    const addr = document.createElement('div');
    addr.className = 'find-dacia-dealers-store-addr';
    addr.textContent = d.city && !String(d.address).includes(d.city) ? `${d.address}, ${d.city}` : d.address;
    card.appendChild(addr);
  }

  if (d.phone) {
    const phone = document.createElement('div');
    phone.className = 'find-dacia-dealers-store-phone';
    phone.style.color = PHONE_COLOR;
    phone.textContent = d.phone;
    card.appendChild(phone);
  }

  if (d.opening_hours) {
    const hours = document.createElement('div');
    hours.className = 'find-dacia-dealers-store-hours';
    hours.textContent = d.opening_hours;
    card.appendChild(hours);
  }

  if (Array.isArray(d.services) && d.services.length) {
    const badges = document.createElement('div');
    badges.className = 'find-dacia-dealers-badges';
    d.services.slice(0, 5).forEach((s) => {
      const chip = document.createElement('span');
      chip.className = 'find-dacia-dealers-badge';
      chip.textContent = s;
      badges.appendChild(chip);
    });
    card.appendChild(badges);
  }

  const actions = document.createElement('div');
  actions.className = 'find-dacia-dealers-actions';

  const primary = document.createElement('button');
  primary.className = 'find-dacia-dealers-cta';
  primary.type = 'button';
  primary.textContent = 'Alege agentul';
  primary.addEventListener('click', () => {
    if (bridge) {
      const url = d.details_url;
      if (url) bridge.openLink(url);
      else bridge.sendMessage(`Vreau mai multe detalii despre ${d.name}`);
    }
  });
  actions.appendChild(primary);

  const dirs = document.createElement('button');
  dirs.className = 'find-dacia-dealers-cta find-dacia-dealers-cta-ghost';
  dirs.type = 'button';
  dirs.textContent = 'Indicații';
  dirs.addEventListener('click', () => {
    if (bridge) {
      const url = d.directions_url || d.details_url;
      if (url) bridge.openLink(url);
      else bridge.sendMessage(`Cum ajung la ${d.name}?`);
    }
  });
  actions.appendChild(dirs);

  card.appendChild(actions);
  return card;
}

function renderEmpty(block, bridge, cardBg, cardFg) {
  const empty = document.createElement('div');
  empty.className = 'find-dacia-dealers-empty';

  const formCard = document.createElement('div');
  formCard.className = 'find-dacia-dealers-form-card';
  formCard.style.background = cardBg;
  formCard.style.color = cardFg;

  const pin = document.createElement('span');
  pin.className = 'find-dacia-dealers-pin';
  pin.textContent = '◎';
  pin.style.color = cardFg;
  formCard.appendChild(pin);

  const heading = document.createElement('h3');
  heading.className = 'find-dacia-dealers-heading';
  heading.textContent = 'Găsește o locație Dacia';
  heading.style.color = cardFg;
  formCard.appendChild(heading);

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'find-dacia-dealers-input';
  input.placeholder = 'Introdu orașul sau codul poștal…';
  input.setAttribute('aria-label', 'Locație');
  formCard.appendChild(input);

  const btn = document.createElement('button');
  btn.className = 'find-dacia-dealers-search-btn';
  btn.type = 'button';
  btn.textContent = 'Caută';
  formCard.appendChild(btn);

  btn.addEventListener('click', () => {
    const loc = input.value.trim();
    if (bridge && loc) bridge.sendMessage(`Găsește locații Dacia lângă ${loc}`);
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') btn.click(); });

  empty.appendChild(formCard);
  block.appendChild(empty);
}
