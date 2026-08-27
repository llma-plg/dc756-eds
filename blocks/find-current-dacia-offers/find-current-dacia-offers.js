// codegen:layout-pattern=deals-carousel
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    offer_id: 'bigster-rabla-2026',
    model_name: 'Dacia Bigster',
    image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Bigster%20GPL.jpg.ximg.xsmall.jpg/e6921f98ca.jpg',
    offer_price: 19290,
    currency: 'EUR',
    offer_type: 'Rabla campaign',
    customer_type: 'Private',
    eligibility_summary: 'Rabla trade-in required. Largest Dacia SUV, full hybrid.',
    valid_until: '2026-12-31',
    availability_note: 'Subject to Rabla program funding and stock.',
    offer_url: 'https://www.dacia.ro/gama-de-modele-hibride-si-electrice/bigster-suv.html',
  },
  {
    offer_id: 'duster-rabla-2026',
    model_name: 'Dacia Duster',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/duster-p1310/overview/editorial/dacia-duster-p1310-overview-004-1-mobile.jpg.ximg.xsmall.jpg/ba4175c768.jpg',
    offer_price: 15900,
    currency: 'EUR',
    offer_type: 'Rabla campaign',
    customer_type: 'Private',
    eligibility_summary: 'Rabla trade-in required. 4x4 with terrain mode selector.',
    valid_until: '2026-12-31',
    availability_note: 'Subject to Rabla program funding and stock.',
    offer_url: 'https://www.dacia.ro/gama-de-modele-hibride-si-electrice/duster-suv.html',
  },
  {
    offer_id: 'logan-rabla-2026',
    model_name: 'Dacia Logan',
    image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Logan%20GPL.jpg.ximg.xsmall.jpg/7d9c1a07d2.jpg',
    offer_price: 11990,
    currency: 'EUR',
    offer_type: 'Rabla campaign',
    customer_type: 'Private',
    eligibility_summary: 'Rabla trade-in required. Most affordable Dacia sedan.',
    valid_until: '2026-12-31',
    availability_note: 'Subject to Rabla program funding and stock.',
    offer_url: 'https://www.dacia.ro/gama-dacia/logan-berlina.html',
  },
  {
    offer_id: 'sandero-stepway-rabla-2026',
    model_name: 'Dacia Sandero Stepway',
    image_url: 'https://cdn.group.renault.com/dac/ro/bigster-duster-4x4.jpg.ximg.xsmall.jpg/cabdb68ae0.jpg',
    offer_price: 12990,
    currency: 'EUR',
    offer_type: 'Rabla campaign',
    customer_type: 'Private',
    eligibility_summary: 'Rabla trade-in required. Raised crossover with LPG.',
    valid_until: '2026-12-31',
    availability_note: 'Subject to Rabla program funding and stock.',
    offer_url: 'https://www.dacia.ro/gama-dacia/sandero-stepway-crossover.html',
  },
  {
    offer_id: 'spring-2026',
    model_name: 'Dacia Spring',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/dacia-bbg/spring-bbg-ph2/overview/editorial/dacia-spring-bbg-ph2-overview-029-portrait.jpg.ximg.xsmall.jpg/ace8f25eb0.jpg',
    offer_price: 13590,
    currency: 'EUR',
    offer_type: 'Campaign',
    customer_type: 'Private',
    eligibility_summary: '100% electric city car; optional fast charging.',
    valid_until: '',
    availability_note: 'Availability and financing conditions can change.',
    offer_url: 'https://www.dacia.ro/gama-de-modele-hibride-si-electrice/spring-masina-de-oras.html',
  },
  {
    offer_id: 'jogger-rabla-2026',
    model_name: 'Dacia Jogger',
    image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Jogger-GPL.jpg.ximg.xsmall.jpg/7292573e4a.jpg',
    offer_price: 15990,
    currency: 'EUR',
    offer_type: 'Rabla campaign',
    customer_type: 'Private',
    eligibility_summary: 'Rabla trade-in required. Up to 7 seats, long body.',
    valid_until: '2026-12-31',
    availability_note: 'Subject to Rabla program funding and stock.',
    offer_url: 'https://www.dacia.ro/gama-dacia/jogger.html',
  },
];

// Brand colors read from DESIGN_TOKENS' color tier (Step 1c).
// getThemedCardBg() darkens PALETTE[0] to luminance <= 0.12 so white text has WCAG AA contrast.
const PALETTE = ['#646b52', '#3860be'];
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

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

function formatPrice(item) {
  if (item.offer_price === undefined || item.offer_price === null || item.offer_price === '') return '';
  const num = Number(item.offer_price);
  const value = Number.isNaN(num) ? item.offer_price : num.toLocaleString('en-US');
  const currency = item.currency ? `${item.currency} ` : '';
  return `${currency}${value}`;
}

function renderOffers(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'find-current-dacia-offers-wrapper';

  const btnLeft = document.createElement('button');
  btnLeft.type = 'button';
  btnLeft.className = 'find-current-dacia-offers-arrow find-current-dacia-offers-arrow-left';
  btnLeft.setAttribute('aria-label', 'Scroll left');
  btnLeft.textContent = '◄';

  const trackWrap = document.createElement('div');
  trackWrap.className = 'find-current-dacia-offers-track-wrap';

  const track = document.createElement('div');
  track.className = 'find-current-dacia-offers-track';

  const btnRight = document.createElement('button');
  btnRight.type = 'button';
  btnRight.className = 'find-current-dacia-offers-arrow find-current-dacia-offers-arrow-right';
  btnRight.setAttribute('aria-label', 'Scroll right');
  btnRight.textContent = '►';

  const fade = document.createElement('div');
  fade.className = 'find-current-dacia-offers-fade';
  fade.style.background = `linear-gradient(to right, transparent, ${theme?.bg ?? '#1a1a1a'}cc)`;

  items.slice(0, 6).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'find-current-dacia-offers-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'find-current-dacia-offers-img';
    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.model_name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      imgWrap.appendChild(img);
    } else {
      imgWrap.appendChild(colorDiv());
    }

    if (item.offer_type) {
      const badge = document.createElement('span');
      badge.className = 'find-current-dacia-offers-deal-badge';
      badge.textContent = item.offer_type;
      imgWrap.appendChild(badge);
    }
    card.appendChild(imgWrap);

    const info = document.createElement('div');
    info.className = 'find-current-dacia-offers-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const name = document.createElement('div');
    name.className = 'find-current-dacia-offers-name';
    name.textContent = item.model_name || '';
    info.appendChild(name);

    const priceStr = formatPrice(item);
    if (priceStr) {
      const priceRow = document.createElement('div');
      priceRow.className = 'find-current-dacia-offers-price-row';
      const campaign = document.createElement('span');
      campaign.className = 'find-current-dacia-offers-campaign-label';
      campaign.textContent = 'Campaign price';
      priceRow.appendChild(campaign);
      const price = document.createElement('span');
      price.className = 'find-current-dacia-offers-price';
      price.textContent = priceStr;
      priceRow.appendChild(price);
      info.appendChild(priceRow);
    }

    const meta = document.createElement('div');
    meta.className = 'find-current-dacia-offers-meta';
    const metaParts = [];
    if (item.customer_type) metaParts.push(item.customer_type);
    if (item.valid_until) metaParts.push(`Until ${item.valid_until}`);
    meta.textContent = metaParts.join(' · ');
    if (metaParts.length) info.appendChild(meta);

    if (item.eligibility_summary) {
      const elig = document.createElement('div');
      elig.className = 'find-current-dacia-offers-elig';
      elig.textContent = item.eligibility_summary;
      info.appendChild(elig);
    }

    const cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'find-current-dacia-offers-cta';
    cta.textContent = 'View Offer Conditions';
    if (bridge) {
      cta.addEventListener('click', () => {
        if (item.offer_url) bridge.openLink(item.offer_url);
        else bridge.sendMessage(`Tell me more about the ${item.model_name} offer`);
      });
    }
    info.appendChild(cta);

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
  const scrollLeft = () => track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  const scrollRight = () => track.scrollBy({ left: cardWidth, behavior: 'smooth' });
  btnLeft.addEventListener('click', scrollLeft);
  btnRight.addEventListener('click', scrollRight);
  [btnLeft, btnRight].forEach((btn) => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (btn === btnLeft) scrollLeft(); else scrollRight();
      }
    });
  });
  const updateArrows = () => {
    btnLeft.style.display = track.scrollLeft <= 0 ? 'none' : 'flex';
    btnRight.style.display = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4 ? 'none' : 'flex';
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
      // structuredContent.offers — bare array outputSchema; key derived from actionName "find_current_dacia_offers"
      items = structuredContent?.offers || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  if (!items || !items.length) items = SAMPLE_DATA;

  block.textContent = '';
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
