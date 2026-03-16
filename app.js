import {
  communities,
  competitors,
  plans,
  inventoryHomes,
  salesRecords,
  startRecommendations,
  websiteLogs,
  dataSources,
} from './data.js';

const state = {
  view: 'communities',
  selectedCommunityId: communities[0]?.id,
  dateRange: '6m',
  priceFilter: 'all',
  productFilter: 'all',
  sfFilter: 'all',
  includedCompetitors: new Set(competitors.filter((c) => c.active).map((c) => c.id)),
  assumption: {
    monthsOfSupply: 4,
    absorption: 3,
    minSf: 1800,
    maxSf: 2600,
    minPrice: 380000,
    maxPrice: 520000,
    costPerSf: 150,
    marginTarget: 18,
  },
  uploadPreview: null,
};

const navItems = [
  { id: 'communities', label: 'Communities', icon: '🏘️' },
  { id: 'competitors', label: 'Competitors', icon: '🧭' },
  { id: 'market', label: 'Market Data', icon: '📊' },
  { id: 'start', label: 'Start Strategy', icon: '🚀' },
  { id: 'reports', label: 'Reports & Exports', icon: '📄' },
  { id: 'settings', label: 'Settings & Data Sources', icon: '⚙️' },
];

const app = document.getElementById('app');

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatCurrency(value) {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return `$${formatNumber(Math.round(value))}`;
}

function getCommunity() {
  return communities.find((c) => c.id === state.selectedCommunityId) ?? communities[0];
}

function parseMonths(dateRange) {
  switch (dateRange) {
    case '3m':
      return 3;
    case '6m':
      return 6;
    case '12m':
      return 12;
    case '24m':
      return 24;
    default:
      return 6;
  }
}

function filterSales({ includeCompetitors = true } = {}) {
  const months = parseMonths(state.dateRange);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const selected = getCommunity();
  return salesRecords.filter((record) => {
    const recordDate = new Date(record.closeDate);
    if (recordDate < cutoff) return false;
    if (record.type === 'new' && state.productFilter !== 'all') {
      const plan = plans.find((p) => p.planName === record.planName);
      if (plan && plan.productType !== state.productFilter) return false;
    }
    if (record.communityId === selected.id) return true;
    if (!includeCompetitors) return false;
    return state.includedCompetitors.has(record.communityId);
  });
}

function calcAbsorption(records) {
  const months = parseMonths(state.dateRange);
  if (!records.length) return 0;
  return +(records.length / months).toFixed(2);
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function buildLayout() {
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="logo">MarketField</div>
        ${navItems
          .map(
            (item) => `
              <div class="nav-item ${state.view === item.id ? 'active' : ''}" data-nav="${item.id}">
                <span>${item.icon}</span>
                <span>${item.label}</span>
              </div>
            `,
          )
          .join('')}
      </aside>
      <main>
        ${renderTopBar()}
        <div class="view-container" id="view-container"></div>
      </main>
    </div>
  `;

  app.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', () => {
      state.view = el.dataset.nav;
      buildLayout();
      renderView();
    });
  });

  attachTopBarEvents();
}

function renderTopBar() {
  const communityOptions = communities
    .map(
      (community) => `
        <option value="${community.id}" ${community.id === state.selectedCommunityId ? 'selected' : ''}>
          ${community.name}
        </option>
      `,
    )
    .join('');

  return `
    <div class="top-bar">
      <div>
        <label class="metric-label">Community</label>
        <select id="community-select">${communityOptions}</select>
      </div>
      <div>
        <label class="metric-label">Date range</label>
        <select id="date-range">
          <option value="3m" ${state.dateRange === '3m' ? 'selected' : ''}>Last 3 months</option>
          <option value="6m" ${state.dateRange === '6m' ? 'selected' : ''}>Last 6 months</option>
          <option value="12m" ${state.dateRange === '12m' ? 'selected' : ''}>Last 12 months</option>
          <option value="24m" ${state.dateRange === '24m' ? 'selected' : ''}>Last 24 months</option>
        </select>
      </div>
      <div class="filter-chips">
        ${['all', 'under-400', '400-500', '500-plus']
          .map((filter) => renderChip(filter, state.priceFilter, 'price'))
          .join('')}
      </div>
      <div class="filter-chips">
        ${['all', 'single-family', 'townhome']
          .map((filter) => renderChip(filter, state.productFilter, 'product'))
          .join('')}
      </div>
      <div class="filter-chips">
        ${['all', '1600-2000', '2000-2400', '2400-plus']
          .map((filter) => renderChip(filter, state.sfFilter, 'sf'))
          .join('')}
      </div>
    </div>
  `;
}

function renderChip(value, selected, type) {
  const labels = {
    all: 'All',
    'under-400': '< $400K',
    '400-500': '$400K-$500K',
    '500-plus': '$500K+',
    'single-family': 'Single-family',
    townhome: 'Townhome',
    '1600-2000': '1,600-2,000 SF',
    '2000-2400': '2,000-2,400 SF',
    '2400-plus': '2,400+ SF',
  };
  return `
    <div class="filter-chip ${selected === value ? 'active' : ''}" data-chip="${type}" data-value="${value}">
      ${labels[value] || value}
    </div>
  `;
}

function attachTopBarEvents() {
  const communitySelect = app.querySelector('#community-select');
  communitySelect?.addEventListener('change', (event) => {
    state.selectedCommunityId = event.target.value;
    renderView();
  });

  const dateRange = app.querySelector('#date-range');
  dateRange?.addEventListener('change', (event) => {
    state.dateRange = event.target.value;
    renderView();
  });

  app.querySelectorAll('[data-chip]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const { chip: chipType, value } = chip.dataset;
      const key =
        chipType === 'price' ? 'priceFilter' : chipType === 'product' ? 'productFilter' : 'sfFilter';
      state[key] = value;
      renderView();
      buildLayout();
    });
  });
}

function renderView() {
  const container = document.getElementById('view-container');
  if (!container) return;

  switch (state.view) {
    case 'communities':
      container.innerHTML = renderCommunityOverview();
      attachCommunityEvents();
      break;
    case 'competitors':
      container.innerHTML = renderCompetitorsView();
      attachCompetitorEvents();
      break;
    case 'market':
      container.innerHTML = renderMarketDataView();
      attachMarketDataEvents();
      break;
    case 'start':
      container.innerHTML = renderStartStrategy();
      attachStartEvents();
      break;
    case 'reports':
      container.innerHTML = renderReports();
      attachReportEvents();
      break;
    case 'settings':
      container.innerHTML = renderSettings();
      attachSettingsEvents();
      break;
    default:
      container.innerHTML = '<p>Coming soon</p>';
  }
}

function renderCommunityOverview() {
  const selected = getCommunity();
  const sales = filterSales();
  const medianPrice = median(sales.map((s) => s.soldPrice));
  const medianSf = median(sales.map((s) => s.squareFeet));
  const medianPpsf = median(sales.map((s) => s.soldPrice / s.squareFeet));
  const absorption = calcAbsorption(sales);

  return `
    <section class="section-card">
      <div class="section-title">${selected.name} • Community Overview</div>
      <div class="grid-3">
        ${renderCommunityCard(selected)}
        ${renderCommunityKpis({ medianPrice, medianSf, medianPpsf, absorption })}
        ${renderWhatChanged(selected)}
      </div>
    </section>
    <section class="section-card">
      <div class="section-title">Market Snapshot</div>
      ${renderMarketSnapshot({ medianPrice, medianSf, medianPpsf, absorption })}
    </section>
    <section class="section-card">
      <div class="section-title">Competitive Positioning</div>
      ${renderCompetitiveChart(selected)}
    </section>
    <section class="section-card grid-2">
      <div>
        <div class="section-title">Price Band Distribution</div>
        ${renderHistogram('price')}
      </div>
      <div>
        <div class="section-title">Square Footage Distribution</div>
        ${renderHistogram('sf')}
      </div>
    </section>
    <section class="section-card">
      <div class="section-title">Inventory Overview</div>
      ${renderInventoryOverview(selected)}
    </section>
  `;
}

function renderCommunityCard(community) {
  return `
    <div class="metric-card">
      <h3>${community.name}</h3>
      <p>${community.submarket} • ${community.productType}</p>
      <p class="metric-label">${community.address}</p>
      <div class="grid-3" style="margin-top: 12px;">
        <div>
          <div class="metric-label">Lots total</div>
          <div class="metric-value">${community.lotCount.total}</div>
        </div>
        <div>
          <div class="metric-label">Delivered</div>
          <div class="metric-value">${community.lotCount.delivered}</div>
        </div>
        <div>
          <div class="metric-label">Future</div>
          <div class="metric-value">${community.lotCount.future}</div>
        </div>
      </div>
      <div style="margin-top: 16px;">
        <span class="tag">${community.priceBand}</span>
        <span class="tag">Buyer: ${community.buyerProfile}</span>
      </div>
      <p style="margin-top: 12px; font-size: 13px; color: var(--muted);">${community.notes}</p>
    </div>
  `;
}

function renderCommunityKpis({ medianPrice, medianSf, medianPpsf, absorption }) {
  const competitivePosition = medianSf > 2200 ? 'Larger than peers' : 'Mid-pack on SF';
  return `
    <div class="metric-card">
      <div class="grid-2">
        <div>
          <div class="metric-label">Median price</div>
          <div class="metric-value">${formatCurrency(medianPrice)}</div>
        </div>
        <div>
          <div class="metric-label">Median SF</div>
          <div class="metric-value">${formatNumber(Math.round(medianSf))} SF</div>
        </div>
        <div>
          <div class="metric-label">Price per SF</div>
          <div class="metric-value">${medianPpsf ? `$${medianPpsf.toFixed(0)}` : '—'}</div>
        </div>
        <div>
          <div class="metric-label">Absorption</div>
          <div class="metric-value">${absorption} /mo</div>
        </div>
      </div>
      <div style="margin-top: 16px;">
        <div class="metric-label">Competitive position</div>
        <p style="margin: 4px 0 0; font-weight: 600;">${competitivePosition}</p>
      </div>
    </div>
  `;
}

function renderWhatChanged(community) {
  const priceChange = (Math.random() * 1.5 - 0.5).toFixed(1);
  const inventoryChange = (Math.random() * 2 - 1).toFixed(1);
  const absorptionChange = (Math.random() * 1 - 0.5).toFixed(1);
  return `
    <div class="metric-card">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h3>What changed?</h3>
        <div class="tag">vs last 4 weeks</div>
      </div>
      <div class="timeline">
        <div class="timeline-item">
          <strong>Competitor pricing</strong>
          <p style="margin:4px 0;color:var(--muted);">${priceChange}% shift in avg list price.</p>
        </div>
        <div class="timeline-item">
          <strong>Spec inventory</strong>
          <p style="margin:4px 0;color:var(--muted);">${inventoryChange} specs net change nearby.</p>
        </div>
        <div class="timeline-item">
          <strong>Absorption pace</strong>
          <p style="margin:4px 0;color:var(--muted);">${absorptionChange} closings/mo vs prior period.</p>
        </div>
      </div>
      <p style="font-size:13px;color:var(--muted);margin-top:12px;">
        Updates derived from MLS + website pulls for ${community.submarket}.
      </p>
    </div>
  `;
}

function renderMarketSnapshot({ medianPrice, medianSf, medianPpsf, absorption }) {
  const stats = [
    { label: 'Median price', value: formatCurrency(medianPrice) },
    { label: 'Median SF', value: `${formatNumber(Math.round(medianSf || 0))} SF` },
    { label: 'Median $/SF', value: medianPpsf ? `$${medianPpsf.toFixed(0)}` : '—' },
    { label: 'Absorption', value: `${absorption} /mo` },
  ];
  return `
    <div class="grid-4">
      ${stats
        .map(
          (stat) => `
            <div class="metric-card">
              <div class="metric-label">${stat.label}</div>
              <div class="metric-value">${stat.value}</div>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderCompetitiveChart(selected) {
  const relevantCommunities = [selected, ...competitors.filter((c) => state.includedCompetitors.has(c.id))];
  const resalePoints = salesRecords.filter((s) => s.type === 'resale');
  const scatterPoints = relevantCommunities
    .map((community) => {
      const communityPlans = plans.filter((plan) => plan.communityId === community.id);
      const avgSf = average(communityPlans.map((p) => p.squareFeet)) || 0;
      const avgPrice = average(communityPlans.map((p) => p.basePrice)) || 0;
      return {
        label: community.name,
        type: community.id === selected.id ? 'subject' : 'competitor',
        sf: avgSf,
        price: avgPrice,
      };
    })
    .filter((point) => point.sf && point.price);

  const resaleScatter = resalePoints.slice(0, 15).map((sale) => ({
    label: sale.address,
    type: 'resale',
    sf: sale.squareFeet,
    price: sale.soldPrice,
  }));

  const maxSf = Math.max(...scatterPoints.map((p) => p.sf), ...resaleScatter.map((p) => p.sf), 1);
  const maxPrice = Math.max(...scatterPoints.map((p) => p.price), ...resaleScatter.map((p) => p.price), 1);

  const renderPoint = (point) => {
    const left = (point.sf / maxSf) * 100;
    const top = 100 - (point.price / maxPrice) * 100;
    return `<div class="chart-point ${point.type}" style="left:${left}%;top:${top}%" title="${point.label}\n${formatNumber(
      Math.round(point.sf),
    )} SF | ${formatCurrency(point.price)}"></div>`;
  };

  return `
    <div class="chart-grid">
      ${scatterPoints.map(renderPoint).join('')}
      ${resaleScatter.map(renderPoint).join('')}
      <div style="position:absolute;bottom:8px;right:16px;font-size:12px;color:var(--muted);">
        SF ➜
      </div>
      <div style="position:absolute;top:16px;left:8px;font-size:12px;color:var(--muted);transform:rotate(-90deg);">
        Price ➜
      </div>
      <div style="position:absolute;bottom:8px;left:16px;display:flex;gap:12px;font-size:12px;">
        <span><span class="chart-point subject" style="position:static;"></span> Subject</span>
        <span><span class="chart-point competitor" style="position:static;"></span> Competitor</span>
        <span><span class="chart-point resale" style="position:static;"></span> Resale</span>
      </div>
    </div>
  `;
}

function renderHistogram(type) {
  const sales = filterSales();
  const buckets = type === 'price'
    ? [
        { label: '<$350K', match: (sale) => sale.soldPrice < 350000 },
        { label: '$350K-$400K', match: (sale) => sale.soldPrice >= 350000 && sale.soldPrice < 400000 },
        { label: '$400K-$450K', match: (sale) => sale.soldPrice >= 400000 && sale.soldPrice < 450000 },
        { label: '$450K-$500K', match: (sale) => sale.soldPrice >= 450000 && sale.soldPrice < 500000 },
        { label: '$500K+', match: (sale) => sale.soldPrice >= 500000 },
      ]
    : [
        { label: '<1,800', match: (sale) => sale.squareFeet < 1800 },
        { label: '1,800-2,000', match: (sale) => sale.squareFeet >= 1800 && sale.squareFeet < 2000 },
        { label: '2,000-2,300', match: (sale) => sale.squareFeet >= 2000 && sale.squareFeet < 2300 },
        { label: '2,300-2,600', match: (sale) => sale.squareFeet >= 2300 && sale.squareFeet < 2600 },
        { label: '2,600+', match: (sale) => sale.squareFeet >= 2600 },
      ];

  const max = Math.max(
    ...buckets.map((bucket) => sales.filter(bucket.match).length),
    1,
  );

  return `
    <div class="bar-chart">
      ${buckets
        .map((bucket) => {
          const count = sales.filter(bucket.match).length;
          const width = (count / max) * 100;
          return `
            <div class="bar-row">
              <div class="bar-label">${bucket.label}</div>
              <div class="bar"><span style="width:${width}%"></span></div>
              <div style="width:24px;text-align:right;font-size:13px;">${count}</div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderInventoryOverview(community) {
  const relevantInventory = inventoryHomes.filter(
    (home) => home.communityId === community.id || state.includedCompetitors.has(home.communityId),
  );
  const stages = ['not started', 'frame', 'drywall', 'trim', 'complete'];
  const stageRows = stages.map((stage) => {
    const count = relevantInventory.filter((home) => home.stage === stage).length;
    return `<div class="inventory-stage"><span>${stage}</span><strong>${count}</strong></div>`;
  });
  const monthsOfSupply = calcAbsorption(filterSales())
    ? (relevantInventory.length / calcAbsorption(filterSales())).toFixed(1)
    : '—';

  return `
    <div class="grid-2">
      <div>
        ${stageRows.join('')}
      </div>
      <div class="metric-card">
        <div class="metric-label">Specs tracked</div>
        <div class="metric-value">${relevantInventory.length}</div>
        <div class="metric-label" style="margin-top:12px;">Months of supply</div>
        <div class="metric-value">${monthsOfSupply}</div>
        <p style="font-size:13px;color:var(--muted);margin-top:12px;">
          Includes subject + included competitors for current filters.
        </p>
      </div>
    </div>
  `;
}

function renderCompetitorsView() {
  const selected = getCommunity();
  const includedCompetitors = competitors.filter((comp) => state.includedCompetitors.has(comp.id));
  const competitorCards = competitors
    .map((comp) => {
      const checked = state.includedCompetitors.has(comp.id) ? 'checked' : '';
      return `
        <div class="section-card">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <h3 style="margin:0;">${comp.builder} • ${comp.name}</h3>
              <p class="metric-label">${comp.distanceMiles} mi • ${comp.productType}</p>
            </div>
            <label class="toggle">
              <input type="checkbox" data-competitor="${comp.id}" ${checked} />
              Include
            </label>
          </div>
          <div class="grid-3" style="margin-top:12px;">
            <div>
              <div class="metric-label">Price range</div>
              <div class="metric-value">${comp.priceRange || '—'}</div>
            </div>
            <div>
              <div class="metric-label">Tags</div>
              <div>${comp.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
            </div>
            <div>
              <div class="metric-label">Status</div>
              <div class="status-pill ${comp.active ? 'success' : 'warning'}">${comp.active ? 'active' : 'inactive'}</div>
            </div>
          </div>
          <div style="margin-top:12px;font-size:13px;">
            <a href="${comp.website}" target="_blank" rel="noreferrer">${comp.website}</a>
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <section class="section-card">
      <div class="section-title">Competitor Map & List</div>
      <div class="map-placeholder" id="map-placeholder">
        ${renderMapPoints(selected, competitors)}
      </div>
      <div class="grid-2" style="margin-top:16px;">
        <div class="section-card" style="padding:16px;">
          <div class="section-title" style="margin-top:0;">Search & Radius</div>
          <div class="form-grid">
            <div>
              <label>Radius (miles)</label>
              <input type="number" value="5" min="1" />
            </div>
            <div>
              <label>Search builder</label>
              <input type="text" placeholder="Builder name" />
            </div>
            <div>
              <label>Search community</label>
              <input type="text" placeholder="Community name" />
            </div>
          </div>
        </div>
        <div class="section-card" style="padding:16px;">
          <div class="section-title" style="margin-top:0;">Manual input</div>
          <div class="form-grid">
            <div>
              <label>Community name</label>
              <input type="text" id="manual-name" placeholder="New competitor" />
            </div>
            <div>
              <label>Builder</label>
              <input type="text" id="manual-builder" placeholder="Builder" />
            </div>
            <div>
              <label>Website URL</label>
              <input type="url" id="manual-url" placeholder="https://" />
            </div>
          </div>
          <label style="display:block;margin-top:12px;">Address</label>
          <textarea id="manual-address" placeholder="123 Main St, City, ST"></textarea>
          <button class="button primary" id="manual-save" style="margin-top:12px;">Add competitor</button>
          <p id="manual-feedback" style="font-size:13px;color:var(--muted);"></p>
        </div>
      </div>
    </section>
    <section class="section-card">
      <div class="section-title">Competitors (${includedCompetitors.length} included)</div>
      <div class="grid-2">
        ${competitorCards}
      </div>
    </section>
    <section class="section-card">
      <div class="section-title">Competitor Detail</div>
      ${renderCompetitorDetail()}
    </section>
  `;
}

function renderMapPoints(selected, competitorsList) {
  const allPoints = [selected, ...competitorsList];
  const lats = allPoints.map((pt) => pt.coordinates?.lat ?? selected.coordinates.lat);
  const lngs = allPoints.map((pt) => pt.coordinates?.lng ?? selected.coordinates.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return allPoints
    .map((point) => {
      const lat = point.coordinates?.lat ?? selected.coordinates.lat;
      const lng = point.coordinates?.lng ?? selected.coordinates.lng;
      const left = ((lng - minLng) / (maxLng - minLng || 1)) * 80 + 10;
      const top = 90 - ((lat - minLat) / (maxLat - minLat || 1)) * 80;
      const cls = point.id === selected.id ? 'subject' : 'competitor';
      return `<div class="map-point ${cls}" style="left:${left}%;top:${top}%" title="${point.name}"></div>`;
    })
    .join('');
}

function renderCompetitorDetail() {
  const included = competitors.filter((comp) => state.includedCompetitors.has(comp.id));
  const selectedComp = included[0] ?? competitors[0];
  const compPlans = plans.filter((plan) => plan.communityId === selectedComp.id);
  const compInventory = inventoryHomes.filter((home) => home.communityId === selectedComp.id);

  return `
    <div class="grid-2">
      <div class="metric-card">
        <h3 style="margin-top:0;">${selectedComp.builder} • ${selectedComp.name}</h3>
        <p class="metric-label">${selectedComp.productType}</p>
        <div class="grid-2">
          <div>
            <div class="metric-label">Price range</div>
            <div class="metric-value">${selectedComp.priceRange || '—'}</div>
          </div>
          <div>
            <div class="metric-label">Distance</div>
            <div class="metric-value">${selectedComp.distanceMiles ?? '—'} mi</div>
          </div>
        </div>
        <div style="margin-top:16px;">
          ${selectedComp.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
      <div>
        <div class="section-title" style="margin-top:0;">Key facts</div>
        <ul style="padding-left:18px; color:var(--muted); font-size:14px; line-height:1.6;">
          <li>Average plan size ${formatNumber(Math.round(average(compPlans.map((p) => p.squareFeet))))} SF</li>
          <li>Inventory count ${compInventory.length}</li>
          <li>Website: <a href="${selectedComp.website}" target="_blank" rel="noreferrer">${selectedComp.website}</a></li>
        </ul>
      </div>
    </div>
    <div style="margin-top:24px;">
      <h4>Plans</h4>
      <table class="table">
        <thead>
          <tr>
            <th>Plan</th>
            <th>SF</th>
            <th>Beds</th>
            <th>Baths</th>
            <th>Base price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${compPlans
            .map(
              (plan) => `
                <tr>
                  <td>${plan.planName}</td>
                  <td>${formatNumber(plan.squareFeet)}</td>
                  <td>${plan.beds}</td>
                  <td>${plan.baths}</td>
                  <td>${formatCurrency(plan.basePrice)}</td>
                  <td>${plan.status}</td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
    <div style="margin-top:24px;">
      <h4>Inventory</h4>
      <table class="table">
        <thead>
          <tr>
            <th>Address / Lot</th>
            <th>Plan</th>
            <th>Stage</th>
            <th>Price</th>
            <th>Est. delivery</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${compInventory
            .map(
              (home) => `
                <tr>
                  <td>${home.address || home.lot}</td>
                  <td>${home.planName}</td>
                  <td>${home.stage}</td>
                  <td>${formatCurrency(home.price)}</td>
                  <td>${home.deliveryDate}</td>
                  <td>${home.notes || '—'}</td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function attachCompetitorEvents() {
  document.querySelectorAll('[data-competitor]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const { competitor } = event.target.dataset;
      if (event.target.checked) {
        state.includedCompetitors.add(competitor);
      } else {
        state.includedCompetitors.delete(competitor);
      }
      renderView();
    });
  });

  document.getElementById('manual-save')?.addEventListener('click', () => {
    const name = document.getElementById('manual-name').value;
    const builder = document.getElementById('manual-builder').value;
    const url = document.getElementById('manual-url').value;
    const address = document.getElementById('manual-address').value;
    if (!name || !builder) {
      document.getElementById('manual-feedback').textContent = 'Name and builder required.';
      return;
    }
    document.getElementById('manual-feedback').textContent = `${name} saved locally. Add details in Settings to sync.`;
  });
}

function renderMarketDataView() {
  return `
    <section class="section-card">
      <div class="section-title">Upload & Map Market Data</div>
      <input type="file" id="data-upload" accept=".csv,.xlsx,.json" />
      <div id="upload-preview" style="margin-top:16px;font-size:14px;color:var(--muted);">
        ${state.uploadPreview || 'No file uploaded yet.'}
      </div>
    </section>
    <section class="section-card">
      <div class="section-title">Field Mapping</div>
      <div id="field-mapping">${renderFieldMapping()}</div>
    </section>
    <section class="section-card">
      <div class="section-title">Sales Records (${salesRecords.length})</div>
      <table class="table">
        <thead>
          <tr>
            <th>Source</th>
            <th>Type</th>
            <th>Address</th>
            <th>Close date</th>
            <th>SF</th>
            <th>Price</th>
            <th>DOM</th>
          </tr>
        </thead>
        <tbody>
          ${salesRecords
            .map(
              (record) => `
                <tr>
                  <td>${record.source}</td>
                  <td>${record.type}</td>
                  <td>${record.address}</td>
                  <td>${record.closeDate}</td>
                  <td>${formatNumber(record.squareFeet)}</td>
                  <td>${formatCurrency(record.soldPrice)}</td>
                  <td>${record.dom}</td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </section>
  `;
}

function renderFieldMapping(columns = ['address', 'price', 'sf', 'beds', 'baths', 'close_date']) {
  const availableFields = ['Address', 'Price', 'Square feet', 'Beds', 'Baths', 'Close date', 'DOM', 'New/Resale'];
  return `
    <div class="grid-2">
      ${columns
        .map((column) => {
          return `
            <div>
              <label style="font-weight:600;">${column}</label>
              <select class="field-map" data-column="${column}">
                ${availableFields
                  .map((field) => `<option value="${field.toLowerCase().replace(/ /g, '_')}">${field}</option>`)
                  .join('')}
              </select>
            </div>
          `;
        })
        .join('')}
    </div>
    <button class="button primary" style="margin-top:16px;" id="save-mapping">Save mapping template</button>
  `;
}

function attachMarketDataEvents() {
  document.getElementById('data-upload')?.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const headerLine = text.split(/\r?\n/)[0];
      const columns = headerLine.split(/,|\t/).filter(Boolean);
      state.uploadPreview = `Detected columns: ${columns.join(', ')}`;
      document.getElementById('upload-preview').textContent = state.uploadPreview;
      document.getElementById('field-mapping').innerHTML = renderFieldMapping(columns);
      attachFieldMappingEvents();
    };
    reader.readAsText(file);
  });

  attachFieldMappingEvents();
}

function attachFieldMappingEvents() {
  document.getElementById('save-mapping')?.addEventListener('click', () => {
    const selected = Array.from(document.querySelectorAll('.field-map')).map((select) => ({
      column: select.dataset.column,
      field: select.value,
    }));
    alert(`Mapping saved: ${JSON.stringify(selected, null, 2)}`);
  });
}

function renderStartStrategy() {
  const assumption = state.assumption;
  const selected = getCommunity();
  const rec = deriveRecommendation();

  return `
    <section class="section-card">
      <div class="section-title">Assumptions</div>
      <div class="form-grid">
        ${renderAssumptionInput('Target months of supply', 'monthsOfSupply', assumption.monthsOfSupply, 'number', 1, 12)}
        ${renderAssumptionInput('Expected absorption (per month)', 'absorption', assumption.absorption, 'number', 0, 10)}
        ${renderAssumptionInput('Min SF', 'minSf', assumption.minSf, 'number', 800, 5000)}
        ${renderAssumptionInput('Max SF', 'maxSf', assumption.maxSf, 'number', 900, 7000)}
        ${renderAssumptionInput('Target price min', 'minPrice', assumption.minPrice, 'number', 50000, 1500000)}
        ${renderAssumptionInput('Target price max', 'maxPrice', assumption.maxPrice, 'number', 50000, 2000000)}
        ${renderAssumptionInput('Cost per SF', 'costPerSf', assumption.costPerSf, 'number', 50, 500)}
        ${renderAssumptionInput('Margin target %', 'marginTarget', assumption.marginTarget, 'number', 0, 50)}
      </div>
    </section>
    <section class="section-card">
      <div class="section-title">Plan Mix Recommendation</div>
      <div class="grid-3">
        ${rec.planMix
          .map(
            (mix) => `
              <div class="metric-card">
                <div class="metric-label">${mix.label}</div>
                <div class="metric-value">${mix.count} plans</div>
                <p style="font-size:13px;color:var(--muted);margin-top:8px;">${mix.beds} beds • ${mix.baths} baths</p>
              </div>
            `,
          )
          .join('')}
      </div>
    </section>
    <section class="section-card grid-2">
      <div>
        <div class="section-title">Start Counts</div>
        <div class="bar-chart">
          ${rec.startCounts
            .map(
              (start) => `
                <div class="bar-row">
                  <div class="bar-label">${start.label}</div>
                  <div class="bar"><span style="width:${(start.total / rec.totalStarts) * 100}%"></span></div>
                  <div style="width:40px;text-align:right;font-weight:600;">${start.total}</div>
                </div>
              `,
            )
            .join('')}
        </div>
        <p style="font-size:13px;color:var(--muted);margin-top:12px;">Target ${rec.totalStarts} specs based on ${assumption.monthsOfSupply} mo supply and ${assumption.absorption} sales/mo.</p>
      </div>
      <div>
        <div class="section-title">Pricing Guidance</div>
        <table class="table">
          <thead>
            <tr>
              <th>Band</th>
              <th>Base price</th>
              <th>$ / SF</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            ${rec.pricing
              .map(
                (price) => `
                  <tr>
                    <td>${price.label}</td>
                    <td>${price.priceRange}</td>
                    <td>${price.ppsf}</td>
                    <td>${price.positioning}</td>
                  </tr>
                `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
    <section class="section-card">
      <div class="section-title">Narrative Summary</div>
      <p>${rec.summary}</p>
      <div class="tag">Generated ${new Date().toLocaleString()}</div>
    </section>
  `;
}

function renderAssumptionInput(label, key, value, type, min, max) {
  return `
    <div>
      <label>${label}</label>
      <input type="${type}" data-assumption="${key}" value="${value}" min="${min}" max="${max}" />
    </div>
  `;
}

function deriveRecommendation() {
  const assumption = state.assumption;
  const sales = filterSales();
  const absorption = assumption.absorption || calcAbsorption(sales) || 3;
  const totalStarts = Math.max(1, Math.round(absorption * assumption.monthsOfSupply));
  const sfBands = [
    { label: 'Entry (1,600-1,900 SF)', min: 1600, max: 1900 },
    { label: 'Core (1,900-2,300 SF)', min: 1900, max: 2300 },
    { label: 'Upsize (2,300-2,700 SF)', min: 2300, max: 2700 },
  ];
  const bandAbsorption = sfBands.map((band) => {
    const bandSales = sales.filter((sale) => sale.squareFeet >= band.min && sale.squareFeet < band.max);
    return { ...band, count: bandSales.length || 1 };
  });
  const totalBandCount = bandAbsorption.reduce((sum, band) => sum + band.count, 0);
  const planMix = bandAbsorption.map((band) => ({
    label: band.label,
    count: Math.max(1, Math.round((band.count / totalBandCount) * 5)),
    beds: band.min < 1900 ? '3-4' : '4',
    baths: band.min < 1900 ? '2-2.5' : '2.5-3',
  }));

  const startCounts = [
    { label: 'Now', total: Math.round(totalStarts * 0.45) },
    { label: 'Next 60 days', total: Math.round(totalStarts * 0.35) },
    { label: 'Next 90+ days', total: totalStarts - Math.round(totalStarts * 0.45) - Math.round(totalStarts * 0.35) },
  ];

  const pricing = planMix.map((mix, index) => {
    const midpoint = (assumption.minPrice + assumption.maxPrice) / 2;
    const spread = 15000 * (index - 1);
    const rangeLow = Math.max(assumption.minPrice, midpoint + spread - 20000);
    const rangeHigh = Math.min(assumption.maxPrice, midpoint + spread + 20000);
    const averageSf = (mix.label.includes('Entry') ? 1800 : mix.label.includes('Core') ? 2100 : 2500);
    const ppsf = `$${Math.round(((rangeLow + rangeHigh) / 2) / averageSf)}`;
    const positions = ['Value leader', 'In-line with market', 'Premium priced'];
    return {
      label: mix.label.split('(')[0].trim(),
      priceRange: `${formatCurrency(rangeLow)}-${formatCurrency(rangeHigh)}`,
      ppsf,
      positioning: positions[index] || 'In-line',
    };
  });

  const summary = `In the ${parseMonths(state.dateRange)}-month window, buyers favor ${planMix[1]?.label.replace(
    /(\(|\))/g,
    '',
  )} with ${planMix[1]?.beds} beds. To hit ${assumption.monthsOfSupply}-month supply with ${absorption} sales/mo, start ${totalStarts} specs split across the core SF bands. Keep pricing between ${pricing[0].priceRange} and ${
    pricing[pricing.length - 1].priceRange
  } to stay ${pricing[1]?.positioning?.toLowerCase()}.`;

  return { planMix, startCounts, pricing, summary, totalStarts };
}

function attachStartEvents() {
  document.querySelectorAll('[data-assumption]').forEach((input) => {
    input.addEventListener('input', (event) => {
      const { assumption: key } = event.target.dataset;
      const value = Number(event.target.value);
      state.assumption[key] = value;
      renderView();
    });
  });
}

function renderReports() {
  const rec = deriveRecommendation();
  return `
    <section class="section-card">
      <div class="section-title">Report Builder</div>
      <div class="grid-3">
        ${renderReportCard('Community One-Pager', 'Market snapshot, competitive chart, narrative summary.')}
        ${renderReportCard('Start Strategy Pack', 'Recommended starts, assumptions, SF mix and pricing guidance.')}
        ${renderReportCard('Competitor Deck', 'Price ranges, SF ranges, inventory summary for each competitor.')}
      </div>
    </section>
    <section class="section-card">
      <div class="section-title">Preview</div>
      <div class="grid-2">
        <div class="metric-card">
          <div class="metric-label">Recommended Starts</div>
          <div class="metric-value">${rec.totalStarts}</div>
          <p style="font-size:13px;color:var(--muted);">Auto-inserted into PDF + PPT exports.</p>
        </div>
        <div class="metric-card">
          <div class="metric-label">Narrative</div>
          <p>${rec.summary}</p>
        </div>
      </div>
      <div class="report-actions">
        <button class="button primary">Download PDF</button>
        <button class="button secondary">Download PPT bundle</button>
        <button class="button secondary">Download CSV</button>
      </div>
    </section>
  `;
}

function renderReportCard(title, description) {
  return `
    <div class="report-card">
      <h4>${title}</h4>
      <p style="margin:0;color:var(--muted);font-size:14px;">${description}</p>
      <div class="report-actions">
        <button class="button primary">Generate</button>
        <button class="button secondary">Schedule</button>
      </div>
    </div>
  `;
}

function attachReportEvents() {
  document.querySelectorAll('.report-card .button.primary').forEach((button) => {
    button.addEventListener('click', () => alert('Report queued. Watch your inbox!'));
  });
}

function renderSettings() {
  return `
    <section class="section-card">
      <div class="section-title">Data Sources</div>
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Last sync</th>
            <th>Records</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${dataSources
            .map(
              (source) => `
                <tr>
                  <td>${source.name}</td>
                  <td>${source.type}</td>
                  <td>${source.lastSync}</td>
                  <td>${source.recordsUpdated}</td>
                  <td><span class="status-pill ${source.status === 'healthy' ? 'success' : 'warning'}">${
                    source.status
                  }</span></td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </section>
    <section class="section-card">
      <div class="section-title">Website Data Pull</div>
      <div class="grid-2">
        <div>
          <label>Community URL</label>
          <input type="url" id="scrape-url" placeholder="https://" />
          <label style="margin-top:12px;display:block;">Notes</label>
          <textarea id="scrape-notes" placeholder="Anything we should watch for?"></textarea>
          <button class="button primary" id="start-scrape" style="margin-top:12px;">Start fetch</button>
        </div>
        <div>
          <div class="section-title" style="margin-top:0;">Recent pulls</div>
          <table class="table">
            <thead>
              <tr>
                <th>Community</th>
                <th>Last fetch</th>
                <th>Plans</th>
                <th>Inventory</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${websiteLogs
                .map(
                  (log) => `
                    <tr>
                      <td>${log.url}</td>
                      <td>${log.lastFetch}</td>
                      <td>${log.plansParsed}</td>
                      <td>${log.inventoryParsed}</td>
                      <td><span class="status-pill ${
                        log.status === 'success' ? 'success' : log.status === 'warning' ? 'warning' : 'danger'
                      }">${log.status}</span></td>
                    </tr>
                  `,
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section-card">
      <div class="section-title">Re-run Imports</div>
      <div class="grid-2">
        ${dataSources
          .map(
            (source) => `
              <div class="metric-card">
                <div class="metric-label">${source.name}</div>
                <button class="button primary" data-rerun="${source.id}">Re-run</button>
              </div>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function attachSettingsEvents() {
  document.getElementById('start-scrape')?.addEventListener('click', () => {
    const url = document.getElementById('scrape-url').value;
    if (!url) {
      alert('Enter a URL to fetch.');
      return;
    }
    alert(`Scheduled fetch for ${url}. We will email logs when complete.`);
  });

  document.querySelectorAll('[data-rerun]').forEach((button) => {
    button.addEventListener('click', () => {
      alert(`Re-running import for ${button.dataset.rerun}.`);
    });
  });
}

buildLayout();
renderView();
