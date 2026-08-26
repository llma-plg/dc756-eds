// codegen:layout-pattern=deals-carousel
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Dacia Bigster', category: 'SUV (C-segment)', body_style: 'SUV', starting_price: 116900, currency: 'RON', seats: 5, boot_capacity_liters: 667, powertrains: ['full hybrid 155', 'mild hybrid 140', 'mild hybrid 130 4x4', 'GPL/LPG'], versions: ['Expression', 'Extreme', 'Journey'], features: ['Dual-zone climate control', '10.1" media display', 'Wireless smartphone replication', 'Arkamys 3D sound', 'YouClip accessory system', 'Hill descent control', 'Level 2 driving assistance'], detail_url: 'https://www.dacia.ro/gama-dacia/bigster.html', configure_url: 'https://www.dacia.ro/configuratorul-nostru.html', is_deal: true },
  { name: 'Dacia Duster', category: 'SUV (B-segment)', body_style: 'SUV', starting_price: 98900, currency: 'RON', seats: 5, boot_capacity_liters: 517, powertrains: ['full hybrid 140', 'mild hybrid 130', 'mild hybrid 130 4x4', 'GPL/LPG'], versions: ['Essential', 'Expression', 'Extreme', 'Journey'], features: ['YouClip modular system', '10.1" touchscreen', 'Multiview camera', 'Hill descent control', 'Emergency braking assist', 'Sleep Pack (Extreme)'], detail_url: 'https://www.dacia.ro/gama-dacia/duster.html', configure_url: 'https://www.dacia.ro/configuratorul-nostru.html', is_deal: true },
  { name: 'Dacia Jogger', category: 'Family estate (7-seater)', body_style: 'Estate / MPV', starting_price: 82900, currency: 'RON', seats: 7, boot_capacity_liters: 708, powertrains: ['full hybrid 140', 'GPL/LPG', 'petrol TCe'], versions: ['Essential', 'Expression', 'Extreme'], features: ['Up to 7 seats', 'Removable third-row seats', 'Modular boot', 'Roof bars'], detail_url: 'https://www.dacia.ro/gama-dacia/jogger.html', configure_url: 'https://www.dacia.ro/configuratorul-nostru.html', is_deal: true },
  { name: 'Dacia Sandero Stepway', category: 'Crossover hatchback', body_style: 'Hatchback (raised)', starting_price: 70900, currency: 'RON', seats: 5, boot_capacity_liters: 328, powertrains: ['mild hybrid', 'GPL/LPG', 'petrol TCe'], versions: ['Expression', 'Extreme'], features: ['Raised ground clearance', 'Roof bars', 'Media Display', 'Emergency braking assist'], detail_url: 'https://www.dacia.ro/gama-dacia/sandero-stepway.html', configure_url: 'https://www.dacia.ro/configuratorul-nostru.html', is_deal: true },
  { name: 'Dacia Sandero', category: 'City hatchback', body_style: 'Hatchback', starting_price: 62900, currency: 'RON', seats: 5, boot_capacity_liters: 328, powertrains: ['GPL/LPG', 'petrol TCe'], versions: ['Essential', 'Expression'], features: ['Media Control / Media Display', 'Emergency braking assist', 'Cruise control'], detail_url: 'https://www.dacia.ro/gama-dacia/sandero.html', configure_url: 'https://www.dacia.ro/configuratorul-nostru.html', is_deal: true },
  { name: 'Dacia Logan', category: 'Compact sedan', body_style: 'Sedan', starting_price: 65900, currency: 'RON', seats: 5, boot_capacity_liters: 528, powertrains: ['GPL/LPG', 'petrol TCe'], versions: ['Essential', 'Expression'], features: ['Large 528L boot', 'Media Display', 'Rear parking sensors', 'Emergency braking assist'], detail_url: 'https://www.dacia.ro/gama-dacia/logan.html', configure_url: 'https://www.dacia.ro/configuratorul-nostru.html', is_deal: true },
  { name: 'Dacia Spring', category: 'Electric city car', body_style: 'Hatchback (EV)', starting_price: 72900, currency: 'RON', seats: 4, boot_capacity_liters: 308, powertrains: ['electric'], versions: ['Expression', 'Extreme'], features: ['100% electric', 'Up to ~225 km WLTP range', 'DC fast charging', 'Compact urban footprint'], detail_url: 'https://www.dacia.ro/gama-dacia/spring.html', configure_url: 'https://www.dacia.ro/configuratorul-nostru.html', is_deal: true },
];

const CONCEPT = 'deals-list';

// Brand palette from DESIGN_TOKENS.color (dacia.ro). Olive-green accent leads.
const PALETTE = ['#646b52', '#3860be', '#111111'];
// Near-black solid CTA fill per DESIGN_TOKENS.color.component.button.
const CTA_REST = '#111111';
const CTA_HOVER = '#000000';
const CARD_COLORS = ['#3a3f2e', '#2e3a3a', '#3a2e2e', '#2e2e3a', '#3a352e', '#2e3a30', '#352e3a', '#3a2e35'];

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
    const mid = (lo + hi) / 2;
    if (relLum(Math.round(r * mid), Math.round(g * mid), Math.round(b * mid)) > 0.12) hi = mid; else lo = mid;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}

const theme = getThemedCardBg(PALETTE);

function formatPrice(value, currency) {
  if (value === undefined || value === null || value === '') return '';
  const num = typeof value === 'number' ? value : Number(value);
  if (isNaN(num)) return String(value);
  const grouped = num.toLocaleString('ro-RO');
  return currency ? `${grouped} ${currency}` : grouped;
}

// Derive short warning chips from offer context (limited stock, Rabla, financing, expiry).
function deriveChips(item) {
  const chips = [];
  const blob = `${item.eligibility_notes || ''} ${item.savings_summary || ''} ${item.financing_context || ''}`.toLowerCase();
  if (/rabla/.test(blob)) chips.push('Rabla');
  if (/stoc|stock|limit/.test(blob)) chips.push('Stoc limitat');
  if (item.financing_context) chips.push('Finanțare');
  if (item.valid_until) {
    const end = new Date(item.valid_until);
    if (!isNaN(end.getTime())) {
      const days = Math.ceil((end.getTime() - Date.now()) / 86400000);
      if (days >= 0 && days <= 30) chips.push('Expiră curând');
    }
  }
  return chips.slice(0, 2);
}

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext && bridge.hostContext.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = (_result && _result.structuredContent) || {};
      // structuredContent.offers — derived from action name "find_dacia_offers" (bare array outputSchema rule)
      items = structuredContent.offers || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  if (!items || !items.length) items = SAMPLE_DATA;
  // AMCP-360 is_deal partition (keyed on concept): deals-list keeps only deal items.
  items = items.filter((it) => (CONCEPT === 'deals-list' ? it.is_deal !== false : it.is_deal !== true));

  renderOffers(block, items, bridge);

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

function renderOffers(block, items, bridge) {
  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'find-dacia-offers-wrapper';

  const btnLeft = document.createElement('button');
  btnLeft.className = 'find-dacia-offers-arrow find-dacia-offers-arrow-left';
  btnLeft.setAttribute('aria-label', 'Scroll left');
  btnLeft.textContent = '◄';

  const trackWrap = document.createElement('div');
  trackWrap.className = 'find-dacia-offers-track-wrap';

  const track = document.createElement('div');
  track.className = 'find-dacia-offers-track';

  const btnRight = document.createElement('button');
  btnRight.className = 'find-dacia-offers-arrow find-dacia-offers-arrow-right';
  btnRight.setAttribute('aria-label', 'Scroll right');
  btnRight.textContent = '►';

  const fade = document.createElement('div');
  fade.className = 'find-dacia-offers-fade';
  fade.style.background = `linear-gradient(to right, transparent, ${(theme && theme.bg) || '#1a1a1a'}cc)`;

  items.slice(0, 8).forEach((item, i) => {
    const title = item.model_name || item.name || '';
    const price = item.advertised_price !== undefined ? item.advertised_price : item.starting_price;
    const currency = item.currency || 'RON';
    const summary = item.savings_summary || item.financing_context || item.eligibility_notes || item.category || '';

    const card = document.createElement('div');
    card.className = 'find-dacia-offers-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'find-dacia-offers-img';

    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[i % CARD_COLORS.length]};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = title;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
      imgWrap.appendChild(img);
    } else {
      imgWrap.appendChild(colorDiv());
    }

    const chips = deriveChips(item);
    if (chips.length) {
      const chipWrap = document.createElement('div');
      chipWrap.className = 'find-dacia-offers-chips';
      chips.forEach((c) => {
        const chip = document.createElement('span');
        chip.className = 'find-dacia-offers-chip';
        chip.textContent = c;
        chipWrap.appendChild(chip);
      });
      imgWrap.appendChild(chipWrap);
    }
    card.appendChild(imgWrap);

    const info = document.createElement('div');
    info.className = 'find-dacia-offers-info';
    info.style.cssText = `background:${(theme && theme.bg) || '#1a1a1a'};color:${(theme && theme.fg) || '#fff'};`;

    const name = document.createElement('div');
    name.className = 'find-dacia-offers-name';
    name.textContent = item.offer_title || title;
    info.appendChild(name);

    if (item.offer_title && title && item.offer_title !== title) {
      const model = document.createElement('div');
      model.className = 'find-dacia-offers-model';
      model.textContent = title;
      info.appendChild(model);
    }

    if (summary) {
      const desc = document.createElement('div');
      desc.className = 'find-dacia-offers-desc';
      desc.textContent = summary;
      info.appendChild(desc);
    }

    const priceRow = document.createElement('div');
    priceRow.className = 'find-dacia-offers-price-row';
    const priceEl = document.createElement('span');
    priceEl.className = 'find-dacia-offers-price';
    priceEl.textContent = formatPrice(price, currency);
    priceRow.appendChild(priceEl);
    if (item.valid_until) {
      const valid = document.createElement('span');
      valid.className = 'find-dacia-offers-valid';
      valid.textContent = `până ${item.valid_until}`;
      priceRow.appendChild(valid);
    }
    info.appendChild(priceRow);

    const actions = document.createElement('div');
    actions.className = 'find-dacia-offers-actions';

    const primaryUrl = item.details_url || item.detail_url || item.request_offer_url || item.reservation_url || item.configure_url;
    const cta = document.createElement('button');
    cta.className = 'find-dacia-offers-cta';
    cta.textContent = 'Vezi oferta';
    if (bridge) {
      cta.addEventListener('click', () => {
        if (primaryUrl) bridge.openLink(primaryUrl);
        else bridge.sendMessage(`Spune-mi mai multe despre oferta ${name.textContent}`);
      });
    }
    actions.appendChild(cta);

    const secondaryUrl = item.reservation_url || item.request_offer_url;
    if (secondaryUrl) {
      const cta2 = document.createElement('button');
      cta2.className = 'find-dacia-offers-cta find-dacia-offers-cta-secondary';
      cta2.textContent = item.reservation_url ? 'Rezervă online' : 'Cere oferta';
      if (bridge) {
        cta2.addEventListener('click', () => bridge.openLink(secondaryUrl));
      }
      actions.appendChild(cta2);
    }

    info.appendChild(actions);
    card.appendChild(info);
    track.appendChild(card);
  });

  trackWrap.appendChild(track);
  trackWrap.appendChild(fade);
  wrapper.appendChild(btnLeft);
  wrapper.appendChild(trackWrap);
  wrapper.appendChild(btnRight);
  block.appendChild(wrapper);

  const cardWidth = 220 + 16;
  btnLeft.addEventListener('click', () => track.scrollBy({ left: -cardWidth, behavior: 'smooth' }));
  btnRight.addEventListener('click', () => track.scrollBy({ left: cardWidth, behavior: 'smooth' }));
  [btnLeft, btnRight].forEach((b) => {
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.click(); }
    });
  });
  const updateArrows = () => {
    btnLeft.style.display = track.scrollLeft <= 0 ? 'none' : 'flex';
    btnRight.style.display = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4 ? 'none' : 'flex';
  };
  track.addEventListener('scroll', updateArrows);
  updateArrows();
}
