// codegen:layout-pattern=generic-detail
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  vehicle_price: 22000,
  currency: 'EUR',
  deposit_amount: 5000,
  financed_amount: 17000,
  term_months: 60,
  estimated_monthly_payment: 310,
  scenarios: [
    {
      financing_type: 'Credit',
      ownership_timing: 'You own the vehicle from the start; the financer holds a lien until the final payment.',
      minimum_deposit_context: 'Published minimum deposit typically from ~15%.',
      term_context: 'Terms commonly 12–60 months.',
      fixed_rate_indicator: true,
      residual_value_context: 'No balloon payment; the loan fully amortises.',
      included_services: ['Optional GAP insurance', 'Optional maintenance pack'],
      key_tradeoffs: ['Higher monthly payment than leasing', 'Full ownership and no mileage limits'],
    },
    {
      financing_type: 'Financial leasing',
      ownership_timing: 'Ownership transfers at the end of the contract after the residual value is settled.',
      minimum_deposit_context: 'Advance payment commonly from ~10–20%.',
      term_context: 'Terms commonly 24–60 months.',
      fixed_rate_indicator: true,
      residual_value_context: 'A residual (balloon) value is due or refinanced at contract end.',
      included_services: ['CASCO insurance often bundled', 'Assistance package'],
      key_tradeoffs: ['Lower monthly payment', 'Residual value due at the end'],
    },
  ],
  disclaimer: 'Illustrative only — not a credit approval or binding finance offer.',
  request_offer_url: 'https://www.dacia.ro/oferte-financiare.html',
};

const ACCENT = '#646b52';

function fmtMoney(value, currency) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || 'EUR',
      maximumFractionDigits: 0,
    }).format(Number(value));
  } catch (e) {
    return `${Number(value).toLocaleString('en-GB')} ${currency || ''}`.trim();
  }
}

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
    }
  } else {
    item = SAMPLE_DATA;
  }

  block.textContent = '';

  if (!item || item.vehicle_price === undefined || item.vehicle_price === null) {
    const empty = document.createElement('p');
    empty.className = 'edf-empty';
    empty.textContent = 'No financing scenario is available for these inputs.';
    block.appendChild(empty);
  } else {
    renderFinancing(block, item, bridge);
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

function renderFinancing(block, item, bridge) {
  const currency = item.currency || 'EUR';
  const card = document.createElement('div');
  card.className = 'edf-card';

  // Section 1 — headline summary
  const summary = document.createElement('div');
  summary.className = 'edf-summary';

  const makeStat = (label, value, emphasized) => {
    const stat = document.createElement('div');
    stat.className = `edf-stat${emphasized ? ' edf-stat--hero' : ''}`;
    const l = document.createElement('span');
    l.className = 'edf-stat-label';
    l.textContent = label;
    const v = document.createElement('span');
    v.className = 'edf-stat-value';
    v.textContent = value;
    stat.appendChild(l);
    stat.appendChild(v);
    return stat;
  };

  summary.appendChild(makeStat('Vehicle price', fmtMoney(item.vehicle_price, currency), true));
  summary.appendChild(makeStat('Deposit', fmtMoney(item.deposit_amount, currency), false));
  summary.appendChild(makeStat('Financed', fmtMoney(item.financed_amount, currency), false));
  summary.appendChild(makeStat('Term', item.term_months ? `${item.term_months} mo` : '—', false));
  summary.appendChild(makeStat('Est. monthly', fmtMoney(item.estimated_monthly_payment, currency), true));
  card.appendChild(summary);

  // Section 2 — scenario cards
  const scenarios = Array.isArray(item.scenarios) ? item.scenarios : [];
  if (scenarios.length) {
    const grid = document.createElement('div');
    grid.className = 'edf-scenarios';

    scenarios.forEach((sc) => {
      const panel = document.createElement('div');
      panel.className = 'edf-scenario';

      const head = document.createElement('div');
      head.className = 'edf-scenario-head';
      const title = document.createElement('h3');
      title.className = 'edf-scenario-title';
      title.textContent = sc.financing_type || 'Financing route';
      head.appendChild(title);

      const chip = document.createElement('span');
      chip.className = 'edf-chip';
      chip.textContent = sc.fixed_rate_indicator ? 'Fixed rate' : 'Variable rate';
      head.appendChild(chip);
      panel.appendChild(head);

      const addRow = (label, value) => {
        if (!value) return;
        const row = document.createElement('div');
        row.className = 'edf-row';
        const rl = document.createElement('span');
        rl.className = 'edf-row-label';
        rl.textContent = label;
        const rv = document.createElement('span');
        rv.className = 'edf-row-value';
        rv.textContent = value;
        row.appendChild(rl);
        row.appendChild(rv);
        panel.appendChild(row);
      };

      addRow('Ownership', sc.ownership_timing);
      addRow('Residual value', sc.residual_value_context);

      if (Array.isArray(sc.included_services) && sc.included_services.length) {
        const svc = document.createElement('div');
        svc.className = 'edf-tags';
        sc.included_services.forEach((s) => {
          const tag = document.createElement('span');
          tag.className = 'edf-tag';
          tag.textContent = s;
          svc.appendChild(tag);
        });
        panel.appendChild(svc);
      }

      if (Array.isArray(sc.key_tradeoffs) && sc.key_tradeoffs.length) {
        const list = document.createElement('ul');
        list.className = 'edf-tradeoffs';
        sc.key_tradeoffs.forEach((t) => {
          const li = document.createElement('li');
          li.textContent = t;
          list.appendChild(li);
        });
        panel.appendChild(list);
      }

      grid.appendChild(panel);
    });
    card.appendChild(grid);
  }

  // Disclaimer (structured field) + CTAs
  const footer = document.createElement('div');
  footer.className = 'edf-footer';

  if (item.disclaimer) {
    const disc = document.createElement('p');
    disc.className = 'edf-disclaimer';
    disc.textContent = item.disclaimer;
    footer.appendChild(disc);
  }

  const actions = document.createElement('div');
  actions.className = 'edf-actions';

  const compareBtn = document.createElement('button');
  compareBtn.type = 'button';
  compareBtn.className = 'edf-btn edf-btn--secondary';
  compareBtn.textContent = 'Compară finanțarea';
  if (bridge) {
    compareBtn.addEventListener('click', () => {
      bridge.sendMessage('Compare the credit and financial leasing routes for this Dacia financing scenario in more detail.');
    });
  }
  actions.appendChild(compareBtn);

  const offerBtn = document.createElement('button');
  offerBtn.type = 'button';
  offerBtn.className = 'edf-btn edf-btn--primary';
  offerBtn.textContent = 'Cere ofertă';
  if (bridge && item.request_offer_url) {
    offerBtn.addEventListener('click', () => {
      bridge.openLink(item.request_offer_url);
    });
  }
  actions.appendChild(offerBtn);

  footer.appendChild(actions);
  card.appendChild(footer);

  block.appendChild(card);
}
