// codegen:layout-pattern=booking-form
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_MODELS = [
  { model_id: 'bigster', name: 'Dacia Bigster', body_style: 'SUV (C-segment)', category: 'SUV', starting_price: 20490, currency: 'EUR', seats: 5, is_deal: true, detail_url: 'https://www.dacia.ro/gama-de-modele-hibride-si-electrice/bigster-suv.html', image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Bigster%20GPL.jpg.ximg.xsmall.jpg/e6921f98ca.jpg' },
  { model_id: 'duster', name: 'Dacia Duster', body_style: 'SUV (B-segment)', category: 'SUV', starting_price: 17100, currency: 'EUR', seats: 5, is_deal: true, detail_url: 'https://www.dacia.ro/gama-de-modele-hibride-si-electrice/duster-suv.html', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/duster-p1310/overview/editorial/dacia-duster-p1310-overview-004-1-mobile.jpg.ximg.xsmall.jpg/ba4175c768.jpg' },
  { model_id: 'logan', name: 'Dacia Logan', body_style: 'Sedan', category: 'Sedan', starting_price: 12741, currency: 'EUR', seats: 5, is_deal: true, detail_url: 'https://www.dacia.ro/gama-dacia/logan-berlina.html', image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Logan%20GPL.jpg.ximg.xsmall.jpg/7d9c1a07d2.jpg' },
  { model_id: 'sandero-stepway', name: 'Dacia Sandero Stepway', body_style: 'Crossover / raised hatchback', category: 'Crossover', starting_price: 13741, currency: 'EUR', seats: 5, is_deal: true, detail_url: 'https://www.dacia.ro/gama-dacia/sandero-stepway-crossover.html', image_url: 'https://cdn.group.renault.com/dac/ro/bigster-duster-4x4.jpg.ximg.xsmall.jpg/cabdb68ae0.jpg' },
  { model_id: 'spring', name: 'Dacia Spring', body_style: 'City car (electric)', category: 'City car', starting_price: 13590, currency: 'EUR', seats: 4, is_deal: true, detail_url: 'https://www.dacia.ro/gama-de-modele-hibride-si-electrice/spring-masina-de-oras.html', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/dacia-bbg/spring-bbg-ph2/overview/editorial/dacia-spring-bbg-ph2-overview-029-portrait.jpg.ximg.xsmall.jpg/ace8f25eb0.jpg' },
  { model_id: 'jogger', name: 'Dacia Jogger', body_style: 'Estate / 7-seat MPV', category: 'MPV', starting_price: 16650, currency: 'EUR', seats: 7, is_deal: true, detail_url: 'https://www.dacia.ro/gama-dacia/jogger.html', image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Jogger-GPL.jpg.ximg.xsmall.jpg/7292573e4a.jpg' },
];

// Brand colors from DESIGN_TOKENS (Dacia — olive-khaki accent).
const PALETTE = ['#646b52', '#3860be', '#000000'];
const CARD_COLORS = ['#646b52', '#3860be', '#0fb5ae', '#e68619', '#4046ca', '#72b340'];

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

function fmtPrice(item) {
  if (typeof item.starting_price !== 'number') return '';
  const cur = item.currency === 'EUR' ? '€' : (item.currency ? `${item.currency} ` : '');
  return `from ${cur}${item.starting_price.toLocaleString('en-US')}`;
}

function fmtSlot(dateStr, windowStr) {
  const parts = [];
  if (dateStr) parts.push(dateStr);
  if (windowStr) parts.push(windowStr);
  return parts.join(' · ');
}

export default async function decorate(block, bridge) {
  let models = SAMPLE_MODELS;
  let prefill = { model_name: 'Dacia Duster', dealer_id: '', dealer_name: '' };
  let confirmation = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      // booking-form: a returned confirmation_id means the request was already submitted.
      if (structuredContent.confirmation_id || structuredContent.status) {
        confirmation = structuredContent;
      }
      if (structuredContent.model_name) prefill.model_name = structuredContent.model_name;
      if (structuredContent.dealer_name) prefill.dealer_name = structuredContent.dealer_name;
    }
  }

  block.textContent = '';
  if (confirmation) {
    renderConfirmation(block, confirmation, bridge);
  } else {
    // Derive selected model from prefill; fall back to first option (never blindly OPTIONS[0]).
    const selected = models.find((m) => m.name === prefill.model_name) || models[0];
    renderForm(block, selected, models, prefill, bridge);
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

function buildHeader(model) {
  const header = document.createElement('div');
  header.className = 'bdtd-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const imgWrap = document.createElement('div');
  imgWrap.className = 'bdtd-hero';
  const fallbackColor = CARD_COLORS[0];
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    return d;
  };
  if (model.image_url) {
    const img = document.createElement('img');
    img.src = model.image_url;
    img.alt = model.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imgWrap.appendChild(img);
  } else {
    imgWrap.appendChild(colorDiv());
  }
  header.appendChild(imgWrap);

  const meta = document.createElement('div');
  meta.className = 'bdtd-header-meta';

  const title = document.createElement('h3');
  title.className = 'bdtd-title';
  title.textContent = `Book a Test Drive — ${model.name}`;
  meta.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'bdtd-desc';
  const bits = [model.body_style, fmtPrice(model)].filter(Boolean);
  desc.textContent = bits.join(' · ');
  meta.appendChild(desc);

  header.appendChild(meta);
  return header;
}

function labeledInput(labelText, name, type, value, attrs = {}) {
  const wrap = document.createElement('label');
  wrap.className = 'bdtd-field';

  const lbl = document.createElement('span');
  lbl.className = 'bdtd-label';
  lbl.textContent = labelText;
  wrap.appendChild(lbl);

  const input = document.createElement('input');
  input.className = 'bdtd-input';
  input.type = type;
  input.name = name;
  if (value) input.value = value;
  Object.entries(attrs).forEach(([k, v]) => input.setAttribute(k, v));
  wrap.appendChild(input);

  return { wrap, input };
}

function renderForm(block, model, models, prefill, bridge) {
  const card = document.createElement('div');
  card.className = 'bdtd-card';

  card.appendChild(buildHeader(model));

  const form = document.createElement('form');
  form.className = 'bdtd-form';
  form.setAttribute('novalidate', 'novalidate');

  // Section: appointment
  const modelField = labeledInput('Model', 'model_name', 'text', model.name, { readonly: 'readonly' });
  form.appendChild(modelField.wrap);

  const dateField = labeledInput('Preferred date', 'preferred_date', 'date', '', { required: 'required' });
  form.appendChild(dateField.wrap);

  const windowWrap = document.createElement('label');
  windowWrap.className = 'bdtd-field';
  const windowLbl = document.createElement('span');
  windowLbl.className = 'bdtd-label';
  windowLbl.textContent = 'Preferred time';
  windowWrap.appendChild(windowLbl);
  const windowSelect = document.createElement('select');
  windowSelect.className = 'bdtd-input';
  windowSelect.name = 'preferred_time_window';
  ['Morning', 'Afternoon', 'Evening'].forEach((opt) => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt;
    windowSelect.appendChild(o);
  });
  windowWrap.appendChild(windowSelect);
  form.appendChild(windowWrap);

  // Section: contact
  const nameField = labeledInput('Full name', 'full_name', 'text', '', { required: 'required', autocomplete: 'name' });
  form.appendChild(nameField.wrap);

  const phoneField = labeledInput('Phone', 'phone', 'tel', '', { required: 'required', autocomplete: 'tel' });
  form.appendChild(phoneField.wrap);

  const emailField = labeledInput('Email', 'email', 'email', '', { autocomplete: 'email' });
  form.appendChild(emailField.wrap);

  // Section: consent
  const consentWrap = document.createElement('label');
  consentWrap.className = 'bdtd-consent';
  const consentInput = document.createElement('input');
  consentInput.type = 'checkbox';
  consentInput.name = 'consent_to_contact';
  consentInput.className = 'bdtd-checkbox';
  consentWrap.appendChild(consentInput);
  const consentText = document.createElement('span');
  consentText.textContent = 'I agree the dealership may contact me about this request.';
  consentWrap.appendChild(consentText);
  form.appendChild(consentWrap);

  const errorMsg = document.createElement('p');
  errorMsg.className = 'bdtd-error';
  errorMsg.hidden = true;
  form.appendChild(errorMsg);

  const actions = document.createElement('div');
  actions.className = 'bdtd-actions';

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'bdtd-btn bdtd-btn-primary';
  submitBtn.textContent = 'Submit Test Drive Request';
  actions.appendChild(submitBtn);

  const changeBtn = document.createElement('button');
  changeBtn.type = 'button';
  changeBtn.className = 'bdtd-btn bdtd-btn-secondary';
  changeBtn.textContent = 'Change Dealer';
  if (bridge) {
    changeBtn.addEventListener('click', () => {
      bridge.sendMessage('I\'d like to choose a different Dacia dealer for my test drive');
    });
  }
  actions.appendChild(changeBtn);

  form.appendChild(actions);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.hidden = true;
    const args = {
      model_name: modelField.input.value.trim(),
      dealer_id: prefill.dealer_id || model.model_id,
      preferred_date: dateField.input.value,
      preferred_time_window: windowSelect.value,
      full_name: nameField.input.value.trim(),
      phone: phoneField.input.value.trim(),
      email: emailField.input.value.trim(),
      consent_to_contact: consentInput.checked,
    };
    if (!args.preferred_date || !args.full_name || !args.phone) {
      errorMsg.textContent = 'Please provide a date, your name, and a phone number.';
      errorMsg.hidden = false;
      return;
    }
    if (!args.consent_to_contact) {
      errorMsg.textContent = 'Please confirm you agree to be contacted about this request.';
      errorMsg.hidden = false;
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    if (bridge && typeof bridge.callTool === 'function') {
      try {
        const res = await bridge.callTool('book_dacia_test_drive', args);
        const sc = res?.structuredContent || res || {};
        renderConfirmation(block, {
          model_name: args.model_name,
          requested_slot: fmtSlot(args.preferred_date, args.preferred_time_window),
          ...sc,
        }, bridge);
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Test Drive Request';
        errorMsg.textContent = 'Something went wrong submitting your request. Please try again.';
        errorMsg.hidden = false;
      }
    } else {
      // Standalone/preview — show an optimistic confirmation.
      renderConfirmation(block, {
        confirmation_id: 'TD-PREVIEW-0001',
        status: 'submitted',
        message: 'Your test-drive request has been submitted. The dealership will confirm your appointment shortly.',
        model_name: args.model_name,
        dealer_name: prefill.dealer_name || 'Your selected Dacia dealer',
        requested_slot: fmtSlot(args.preferred_date, args.preferred_time_window),
      }, bridge);
    }
  });

  card.appendChild(form);
  block.appendChild(card);
}

function renderConfirmation(block, data, bridge) {
  block.textContent = '';
  const card = document.createElement('div');
  card.className = 'bdtd-card bdtd-confirm';

  const head = document.createElement('div');
  head.className = 'bdtd-confirm-head';
  head.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const badge = document.createElement('span');
  badge.className = 'bdtd-status';
  badge.textContent = (data.status || 'submitted').replace(/_/g, ' ');
  head.appendChild(badge);

  const title = document.createElement('h3');
  title.className = 'bdtd-title';
  title.textContent = 'Test Drive Requested';
  head.appendChild(title);

  card.appendChild(head);

  const body = document.createElement('div');
  body.className = 'bdtd-confirm-body';

  const rows = [
    ['Model', data.model_name],
    ['Dealer', data.dealer_name],
    ['Requested slot', data.requested_slot],
    ['Confirmation', data.confirmation_id],
  ];
  rows.forEach(([k, v]) => {
    if (!v) return;
    const row = document.createElement('div');
    row.className = 'bdtd-row';
    const rk = document.createElement('span');
    rk.className = 'bdtd-row-key';
    rk.textContent = k;
    const rv = document.createElement('span');
    rv.className = 'bdtd-row-val';
    rv.textContent = v;
    row.appendChild(rk);
    row.appendChild(rv);
    body.appendChild(row);
  });

  if (data.message) {
    const msg = document.createElement('p');
    msg.className = 'bdtd-message';
    msg.textContent = data.message;
    body.appendChild(msg);
  }

  card.appendChild(body);
  block.appendChild(card);

  if (bridge) bridge.reportSize(block.offsetWidth, block.offsetHeight);
}
