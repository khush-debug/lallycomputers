/**
 * Lally Computers (Supreme Infosys) - Core Website Interactivity & Store Engine
 * Clean, efficient, production-grade implementation.
 */

// Global State
window.CATEGORIES = window.CATEGORIES || [];
window.DEFAULT_PRODUCTS = window.DEFAULT_PRODUCTS || [];
window.PRODUCTS = window.DEFAULT_PRODUCTS.slice(0);

let activeCategory = 'laptops_used';
let searchFilter = '';
let brandFilter = '';
let budgetFilter = '';
let sizeFilter = '';
let panelFilter = '';

/* ==========================================================================
   THEME SWITCHER
   ========================================================================== */
function toggleSiteTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const isLight = current === 'light' || (!current && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
  const next = isLight ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('lally_apple_theme', next); } catch (e) { }
}

/* ==========================================================================
   MODAL CONTROLLER (UNIFIED)
   ========================================================================== */
const Modal = {
  open(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  },
  close(id) {
    if (id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('is-open');
    } else {
      document.querySelectorAll('.modal-backdrop.is-open').forEach(m => m.classList.remove('is-open'));
    }
    if (!document.querySelector('.modal-backdrop.is-open')) {
      document.body.style.overflow = '';
    }
  }
};

/* ==========================================================================
   CATEGORY NAVIGATION & RENDERING
   ========================================================================== */
function renderCategories() {
  const counts = {};
  window.PRODUCTS.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });

  const ribbonEl = document.getElementById('categoryScroller');
  const spaceScrollerEl = document.getElementById('spaceCatScroller');
  const gridEl = document.getElementById('categoryOptionsGrid');

  if (ribbonEl) {
    ribbonEl.innerHTML = window.CATEGORIES.map(c => `
      <button class="chap-item ${c.id === activeCategory ? 'is-active' : ''}" data-chap-id="${c.id}" onclick="openCatalogueSpace('${c.id}')">
        ${c.icon}
        <span>${c.name}</span>
      </button>
    `).join('');
  }

  if (spaceScrollerEl) {
    spaceScrollerEl.innerHTML = window.CATEGORIES.map(c => {
      const cnt = counts[c.id] || 0;
      return `
        <button class="space-cat-btn ${c.id === activeCategory ? 'is-active' : ''}" data-cat="${c.id}" onclick="switchSpaceCategory('${c.id}')">
          <span class="space-cat-name">${c.name}</span> (<span class="space-cat-count">${cnt}</span>)
        </button>
      `;
    }).join('');
  }

  if (gridEl) {
    gridEl.innerHTML = window.CATEGORIES.map(c => {
      const cnt = counts[c.id] || 0;
      const title = c.cardName || c.name;
      const waMsg = encodeURIComponent(`Hi Lally Computers, what do you have in ${c.name}?`);
      return `
        <div class="cat-opt-card" data-cat="${c.id}" onclick="openCatalogueSpace('${c.id}')">
          <div class="cat-opt-top">
            <div class="cat-opt-header-row">
              <div class="cat-opt-icon">${c.icon}</div>
              <span class="cat-opt-count-badge">${cnt} Items</span>
            </div>
            <h3>${title}</h3>
            <span class="cat-opt-feature-tag">${c.badge}</span>
            <p>${c.desc}</p>
          </div>
          <div class="cat-opt-actions">
            <button class="btn-open-cat" type="button" onclick="openCatalogueSpace('${c.id}')">
              Explore (${cnt}) &rarr;
            </button>
            <a class="btn-quick-wa" href="https://wa.me/919872010193?text=${waMsg}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
              Inquire ↗
            </a>
          </div>
        </div>
      `;
    }).join('');
  }
}

function updateCategoryCountsUI() {
  renderCategories();
}

function openCatalogueSpace(catId) {
  showTopLoader();
  if (catId) activeCategory = catId;
  const space = document.getElementById('catalogueSpace');
  if (!space) {
    finishTopLoader();
    return;
  }

  space.classList.add('is-open');

  const catObj = window.CATEGORIES.find(c => c.id === activeCategory);
  if (catObj) {
    const titleEl = document.getElementById('spaceTitle') || document.getElementById('spaceCurrentCatTitle');
    const descEl = document.getElementById('spaceDesc') || document.getElementById('spaceCurrentCatDesc');
    const badgeEl = document.getElementById('spaceEyebrow') || document.getElementById('spaceCurrentCatBadge');
    if (titleEl) titleEl.textContent = catObj.name;
    if (descEl) descEl.textContent = catObj.desc;
    if (badgeEl) badgeEl.textContent = catObj.badge;
  }

  // Update active state in scrollers
  document.querySelectorAll('.space-cat-btn').forEach(btn => {
    btn.classList.toggle('is-active', btn.getAttribute('data-cat') === activeCategory);
  });
  document.querySelectorAll('.chap-item').forEach(btn => {
    btn.classList.toggle('is-active', btn.getAttribute('data-chap-id') === activeCategory);
  });

  renderCategoryFilters(activeCategory);
  resetFilters();
  renderSpaceProducts();

  space.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(finishTopLoader, 160);
}

function closeCatalogueSpace() {
  const space = document.getElementById('catalogueSpace');
  if (space) space.classList.remove('is-open');
  document.querySelectorAll('.chap-item').forEach(btn => btn.classList.remove('is-active'));
  const lineup = document.getElementById('lineup');
  if (lineup) lineup.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function switchSpaceCategory(catId) {
  showTopLoader();
  activeCategory = catId;
  const catObj = window.CATEGORIES.find(c => c.id === catId);
  if (catObj) {
    const titleEl = document.getElementById('spaceTitle') || document.getElementById('spaceCurrentCatTitle');
    const descEl = document.getElementById('spaceDesc') || document.getElementById('spaceCurrentCatDesc');
    const badgeEl = document.getElementById('spaceEyebrow') || document.getElementById('spaceCurrentCatBadge');
    if (titleEl) titleEl.textContent = catObj.name;
    if (descEl) descEl.textContent = catObj.desc;
    if (badgeEl) badgeEl.textContent = catObj.badge;
  }

  document.querySelectorAll('.space-cat-btn').forEach(btn => {
    btn.classList.toggle('is-active', btn.getAttribute('data-cat') === catId);
  });
  document.querySelectorAll('.chap-item').forEach(btn => {
    btn.classList.toggle('is-active', btn.getAttribute('data-chap-id') === catId);
  });

  renderCategoryFilters(activeCategory);
  resetFilters();
  renderSpaceProducts();
  setTimeout(finishTopLoader, 160);
}

/* ==========================================================================
   CATEGORY-SPECIFIC DYNAMIC FILTERS CONFIGURATION
   ========================================================================== */
const CATEGORY_FILTER_CONFIG = {
  laptops_used: {
    budgetLabel: "Laptop Budget",
    budgetTiers: [
      { label: "Under ₹25,000", value: "under-25k", min: 0, max: 25000 },
      { label: "₹25,000 - ₹35,000", value: "25k-35k", min: 25000, max: 35000 },
      { label: "Above ₹35,000", value: "above-35k", min: 35000, max: Infinity }
    ],
    typeLabel: "Screen Size",
    typeOptions: [
      { label: "14\" Compact Ultrabook", value: "14-inch" },
      { label: "15.6\" Full Size Display", value: "15-inch" }
    ],
    panelLabel: "Series / Processor",
    panelOptions: [
      { label: "ThinkPad Corporate", value: "ThinkPad" },
      { label: "Latitude Corporate", value: "Latitude" },
      { label: "EliteBook Ultrabook", value: "EliteBook" },
      { label: "Apple M1 Silicon", value: "M1" }
    ]
  },
  laptops_new: {
    budgetLabel: "Laptop Budget",
    budgetTiers: [
      { label: "Under ₹55,000", value: "under-55k", min: 0, max: 55000 },
      { label: "₹55,000 - ₹85,000", value: "55k-85k", min: 55000, max: 85000 },
      { label: "Above ₹85,000", value: "above-85k", min: 85000, max: Infinity }
    ],
    typeLabel: "Form Factor",
    typeOptions: [
      { label: "13.3\" / 13.6\" Ultra-Light", value: "13" },
      { label: "14\" Compact Slim", value: "14" },
      { label: "15.6\" Full Size", value: "15" }
    ],
    panelLabel: "Display Type",
    panelOptions: [
      { label: "Liquid Retina Display", value: "Retina" },
      { label: "2.8K OLED Display", value: "OLED" },
      { label: "FHD IPS Display", value: "IPS" }
    ]
  },
  laptops_gaming: {
    budgetLabel: "Gaming Budget",
    budgetTiers: [
      { label: "Under ₹60,000", value: "under-60k", min: 0, max: 60000 },
      { label: "₹60,000 - ₹80,000", value: "60k-80k", min: 60000, max: 80000 },
      { label: "Above ₹80,000", value: "above-80k", min: 80000, max: Infinity }
    ],
    typeLabel: "Graphics (GPU)",
    typeOptions: [
      { label: "RTX 2050 / 3050 (Entry Gaming)", value: "3050" },
      { label: "RTX 4050 (Mid Gaming)", value: "4050" },
      { label: "RTX 4060 (High-End Gaming)", value: "4060" }
    ],
    panelLabel: "Refresh Rate",
    panelOptions: [
      { label: "144Hz High Refresh", value: "144Hz" },
      { label: "120Hz Fast Display", value: "120Hz" }
    ]
  },
  pc: {
    budgetLabel: "Custom PC Budget",
    budgetTiers: [
      { label: "Under ₹50,000", value: "under-50k", min: 0, max: 50000 },
      { label: "₹50,000 - ₹1,00,000", value: "50k-100k", min: 50000, max: 100000 },
      { label: "Above ₹1,00,000", value: "above-100k", min: 100000, max: Infinity }
    ],
    typeLabel: "PC Form / Rig Type",
    typeOptions: [
      { label: "Esports & Gaming Rig", value: "Esports" },
      { label: "4K Video Editing Battlestation", value: "Editing" },
      { label: "Liquid-Cooled Flagship Rig", value: "Liquid" }
    ],
    panelLabel: "Graphics Tier",
    panelOptions: [
      { label: "RTX 3060 12GB", value: "3060" },
      { label: "RTX 4060 Ti", value: "4060" },
      { label: "RTX 4070 Ti Super", value: "4070" }
    ]
  },
  pc_components: {
    budgetLabel: "Component Budget",
    budgetTiers: [
      { label: "Under ₹5,000", value: "under-5k", min: 0, max: 5000 },
      { label: "₹5,000 - ₹15,000", value: "5k-15k", min: 5000, max: 15000 },
      { label: "₹15,000 - ₹35,000", value: "15k-35k", min: 15000, max: 35000 },
      { label: "Above ₹35,000", value: "above-35k", min: 35000, max: Infinity }
    ],
    typeLabel: "Component Category",
    typeOptions: [
      { label: "Graphics Card (GPU)", value: "GPU" },
      { label: "Processor (CPU)", value: "CPU" },
      { label: "Motherboard", value: "Motherboard" },
      { label: "Gen4 NVMe SSD", value: "SSD" },
      { label: "RAM (DDR4 / DDR5)", value: "RAM" },
      { label: "Power Supply (PSU)", value: "PSU" },
      { label: "Cooling & Cabinet", value: "Cooler" }
    ],
    panelLabel: "Standard / Interface",
    panelOptions: [
      { label: "PCIe Gen 4.0", value: "Gen4" },
      { label: "80 Plus Gold", value: "Gold" },
      { label: "LGA1700 / AM5", value: "Socket" }
    ]
  },
  pc_peripherals: {
    budgetLabel: "Gear Budget",
    budgetTiers: [
      { label: "Under ₹1,500", value: "under-1500", min: 0, max: 1500 },
      { label: "₹1,500 - ₹3,500", value: "1500-3500", min: 1500, max: 3500 },
      { label: "Above ₹3,500", value: "above-3500", min: 3500, max: Infinity }
    ],
    typeLabel: "Peripheral Type",
    typeOptions: [
      { label: "Mechanical Keyboard", value: "Keyboard" },
      { label: "Gaming Mouse", value: "Mouse" },
      { label: "Headset & Audio", value: "Headset" },
      { label: "Desk Mat & Accessories", value: "Mat" },
      { label: "Aluminum Stand", value: "Stand" }
    ],
    panelLabel: "Connectivity",
    panelOptions: [
      { label: "Wireless 2.4GHz / BT", value: "Wireless" },
      { label: "Braided USB Wired", value: "Wired" }
    ]
  },
  monitors: {
    budgetLabel: "Display Budget",
    budgetTiers: [
      { label: "Under ₹12,000", value: "under-12k", min: 0, max: 12000 },
      { label: "₹12,000 - ₹25,000", value: "12k-25k", min: 12000, max: 25000 },
      { label: "Above ₹25,000", value: "above-25k", min: 25000, max: Infinity }
    ],
    typeLabel: "Screen Size",
    typeOptions: [
      { label: "24\" - 25\" Esports Size", value: "24" },
      { label: "27\" Standard Creator", value: "27" },
      { label: "32\" - 34\" Ultrawide / 4K", value: "34" }
    ],
    panelLabel: "Panel & Refresh Rate",
    panelOptions: [
      { label: "144Hz - 180Hz Fast IPS", value: "144Hz" },
      { label: "100Hz Smooth IPS", value: "100Hz" },
      { label: "Curved 1500R Ultrawide", value: "Curved" },
      { label: "4K Ultra HD IPS", value: "4K" }
    ]
  },
  watches: {
    budgetLabel: "Watch Budget",
    budgetTiers: [
      { label: "Under ₹2,500", value: "under-2500", min: 0, max: 2500 },
      { label: "₹2,500 - ₹6,000", value: "2500-6000", min: 2500, max: 6000 },
      { label: "Above ₹6,000", value: "above-6000", min: 6000, max: Infinity }
    ],
    typeLabel: "Style / Type",
    typeOptions: [
      { label: "AMOLED Smartwatch", value: "AMOLED" },
      { label: "Apple Watch Ultra Style", value: "Ultra" },
      { label: "Casio G-Shock Shockproof", value: "G-Shock" },
      { label: "Titan Formal Chronograph", value: "Chronograph" }
    ],
    panelLabel: "Strap & Build",
    panelOptions: [
      { label: "Stainless Steel Chain", value: "Steel" },
      { label: "Silicone / Ocean Band", value: "Silicone" },
      { label: "Rugged Resin Case", value: "Resin" }
    ]
  },
  gadgets: {
    budgetLabel: "Gadget Budget",
    budgetTiers: [
      { label: "Under ₹2,000", value: "under-2k", min: 0, max: 2000 },
      { label: "₹2,000 - ₹5,000", value: "2k-5k", min: 2000, max: 5000 },
      { label: "Above ₹5,000", value: "above-5k", min: 5000, max: Infinity }
    ],
    typeLabel: "Gadget Category",
    typeOptions: [
      { label: "True Wireless Earbuds (TWS)", value: "Earbuds" },
      { label: "Bluetooth Party Speaker", value: "Speaker" },
      { label: "65W GaN Fast Charger", value: "Charger" },
      { label: "High Capacity Power Bank", value: "Power" },
      { label: "Wi-Fi 6 Gigabit Router", value: "Router" }
    ],
    panelLabel: "Key Feature",
    panelOptions: [
      { label: "Active Noise Cancellation (ANC)", value: "ANC" },
      { label: "Fast Charging / USB-C PD", value: "Fast" },
      { label: "IPX Waterproof Sound", value: "Waterproof" }
    ]
  },
  gym: {
    budgetLabel: "Equipment Budget",
    budgetTiers: [
      { label: "Under ₹3,000", value: "under-3k", min: 0, max: 3000 },
      { label: "₹3,000 - ₹10,000", value: "3k-10k", min: 3000, max: 10000 },
      { label: "Above ₹10,000", value: "above-10k", min: 10000, max: Infinity }
    ],
    typeLabel: "Equipment Type",
    typeOptions: [
      { label: "Dumbbells & Weight Plates", value: "Dumbbell" },
      { label: "Olympic Rods & Curl Bars", value: "Bar" },
      { label: "Motorized Treadmill", value: "Treadmill" },
      { label: "Spinning Exercise Bike", value: "Bike" },
      { label: "Workout Bench & Sets", value: "Bench" }
    ],
    panelLabel: "Grade",
    panelOptions: [
      { label: "Commercial Heavy-Gauge Steel", value: "Commercial" },
      { label: "Home Gym High-Durability", value: "Home" }
    ]
  },
  suitcases: {
    budgetLabel: "Luggage Budget",
    budgetTiers: [
      { label: "Under ₹4,000", value: "under-4k", min: 0, max: 4000 },
      { label: "₹4,000 - ₹8,000", value: "4k-8k", min: 4000, max: 8000 },
      { label: "Above ₹8,000", value: "above-8k", min: 8000, max: Infinity }
    ],
    typeLabel: "Luggage Size",
    typeOptions: [
      { label: "20\" International Airline Cabin", value: "20" },
      { label: "24\" Medium Check-In", value: "24" },
      { label: "3-Piece Complete Trolley Set", value: "3-Piece" }
    ],
    panelLabel: "Material & Security",
    panelOptions: [
      { label: "100% Polycarbonate Unbreakable", value: "Polycarbonate" },
      { label: "Embedded TSA Lock", value: "TSA" },
      { label: "Reinforced Aluminum Corners", value: "Aluminum" }
    ]
  },
  appliances: {
    budgetLabel: "Washer Budget",
    budgetTiers: [
      { label: "Under ₹18,000", value: "under-18k", min: 0, max: 18000 },
      { label: "₹18,000 - ₹30,000", value: "18k-30k", min: 18000, max: 30000 },
      { label: "Above ₹30,000", value: "above-30k", min: 30000, max: Infinity }
    ],
    typeLabel: "Loading Type",
    typeOptions: [
      { label: "Front Load Inverter Direct Drive", value: "Front" },
      { label: "Top Load Fully Automatic", value: "Top" },
      { label: "Semi-Automatic Heavy Duty", value: "Semi" }
    ],
    panelLabel: "Capacity & Rating",
    panelOptions: [
      { label: "8.0 kg Direct Drive Steam", value: "8" },
      { label: "7.0 kg Smart Inverter", value: "7" },
      { label: "8.5 kg High Capacity", value: "8.5" }
    ]
  },
  repairs: {
    budgetLabel: "Service Estimate",
    budgetTiers: [
      { label: "Free Diagnostic Inspection", value: "free-diagnostic", min: 0, max: 0 },
      { label: "Under ₹2,500 (Express Service)", value: "under-2500", min: 1, max: 2500 },
      { label: "Above ₹2,500 (Chip / Screen Swap)", value: "above-2500", min: 2500, max: Infinity }
    ],
    typeLabel: "Repair Service",
    typeOptions: [
      { label: "Motherboard BGA & IC Micro-Soldering", value: "BGA" },
      { label: "Broken Display & Screen Swap", value: "Screen" },
      { label: "Liquid Spill & Short Circuit Recovery", value: "Liquid" },
      { label: "Thermal Deep Overhaul & Re-Paste", value: "Thermal" }
    ],
    panelLabel: "Turnaround Time",
    panelOptions: [
      { label: "Same-Day Express Lab Service", value: "Same-Day" },
      { label: "Comprehensive 24-Hr Diagnostic", value: "24-Hour" }
    ]
  }
};

function renderCategoryFilters(catId) {
  const brandSelect = document.getElementById('brandFilterSelect') || document.getElementById('spaceBrandSelect');
  const budgetSelect = document.getElementById('budgetFilterSelect') || document.getElementById('spaceBudgetSelect');
  const sizeSelect = document.getElementById('sizeFilterSelect') || document.getElementById('spaceSizeSelect');
  const panelSelect = document.getElementById('panelFilterSelect') || document.getElementById('spacePanelSelect');

  const cfg = CATEGORY_FILTER_CONFIG[catId] || {};
  const catItems = window.PRODUCTS.filter(p => p.category === catId);

  // 1. Brands dynamically from products in this category
  if (brandSelect) {
    const brands = Array.from(new Set(catItems.map(p => p.brand).filter(Boolean))).sort();
    let bHtml = '<option value="">All Brands</option>';
    brands.forEach(b => {
      bHtml += `<option value="${b}">${b}</option>`;
    });
    brandSelect.innerHTML = bHtml;
    brandSelect.value = brandFilter;
  }

  // 2. Custom Budget Tiers
  if (budgetSelect) {
    const bLabel = cfg.budgetLabel || 'Budget';
    let bgHtml = `<option value="">All ${bLabel}</option>`;
    if (cfg.budgetTiers) {
      cfg.budgetTiers.forEach(t => {
        bgHtml += `<option value="${t.value}">${t.label}</option>`;
      });
    }
    budgetSelect.innerHTML = bgHtml;
    budgetSelect.value = budgetFilter;
  }

  // 3. Category Type / Form factor
  if (sizeSelect) {
    const tLabel = cfg.typeLabel || 'Sizes & Types';
    let sHtml = `<option value="">All ${tLabel}</option>`;
    if (cfg.typeOptions) {
      cfg.typeOptions.forEach(o => {
        sHtml += `<option value="${o.value}">${o.label}</option>`;
      });
    }
    sizeSelect.innerHTML = sHtml;
    sizeSelect.value = sizeFilter;
  }

  // 4. Category Feature / Spec / Panel
  if (panelSelect) {
    const pLabel = cfg.panelLabel || 'Features & Specs';
    let pHtml = `<option value="">All ${pLabel}</option>`;
    if (cfg.panelOptions) {
      cfg.panelOptions.forEach(o => {
        pHtml += `<option value="${o.value}">${o.label}</option>`;
      });
    }
    panelSelect.innerHTML = pHtml;
    panelSelect.value = panelFilter;
  }
}

/* ==========================================================================
   PRODUCT FILTERING
   ========================================================================== */
function applyFilters() {
  const searchInput = document.getElementById('spaceSearchInput');
  const brandSelect = document.getElementById('brandFilterSelect') || document.getElementById('spaceBrandSelect');
  const budgetSelect = document.getElementById('budgetFilterSelect') || document.getElementById('spaceBudgetSelect');
  const sizeSelect = document.getElementById('sizeFilterSelect') || document.getElementById('spaceSizeSelect');
  const panelSelect = document.getElementById('panelFilterSelect') || document.getElementById('spacePanelSelect');

  searchFilter = searchInput ? searchInput.value.trim().toLowerCase() : '';
  brandFilter = brandSelect ? brandSelect.value : '';
  budgetFilter = budgetSelect ? budgetSelect.value : '';
  sizeFilter = sizeSelect ? sizeSelect.value : '';
  panelFilter = panelSelect ? panelSelect.value : '';

  renderSpaceProducts();
}

function resetFilters() {
  searchFilter = '';
  brandFilter = '';
  budgetFilter = '';
  sizeFilter = '';
  panelFilter = '';

  const ids = [
    'spaceSearchInput',
    'brandFilterSelect', 'spaceBrandSelect',
    'budgetFilterSelect', 'spaceBudgetSelect',
    'sizeFilterSelect', 'spaceSizeSelect',
    'panelFilterSelect', 'spacePanelSelect'
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  renderSpaceProducts();
}

/* ==========================================================================
   STAR RATING GENERATOR
   ========================================================================== */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4 ? 1 : 0;
  const empty = 5 - full - half;
  let html = '';

  for (let i = 0; i < full; i++) {
    html += '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';
  }
  if (half) {
    html += '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3V2.5z"/></svg>';
  }
  for (let i = 0; i < empty; i++) {
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';
  }
  return html;
}

/* ==========================================================================
   COMPACT, WELL-SPACED PRODUCT CATALOGUE
   ========================================================================== */
function renderSpaceProducts() {
  const grid = document.getElementById('spaceLineupGrid');
  if (!grid) return;

  const cfg = CATEGORY_FILTER_CONFIG[activeCategory] || {};

  const items = window.PRODUCTS.filter(item => {
    if (item.category !== activeCategory) return false;
    if (brandFilter && item.brand !== brandFilter) return false;

    // Custom Budget Filter
    if (budgetFilter && cfg.budgetTiers) {
      const tier = cfg.budgetTiers.find(t => t.value === budgetFilter);
      if (tier) {
        if (tier.min === 0 && tier.max === 0) {
          if (item.priceNum !== 0) return false;
        } else {
          const price = item.priceNum || 0;
          if (price < tier.min || price > tier.max) return false;
        }
      }
    }

    // Category Type / Form factor filter
    if (sizeFilter) {
      const q = sizeFilter.toLowerCase();
      const match = (item.size || '').toLowerCase().includes(q) ||
                    (item.title || '').toLowerCase().includes(q) ||
                    (item.specs || []).some(s => s.toLowerCase().includes(q)) ||
                    (item.desc || '').toLowerCase().includes(q) ||
                    (item.badge || '').toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category Feature / Spec filter
    if (panelFilter) {
      const q = panelFilter.toLowerCase();
      const match = (item.panel || '').toLowerCase().includes(q) ||
                    (item.specs || []).some(s => s.toLowerCase().includes(q)) ||
                    (item.title || '').toLowerCase().includes(q) ||
                    (item.desc || '').toLowerCase().includes(q) ||
                    (item.badge || '').toLowerCase().includes(q);
      if (!match) return false;
    }

    // Search filter
    if (searchFilter) {
      const q = searchFilter;
      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const descMatch = (item.desc || '').toLowerCase().includes(q);
      const brandMatch = (item.brand || '').toLowerCase().includes(q);
      const specsMatch = (item.specs || []).some(s => s.toLowerCase().includes(q));
      if (!titleMatch && !descMatch && !brandMatch && !specsMatch) return false;
    }
    return true;
  });

  // Update count badge & active filter chips
  const countBadge = document.getElementById('resultsCount') || document.getElementById('spaceResultsCount');
  if (countBadge) countBadge.textContent = `${items.length} Product${items.length === 1 ? '' : 's'}`;

  const tagsContainer = document.getElementById('activeFilterTags');
  if (tagsContainer) {
    const activeTags = [];
    if (searchFilter) activeTags.push({ label: `"${searchFilter}"`, type: 'search' });
    if (brandFilter) activeTags.push({ label: `Brand: ${brandFilter}`, type: 'brand' });
    if (budgetFilter) {
      const tier = cfg.budgetTiers ? cfg.budgetTiers.find(t => t.value === budgetFilter) : null;
      activeTags.push({ label: tier ? tier.label : budgetFilter, type: 'budget' });
    }
    if (sizeFilter) {
      const opt = cfg.typeOptions ? cfg.typeOptions.find(o => o.value === sizeFilter) : null;
      activeTags.push({ label: opt ? opt.label : sizeFilter, type: 'size' });
    }
    if (panelFilter) {
      const opt = cfg.panelOptions ? cfg.panelOptions.find(o => o.value === panelFilter) : null;
      activeTags.push({ label: opt ? opt.label : panelFilter, type: 'panel' });
    }

    if (activeTags.length > 0) {
      tagsContainer.innerHTML = activeTags.map(t => `<span class="filter-chip">${t.label}</span>`).join('') +
        '<button class="filter-clear-all" type="button" onclick="resetFilters()">Clear Filters &times;</button>';
      tagsContainer.style.display = 'flex';
    } else {
      tagsContainer.innerHTML = '';
      tagsContainer.style.display = 'none';
    }
  }

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="space-empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <h3>No products found</h3>
        <p>Try clearing your active filters or searching with a different term.</p>
        <button class="apple-pill-btn apple-pill-btn--primary" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(item => {
    const rating = item.rating || 4.5;
    const reviews = item.reviewsCount || 120;
    const bought = item.boughtPastMonth || '500+ bought in past month';
    const delivery = item.delivery || 'FREE delivery Thu, 19 Nov';
    const image = item.image || `images/products/${item.id}.svg`;
    const waText = encodeURIComponent(`Hi Lally Computers, I want to inquire about ${item.title} (${item.price}). Is this currently in stock at Sodhi Nagar?`);

    const badgesHtml = `
      <div class="amz-badge-strip">
        ${item.condition === 'service' ? '<span class="amz-badge-tag amz-badge-tag--lab">🔬 In-Store Lab Service</span>' : ''}
        ${item.condition === 'used' ? '<span class="amz-badge-tag amz-badge-tag--used">⚡ 25-Point Lab Verified</span>' : ''}
        ${item.condition === 'new' ? '<span class="amz-badge-tag amz-badge-tag--new">✨ 100% Factory Sealed</span>' : ''}
        ${item.badge ? `<span class="amz-badge-tag amz-badge-tag--feature">${item.badge}</span>` : ''}
      </div>
    `;

    const specsHtml = item.specs && item.specs.length ? `
      <div class="amz-specs-list">
        ${item.specs.map(s => `<span class="amz-spec-pill">${s}</span>`).join('')}
      </div>
    ` : '';

    const mrpHtml = item.mrp ? `
      <span class="amz-mrp-group">
        M.R.P.: <span class="amz-mrp">${item.mrp}</span>
        ${item.discount ? `<span class="amz-discount">(${item.discount})</span>` : ''}
      </span>
    ` : '';

    const labBtnHtml = item.labReport ? `
      <button class="amz-btn-lab" data-lab-id="${item.id}" type="button">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span>View 25-Point Lab Report</span>
      </button>
    ` : '';

    return `
      <article class="amz-product-row" id="product-${item.id}">
        <div class="amz-img-col">
          <div class="amz-img-container">
            <img class="amz-product-img" src="${image}" alt="${item.title}" loading="lazy" width="180" height="150">
          </div>
        </div>

        <div class="amz-info-col">
          ${badgesHtml}
          <h3 class="amz-product-title" data-specs-id="${item.id}">${item.title}</h3>
          <p class="amz-product-desc">${item.desc}</p>
          ${specsHtml}

          <div class="amz-meta-row">
            <div class="amz-pricing-inline">
              <span class="amz-price-current">${item.price}</span>
              ${mrpHtml}
            </div>
            <div class="amz-rating-inline">
              <span class="amz-rating-num">${rating.toFixed(1)}</span>
              <div class="amz-stars">${renderStars(rating)}</div>
              <span class="amz-review-link">(${reviews.toLocaleString()})</span>
              <span class="amz-bought-tag">${bought}</span>
            </div>
          </div>

          <div class="amz-delivery-strip">
            <span class="amz-delivery-item">🚚 ${delivery}</span>
            <span class="amz-warranty-item">🛡️ ${item.warranty || 'Official Warranty & GST Bill Included'}</span>
          </div>

          <div class="amz-actions-row">
            <button class="amz-btn-cart" data-cart-id="${item.id}" type="button">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span>Add to cart</span>
            </button>
            <a class="amz-btn-wa" href="https://wa.me/919872010193?text=${waText}" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.677.15-.2.301-.777.98-.952 1.18-.175.201-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.894-.799-1.498-1.786-1.674-2.087-.175-.3-.019-.463.132-.612.136-.134.301-.351.451-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.631-.928-2.233-.244-.585-.493-.506-.677-.515-.175-.009-.376-.011-.577-.011-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.91 1.228 3.111.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.379.197 1.898.12.579-.086 1.782-.728 2.033-1.431.251-.703.251-1.305.175-1.431-.075-.126-.276-.201-.577-.351zM12.04 2C6.516 2 2.023 6.49 2.023 12.013c0 1.942.555 3.756 1.517 5.292L2 22l4.834-1.503a10.007 10.007 0 0 0 5.206 1.516c5.524 0 10.017-4.49 10.017-10.013C22.057 6.49 17.564 2 12.04 2z"/>
              </svg>
              <span>WhatsApp Inquiry</span>
            </a>
            <button class="amz-btn-view" data-specs-id="${item.id}" type="button">Quick View</button>
            ${labBtnHtml}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/* ==========================================================================
   SHOPPING CART SYSTEM
   ========================================================================== */
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem('lally_cart')) || [];
} catch (e) {
  cart = [];
}

function addToCart(id) {
  const item = window.PRODUCTS.find(x => x.id === id);
  if (!item) return;

  const existing = cart.find(x => x.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: item.id,
      title: item.title,
      price: item.price,
      priceNum: item.priceNum || 0,
      image: item.image || `images/products/${item.id}.svg`,
      qty: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast(`Added "${item.title.substring(0, 28)}..." to cart`);

  // Visual button feedback
  const cartBtn = document.querySelector(`button[data-cart-id="${id}"]`);
  if (cartBtn && !cartBtn.classList.contains('is-added')) {
    cartBtn.classList.add('is-added');
    const origHtml = cartBtn.innerHTML;
    cartBtn.innerHTML = '<span>Added ✓</span>';
    setTimeout(() => {
      cartBtn.innerHTML = origHtml;
      cartBtn.classList.remove('is-added');
    }, 1400);
  }
}

function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  saveCart();
  updateCartUI();
  renderCartModal();
}

function updateCartQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart();
  updateCartUI();
  renderCartModal();
}

function saveCart() {
  try { localStorage.setItem('lally_cart', JSON.stringify(cart)); } catch (e) { }
}

function updateCartUI() {
  const badge = document.getElementById('cartCountBadge');
  const count = cart.reduce((acc, x) => acc + x.qty, 0);
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}

function openCartModal() {
  renderCartModal();
  Modal.open('cartModal');
}

function closeCartModal() {
  Modal.close('cartModal');
}

function renderCartModal() {
  const body = document.getElementById('cartModalBody');
  const footer = document.getElementById('cartModalFooter');
  if (!body) return;

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <p>Your shopping cart is currently empty.</p>
        <button class="apple-pill-btn apple-pill-btn--primary" onclick="closeCartModal()">Browse Stock</button>
      </div>
    `;
    if (footer) footer.style.display = 'none';
    return;
  }

  let totalNum = 0;
  body.innerHTML = cart.map(item => {
    totalNum += (item.priceNum || 0) * item.qty;
    return `
      <div class="cart-item-row">
        <img class="cart-item-thumb" src="${item.image}" alt="${item.title}">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">${item.price} &times; ${item.qty}</div>
          <div class="cart-qty-ctrls">
            <button class="cart-qty-btn" type="button" onclick="updateCartQty('${item.id}', -1)">−</button>
            <span class="cart-qty-val">${item.qty}</span>
            <button class="cart-qty-btn" type="button" onclick="updateCartQty('${item.id}', 1)">+</button>
            <button class="cart-btn-del" type="button" onclick="removeFromCart('${item.id}')">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (footer) {
    footer.style.display = 'flex';
    const totalEl = document.getElementById('cartSubtotalVal') || document.getElementById('cartTotalDisplay');
    if (totalEl) totalEl.textContent = totalNum > 0 ? `₹${totalNum.toLocaleString('en-IN')}` : 'Estimated in store';
  }
}

function checkoutCartWhatsApp() {
  if (cart.length === 0) return;
  let text = "Hi Lally Computers, I would like to purchase / reserve the following items from your in-store stock:\n\n";
  let total = 0;
  cart.forEach((item, idx) => {
    text += `${idx + 1}. ${item.title} (Qty: ${item.qty}) - ${item.price}\n`;
    total += (item.priceNum || 0) * item.qty;
  });
  text += `\nEstimated Total: ₹${total.toLocaleString('en-IN')}\nStore Location: Sodhi Nagar, Moga`;
  window.open(`https://wa.me/919872010193?text=${encodeURIComponent(text)}`, '_blank');
}

function showToast(msg) {
  let toast = document.getElementById('amzToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'amzToast';
    toast.className = 'amz-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <span>${msg}</span>
    <button class="amz-toast-btn" onclick="openCartModal()">View Cart</button>
  `;
  toast.classList.add('is-visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 3500);
}

/* ==========================================================================
   LAB REPORT & QUICK VIEW MODALS
   ========================================================================== */
function openLabReportModal(id) {
  const item = window.PRODUCTS.find(x => x.id === id);
  if (!item || !item.labReport) return;

  const rep = item.labReport;
  document.getElementById('labLaptopTitle').textContent = item.title;
  document.getElementById('labReportId').textContent = rep.reportId || 'SUP-2024-LAB-001';
  document.getElementById('labTestedDate').textContent = rep.testDate || 'Tested Recently';
  document.getElementById('labGradeBadge').textContent = rep.grade || 'GRADE A+';
  document.getElementById('labOverallNotes').textContent = rep.overallNotes || '';
  document.getElementById('labInspector').textContent = rep.inspector || 'Senior Hardware Engineer';

  const tbody = document.getElementById('labChecklistTbody');
  if (tbody && rep.checklist) {
    tbody.innerHTML = rep.checklist.map(chk => `
      <tr>
        <td class="lab-point-name">${chk.point}</td>
        <td class="lab-point-result">${chk.result} <span class="lab-pass-tag">✓ ${chk.status || 'PASS'}</span></td>
      </tr>
    `).join('');
  }

  const waBtn = document.getElementById('labReportWaBtn');
  if (waBtn) {
    waBtn.href = `https://wa.me/919872010193?text=${encodeURIComponent(`Hi Lally Computers, I reviewed Lab Diagnostic Report ${rep.reportId} for ${item.title}. Can I inspect it in Sodhi Nagar?`)}`;
  }

  Modal.open('labReportModal');
}

function closeLabReportModal() {
  Modal.close('labReportModal');
}

function openSpecSheet(id) {
  const item = window.PRODUCTS.find(x => x.id === id);
  if (!item) return;

  document.getElementById('modalCategory').textContent = `${item.badge || 'Product'} · In-Store Inventory`;
  document.getElementById('modalTitle').textContent = item.title;
  document.getElementById('modalPrice').textContent = item.price;
  document.getElementById('modalDesc').textContent = item.desc;
  document.getElementById('modalWarranty').textContent = item.warranty || 'Warranty Included';

  const tbody = document.getElementById('modalSpecTable');
  if (tbody) {
    let rowsHtml = '';
    if (item.specs && item.specs.length) {
      rowsHtml += `<tr><th>Key Specs</th><td>${item.specs.join(' &middot; ')}</td></tr>`;
    }
    if (item.details) {
      Object.keys(item.details).forEach(key => {
        rowsHtml += `<tr><th>${key}</th><td>${item.details[key]}</td></tr>`;
      });
    }
    tbody.innerHTML = rowsHtml;
  }

  const waBtn = document.getElementById('modalWaBtn');
  if (waBtn) {
    waBtn.href = `https://wa.me/919872010193?text=${encodeURIComponent(`Hi Lally Computers, I would like to inquire about ${item.title} (${item.price}).`)}`;
  }

  Modal.open('appleModal');
}

function closeSpecSheet() {
  Modal.close('appleModal');
}

/* ==========================================================================
   GOOGLE SHEETS LIVE STOCK SYNC
   ========================================================================== */
function normalizeGoogleSheetUrl(url) {
  if (!url) return '';
  url = url.trim();
  if (url.includes('output=csv') || url.includes('/export?format=csv')) return url;

  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) return url;
  const sheetId = match[1];

  let gid = '0';
  const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
  if (gidMatch) gid = gidMatch[1];

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const row = [];
    let insideQuote = false;
    let entry = '';
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') {
        if (insideQuote && line[c + 1] === '"') { entry += '"'; c++; }
        else { insideQuote = !insideQuote; }
      } else if (ch === ',' && !insideQuote) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += ch;
      }
    }
    row.push(entry.trim());
    rows.push(row);
  }
  return rows;
}

function mapCsvToProducts(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase());
  const products = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0 || !r[0]) continue;
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] || '').trim();
    });

    const id = obj.id || `csv-${i}`;
    const pNum = parseFloat((obj.pricenum || obj.price || '0').replace(/[^0-9.]/g, '')) || 0;
    const mrpNum = parseFloat((obj.mrpnum || obj.mrp || '0').replace(/[^0-9.]/g, '')) || 0;
    const specsList = obj.specs ? obj.specs.split('|').map(s => s.trim()) : [];

    products.push({
      id: id,
      category: obj.category || 'laptops_used',
      brand: obj.brand || 'Supreme',
      title: obj.title || 'In-Store Product',
      desc: obj.desc || '',
      price: obj.price || (pNum ? `₹${pNum.toLocaleString('en-IN')}` : 'Inquire for Price'),
      priceNum: pNum,
      mrp: obj.mrp || (mrpNum ? `₹${mrpNum.toLocaleString('en-IN')}` : ''),
      mrpNum: mrpNum,
      discount: obj.discount || (mrpNum > pNum && pNum > 0 ? `${Math.round(((mrpNum - pNum) / mrpNum) * 100)}% off` : ''),
      badge: obj.badge || '',
      condition: obj.condition || 'new',
      warranty: obj.warranty || 'Warranty Included',
      specs: specsList,
      details: obj.details ? { "Specifications": obj.details } : {},
      image: obj.image || `images/products/${id}.svg`,
      rating: parseFloat(obj.rating) || 4.5,
      reviewsCount: parseInt(obj.reviewscount, 10) || 120,
      boughtPastMonth: obj.boughtpastmonth || '100+ bought in past month',
      delivery: obj.delivery || 'In-Store Available · Sodhi Nagar, Moga',
      fastDelivery: obj.fastdelivery || 'Same-Day Pickup Available'
    });
  }
  return products;
}

function fetchAndSyncGoogleSheet(csvUrl, isManual) {
  showTopLoader();
  const normUrl = normalizeGoogleSheetUrl(csvUrl);
  const statusEl = document.getElementById('sheetSyncStatus');
  const badgeEl = document.getElementById('sheetSyncBadgeText');
  const indicatorEl = document.getElementById('sheetStatusIndicator');

  if (statusEl) {
    statusEl.innerHTML = '<span style="color:#60a5fa">Connecting to Google Sheets...</span>';
  }

  fetch(normUrl)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then(csvText => {
      const rows = parseCSV(csvText);
      const newProducts = mapCsvToProducts(rows);
      if (newProducts.length === 0) throw new Error("No products found in sheet.");

      window.PRODUCTS = newProducts;
      try { localStorage.setItem('lally_sheet_url', csvUrl); } catch (e) { }

      if (statusEl) {
        statusEl.innerHTML = `<span style="color:#34d399">✓ Successfully synced ${newProducts.length} live items!</span>`;
      }
      if (badgeEl) badgeEl.textContent = `Live Sheets (${newProducts.length} Items)`;
      if (indicatorEl) indicatorEl.className = 'dot-status dot-open';

      renderCategories();
      renderSpaceProducts();

      finishTopLoader();
      if (isManual) {
        setTimeout(closeSheetSyncModal, 1200);
        showToast(`Stock synced from Google Sheets (${newProducts.length} items)`);
      }
    })
    .catch(err => {
      console.warn("Google Sheet sync error:", err);
      finishTopLoader();
      if (statusEl) {
        statusEl.innerHTML = `<span style="color:#f87171">Sync failed. Ensure sheet is published as CSV or public viewer. (${err.message})</span>`;
      }
      if (badgeEl) badgeEl.textContent = 'Sync Google Sheet';
      if (indicatorEl) indicatorEl.className = 'dot-status dot-closed';
    });
}

function openSheetSyncModal() {
  const input = document.getElementById('sheetUrlInput');
  const savedUrl = localStorage.getItem('lally_sheet_url');
  if (input && savedUrl) input.value = savedUrl;
  Modal.open('sheetSyncModal');
}

function closeSheetSyncModal() {
  Modal.close('sheetSyncModal');
}

function saveAndSyncSheet() {
  const input = document.getElementById('sheetUrlInput');
  if (!input || !input.value.trim()) return;
  fetchAndSyncGoogleSheet(input.value.trim(), true);
}

function resetToDefaultStock() {
  try { localStorage.removeItem('lally_sheet_url'); } catch (e) { }
  window.PRODUCTS = window.DEFAULT_PRODUCTS.slice(0);

  const input = document.getElementById('sheetUrlInput');
  if (input) input.value = '';
  const badgeEl = document.getElementById('sheetSyncBadgeText');
  if (badgeEl) badgeEl.textContent = 'Sync Google Sheet';
  const indicatorEl = document.getElementById('sheetStatusIndicator');
  if (indicatorEl) indicatorEl.className = 'dot-status dot-closed';
  const statusEl = document.getElementById('sheetSyncStatus');
  if (statusEl) statusEl.innerHTML = '<span style="color:#94a3b8">Default in-store inventory restored.</span>';

  renderCategories();
  renderCategoryFilters(activeCategory);
  renderSpaceProducts();
  showToast('Restored default catalogue');
  setTimeout(closeSheetSyncModal, 1000);
}

/* ==========================================================================
   STORE HOURS & INITIALIZATION
   ========================================================================== */
function updateHours() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (3600000 * 5.5));
  const day = ist.getDay(); // 0 = Sunday
  const hour = ist.getHours();
  const min = ist.getMinutes();
  const time = hour + min / 60;
  const text = document.getElementById('storeStatusText');
  const badge = document.getElementById('storeBadge');
  if (!text || !badge) return;

  const dot = badge.querySelector('.dot-status');
  if (day === 0) {
    if (dot) dot.className = 'dot-status dot-closed';
    text.textContent = 'Sunday · Closed today (Call for urgent repairs)';
  } else if (time >= 10 && time < 19) {
    if (dot) dot.className = 'dot-status dot-open';
    text.textContent = 'Open Now · Closes at 7:00 PM';
  } else if (time < 10) {
    if (dot) dot.className = 'dot-status dot-closed';
    text.textContent = 'Closed Now · Opens at 10:00 AM';
  } else {
    if (dot) dot.className = 'dot-status dot-closed';
    text.textContent = 'Closed for the day · Opens tomorrow at 10:00 AM';
  }
}

/* ==========================================================================
   COOKIE CONSENT & PREFERENCES
   ========================================================================== */
function initCookieBanner() {
  try {
    const consent = localStorage.getItem('lally_cookie_consent');
    if (!consent) {
      setTimeout(() => {
        const banner = document.getElementById('cookieBanner');
        if (banner) banner.classList.add('is-visible');
      }, 1000);
    }
  } catch (e) {}
}

function acceptCookies() {
  try {
    localStorage.setItem('lally_cookie_consent', 'all');
  } catch (e) {}
  const banner = document.getElementById('cookieBanner');
  if (banner) banner.classList.remove('is-visible');
}

function dismissCookies() {
  try {
    localStorage.setItem('lally_cookie_consent', 'essential');
  } catch (e) {}
  const banner = document.getElementById('cookieBanner');
  if (banner) banner.classList.remove('is-visible');
}

function openCookieBannerAgain() {
  const banner = document.getElementById('cookieBanner');
  if (banner) banner.classList.add('is-visible');
}

/* ==========================================================================
   TOP PROGRESS LOADER
   ========================================================================== */
function showTopLoader() {
  const bar = document.getElementById('topLoaderBar');
  if (!bar) return;
  bar.classList.add('is-loading');
  bar.style.width = '30%';
  setTimeout(() => {
    if (bar.classList.contains('is-loading')) bar.style.width = '70%';
  }, 120);
}

function finishTopLoader() {
  const bar = document.getElementById('topLoaderBar');
  if (!bar) return;
  bar.style.width = '100%';
  setTimeout(() => {
    bar.classList.remove('is-loading');
    setTimeout(() => {
      bar.style.width = '0%';
    }, 200);
  }, 250);
}

/* ==========================================================================
   CAROUSEL PAGINATION DOTS CONTROLLER
   ========================================================================== */
function initSliderWithDots(sliderWrapperId, trackId, dotsContainerId, cardCount, durationSeconds, prevBtnId, nextBtnId) {
  const wrapper = document.getElementById(sliderWrapperId);
  const track = document.getElementById(trackId);
  const dotsContainer = document.getElementById(dotsContainerId);
  if (!wrapper || !track || !dotsContainer) return;

  const prevBtn = prevBtnId ? document.getElementById(prevBtnId) : null;
  const nextBtn = nextBtnId ? document.getElementById(nextBtnId) : null;

  const dots = Array.from(dotsContainer.querySelectorAll('.slider-dot'));
  if (dots.length === 0) return;

  const allCards = Array.from(track.children);
  const uniqueCards = allCards.slice(0, cardCount);

  let isManualNav = false;
  let resumeTimeout = null;
  let lastActiveIndex = 0;

  function getTranslateX() {
    const style = window.getComputedStyle(track);
    const transform = style.transform || style.webkitTransform;
    if (!transform || transform === 'none') return 0;
    const match = transform.match(/matrix(?:3d)?\((.+)\)/);
    if (!match) return 0;
    const values = match[1].split(', ');
    return parseFloat(values.length > 6 ? values[12] : values[4]) || 0;
  }

  function setActiveDot(index) {
    if (index === lastActiveIndex && dots[index]?.classList.contains('is-active')) return;
    lastActiveIndex = index;
    dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  // Animation frame loop to keep dots in sync with continuous marquee
  let lastTimestamp = 0;
  function updateFromMarquee(timestamp) {
    if (!isManualNav) {
      if (!lastTimestamp || timestamp - lastTimestamp > 70) {
        lastTimestamp = timestamp;
        const currentTx = Math.abs(getTranslateX());
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth > 0 && uniqueCards.length > 0) {
          const currentX = currentTx % halfWidth;
          const focusPoint = currentX + (wrapper.clientWidth / 2);

          let closestIdx = 0;
          let minDiff = Infinity;
          uniqueCards.forEach((c, idx) => {
            const cardCenter = (c.offsetLeft - uniqueCards[0].offsetLeft) + (c.offsetWidth / 2);
            const diff = Math.abs(focusPoint - cardCenter);
            if (diff < minDiff) {
              minDiff = diff;
              closestIdx = idx;
            }
          });
          setActiveDot(closestIdx);
        }
      }
    }
    requestAnimationFrame(updateFromMarquee);
  }
  requestAnimationFrame(updateFromMarquee);

  function navigateToSlide(targetIndex, smooth = true) {
    if (targetIndex < 0 || targetIndex >= uniqueCards.length) return;
    const targetCard = uniqueCards[targetIndex];
    if (!targetCard) return;

    // Read current position before removing animation
    const currentTx = getTranslateX();

    isManualNav = true;
    clearTimeout(resumeTimeout);

    // Compute target X to center the target card in the visible viewport
    const wrapperWidth = wrapper.clientWidth;
    const cardWidth = targetCard.offsetWidth;
    const cardLeft = targetCard.offsetLeft - uniqueCards[0].offsetLeft;
    const targetX = Math.max(0, cardLeft - Math.max(0, (wrapperWidth - cardWidth) / 2));

    if (!track.classList.contains('is-manual-nav')) {
      track.classList.add('is-manual-nav');
      track.style.transition = 'none';
      track.style.transform = `translate3d(${currentTx}px, 0, 0)`;
      void track.offsetHeight; // Force reflow
    }

    if (smooth) {
      track.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
      track.style.transition = 'none';
    }

    track.style.transform = `translate3d(-${targetX}px, 0, 0)`;

    // Highlight card and active dot
    allCards.forEach(c => c.classList.remove('is-card-focused'));
    targetCard.classList.add('is-card-focused');
    setActiveDot(targetIndex);

    // Schedule auto-resume after 6 seconds of idle
    scheduleAutoResume(targetX);
  }

  function scheduleAutoResume(currentOffset) {
    clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(() => {
      if (!isManualNav) return;
      const halfWidth = track.scrollWidth / 2;
      if (halfWidth <= 0) return;

      const normalized = Math.abs(currentOffset) % halfWidth;
      const delaySeconds = (normalized / halfWidth) * durationSeconds;

      allCards.forEach(c => c.classList.remove('is-card-focused'));

      // Seamlessly switch back to CSS marquee from current position
      track.style.transition = 'none';
      track.style.transform = '';
      track.style.animationDelay = `-${delaySeconds.toFixed(2)}s`;
      track.classList.remove('is-manual-nav');
      void track.offsetHeight;
      isManualNav = false;
    }, 6000);
  }

  // Hovering pauses the resume countdown
  wrapper.addEventListener('mouseenter', () => clearTimeout(resumeTimeout));
  wrapper.addEventListener('mouseleave', () => {
    if (isManualNav && !isPointerDown) {
      const currentTx = Math.abs(getTranslateX());
      scheduleAutoResume(currentTx);
    }
  });

  // ==========================================
  // POINTER & TOUCH DRAG CONTROLLER (MANUAL MOVEMENT)
  // ==========================================
  let isPointerDown = false;
  let hasDragged = false;
  let startPointerX = 0;
  let startPointerY = 0;
  let startTx = 0;
  let dragCurrentTx = 0;
  let pointerStartTime = 0;

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    isPointerDown = true;
    hasDragged = false;
    startPointerX = e.clientX;
    startPointerY = e.clientY;
    pointerStartTime = Date.now();

    startTx = getTranslateX();
    dragCurrentTx = startTx;
    clearTimeout(resumeTimeout);
  }

  function onPointerMove(e) {
    if (!isPointerDown) return;
    const deltaX = e.clientX - startPointerX;
    const deltaY = e.clientY - startPointerY;

    if (!hasDragged) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
        isPointerDown = false;
        return;
      }
      if (Math.abs(deltaX) > 6) {
        hasDragged = true;
        isManualNav = true;
        track.classList.add('is-manual-nav', 'is-dragging');
        track.style.transition = 'none';
        if (track.setPointerCapture) {
          try { track.setPointerCapture(e.pointerId); } catch (err) {}
        }
      }
    }

    if (hasDragged) {
      e.preventDefault();
      const halfWidth = track.scrollWidth / 2;
      if (halfWidth <= 0) return;

      let newTx = startTx + deltaX;
      while (newTx > 0) newTx -= halfWidth;
      while (newTx < -halfWidth) newTx += halfWidth;

      dragCurrentTx = newTx;
      track.style.transform = `translate3d(${newTx}px, 0, 0)`;

      // Live update active dot
      const currentX = Math.abs(newTx) % halfWidth;
      const focusPoint = currentX + (wrapper.clientWidth / 2);
      let closestIdx = 0;
      let minDiff = Infinity;
      uniqueCards.forEach((c, idx) => {
        const cardCenter = (c.offsetLeft - uniqueCards[0].offsetLeft) + (c.offsetWidth / 2);
        const diff = Math.abs(focusPoint - cardCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      setActiveDot(closestIdx);
    }
  }

  function onPointerUp(e) {
    if (!isPointerDown) return;
    isPointerDown = false;

    if (hasDragged) {
      track.classList.remove('is-dragging');
      if (track.releasePointerCapture) {
        try { track.releasePointerCapture(e.pointerId); } catch (err) {}
      }

      const deltaTime = Math.max(1, Date.now() - pointerStartTime);
      const deltaX = e.clientX - startPointerX;
      const velocity = deltaX / deltaTime; // px per ms

      const halfWidth = track.scrollWidth / 2;
      const currentX = Math.abs(dragCurrentTx) % halfWidth;
      const projectedFocus = currentX + (wrapper.clientWidth / 2) - (velocity * 200);

      let closestIdx = 0;
      let minDiff = Infinity;
      uniqueCards.forEach((c, idx) => {
        const cardCenter = (c.offsetLeft - uniqueCards[0].offsetLeft) + (c.offsetWidth / 2);
        const diff = Math.abs(projectedFocus - cardCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });

      navigateToSlide(closestIdx);
    }
  }

  track.addEventListener('pointerdown', onPointerDown, { passive: true });
  track.addEventListener('pointermove', onPointerMove, { passive: false });
  track.addEventListener('pointerup', onPointerUp, { passive: true });
  track.addEventListener('pointercancel', onPointerUp, { passive: true });

  // Dots click listener
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetIndex = parseInt(dot.getAttribute('data-index'), 10);
      if (!isNaN(targetIndex)) {
        navigateToSlide(targetIndex);
      }
    });
  });

  // Previous & Next Arrow Buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const prevIndex = (lastActiveIndex - 1 + cardCount) % cardCount;
      navigateToSlide(prevIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const nextIndex = (lastActiveIndex + 1) % cardCount;
      navigateToSlide(nextIndex);
    });
  }

  // Clicking any card directly navigates to it (unless user was dragging)
  allCards.forEach((card, idx) => {
    card.style.cursor = 'grab';
    card.addEventListener('click', (e) => {
      if (hasDragged) {
        e.preventDefault();
        return;
      }
      navigateToSlide(idx % cardCount);
    });
  });
}

// Global Event Delegation & Setup
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Cookie Consent Banner
  initCookieBanner();

  // Initialize Carousel Pagination Dots with Manual Movement & Arrow Controls
  initSliderWithDots('whySliderWrap', 'whyTrack', 'whyDots', 6, 42, 'whyPrevBtn', 'whyNextBtn');
  initSliderWithDots('reviewsSliderWrap', 'reviewsTrack', 'reviewsDots', 4, 40, 'reviewsPrevBtn', 'reviewsNextBtn');

  // Render Categories & Initial Products
  renderCategories();
  renderCategoryFilters(activeCategory);
  renderSpaceProducts();
  updateCartUI();
  updateHours();

  // Search Input live typing
  const searchInput = document.getElementById('spaceSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchFilter = searchInput.value.trim().toLowerCase();
      renderSpaceProducts();
    });
  }

  // Grid Event Delegation for Cart, Quick View, and Lab Report
  const grid = document.getElementById('spaceLineupGrid');
  if (grid) {
    grid.addEventListener('click', e => {
      const cartBtn = e.target.closest('[data-cart-id]');
      if (cartBtn) {
        addToCart(cartBtn.getAttribute('data-cart-id'));
        return;
      }
      const specsBtn = e.target.closest('[data-specs-id]');
      if (specsBtn) {
        openSpecSheet(specsBtn.getAttribute('data-specs-id'));
        return;
      }
      const labBtn = e.target.closest('[data-lab-id]');
      if (labBtn) {
        openLabReportModal(labBtn.getAttribute('data-lab-id'));
      }
    });
  }

  // Unified Modal Backdrop and Close Button Click Delegation
  document.addEventListener('click', e => {
    if (e.target.matches('.modal-backdrop, .modal-sheet-close, [data-close-modal]') || e.target.closest('[data-close-modal]')) {
      Modal.close();
    }
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') Modal.close();
  });

  // Check for saved Google Sheet URL
  const savedSheet = localStorage.getItem('lally_sheet_url');
  if (savedSheet) {
    fetchAndSyncGoogleSheet(savedSheet, false);
  }

  // Hero Panoramic Banner Interactive Parallax
  const heroSection = document.getElementById('top');
  const heroPanorama = document.getElementById('heroPanorama');

  if (heroSection && heroPanorama && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
      const yRatio = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = xRatio * 28;
      targetY = yRatio * 18;
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });

    function stepParallax() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      heroPanorama.style.setProperty('--mouse-shift-x', `${currentX.toFixed(2)}px`);
      heroPanorama.style.setProperty('--mouse-shift-y', `${currentY.toFixed(2)}px`);
      requestAnimationFrame(stepParallax);
    }
    requestAnimationFrame(stepParallax);
  }
});
