// codegen:layout-pattern=carousel
// Sample data for standalone/preview mode — mirrors the handler's outputSchema shape.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { model_id: 'bigster', name: 'Dacia Bigster', description: 'Spacious C-segment SUV with a 667L boot and full-hybrid efficiency.', body_style: 'SUV', starting_price: 116900, currency: 'RON', price_context: 'Starting price, subject to current commercial offer.', passenger_capacity: 5, powertrain_types: ['full hybrid 155', 'mild hybrid 140', 'mild hybrid 130 4x4', 'GPL/LPG'], fit_summary: 'Five seats, 667L boot and hybrid economy for family trips.', image_url: '', details_url: 'https://www.dacia.ro/gama-dacia/bigster.html', configure_url: 'https://www.dacia.ro/configuratorul-nostru.html' },
  { model_id: 'duster', name: 'Dacia Duster', description: 'Rugged B-segment SUV with 517L boot and hybrid or 4x4 options.', body_style: 'SUV', starting_price: 98900, currency: 'RON', price_context: 'Starting price, subject to current commercial offer.', passenger_capacity: 5, powertrain_types: ['full hybrid 140', 'mild hybrid 130', 'mild hybrid 130 4x4', 'GPL/LPG'], fit_summary: 'Roomy five-seater, strong economy and optional 4x4.', image_url: '', details_url: 'https://www.dacia.ro/gama-dacia/duster.html', configure_url: 'https://www.dacia.ro/configuratorul-nostru.html' },
  { model_id: 'jogger', name: 'Dacia Jogger', description: 'Seven-seat family estate with a modular 708L boot.', body_style: 'Estate / MPV', starting_price: 82900, currency: 'RON', price_context: 'Starting price, subject to current commercial offer.', passenger_capacity: 7, powertrain_types: ['full hybrid 140', 'GPL/LPG', 'petrol TCe'], fit_summary: 'Most affordable roomy pick with hybrid economy for five.', image_url: '', details_url: 'https://www.dacia.ro/gama-dacia/jogger.html', configure_url: 'https://www.dacia.ro/configuratorul-nostru.html' },
  { model_id: 'sandero-stepway', name: 'Dacia Sandero Stepway', description: 'Raised crossover hatchback with roof bars and GPL economy.', body_style: 'Hatchback (raised)', starting_price: 70900, currency: 'RON', price_context: 'Starting price, subject to current commercial offer.', passenger_capacity: 5, powertrain_types: ['mild hybrid', 'GPL/LPG', 'petrol TCe'], fit_summary: 'Five seats and low running costs in a compact package.', image_url: '', details_url: 'https://www.dacia.ro/gama-dacia/sandero-stepway.html', configure_url: 'https://www.dacia.ro/configuratorul-nostru.html' },
  { model_id: 'sandero', name: 'Dacia Sandero', description: 'Value city hatchback with GPL and petrol powertrains.', body_style: 'Hatchback', starting_price: 62900, currency: 'RON', price_context: 'Starting price, subject to current commercial offer.', passenger_capacity: 5, powertrain_types: ['GPL/LPG', 'petrol TCe'], fit_summary: 'Lowest entry price with room for five and GPL economy.', image_url: '', details_url: 'https://www.dacia.ro/gama-dacia/sandero.html', configure_url: 'https://www.dacia.ro/configuratorul-nostru.html' },
  { model_id: 'logan', name: 'Dacia Logan', description: 'Compact sedan with a large 528L boot.', body_style: 'Sedan', starting_price: 65900, currency: 'RON', price_context: 'Starting price, subject to current commercial offer.', passenger_capacity: 5, powertrain_types: ['GPL/LPG', 'petrol TCe'], fit_summary: 'Five seats and a big 528L boot at a low price.', image_url: '', details_url: 'https://www.dacia.ro/gama-dacia/logan.html', configure_url: 'https://www.dacia.ro/configuratorul-nostru.html' },
  { model_id: 'spring', name: 'Dacia Spring', description: '100% electric city car with DC fast charging.', body_style: 'Hatchback (EV)', starting_price: 72900, currency: 'RON', price_context: 'Starting price, subject to current commercial offer.', passenger_capacity: 4, powertrain_types: ['electric'], fit_summary: 'Fully electric city runabout, best for four-up commuting.', image_url: '', details_url: 'https://www.dacia.ro/gama-dacia/spring.html', configure_url: 'https://www.dacia.ro/configuratorul-nostru.html' },
];

// Brand colors read from DESIGN_TOKENS' color tier — getThemedCardBg darkens PALETTE[0]
// to luminance <= 0.12 so white text has WCAG AA contrast.
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
  for (let i = 0; i < 20; i += 1) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#646b52', '#3860be', '#4a5240', '#2f4f4f', '#5a4632', '#3a3a3a', '#4046ca', '#72b340'];

function formatPrice(value, currency) {
  if (value === undefined || value === null || value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toLocaleString('ro-RO')} ${currency || ''}`.trim();
}

// Derive compact badges for the powertrain families that matter to buyers.
function deriveBadges(powertrains) {
  const list = Array.isArray(powertrains) ? powertrains.map((p) => String(p).toLowerCase()) : [];
  const badges = [];
  if (list.some((p) => p.includes('electric'))) badges.push('Electric');
  if (list.some((p) => p.includes('full hybrid'))) badges.push('Full hybrid');
  if (list.some((p) => p.includes('gpl') || p.includes('lpg'))) badges.push('GPL');
  if (list.some((p) => p.includes('4x4'))) badges.push('4x4');
  return badges;
}

function renderCards(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'discover-dacia-models-wrapper';

  const btnLeft = document.createElement('button');
  btnLeft.className = 'discover-dacia-models-arrow discover-dacia-models-arrow-left';
  btnLeft.setAttribute('aria-label', 'Scroll left');
  btnLeft.textContent = '◄';

  const trackWrap = document.createElement('div');
  trackWrap.className = 'discover-dacia-models-track-wrap';

  const track = document.createElement('div');
  track.className = 'discover-dacia-models-track';

  const btnRight = document.createElement('button');
  btnRight.className = 'discover-dacia-models-arrow discover-dacia-models-arrow-right';
  btnRight.setAttribute('aria-label', 'Scroll right');
  btnRight.textContent = '►';

  const fade = document.createElement('div');
  fade.className = 'discover-dacia-models-fade';
  fade.style.background = `linear-gradient(to right, transparent, ${theme ? theme.bg : '#1a1a1a'}cc)`;

  items.slice(0, 5).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'discover-dacia-models-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'discover-dacia-models-img';
    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
      imgWrap.appendChild(img);
    } else {
      imgWrap.appendChild(colorDiv());
    }
    card.appendChild(imgWrap);

    const info = document.createElement('div');
    info.className = 'discover-dacia-models-info';
    info.style.cssText = `background:${theme ? theme.bg : '#1a1a1a'};color:${theme ? theme.fg : '#fff'};`;

    const name = document.createElement('div');
    name.className = 'discover-dacia-models-name';
    name.textContent = item.name || '';
    info.appendChild(name);

    if (item.fit_summary || item.description) {
      const desc = document.createElement('div');
      desc.className = 'discover-dacia-models-desc';
      desc.textContent = item.fit_summary || item.description;
      info.appendChild(desc);
    }

    const metaRow = document.createElement('div');
    metaRow.className = 'discover-dacia-models-meta';
    const price = document.createElement('span');
    price.className = 'discover-dacia-models-price';
    price.textContent = formatPrice(item.starting_price, item.currency);
    metaRow.appendChild(price);
    const sub = document.createElement('span');
    sub.className = 'discover-dacia-models-sub';
    const bits = [];
    if (item.body_style) bits.push(item.body_style);
    if (item.passenger_capacity) bits.push(`${item.passenger_capacity} seats`);
    sub.textContent = bits.join(' · ');
    metaRow.appendChild(sub);
    info.appendChild(metaRow);

    const badges = deriveBadges(item.powertrain_types);
    if (badges.length) {
      const badgeRow = document.createElement('div');
      badgeRow.className = 'discover-dacia-models-badges';
      badges.forEach((b) => {
        const chip = document.createElement('span');
        chip.className = 'discover-dacia-models-badge';
        chip.textContent = b;
        badgeRow.appendChild(chip);
      });
      info.appendChild(badgeRow);
    }

    const cta = document.createElement('button');
    cta.className = 'discover-dacia-models-cta';
    cta.textContent = 'Descoperă modelul';
    if (bridge) {
      cta.addEventListener('click', () => {
        if (item.details_url) bridge.openLink(item.details_url);
        else bridge.sendMessage(`Spune-mi mai multe despre ${item.name}`);
      });
    }
    info.appendChild(cta);

    const secondRow = document.createElement('div');
    secondRow.className = 'discover-dacia-models-cta-row';
    const compare = document.createElement('button');
    compare.className = 'discover-dacia-models-cta-sec';
    compare.textContent = 'Compară';
    if (bridge) {
      compare.addEventListener('click', () => {
        bridge.sendMessage(`Compară ${item.name} cu alt model Dacia potrivit familiei mele`);
      });
    }
    secondRow.appendChild(compare);
    const configure = document.createElement('button');
    configure.className = 'discover-dacia-models-cta-sec';
    configure.textContent = 'Configurează';
    if (bridge) {
      configure.addEventListener('click', () => {
        if (item.configure_url) bridge.openLink(item.configure_url);
        else bridge.sendMessage(`Vreau să configurez ${item.name}`);
      });
    }
    secondRow.appendChild(configure);
    info.appendChild(secondRow);

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
  const scrollBy = (dir) => track.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
  btnLeft.addEventListener('click', () => scrollBy(-1));
  btnRight.addEventListener('click', () => scrollBy(1));
  [btnLeft, btnRight].forEach((btn, idx) => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollBy(idx === 0 ? -1 : 1); }
    });
  });
  const updateArrows = () => {
    btnLeft.style.display = track.scrollLeft <= 0 ? 'none' : 'flex';
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    btnRight.style.display = atEnd ? 'none' : 'flex';
  };
  track.addEventListener('scroll', updateArrows);
  updateArrows();
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
      // structuredContent.models — bare array outputSchema; key derived from actionName "discover_dacia_models"
      items = structuredContent?.models || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  if (!items || !items.length) items = SAMPLE_DATA;

  block.textContent = '';
  renderCards(block, items, bridge);

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
