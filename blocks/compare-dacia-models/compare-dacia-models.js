// codegen:layout-pattern=comparison
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    model_id: 'bigster',
    name: 'Dacia Bigster',
    body_style: 'SUV (C-segment)',
    category: 'SUV',
    starting_price: 20490,
    currency: 'EUR',
    powertrains: ['full hybrid 155', 'hybrid-G 150 4x4 (petrol/LPG)', 'mild hybrid 140', 'eco-g 120 (LPG)'],
    seats: 5,
    available_versions: ['essential', 'expression', 'journey', 'extreme'],
    key_equipment: ['Largest Dacia SUV', 'Available as full hybrid', 'Up to 4x4 hybrid-G powertrain'],
    scenario_tradeoffs: ['Largest boot and cabin — best for family road trips', 'Higher starting price than Duster'],
    detail_url: 'https://www.dacia.ro/gama-de-modele-hibride-si-electrice/bigster-suv.html',
    image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Bigster%20GPL.jpg.ximg.xsmall.jpg/e6921f98ca.jpg',
  },
  {
    model_id: 'duster',
    name: 'Dacia Duster',
    body_style: 'SUV (B-segment)',
    category: 'SUV',
    starting_price: 17100,
    currency: 'EUR',
    powertrains: ['hybrid-G 150 4x4 (petrol/LPG)', 'hybrid 155', 'mild hybrid 140', 'eco-g 120 (LPG)', 'hybrid 150 4x4', 'eco-g 120 auto'],
    seats: 5,
    available_versions: ['essential', 'expression', 'journey', 'extreme'],
    key_equipment: ['Ground clearance up to 217 mm', '4x4 with terrain mode selector', '10-inch touchscreen'],
    scenario_tradeoffs: ['More affordable and easier to park', 'Smaller cabin than the Bigster'],
    detail_url: 'https://www.dacia.ro/gama-de-modele-hibride-si-electrice/duster-suv.html',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/duster-p1310/overview/editorial/dacia-duster-p1310-overview-004-1-mobile.jpg.ximg.xsmall.jpg/ba4175c768.jpg',
  },
];

// Brand palette read from DESIGN_TOKENS.color (olive-khaki accent).
const PALETTE = ['#646b52', '#3860be', '#000000', '#ffffff'];
const ACCENT = '#646b52';
const ACCENT_LIGHT = '#b9c19f'; // lightened olive for highlight text on the dark card strip

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
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

function formatPrice(item) {
  if (item.starting_price == null) return '';
  const symbols = { EUR: '€', USD: '$', GBP: '£', RON: 'lei ' };
  const sym = symbols[item.currency] || (item.currency ? `${item.currency} ` : '');
  const num = Number(item.starting_price).toLocaleString('en-US');
  return `from ${sym}${num}`;
}

function specValue(item, key) {
  const v = item[key];
  if (v == null) return '';
  if (Array.isArray(v)) return v.join(', ');
  if (key === 'luggage_capacity_liters') return `${v} L`;
  return String(v);
}

const SPEC_ROWS = [
  { key: 'seats', label: 'Seats' },
  { key: 'luggage_capacity_liters', label: 'Boot capacity' },
  { key: 'dimensions', label: 'Dimensions' },
  { key: 'powertrains', label: 'Powertrains' },
  { key: 'available_versions', label: 'Versions' },
  { key: 'key_equipment', label: 'Key equipment' },
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
      // structuredContent.models — derived from action name "compare_dacia_models" (bare array outputSchema rule)
      items = structuredContent?.models || [];
    }
  } else {
    items = SAMPLE_DATA;
  }
  if (!items || !items.length) items = SAMPLE_DATA;

  block.textContent = '';
  renderComparison(block, items, bridge);

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

function renderComparison(block, items, bridge) {
  const itemA = items[0] || {};
  const itemB = items[1] || items[0] || {};
  const pair = [itemA, itemB];

  const row = document.createElement('div');
  row.className = 'compare-dacia-models-row';

  pair.forEach((item, i) => {
    const other = pair[(i + 1) % 2];
    row.appendChild(buildPanel(item, other, bridge));
  });

  block.appendChild(row);
}

function buildPanel(item, other, bridge) {
  const panel = document.createElement('div');
  panel.className = 'compare-dacia-models-panel';

  // Image
  const imgPanel = document.createElement('div');
  imgPanel.className = 'compare-dacia-models-panel-image';
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => {
      const d = document.createElement('div');
      d.className = 'compare-dacia-models-panel-image-placeholder';
      if (img.parentNode) img.parentNode.replaceChild(d, img);
    };
    imgPanel.appendChild(img);
  } else {
    const d = document.createElement('div');
    d.className = 'compare-dacia-models-panel-image-placeholder';
    imgPanel.appendChild(d);
  }
  panel.appendChild(imgPanel);

  // Content
  const content = document.createElement('div');
  content.className = 'compare-dacia-models-panel-content';
  content.style.background = theme ? theme.bg : '#2a2d22';
  content.style.color = theme ? theme.fg : '#fff';

  const title = document.createElement('h3');
  title.className = 'compare-dacia-models-panel-title';
  title.textContent = item.name || '';
  content.appendChild(title);

  if (item.category || item.body_style) {
    const badge = document.createElement('span');
    badge.className = 'compare-dacia-models-panel-badge';
    badge.textContent = item.body_style || item.category;
    content.appendChild(badge);
  }

  const priceText = formatPrice(item);
  if (priceText) {
    const price = document.createElement('div');
    price.className = 'compare-dacia-models-panel-price';
    price.textContent = priceText;
    content.appendChild(price);
  }

  // Aligned spec rows — highlight values that differ from the other model.
  const specs = document.createElement('dl');
  specs.className = 'compare-dacia-models-specs';
  SPEC_ROWS.forEach((spec) => {
    const va = specValue(item, spec.key);
    const vb = specValue(other, spec.key);
    if (!va && !vb) return;

    const rowEl = document.createElement('div');
    rowEl.className = 'compare-dacia-models-spec';

    const dt = document.createElement('dt');
    dt.textContent = spec.label;
    rowEl.appendChild(dt);

    const dd = document.createElement('dd');
    dd.textContent = va || '—';
    if (va && va !== vb) dd.classList.add('is-diff');
    rowEl.appendChild(dd);

    specs.appendChild(rowEl);
  });
  content.appendChild(specs);

  // Best suited for
  const tradeoffs = Array.isArray(item.scenario_tradeoffs) ? item.scenario_tradeoffs : [];
  if (tradeoffs.length) {
    const best = document.createElement('div');
    best.className = 'compare-dacia-models-best';
    const bh = document.createElement('span');
    bh.className = 'compare-dacia-models-best-label';
    bh.textContent = 'Best suited for';
    best.appendChild(bh);
    const bp = document.createElement('p');
    bp.className = 'compare-dacia-models-best-text';
    bp.textContent = tradeoffs[0];
    best.appendChild(bp);
    content.appendChild(best);
  }

  // CTA — olive-filled primary, opens the model detail page.
  const cta = document.createElement('button');
  cta.className = 'compare-dacia-models-panel-cta';
  cta.type = 'button';
  cta.textContent = 'Configure This Model';
  if (bridge) {
    cta.addEventListener('click', () => {
      if (item.detail_url) bridge.openLink(item.detail_url);
      else bridge.sendMessage(`Tell me more about the ${item.name || 'model'}`);
    });
  }
  content.appendChild(cta);

  panel.appendChild(content);
  return panel;
}
