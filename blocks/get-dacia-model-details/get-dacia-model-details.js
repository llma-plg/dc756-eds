// codegen:layout-pattern=detail-split
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: 'Dacia Bigster',
  category: 'SUV (C-segment)',
  body_style: 'SUV',
  starting_price: 116900,
  currency: 'RON',
  seats: 5,
  boot_capacity_liters: 667,
  powertrains: ['full hybrid 155', 'mild hybrid 140', 'mild hybrid 130 4x4', 'GPL/LPG'],
  versions: ['Expression', 'Extreme', 'Journey'],
  features: [
    'Dual-zone climate control',
    '10.1" media display',
    'Wireless smartphone replication',
    'Arkamys 3D sound',
    'YouClip accessory system',
    'Hill descent control',
    'Level 2 driving assistance',
  ],
  detail_url: 'https://www.dacia.ro/gama-dacia/bigster.html',
  configure_url: 'https://www.dacia.ro/configuratorul-nostru.html',
};

// Brand colors from DESIGN_TOKENS' color tier — getThemedCardBg darkens PALETTE[0]
// to luminance <= 0.12 so white text keeps WCAG AA contrast.
const PALETTE = ['#646b52', '#3860be', '#111111', '#ffffff', '#dddddd'];
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
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#646b52', '#3860be', '#0fb5ae', '#e68619', '#d83790', '#2dca72'];

function fmtPrice(item) {
  if (typeof item.starting_price !== 'number') return '';
  const val = item.starting_price.toLocaleString('ro-RO');
  return `de la ${val} ${item.currency || ''}`.trim();
}

function chip(label) {
  const c = document.createElement('span');
  c.className = 'gdmd-chip';
  c.textContent = label;
  return c;
}

function section(title, values) {
  const list = Array.isArray(values) ? values.filter(Boolean) : [];
  if (!list.length) return null;
  const details = document.createElement('details');
  details.className = 'gdmd-section';
  const summary = document.createElement('summary');
  summary.textContent = title;
  details.appendChild(summary);
  const ul = document.createElement('ul');
  list.forEach((v) => {
    const li = document.createElement('li');
    li.textContent = typeof v === 'string' ? v : (v.name || '');
    ul.appendChild(li);
  });
  details.appendChild(ul);
  return details;
}

function renderDetail(block, item, bridge) {
  const card = document.createElement('article');
  card.className = 'gdmd-card';

  // LEFT — image
  const media = document.createElement('div');
  media.className = 'gdmd-media';
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    media.appendChild(img);
  } else {
    media.appendChild(colorDiv());
  }
  card.appendChild(media);

  // RIGHT — content
  const content = document.createElement('div');
  content.className = 'gdmd-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const name = document.createElement('h3');
  name.className = 'gdmd-name';
  name.textContent = item.name || '';
  content.appendChild(name);

  const price = document.createElement('div');
  price.className = 'gdmd-price';
  price.textContent = fmtPrice(item);
  if (price.textContent) content.appendChild(price);

  const ctx = item.price_context;
  if (ctx) {
    const ctxEl = document.createElement('div');
    ctxEl.className = 'gdmd-price-context';
    ctxEl.textContent = ctx;
    content.appendChild(ctxEl);
  }

  const badges = document.createElement('div');
  badges.className = 'gdmd-badges';
  if (item.body_style || item.category) badges.appendChild(chip(item.body_style || item.category));
  const seats = item.passenger_capacity ?? item.seats;
  if (seats) badges.appendChild(chip(`${seats} locuri`));
  const powertrains = item.powertrain_types || item.powertrains || [];
  powertrains.slice(0, 3).forEach((p) => badges.appendChild(chip(p)));
  if (badges.childElementCount) content.appendChild(badges);

  // spec strip
  const spec = document.createElement('div');
  spec.className = 'gdmd-spec';
  const boot = item.luggage_capacity_litres ?? item.boot_capacity_liters;
  if (boot) {
    const s = document.createElement('span');
    s.textContent = `Portbagaj ${boot} L`;
    spec.appendChild(s);
  }
  if (powertrains.length) {
    const s = document.createElement('span');
    s.textContent = `${powertrains.length} motorizări`;
    spec.appendChild(s);
  }
  if (spec.childElementCount) content.appendChild(spec);

  // expandable sections (max 3)
  const secWrap = document.createElement('div');
  secWrap.className = 'gdmd-sections';
  const versions = (item.versions || []).map((v) => (typeof v === 'string' ? v : v.name));
  const keyFeatures = item.key_features || item.features || [];
  [
    section('Versiuni', versions),
    section('Dotări principale', keyFeatures),
    section('Motorizări', powertrains),
  ].filter(Boolean).slice(0, 3).forEach((s) => secWrap.appendChild(s));
  if (secWrap.childElementCount) content.appendChild(secWrap);

  // CTAs (max 2)
  const actions = document.createElement('div');
  actions.className = 'gdmd-actions';
  const configUrl = item.configure_url;
  const offerUrl = item.offer_url || item.detail_url;
  const mkBtn = (label, handler) => {
    const b = document.createElement('button');
    b.className = 'gdmd-cta';
    b.type = 'button';
    b.textContent = label;
    if (bridge) b.addEventListener('click', handler);
    return b;
  };
  if (configUrl) {
    actions.appendChild(mkBtn('Configurează', () => bridge.openLink(configUrl)));
  }
  if (offerUrl) {
    actions.appendChild(mkBtn('Cere ofertă', () => bridge.openLink(offerUrl)));
  } else if (!configUrl) {
    actions.appendChild(mkBtn('Cere ofertă', () => bridge.sendMessage(`Tell me more about ${item.name}`)));
  }
  if (actions.childElementCount) content.appendChild(actions);

  card.appendChild(content);
  block.appendChild(card);
}

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
    }
  } else {
    item = SAMPLE_DATA;
  }

  block.textContent = '';
  if (!item?.name) {
    const empty = document.createElement('p');
    empty.className = 'gdmd-empty';
    empty.textContent = 'No matching Dacia model was found.';
    block.appendChild(empty);
  } else {
    renderDetail(block, item, bridge);
  }

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
