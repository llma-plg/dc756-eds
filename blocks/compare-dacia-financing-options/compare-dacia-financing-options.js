// codegen:layout-pattern=comparison
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    plan_id: 'dacia_credit',
    plan_name: 'Dacia Credit',
    financing_structure: 'Classic auto credit: you borrow the financed amount and repay it in fixed monthly instalments, becoming the outright owner from the start.',
    deposit_note: 'Optional deposit reduces the financed amount; 4,000 EUR on a 20,000 EUR vehicle lowers the amount to finance to 16,000 EUR.',
    term_note: 'Typical terms range from 12 to 60 months; 48 months requested.',
    rate_structure: 'Fixed annual interest rate for the whole term, so instalments stay predictable.',
    illustrative_monthly_payment: 372,
    currency: 'EUR',
    ownership_options: ['Own the vehicle from day one', 'No mileage limits', 'Keep the car after the final instalment'],
    flexibility_summary: 'Best when you want to keep the car long term with predictable, unchanging repayments.',
    required_documents: ['Valid ID', 'Proof of income', 'Proof of address'],
    important_conditions: ['Approval subject to eligibility and credit checks', 'Advertised rate depends on profile and term', 'Final APR confirmed in the official offer'],
  },
  {
    plan_id: 'financial_leasing',
    plan_name: 'Financial Leasing',
    financing_structure: 'Leasing: you pay to use the vehicle over the term with a set residual value, then choose to buy, return, or change it.',
    deposit_note: 'Upfront contribution lowers monthly payments; 4,000 EUR upfront reduces the amount spread across the term.',
    term_note: 'Common terms from 24 to 48 months; 48 months requested.',
    rate_structure: 'Rate reflected in the lease factor; monthly cost weighted by the agreed residual value.',
    illustrative_monthly_payment: 315,
    currency: 'EUR',
    ownership_options: ['Buy at the residual value', 'Return the vehicle', 'Change to a newer Dacia'],
    flexibility_summary: 'Best when you value lower monthly cost and the freedom to return or change the car at term end.',
    required_documents: ['Valid ID', 'Proof of income', 'Proof of address'],
    important_conditions: ['Mileage limits may apply', 'Excess wear or mileage can incur charges', 'Approval subject to eligibility and credit checks'],
  },
];

// Neutral tradeoff labels keyed off the financing option, per the widget spec.
const TRADEOFF_LABELS = {
  dacia_credit: 'Predictable repayment',
  financial_leasing: 'More end-of-term flexibility',
};

// Brand palette from DESIGN_TOKENS' color tier (olive accent + blue secondary).
const PALETTE = ['#646b52', '#3860be'];
// Distinct header fill per panel so the two options read as separate.
const PANEL_COLORS = ['#646b52', '#3860be'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
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

function fmtPayment(item) {
  const amount = item.illustrative_monthly_payment;
  if (amount === undefined || amount === null || amount === '') return '';
  const currency = item.currency === 'EUR' ? '€' : `${item.currency || ''} `;
  return `${currency}${amount}/mo`;
}

function buildPanel(item, index, bridge) {
  const panel = document.createElement('div');
  panel.className = 'compare-dacia-financing-options-panel';

  const header = document.createElement('div');
  header.className = 'compare-dacia-financing-options-panel-image';
  const headerColor = PANEL_COLORS[index % PANEL_COLORS.length];
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.plan_name || '';
    img.onerror = () => {
      const d = document.createElement('div');
      d.className = 'compare-dacia-financing-options-panel-image-fill';
      d.style.backgroundColor = headerColor;
      if (header.contains(img)) header.replaceChild(d, img);
    };
    header.appendChild(img);
  } else {
    header.style.backgroundColor = headerColor;
    const payment = fmtPayment(item);
    if (payment) {
      const hero = document.createElement('div');
      hero.className = 'compare-dacia-financing-options-panel-hero';
      const num = document.createElement('span');
      num.className = 'compare-dacia-financing-options-panel-hero-amount';
      num.textContent = payment;
      const cap = document.createElement('span');
      cap.className = 'compare-dacia-financing-options-panel-hero-caption';
      cap.textContent = 'Illustrative monthly payment';
      hero.appendChild(num);
      hero.appendChild(cap);
      header.appendChild(hero);
    }
  }
  panel.appendChild(header);

  const content = document.createElement('div');
  content.className = 'compare-dacia-financing-options-panel-content';
  content.style.background = theme ? theme.bg : '#1a1a1a';
  content.style.color = theme ? theme.fg : '#fff';

  const title = document.createElement('h3');
  title.className = 'compare-dacia-financing-options-panel-title';
  title.textContent = item.plan_name || '';
  content.appendChild(title);

  const label = TRADEOFF_LABELS[item.plan_id];
  if (label) {
    const badge = document.createElement('span');
    badge.className = 'compare-dacia-financing-options-panel-badge';
    badge.textContent = label;
    content.appendChild(badge);
  }

  if (item.flexibility_summary) {
    const desc = document.createElement('p');
    desc.className = 'compare-dacia-financing-options-panel-description';
    desc.textContent = item.flexibility_summary;
    content.appendChild(desc);
  }

  if (item.term_note) {
    const term = document.createElement('div');
    term.className = 'compare-dacia-financing-options-panel-term';
    term.textContent = item.term_note;
    content.appendChild(term);
  }

  const cta = document.createElement('button');
  cta.className = 'compare-dacia-financing-options-panel-cta';
  cta.type = 'button';
  cta.textContent = 'Request Financing Offer';
  if (bridge) {
    cta.addEventListener('click', () => {
      bridge.sendMessage(`Request a financing offer for ${item.plan_name}`);
    });
  }
  content.appendChild(cta);

  panel.appendChild(content);
  return panel;
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
      // structuredContent.options — bare array outputSchema; key derived from actionName "compare_dacia_financing_options"
      items = structuredContent?.options || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  if (!items || !items.length) items = SAMPLE_DATA;

  block.textContent = '';

  const row = document.createElement('div');
  row.className = 'compare-dacia-financing-options-row';
  const itemA = items[0] || {};
  const itemB = items[1] || items[0] || {};
  row.appendChild(buildPanel(itemA, 0, bridge));
  row.appendChild(buildPanel(itemB, 1, bridge));
  block.appendChild(row);

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
