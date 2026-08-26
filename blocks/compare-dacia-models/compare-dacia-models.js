// codegen:layout-pattern=comparison
// Sample data for standalone/preview mode. In production, data comes from bridge.toolResult.
const SAMPLE_DATA = [
  {
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
    is_deal: false,
  },
  {
    name: 'Dacia Duster',
    category: 'SUV (B-segment)',
    body_style: 'SUV',
    starting_price: 98900,
    currency: 'RON',
    seats: 5,
    boot_capacity_liters: 517,
    powertrains: ['full hybrid 140', 'mild hybrid 130', 'mild hybrid 130 4x4', 'GPL/LPG'],
    versions: ['Essential', 'Expression', 'Extreme', 'Journey'],
    features: [
      'YouClip modular system',
      '10.1" touchscreen',
      'Multiview camera',
      'Hill descent control',
      'Emergency braking assist',
      'Sleep Pack (Extreme)',
    ],
    detail_url: 'https://www.dacia.ro/gama-dacia/duster.html',
    configure_url: 'https://www.dacia.ro/configuratorul-nostru.html',
    is_deal: false,
  },
];

// Brand colors from DESIGN_TOKENS. getThemedCardBg darkens PALETTE[0] to luminance <= 0.12 for WCAG AA.
const PALETTE = ['#646b52', '#3860be', '#111111', '#ffffff', '#dddddd'];
const CARD_COLORS = ['#646b52', '#3860be', '#0fb5ae', '#e68619', '#d83790', '#2dca72'];
const ACCENT = '#646b52';

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

const get = {
  seats: (it) => it.passenger_capacity ?? it.seats,
  luggage: (it) => it.luggage_capacity_litres ?? it.boot_capacity_liters,
  powertrains: (it) => it.powertrain_types ?? it.powertrains ?? [],
  drivetrain: (it) => it.drivetrain_options ?? [],
  versions: (it) => it.versions ?? [],
  features: (it) => it.key_features ?? it.features ?? [],
};

function fmtPrice(it) {
  if (it.starting_price == null) return '—';
  const n = Number(it.starting_price).toLocaleString('ro-RO');
  return `${n} ${it.currency || ''}`.trim();
}

function differ(a, b) {
  const norm = (v) => (Array.isArray(v) ? v.join('|') : String(v ?? ''));
  return norm(a) !== norm(b);
}

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
      // structuredContent.models — bare array outputSchema; key derived from actionName "compare_dacia_models"
      items = structuredContent?.models || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderComparison(block, (items || []).slice(0, 2), bridge);

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

function specRow(label, value, isDiff) {
  const row = document.createElement('div');
  row.className = 'cdm-row';
  const l = document.createElement('span');
  l.className = 'cdm-row-label';
  l.textContent = label;
  const v = document.createElement('span');
  v.className = `cdm-row-value${isDiff ? ' cdm-diff' : ''}`;
  v.textContent = value;
  row.append(l, v);
  return row;
}

function renderComparison(block, items, bridge) {
  const wrap = document.createElement('div');
  wrap.className = 'cdm-wrap';

  const panels = document.createElement('div');
  panels.className = 'cdm-panels';

  const other = (i) => items[i === 0 ? 1 : 0] || {};

  items.forEach((item, i) => {
    const oth = other(i);
    const panel = document.createElement('div');
    panel.className = 'cdm-panel';

    // Image (pinned top) — color fallback when no image_url
    const imgBox = document.createElement('div');
    imgBox.className = 'cdm-image';
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.onerror = () => {
        const d = document.createElement('div');
        d.className = 'cdm-image-fallback';
        d.style.backgroundColor = CARD_COLORS[i % CARD_COLORS.length];
        img.parentNode.replaceChild(d, img);
      };
      imgBox.appendChild(img);
    } else {
      const d = document.createElement('div');
      d.className = 'cdm-image-fallback';
      d.style.backgroundColor = CARD_COLORS[i % CARD_COLORS.length];
      imgBox.appendChild(d);
    }
    panel.appendChild(imgBox);

    const content = document.createElement('div');
    content.className = 'cdm-content';
    content.style.background = theme?.bg ?? '#1a1a1a';
    content.style.color = theme?.fg ?? '#fff';

    // Name + price pinned top
    const name = document.createElement('h3');
    name.className = 'cdm-name';
    name.textContent = item.name || '—';
    content.appendChild(name);

    if (item.body_style || item.category) {
      const chip = document.createElement('span');
      chip.className = 'cdm-chip';
      chip.textContent = item.body_style || item.category;
      content.appendChild(chip);
    }

    const price = document.createElement('div');
    price.className = 'cdm-price';
    if (differ(item.starting_price, oth.starting_price)) price.classList.add('cdm-diff');
    price.textContent = fmtPrice(item);
    content.appendChild(price);

    if (item.price_context) {
      const pc = document.createElement('div');
      pc.className = 'cdm-price-context';
      pc.textContent = item.price_context;
      content.appendChild(pc);
    }

    const rows = document.createElement('div');
    rows.className = 'cdm-rows';

    rows.appendChild(specRow('Locuri', String(get.seats(item) ?? '—'), differ(get.seats(item), get.seats(oth))));
    rows.appendChild(specRow('Portbagaj', get.luggage(item) != null ? `${get.luggage(item)} l` : '—', differ(get.luggage(item), get.luggage(oth))));

    const pt = get.powertrains(item);
    if (pt.length) rows.appendChild(specRow('Motorizări', pt.join(', '), differ(pt, get.powertrains(oth))));

    const dt = get.drivetrain(item);
    if (dt.length) rows.appendChild(specRow('Tracțiune', dt.join(', '), differ(dt, get.drivetrain(oth))));

    const vs = get.versions(item);
    if (vs.length) rows.appendChild(specRow('Versiuni', vs.join(', '), differ(vs, get.versions(oth))));

    const ft = get.features(item);
    if (ft.length) rows.appendChild(specRow('Dotări', ft.slice(0, 4).join(', '), false));

    if (item.use_case_fit) rows.appendChild(specRow('Potrivire', item.use_case_fit, true));

    content.appendChild(rows);

    // CTAs
    const ctas = document.createElement('div');
    ctas.className = 'cdm-ctas';

    const configBtn = document.createElement('button');
    configBtn.className = 'cdm-btn cdm-btn-primary';
    configBtn.type = 'button';
    configBtn.textContent = 'Configurează';
    if (bridge) {
      configBtn.addEventListener('click', () => {
        if (item.configure_url) bridge.openLink(item.configure_url);
        else bridge.sendMessage(`Vreau să configurez ${item.name}`);
      });
    }
    ctas.appendChild(configBtn);

    const testBtn = document.createElement('button');
    testBtn.className = 'cdm-btn cdm-btn-secondary';
    testBtn.type = 'button';
    testBtn.textContent = 'Programează test drive';
    if (bridge) {
      testBtn.addEventListener('click', () => {
        if (item.detail_url) bridge.openLink(item.detail_url);
        else bridge.sendMessage(`Vreau să programez un test drive pentru ${item.name}`);
      });
    }
    ctas.appendChild(testBtn);

    content.appendChild(ctas);
    panel.appendChild(content);
    panels.appendChild(panel);
  });

  wrap.appendChild(panels);

  // Shared CTA
  const shared = document.createElement('button');
  shared.className = 'cdm-btn cdm-shared';
  shared.type = 'button';
  shared.textContent = 'Vezi ofertele';
  if (bridge) {
    shared.addEventListener('click', () => bridge.sendMessage('Arată-mi ofertele Dacia'));
  }
  wrap.appendChild(shared);

  block.appendChild(wrap);
}
