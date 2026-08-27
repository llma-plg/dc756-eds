// codegen:layout-pattern=store-locator
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { store_id: 'dacia-service-cluj', name: 'Dacia Service Cluj', location_type: 'authorized repair center', address: 'Calea Turzii, Nr. 253-255, 400495 Cluj-Napoca', phone: '0264 438 443', available_services: 'sales, service' },
  { store_id: 'automobile-service-bistrita', name: 'Automobile Service', location_type: 'sales agent', address: 'Calea Moldovei, Nr. 22, 420096 Bistrita Nasaud', phone: '0263 207 010', available_services: 'sales, service' },
  { store_id: 'auto-becoro-baia-mare', name: 'Auto Becoro', location_type: 'sales agent', address: 'B-dul Independentei, Nr. 32, 430071 Baia Mare', phone: '0262 218 023', available_services: 'sales, service' },
  { store_id: 'auto-bara-oradea', name: 'Auto Bara & Co', location_type: 'sales agent', address: 'Sos. Borsului, Nr. 22, 410605 Oradea', phone: '0259 440 000', available_services: 'sales, service' },
];

// Brand palette read from DESIGN_TOKENS' color tier (olive-khaki accent).
const PALETTE = ['#646b52', '#3860be', '#000000', '#ffffff'];
function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const ACCENT = '#646b52';

const FILTERS = [
  { key: 'sales agent', label: 'Sales agent', match: (s) => (s.location_type || '').toLowerCase().includes('sales') },
  { key: 'repair center', label: 'Repair center', match: (s) => (s.location_type || '').toLowerCase().includes('repair') },
  { key: 'test drive', label: 'Test drive', match: (s) => (s.available_services || '').toLowerCase().includes('test') || (s.available_services || '').toLowerCase().includes('sales') },
  { key: 'service', label: 'Service', match: (s) => (s.available_services || '').toLowerCase().includes('service') },
  { key: 'lpg repair', label: 'LPG repair', match: (s) => (s.available_services || '').toLowerCase().includes('lpg') },
];

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      // structuredContent.dealers — bare array outputSchema; key derived from actionName "locate_dacia_dealer"
      items = structuredContent?.dealers || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderLocator(block, items, bridge);

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

function renderLocator(block, items, bridge) {
  const root = document.createElement('div');
  root.className = 'locate-dacia-dealer-root';

  if (!items || items.length === 0) {
    root.appendChild(buildEmptyState(bridge));
    block.appendChild(root);
    return;
  }

  let activeFilter = null;

  const chipRow = document.createElement('div');
  chipRow.className = 'locate-dacia-dealer-chips';

  const list = document.createElement('div');
  list.className = 'locate-dacia-dealer-list';

  const render = () => {
    list.textContent = '';
    const filtered = activeFilter ? items.filter(FILTERS.find((f) => f.key === activeFilter).match) : items;
    const shown = filtered.slice(0, 2);
    shown.forEach((store, i) => list.appendChild(buildStoreCard(store, i, i === 0, bridge)));
    if (shown.length === 0) {
      const none = document.createElement('div');
      none.className = 'locate-dacia-dealer-none';
      none.textContent = 'No matching locations. Try another filter.';
      list.appendChild(none);
    }
  };

  FILTERS.forEach((f) => {
    const supported = items.some(f.match);
    if (!supported) return;
    const chip = document.createElement('button');
    chip.className = 'locate-dacia-dealer-chip';
    chip.type = 'button';
    chip.textContent = f.label;
    chip.setAttribute('aria-pressed', 'false');
    chip.addEventListener('click', () => {
      activeFilter = activeFilter === f.key ? null : f.key;
      chipRow.querySelectorAll('.locate-dacia-dealer-chip').forEach((c) => {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      if (activeFilter === f.key) {
        chip.classList.add('is-active');
        chip.setAttribute('aria-pressed', 'true');
      }
      render();
    });
    chipRow.appendChild(chip);
  });

  root.appendChild(chipRow);
  root.appendChild(list);
  render();
  block.appendChild(root);
}

function buildStoreCard(store, index, isNearest, bridge) {
  const card = document.createElement('div');
  card.className = 'locate-dacia-dealer-card';
  card.style.background = theme?.bg ?? '#1a1a1a';
  card.style.color = theme?.fg ?? '#fff';

  const head = document.createElement('div');
  head.className = 'locate-dacia-dealer-card-head';

  const pin = document.createElement('div');
  pin.className = 'locate-dacia-dealer-pin';
  pin.setAttribute('aria-hidden', 'true');
  pin.textContent = '◉';
  head.appendChild(pin);

  const headText = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'locate-dacia-dealer-name';
  name.textContent = store.name || 'Dacia location';
  headText.appendChild(name);

  const type = document.createElement('div');
  type.className = 'locate-dacia-dealer-type';
  type.textContent = store.location_type || '';
  headText.appendChild(type);
  head.appendChild(headText);
  card.appendChild(head);

  if (isNearest && typeof store.distance_km === 'number') {
    const badge = document.createElement('span');
    badge.className = 'locate-dacia-dealer-badge';
    badge.textContent = 'Nearest';
    head.appendChild(badge);
  }

  const addr = document.createElement('div');
  addr.className = 'locate-dacia-dealer-addr';
  addr.textContent = store.address || '';
  card.appendChild(addr);

  const meta = document.createElement('div');
  meta.className = 'locate-dacia-dealer-meta';
  if (typeof store.distance_km === 'number') {
    const dist = document.createElement('span');
    dist.className = 'locate-dacia-dealer-dist';
    dist.textContent = `${store.distance_km} km away`;
    meta.appendChild(dist);
  }
  if (store.phone) {
    const phone = document.createElement('span');
    phone.className = 'locate-dacia-dealer-phone';
    phone.textContent = store.phone;
    meta.appendChild(phone);
  }
  card.appendChild(meta);

  if (store.opening_hours) {
    const hours = document.createElement('div');
    hours.className = 'locate-dacia-dealer-hours';
    hours.textContent = store.opening_hours;
    card.appendChild(hours);
  }

  const actions = document.createElement('div');
  actions.className = 'locate-dacia-dealer-actions';

  const primary = document.createElement('button');
  primary.className = 'locate-dacia-dealer-cta';
  primary.type = 'button';
  primary.textContent = 'Choose This Location';
  primary.addEventListener('click', () => {
    if (!bridge) return;
    if (store.directions_url) bridge.openLink(store.directions_url);
    else bridge.sendMessage(`I'd like to visit ${store.name}. What are the next steps?`);
  });
  actions.appendChild(primary);

  const secondary = document.createElement('button');
  secondary.className = 'locate-dacia-dealer-cta-secondary';
  secondary.type = 'button';
  secondary.textContent = 'Call Location';
  secondary.addEventListener('click', () => {
    if (!bridge) return;
    bridge.sendMessage(`How do I reach ${store.name}${store.phone ? ` at ${store.phone}` : ''} to confirm availability?`);
  });
  actions.appendChild(secondary);

  card.appendChild(actions);
  return card;
}

function buildEmptyState(bridge) {
  const wrap = document.createElement('div');
  wrap.className = 'locate-dacia-dealer-empty';
  wrap.style.background = theme?.bg ?? '#1a3a5c';
  wrap.style.color = theme?.fg ?? '#fff';

  const pin = document.createElement('div');
  pin.className = 'locate-dacia-dealer-empty-pin';
  pin.setAttribute('aria-hidden', 'true');
  pin.textContent = '◉';
  wrap.appendChild(pin);

  const heading = document.createElement('div');
  heading.className = 'locate-dacia-dealer-empty-heading';
  heading.textContent = 'Find a store near you';
  wrap.appendChild(heading);

  const input = document.createElement('input');
  input.className = 'locate-dacia-dealer-input';
  input.type = 'text';
  input.placeholder = 'Enter city or postal code…';
  input.setAttribute('aria-label', 'Search location');
  wrap.appendChild(input);

  const search = document.createElement('button');
  search.className = 'locate-dacia-dealer-search';
  search.type = 'button';
  search.textContent = 'Search';
  const submit = () => {
    const q = input.value.trim();
    if (bridge && q) bridge.sendMessage(`Find Dacia dealers near ${q}`);
  };
  search.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  wrap.appendChild(search);

  return wrap;
}
