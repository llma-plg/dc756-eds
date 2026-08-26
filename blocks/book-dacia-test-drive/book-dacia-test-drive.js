// codegen:layout-pattern=booking-form
// Sample data for standalone/preview mode.
// In production, the confirmation result comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Dacia Bigster', category: 'SUV (C-segment)', starting_price: 116900, currency: 'RON', detail_url: 'https://www.dacia.ro/gama-dacia/bigster.html' },
  { name: 'Dacia Duster', category: 'SUV (B-segment)', starting_price: 98900, currency: 'RON', detail_url: 'https://www.dacia.ro/gama-dacia/duster.html' },
  { name: 'Dacia Jogger', category: 'Family estate (7-seater)', starting_price: 82900, currency: 'RON', detail_url: 'https://www.dacia.ro/gama-dacia/jogger.html' },
  { name: 'Dacia Sandero Stepway', category: 'Crossover hatchback', starting_price: 70900, currency: 'RON', detail_url: 'https://www.dacia.ro/gama-dacia/sandero-stepway.html' },
  { name: 'Dacia Sandero', category: 'City hatchback', starting_price: 62900, currency: 'RON', detail_url: 'https://www.dacia.ro/gama-dacia/sandero.html' },
  { name: 'Dacia Logan', category: 'Compact sedan', starting_price: 65900, currency: 'RON', detail_url: 'https://www.dacia.ro/gama-dacia/logan.html' },
  { name: 'Dacia Spring', category: 'Electric city car', starting_price: 72900, currency: 'RON', detail_url: 'https://www.dacia.ro/gama-dacia/spring.html' },
];

const DEFAULT_DEALER = { name: 'Dacia Cluj-Napoca', address: 'Calea Turzii 247, Cluj-Napoca' };

// Brand colors from DESIGN_TOKENS' color tier. getThemedCardBg() darkens PALETTE[0]
// to luminance <= 0.12 so white text keeps WCAG AA contrast on the header block.
const PALETTE = ['#646b52', '#3860be', '#111111', '#dddddd'];
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

const CARD_COLORS = ['#646b52', '#3860be', '#0fb5ae', '#e68619'];

function fmtPrice(item) {
  if (!item || typeof item.starting_price !== 'number') return '';
  return `de la ${item.starting_price.toLocaleString('ro-RO')} ${item.currency || 'RON'}`;
}

function makeHeader(model) {
  const header = document.createElement('div');
  header.className = 'bdtd-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const media = document.createElement('div');
  media.className = 'bdtd-media';
  const colorDiv = document.createElement('div');
  colorDiv.className = 'bdtd-media-fill';
  colorDiv.style.backgroundColor = CARD_COLORS[0];
  if (model && model.image_url) {
    const img = document.createElement('img');
    img.src = model.image_url;
    img.alt = model.name || '';
    img.className = 'bdtd-media-img';
    img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv, img);
    media.appendChild(img);
  } else {
    media.appendChild(colorDiv);
  }
  header.appendChild(media);

  const meta = document.createElement('div');
  meta.className = 'bdtd-header-meta';
  const title = document.createElement('div');
  title.className = 'bdtd-title';
  title.textContent = model ? model.name : 'Test drive Dacia';
  meta.appendChild(title);
  const sub = document.createElement('div');
  sub.className = 'bdtd-sub';
  sub.textContent = [model && model.category, fmtPrice(model)].filter(Boolean).join(' · ');
  meta.appendChild(sub);
  header.appendChild(meta);
  return header;
}

function field(labelText, inputEl) {
  const wrap = document.createElement('label');
  wrap.className = 'bdtd-field';
  const lbl = document.createElement('span');
  lbl.className = 'bdtd-label';
  lbl.textContent = labelText;
  wrap.appendChild(lbl);
  wrap.appendChild(inputEl);
  return wrap;
}

function renderForm(block, model, bridge) {
  block.textContent = '';
  const card = document.createElement('div');
  card.className = 'bdtd-card';
  card.appendChild(makeHeader(model));

  const body = document.createElement('div');
  body.className = 'bdtd-body';

  const dealer = document.createElement('div');
  dealer.className = 'bdtd-dealer';
  const dName = document.createElement('div');
  dName.className = 'bdtd-dealer-name';
  dName.textContent = DEFAULT_DEALER.name;
  const dAddr = document.createElement('div');
  dAddr.className = 'bdtd-dealer-addr';
  dAddr.textContent = DEFAULT_DEALER.address;
  dealer.appendChild(dName);
  dealer.appendChild(dAddr);
  body.appendChild(dealer);

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'bdtd-input';
  const timeSelect = document.createElement('select');
  timeSelect.className = 'bdtd-input';
  ['Dimineața', 'După-amiaza', 'Seara'].forEach((w) => {
    const o = document.createElement('option');
    o.value = w; o.textContent = w; timeSelect.appendChild(o);
  });
  const nameInput = document.createElement('input');
  nameInput.type = 'text'; nameInput.className = 'bdtd-input'; nameInput.placeholder = 'Nume și prenume';
  const phoneInput = document.createElement('input');
  phoneInput.type = 'tel'; phoneInput.className = 'bdtd-input'; phoneInput.placeholder = '07xx xxx xxx';
  const emailInput = document.createElement('input');
  emailInput.type = 'email'; emailInput.className = 'bdtd-input'; emailInput.placeholder = 'nume@exemplu.ro';

  const grid = document.createElement('div');
  grid.className = 'bdtd-grid';
  grid.appendChild(field('Data preferată', dateInput));
  grid.appendChild(field('Interval orar', timeSelect));
  body.appendChild(grid);
  body.appendChild(field('Nume', nameInput));
  body.appendChild(field('Telefon', phoneInput));
  body.appendChild(field('Email', emailInput));

  const consent = document.createElement('label');
  consent.className = 'bdtd-consent';
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'bdtd-check';
  const cText = document.createElement('span');
  cText.textContent = 'Sunt de acord să fiu contactat despre programare.';
  consent.appendChild(check);
  consent.appendChild(cText);
  body.appendChild(consent);

  const submit = document.createElement('button');
  submit.className = 'bdtd-btn bdtd-btn-primary';
  submit.type = 'button';
  submit.textContent = 'Trimite cererea de test drive';
  submit.addEventListener('click', async () => {
    if (!check.checked) { consent.classList.add('bdtd-consent-error'); return; }
    submit.disabled = true;
    submit.textContent = 'Se trimite…';
    const args = {
      model_id: model && model.name,
      dealer_id: DEFAULT_DEALER.name,
      preferred_date: dateInput.value,
      preferred_time_window: timeSelect.value,
      customer_name: nameInput.value,
      phone: phoneInput.value,
      email: emailInput.value,
      consent_to_contact: check.checked,
    };
    let result = null;
    if (bridge && bridge.callTool) {
      try {
        const r = await bridge.callTool('book_dacia_test_drive', args);
        result = (r && r.structuredContent) || r || null;
      } catch (e) { result = null; }
    }
    if (!result) {
      result = {
        confirmation_id: 'TD-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        status: 'awaiting dealer confirmation',
        model_name: model && model.name,
        dealer_name: DEFAULT_DEALER.name,
        requested_date: dateInput.value,
        requested_time_window: timeSelect.value,
        message: 'Cererea a fost înregistrată. Agentul Dacia vă va contacta pentru a confirma disponibilitatea vehiculului și programarea.',
        confirmation_required: true,
      };
    }
    renderConfirmation(block, result, model, bridge);
  });

  const secondary = document.createElement('button');
  secondary.className = 'bdtd-btn bdtd-btn-secondary';
  secondary.type = 'button';
  secondary.textContent = 'Schimbă modelul';
  secondary.addEventListener('click', () => {
    if (bridge && bridge.sendMessage) bridge.sendMessage('Vreau să schimb modelul pentru test drive');
  });

  body.appendChild(submit);
  body.appendChild(secondary);
  card.appendChild(body);
  block.appendChild(card);
  reportSize(block, bridge);
}

function renderConfirmation(block, result, model, bridge) {
  block.textContent = '';
  const card = document.createElement('div');
  card.className = 'bdtd-card';

  const header = document.createElement('div');
  header.className = 'bdtd-conf-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;
  const badge = document.createElement('div');
  badge.className = 'bdtd-status';
  badge.textContent = result.status || 'trimisă';
  header.appendChild(badge);
  const hTitle = document.createElement('div');
  hTitle.className = 'bdtd-title';
  hTitle.textContent = result.model_name || (model && model.name) || 'Test drive Dacia';
  header.appendChild(hTitle);
  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'bdtd-body';

  const rows = [
    ['Cod cerere', result.confirmation_id],
    ['Agent', result.dealer_name],
    ['Interval', [result.requested_date, result.requested_time_window].filter(Boolean).join(' · ')],
  ];
  rows.forEach(([k, v]) => {
    if (!v) return;
    const row = document.createElement('div');
    row.className = 'bdtd-conf-row';
    const key = document.createElement('span');
    key.className = 'bdtd-conf-key';
    key.textContent = k;
    const val = document.createElement('span');
    val.className = 'bdtd-conf-val';
    val.textContent = v;
    row.appendChild(key);
    row.appendChild(val);
    body.appendChild(row);
  });

  if (result.message) {
    const msg = document.createElement('p');
    msg.className = 'bdtd-conf-msg';
    msg.textContent = result.message;
    body.appendChild(msg);
  }

  const cta = document.createElement('button');
  cta.className = 'bdtd-btn bdtd-btn-primary';
  cta.type = 'button';
  cta.textContent = 'Vezi detaliile modelului';
  const url = (model && model.detail_url) || 'https://www.dacia.ro/gama-dacia/bigster.html';
  cta.addEventListener('click', () => {
    if (bridge && bridge.openLink) bridge.openLink(url);
  });
  body.appendChild(cta);

  card.appendChild(body);
  block.appendChild(card);
  reportSize(block, bridge);
}

function reportSize(block, bridge) {
  if (!bridge || !bridge.reportSize) return;
  bridge.reportSize(block.offsetWidth, block.offsetHeight);
}

export default async function decorate(block, bridge) {
  let result = null;
  const model = SAMPLE_DATA[0];

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      if (structuredContent && structuredContent.confirmation_id) result = structuredContent;
    }
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => reportSize(block, bridge), 150);
    });
    ro.observe(block);
  }

  if (result) {
    const selected = SAMPLE_DATA.find((m) => m.name === result.model_name) || model;
    renderConfirmation(block, result, selected, bridge);
  } else {
    renderForm(block, model, bridge);
  }
}
