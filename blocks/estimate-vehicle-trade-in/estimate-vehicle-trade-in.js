// codegen:layout-pattern=generic-detail
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
// This is a detail concept — the result is a single flat valuation object.
const SAMPLE_DATA = {
  valuation_id: 'VAL-2016-HB-0007',
  vehicle_summary: '2016 Volkswagen Golf 1.6 TDI hatchback',
  make: 'Volkswagen',
  model: 'Golf',
  year: 2016,
  mileage_km: 128000,
  fuel_type: 'Diesel',
  condition: 'Good',
  estimated_value_low: 6200,
  estimated_value_high: 7800,
  currency: 'EUR',
  valuation_date: '2026-08-27',
  assumptions: [
    'No accident history reported',
    'Full service history available',
    'Standard factory equipment',
  ],
  factors_affecting_value: [
    'Actual mileage confirmed at inspection',
    'Tyre and brake wear',
    'Bodywork and interior condition',
    'Number of previous owners',
  ],
  status: 'preliminary',
  message:
    'This is a preliminary, non-binding estimate. A final offer requires an in-person inspection through the Dacia partner network.',
};

function fmtMoney(value, currency) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  try {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: currency || 'EUR',
      maximumFractionDigits: 0,
    }).format(n);
  } catch (e) {
    return `${n.toLocaleString('en-US')} ${currency || ''}`.trim();
  }
}

function fmtKm(value) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (Number.isNaN(n)) return `${value} km`;
  return `${n.toLocaleString('en-US')} km`;
}

function buildSummary(item) {
  const parts = [item.year, item.make, item.model].filter(Boolean);
  if (parts.length) return parts.join(' ');
  return item.vehicle_summary || 'Your vehicle';
}

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the item (flat), no wrapper key.
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
    }
  } else {
    item = SAMPLE_DATA;
  }

  block.textContent = '';

  const hasResult = item && (item.estimated_value_low !== undefined
    || item.estimated_value_high !== undefined
    || item.vehicle_summary || item.make);

  if (!hasResult) {
    const empty = document.createElement('p');
    empty.className = 'evti-empty';
    empty.textContent = 'No trade-in estimate is available yet.';
    block.appendChild(empty);
  } else {
    renderValuation(block, item, bridge);
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

function renderSteps(container) {
  const steps = document.createElement('div');
  steps.className = 'evti-steps';
  const defs = [
    { label: 'Vehicle details', state: 'done' },
    { label: 'Online estimate', state: 'active' },
    { label: 'Partner inspection', state: 'upcoming' },
  ];
  defs.forEach((def, i) => {
    if (i > 0) {
      const conn = document.createElement('span');
      conn.className = 'evti-step-connector';
      steps.appendChild(conn);
    }
    const step = document.createElement('div');
    step.className = `evti-step evti-step--${def.state}`;
    const marker = document.createElement('span');
    marker.className = 'evti-step-marker';
    marker.textContent = def.state === 'done' ? '✓' : String(i + 1);
    const label = document.createElement('span');
    label.className = 'evti-step-label';
    label.textContent = def.label;
    step.appendChild(marker);
    step.appendChild(label);
    steps.appendChild(step);
  });
  container.appendChild(steps);
}

function renderChips(container, values) {
  const row = document.createElement('div');
  row.className = 'evti-meta';
  values.filter(Boolean).forEach((val) => {
    const chip = document.createElement('span');
    chip.className = 'evti-chip';
    chip.textContent = val;
    row.appendChild(chip);
  });
  if (row.childElementCount) container.appendChild(row);
}

function renderList(container, title, values) {
  if (!Array.isArray(values) || !values.length) return;
  const wrap = document.createElement('div');
  wrap.className = 'evti-list';
  const heading = document.createElement('div');
  heading.className = 'evti-list-title';
  heading.textContent = title;
  wrap.appendChild(heading);
  const ul = document.createElement('ul');
  values.slice(0, 4).forEach((v) => {
    const li = document.createElement('li');
    li.textContent = v;
    ul.appendChild(li);
  });
  wrap.appendChild(ul);
  container.appendChild(wrap);
}

function renderValuation(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'evti-card';

  renderSteps(card);

  const head = document.createElement('div');
  head.className = 'evti-head';
  const title = document.createElement('h3');
  title.className = 'evti-title';
  title.textContent = buildSummary(item);
  head.appendChild(title);
  renderChips(head, [fmtKm(item.mileage_km), item.fuel_type, item.condition, item.transmission]);
  card.appendChild(head);

  const valueBlock = document.createElement('div');
  valueBlock.className = 'evti-value-block';

  const badge = document.createElement('span');
  badge.className = 'evti-badge';
  badge.textContent = 'Preliminary, non-binding estimate';
  valueBlock.appendChild(badge);

  const range = document.createElement('div');
  range.className = 'evti-range';
  const low = fmtMoney(item.estimated_value_low, item.currency);
  const high = fmtMoney(item.estimated_value_high, item.currency);
  range.textContent = low && high ? `${low} – ${high}` : (low || high || '');
  valueBlock.appendChild(range);

  if (item.valuation_date) {
    const date = document.createElement('div');
    date.className = 'evti-date';
    date.textContent = `Estimated on ${item.valuation_date}`;
    valueBlock.appendChild(date);
  }
  card.appendChild(valueBlock);

  const lists = document.createElement('div');
  lists.className = 'evti-lists';
  renderList(lists, 'Assumptions', item.assumptions);
  renderList(lists, 'Factors affecting value', item.factors_affecting_value);
  if (lists.childElementCount) card.appendChild(lists);

  const actions = document.createElement('div');
  actions.className = 'evti-actions';

  const primary = document.createElement('button');
  primary.className = 'evti-btn evti-btn--primary';
  primary.type = 'button';
  primary.textContent = 'Continue to Vehicle Inspection';
  if (bridge) {
    primary.addEventListener('click', () => {
      bridge.sendMessage("I'd like to continue to the in-person vehicle inspection for this trade-in estimate.");
    });
  }
  actions.appendChild(primary);

  const secondary = document.createElement('button');
  secondary.className = 'evti-btn evti-btn--secondary';
  secondary.type = 'button';
  secondary.textContent = 'Apply Estimate to a Dacia Purchase';
  if (bridge) {
    secondary.addEventListener('click', () => {
      bridge.sendMessage('Apply this trade-in estimate toward a Dacia purchase.');
    });
  }
  actions.appendChild(secondary);

  card.appendChild(actions);
  block.appendChild(card);
}
