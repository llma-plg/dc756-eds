// codegen:layout-pattern=carousel
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [{"model_id": "bigster", "name": "Dacia Bigster", "body_style": "SUV (C-segment)", "category": "SUV", "starting_price": 20490, "currency": "EUR", "powertrains": ["full hybrid 155", "hybrid-G 150 4x4 (petrol/LPG)", "mild hybrid 140", "eco-g 120 (LPG)"], "seats": 5, "available_versions": ["essential", "expression", "journey", "extreme"], "key_highlights": ["Largest Dacia SUV", "Available as full hybrid", "Up to 4x4 hybrid-G powertrain", "Rabla campaign price from 19,290 EUR"], "is_deal": true, "detail_url": "https://www.dacia.ro/gama-de-modele-hibride-si-electrice/bigster-suv.html", "image_url": "https://cdn.group.renault.com/dac/ro/gpl/Bigster%20GPL.jpg.ximg.xsmall.jpg/e6921f98ca.jpg"}, {"model_id": "duster", "name": "Dacia Duster", "body_style": "SUV (B-segment)", "category": "SUV", "starting_price": 17100, "currency": "EUR", "powertrains": ["hybrid-G 150 4x4 (petrol/LPG)", "hybrid 155", "mild hybrid 140", "eco-g 120 (LPG)", "hybrid 150 4x4", "eco-g 120 auto"], "seats": 5, "available_versions": ["essential", "expression", "journey", "extreme"], "key_highlights": ["Ground clearance up to 217 mm", "4x4 with terrain mode selector", "10-inch touchscreen", "Rabla campaign price from 15,900 EUR"], "is_deal": true, "detail_url": "https://www.dacia.ro/gama-de-modele-hibride-si-electrice/duster-suv.html", "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/duster-p1310/overview/editorial/dacia-duster-p1310-overview-004-1-mobile.jpg.ximg.xsmall.jpg/ba4175c768.jpg"}, {"model_id": "logan", "name": "Dacia Logan", "body_style": "Sedan", "category": "Sedan", "starting_price": 12741, "currency": "EUR", "powertrains": ["eco-g 120 (LPG)", "mild hybrid", "hybrid 155"], "seats": 5, "available_versions": ["essential", "expression", "journey"], "key_highlights": ["Most affordable Dacia sedan", "Large 528 L boot class", "LPG dual-fuel from factory", "Rabla campaign price from 11,990 EUR"], "is_deal": true, "detail_url": "https://www.dacia.ro/gama-dacia/logan-berlina.html", "image_url": "https://cdn.group.renault.com/dac/ro/gpl/Logan%20GPL.jpg.ximg.xsmall.jpg/7d9c1a07d2.jpg"}, {"model_id": "sandero-stepway", "name": "Dacia Sandero Stepway", "body_style": "Crossover / raised hatchback", "category": "Crossover", "starting_price": 13741, "currency": "EUR", "powertrains": ["eco-g 120 (LPG)", "hybrid 155", "mild hybrid"], "seats": 5, "available_versions": ["essential", "expression", "extreme"], "key_highlights": ["Raised crossover styling", "First electrified hybrid 155 powertrain", "LPG dual-fuel option", "Rabla campaign price from 12,990 EUR"], "is_deal": true, "detail_url": "https://www.dacia.ro/gama-dacia/sandero-stepway-crossover.html", "image_url": "https://cdn.group.renault.com/dac/ro/bigster-duster-4x4.jpg.ximg.xsmall.jpg/cabdb68ae0.jpg"}, {"model_id": "spring", "name": "Dacia Spring", "body_style": "City car (electric)", "category": "City car", "starting_price": 13590, "currency": "EUR", "powertrains": ["electric"], "seats": 4, "available_versions": ["essential", "expression", "extreme"], "key_highlights": ["100% electric", "Spring Extreme 100 CP version", "Boot capacity ~308 L", "Optional fast charging & V2L"], "is_deal": true, "detail_url": "https://www.dacia.ro/gama-de-modele-hibride-si-electrice/spring-masina-de-oras.html", "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/dacia-bbg/spring-bbg-ph2/overview/editorial/dacia-spring-bbg-ph2-overview-029-portrait.jpg.ximg.xsmall.jpg/ace8f25eb0.jpg"}, {"model_id": "jogger", "name": "Dacia Jogger", "body_style": "Estate / 7-seat MPV", "category": "MPV", "starting_price": 16650, "currency": "EUR", "powertrains": ["eco-g 120 (LPG)", "hybrid 155", "mild hybrid"], "seats": 7, "luggage_capacity_liters": 2094, "available_versions": ["essential", "expression", "journey", "extreme"], "key_highlights": ["Up to 7 seats", "Family-oriented long body", "Boot up to 2,094 L (5-seat config)", "Rabla campaign price from 15,990 EUR"], "is_deal": true, "detail_url": "https://www.dacia.ro/gama-dacia/jogger.html", "image_url": "https://cdn.group.renault.com/dac/ro/gpl/Jogger-GPL.jpg.ximg.xsmall.jpg/7292573e4a.jpg"}];

const CONCEPT = 'product-list';

// Brand colors from DESIGN_TOKENS' color tier — used to derive the card info-strip background.
const PALETTE = ['#646b52', '#3860be'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  if (hex.length !== 6) return null;
  const [r, g, b] = [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s=c/255; return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4); };
  const relLum = (rr,gg,bb) => 0.2126*lum(rr)+0.7152*lum(gg)+0.0722*lum(bb);
  if (relLum(r,g,b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo=0, hi=1;
  for (let i=0; i<20; i++) { const m=(lo+hi)/2; if (relLum(Math.round(r*m),Math.round(g*m),Math.round(b*m)) > 0.12) hi=m; else lo=m; }
  const dr=Math.round(r*lo), dg=Math.round(g*lo), db=Math.round(b*lo);
  return { bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`, fg:'#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#646b52', '#4b5240', '#5d644d', '#3860be', '#7a8264', '#2d3025'];

function powertrainLabel(pt) {
  const s = String(pt).toLowerCase();
  if (s.includes('electric')) return 'Electric';
  if (s.includes('lpg') || s.includes('eco-g')) return 'LPG';
  if (s.includes('hybrid')) return 'Hybrid';
  return String(pt).split(' ')[0];
}

function powertrainChips(powertrains) {
  const seen = [];
  (powertrains || []).forEach((pt) => {
    const label = powertrainLabel(pt);
    if (label && !seen.includes(label)) seen.push(label);
  });
  return seen.slice(0, 3);
}

function renderItems(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'find-dacia-models-wrapper';

  const btnLeft = document.createElement('button');
  btnLeft.className = 'find-dacia-models-arrow find-dacia-models-arrow-left';
  btnLeft.setAttribute('aria-label', 'Scroll left');
  btnLeft.textContent = '◄';

  const trackWrap = document.createElement('div');
  trackWrap.className = 'find-dacia-models-track-wrap';

  const track = document.createElement('div');
  track.className = 'find-dacia-models-track';

  const btnRight = document.createElement('button');
  btnRight.className = 'find-dacia-models-arrow find-dacia-models-arrow-right';
  btnRight.setAttribute('aria-label', 'Scroll right');
  btnRight.textContent = '►';

  const fade = document.createElement('div');
  fade.className = 'find-dacia-models-fade';
  fade.style.background = `linear-gradient(to right, transparent, ${theme?.bg ?? '#2d3025'}cc)`;

  items.slice(0, 6).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'find-dacia-models-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'find-dacia-models-img';
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[i % CARD_COLORS.length]};`;
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
    info.className = 'find-dacia-models-info';
    info.style.cssText = `background:${theme?.bg ?? '#2d3025'};color:${theme?.fg ?? '#fff'};`;

    const name = document.createElement('div');
    name.className = 'find-dacia-models-name';
    name.textContent = item.name || '';
    info.appendChild(name);

    if (item.body_style) {
      const desc = document.createElement('div');
      desc.className = 'find-dacia-models-desc';
      desc.textContent = item.body_style;
      info.appendChild(desc);
    }

    const priceRow = document.createElement('div');
    priceRow.className = 'find-dacia-models-price-row';
    if (typeof item.starting_price === 'number') {
      const price = document.createElement('span');
      price.className = 'find-dacia-models-price';
      const cur = item.currency === 'EUR' ? '€' : (item.currency ? item.currency + ' ' : '');
      price.textContent = `from ${cur}${item.starting_price.toLocaleString('en-US')}`;
      priceRow.appendChild(price);
    }
    if (typeof item.seats === 'number') {
      const seats = document.createElement('span');
      seats.className = 'find-dacia-models-seats';
      seats.textContent = `${item.seats} seats`;
      priceRow.appendChild(seats);
    }
    if (priceRow.childNodes.length) info.appendChild(priceRow);

    const chips = powertrainChips(item.powertrains);
    if (chips.length) {
      const chipRow = document.createElement('div');
      chipRow.className = 'find-dacia-models-chips';
      chips.forEach((c) => {
        const chip = document.createElement('span');
        chip.className = 'find-dacia-models-chip';
        chip.textContent = c;
        chipRow.appendChild(chip);
      });
      info.appendChild(chipRow);
    }

    if (Array.isArray(item.key_highlights) && item.key_highlights.length) {
      const ul = document.createElement('ul');
      ul.className = 'find-dacia-models-highlights';
      item.key_highlights.slice(0, 2).forEach((h) => {
        const li = document.createElement('li');
        li.textContent = h;
        ul.appendChild(li);
      });
      info.appendChild(ul);
    }

    const cta = document.createElement('button');
    cta.className = 'find-dacia-models-cta';
    cta.textContent = 'View Model';
    if (bridge) {
      cta.addEventListener('click', () => {
        if (item.detail_url) bridge.openLink(item.detail_url);
        else bridge.sendMessage(`Tell me more about the ${item.name}`);
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
  btnLeft.addEventListener('click', () => track.scrollBy({ left: -cardWidth, behavior: 'smooth' }));
  btnRight.addEventListener('click', () => track.scrollBy({ left: cardWidth, behavior: 'smooth' }));
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
      // structuredContent.models — bare array outputSchema; key derived from actionName "find_dacia_models"
      items = structuredContent?.models || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  if (!items || !items.length) items = SAMPLE_DATA;

  // AMCP-360 is_deal partition: deals-list keeps only deal items, other list concepts exclude them.
  // Guard against emptying the carousel when every item is flagged is_deal (as in this dataset).
  const partitioned = items.filter((it) => (CONCEPT === 'deals-list' ? it.is_deal === true : it.is_deal !== true));
  if (partitioned.length) items = partitioned;

  block.textContent = '';
  renderItems(block, items, bridge);

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
