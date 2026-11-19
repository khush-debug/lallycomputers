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
  if (typeof window.__redrawKineticGrid === 'function') window.__redrawKineticGrid();
}

/* ==========================================================================
   MOBILE HISTORY & HARDWARE/SOFTWARE BACK BUTTON MANAGER
   ========================================================================== */
let isHandlingPopState = false;

function pushNavigationState(type, id) {
  try {
    const cur = window.history.state;
    if (!cur || cur.lallyView !== type || cur.lallyId !== id) {
      window.history.pushState({ lallyView: type, lallyId: id || null, ts: Date.now() }, '', window.location.href);
    }
  } catch (e) { }
}

function popNavigationStateIfMatches(type) {
  if (isHandlingPopState) return;
  try {
    const cur = window.history.state;
    if (cur && cur.lallyView === type) {
      window.history.back();
    }
  } catch (e) { }
}

// Intercept phone Back button (hardware key, on-screen triangle, or edge swipe)
window.addEventListener('popstate', (e) => {
  isHandlingPopState = true;
  try {
    // 1. Close any active modal dialog first
    const openModal = document.querySelector('.modal-backdrop.is-open');
    if (openModal) {
      Modal.close(openModal.id, false);
      return;
    }

    // 2. Close mobile navigation drawer if open
    const mobileDrawer = document.getElementById('appleMobileDrawer');
    if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
      if (typeof window.closeAppleMobileDrawer === 'function') {
        window.closeAppleMobileDrawer(false);
      }
      return;
    }

    // 3. Close full-screen catalogue space if open
    const catalogueSpace = document.getElementById('catalogueSpace');
    if (catalogueSpace && catalogueSpace.classList.contains('is-open')) {
      closeCatalogueSpace(false);
      return;
    }
  } finally {
    setTimeout(() => { isHandlingPopState = false; }, 60);
  }
});

/* ==========================================================================
   MODAL CONTROLLER (UNIFIED WITH MOBILE HISTORY & SWIPE GESTURE)
   ========================================================================== */
const Modal = {
  open(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      pushNavigationState('modal', id);
    }
  },
  close(id, syncHistory = true) {
    if (id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('is-open');
    } else {
      document.querySelectorAll('.modal-backdrop.is-open').forEach(m => m.classList.remove('is-open'));
    }
    if (!document.querySelector('.modal-backdrop.is-open')) {
      document.body.style.overflow = '';
    }
    if (syncHistory) {
      popNavigationStateIfMatches('modal');
    }
  }
};

// Touch swipe-down to dismiss modal sheets on mobile phones
function initModalSwipeToDismiss() {
  document.querySelectorAll('.modal-sheet').forEach(sheet => {
    let startY = 0;
    let currentY = 0;
    let isSwiping = false;

    sheet.addEventListener('touchstart', (e) => {
      if (sheet.scrollTop <= 0) {
        startY = e.touches[0].clientY;
        currentY = startY;
        isSwiping = true;
      }
    }, { passive: true });

    sheet.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      currentY = e.touches[0].clientY;
      const diffY = currentY - startY;
      if (diffY > 0 && sheet.scrollTop <= 0) {
        sheet.style.transform = `translateY(${Math.min(diffY, 150)}px)`;
      }
    }, { passive: true });

    sheet.addEventListener('touchend', () => {
      if (!isSwiping) return;
      isSwiping = false;
      const diffY = currentY - startY;
      sheet.style.transition = 'transform 0.22s ease';
      if (diffY > 75 && sheet.scrollTop <= 0) {
        const parentModal = sheet.closest('.modal-backdrop');
        if (parentModal) Modal.close(parentModal.id);
      }
      sheet.style.transform = '';
      setTimeout(() => { sheet.style.transition = ''; }, 240);
    }, { passive: true });
  });
}

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
  pushNavigationState('catalogueSpace', activeCategory);

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

function closeCatalogueSpace(syncHistory = true) {
  const space = document.getElementById('catalogueSpace');
  if (space) space.classList.remove('is-open');
  document.querySelectorAll('.chap-item').forEach(btn => btn.classList.remove('is-active'));
  const lineup = document.getElementById('lineup');
  if (lineup) lineup.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (syncHistory) {
    popNavigationStateIfMatches('catalogueSpace');
  }
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
    const delivery = item.delivery || 'In-Store Pickup · Sodhi Nagar, Moga';
    const fallbackImg = getCategoryFallbackImage(item.category);
    const image = normalizeProductImageUrl(item.image) || `images/products/${item.id}.svg`;
    const waText = encodeURIComponent(`Hi Lally Computers, I want to inquire about ${item.title} (${item.price}). Is this currently in stock at Sodhi Nagar?`);

    const badgesHtml = `
      <div class="amz-badge-strip">
        ${item.isLowStock ? '<span class="amz-badge-tag amz-badge-tag--used">🔥 Low Stock</span>' : ''}
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

    const mobileLabOrSpecBtn = item.labReport ? `
      <a class="amz-mobile-icon-btn" href="product.html?id=${item.id}#labReport" title="View 25-Point Lab Report" aria-label="Lab Report">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </a>
    ` : `
      <a class="amz-mobile-icon-btn" href="product.html?id=${item.id}" title="View Details" aria-label="View Details">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="4" width="16" height="16" rx="2"/>
          <line x1="8" y1="9" x2="16" y2="9"/>
          <line x1="8" y1="13" x2="16" y2="13"/>
        </svg>
      </a>
    `;

    return `
      <article class="amz-product-row" id="product-${item.id}">
        <div class="amz-img-col">
          <a class="amz-img-link" href="product.html?id=${item.id}" aria-label="View details for ${item.title}">
            <div class="amz-img-container">
              <img class="amz-product-img" src="${image}" alt="${item.title}" loading="lazy" width="180" height="150" onerror="this.onerror=null;this.src='${fallbackImg}';">
            </div>
          </a>
          <div class="amz-mobile-img-actions">
            ${mobileLabOrSpecBtn}
            <a class="amz-mobile-icon-btn" href="https://wa.me/919872010193?text=${waText}" target="_blank" rel="noopener" title="Inquire on WhatsApp" aria-label="Inquire on WhatsApp">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </a>
          </div>
        </div>

        <div class="amz-info-col">
          <div class="amz-mobile-eyebrow">
            ${item.condition === 'service' ? '🔬 Lab Service' : (item.condition === 'used' ? '⚡ 25-Point Lab Verified' : (item.condition === 'new' ? '✨ Factory Sealed' : 'Verified Store Stock'))}
            ${item.badge ? ` &middot; ${item.badge}` : ''}
          </div>
          ${badgesHtml}
          <a class="amz-title-link" href="product.html?id=${item.id}">
            <h3 class="amz-product-title">${item.title}</h3>
          </a>
          <p class="amz-product-desc">${item.desc}</p>
          ${specsHtml}

          <div class="amz-meta-row">
            <div class="amz-rating-inline">
              <span class="amz-rating-num">${rating.toFixed(1)}</span>
              <div class="amz-stars">${renderStars(rating)}</div>
              <span class="amz-review-link">(${reviews.toLocaleString()})</span>
              <span class="amz-bought-tag">${bought}</span>
            </div>
            <div class="amz-pricing-inline">
              <span class="amz-price-current">${item.price}</span>
              ${mrpHtml}
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
            <a class="amz-btn-view" href="product.html?id=${item.id}">View Details &rarr;</a>
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
    existing.checked = true;
  } else {
    cart.push({
      id: item.id,
      title: item.title,
      price: item.price,
      priceNum: item.priceNum || 0,
      image: item.image || `images/products/${item.id}.svg`,
      mrp: item.mrp || '',
      discount: item.discount || '',
      delivery: item.delivery || 'FREE delivery in Moga',
      boughtPastMonth: item.boughtPastMonth || '500+ bought in past month',
      qty: 1,
      checked: true
    });
  }

  saveCart();
  updateCartUI();
  showToast(`Added "${item.title.substring(0, 24)}..." to cart`);

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

function toggleCartItemCheck(id) {
  const item = cart.find(x => x.id === id);
  if (item) {
    item.checked = item.checked === false ? true : false;
    saveCart();
    renderCartModal();
  }
}

function shareCartProduct(id, title) {
  const url = window.location.origin + window.location.pathname + '#product-' + id;
  if (navigator.share) {
    navigator.share({
      title: title,
      text: `${title} at Lally Computers (Supreme Infosys), Moga`,
      url: url
    }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
    showToast('Copied product link to clipboard');
  }
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
  const topBar = document.getElementById('cartMobileTopBar');
  const mobileHeaderBadge = document.getElementById('cartMobileHeaderBadge');
  if (!body) return;

  const totalCount = cart.reduce((acc, x) => acc + x.qty, 0);

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-icon">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <h4 class="cart-empty-title">Your shopping basket is empty</h4>
        <p class="cart-empty-desc">Explore verified laptops, gaming rigs, and components ready for instant pickup or test in Moga.</p>
        <button class="cart-empty-btn" type="button" onclick="closeCartModal(); if (typeof openCatalogueSpace === 'function') { openCatalogueSpace('laptops_used'); } else { document.getElementById('catalogueSpace')?.scrollIntoView({behavior:'smooth'}); }">
          <span>Browse Showroom Inventory</span>
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;
    if (footer) footer.style.display = 'none';
    if (topBar) topBar.style.display = 'none';
    if (mobileHeaderBadge) mobileHeaderBadge.textContent = '0 items';
    return;
  }

  let totalNum = 0;
  let selectedCount = 0;
  body.innerHTML = cart.map(item => {
    const isChecked = item.checked !== false;
    if (isChecked) {
      totalNum += (item.priceNum || 0) * item.qty;
      selectedCount += item.qty;
    }
    const prod = (window.PRODUCTS && window.PRODUCTS.find(p => p.id === item.id)) || {};
    const mrp = item.mrp || prod.mrp || '';
    const discount = item.discount || prod.discount || '';
    const delivery = item.delivery || prod.delivery || 'FREE delivery in Moga';
    const bought = item.boughtPastMonth || prod.boughtPastMonth || '500+ bought in past month';
    const waItemText = encodeURIComponent(`Hi Lally Computers, I want to reserve / inquire about ${item.title} (${item.price}). Is it in stock at Sodhi Nagar?`);
    const escapedTitle = (item.title || '').replace(/'/g, "\\'");

    return `
      <div class="cart-item-row" id="cart-item-${item.id}">
        <div class="cart-item-top">
          <div class="cart-item-check-col">
            <label class="cart-checkbox-label">
              <input type="checkbox" class="cart-checkbox" ${isChecked ? 'checked' : ''} onchange="toggleCartItemCheck('${item.id}')" aria-label="Select ${item.title}">
              <span class="cart-checkbox-custom ${isChecked ? 'is-checked' : ''}">
                <svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </span>
            </label>
          </div>

          <div class="cart-item-thumb-box">
            <a href="product.html?id=${item.id}">
              <img class="cart-item-thumb" src="${item.image}" alt="${item.title}" loading="lazy">
            </a>
          </div>

          <div class="cart-item-info">
            <a href="product.html?id=${item.id}" style="text-decoration:none;color:inherit;">
              <h4 class="cart-item-title">${item.title}</h4>
            </a>
            <div class="cart-item-bought">${bought}</div>

            <div class="cart-item-price-row">
              ${discount ? `<span class="cart-deal-badge">${discount}</span>` : ''}
              <span class="cart-item-price">${item.price}</span>
              ${mrp ? `<span class="cart-item-mrp">M.R.P.: <del>${mrp}</del></span>` : ''}
            </div>

            <div class="cart-item-stock">In stock</div>
            <div class="cart-item-delivery">🚚 ${delivery}</div>
            <div class="cart-item-warranty">🛡️ 10 days Replacement &middot; Official GST Invoice</div>
          </div>
        </div>

        <div class="cart-item-actions-toolbar">
          <div class="cart-stepper-pill">
            <button class="cart-stepper-btn cart-stepper-minus" type="button" onclick="updateCartQty('${item.id}', -1)" aria-label="${item.qty === 1 ? 'Remove item' : 'Decrease quantity'}">
              ${item.qty === 1 ? `
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              ` : '−'}
            </button>
            <span class="cart-stepper-val">${item.qty}</span>
            <button class="cart-stepper-btn cart-stepper-plus" type="button" onclick="updateCartQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
          </div>

          <button class="cart-tool-btn" type="button" onclick="removeFromCart('${item.id}')">Delete</button>
          <a class="cart-tool-btn" href="https://wa.me/919872010193?text=${waItemText}" target="_blank" rel="noopener">Inquire</a>
          <button class="cart-tool-icon-btn" type="button" onclick="shareCartProduct('${item.id}', '${escapedTitle}')" title="Share" aria-label="Share">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  const formattedTotal = totalNum > 0 ? `₹${totalNum.toLocaleString('en-IN')}` : 'Estimated in store';
  const effectiveCount = selectedCount > 0 ? selectedCount : totalCount;

  if (mobileHeaderBadge) {
    mobileHeaderBadge.textContent = `${totalCount} item${totalCount === 1 ? '' : 's'}`;
  }

  if (topBar) {
    topBar.style.display = 'block';
    const topCount = document.getElementById('cartTopCount');
    const btnCount = document.getElementById('cartBtnCount');
    const topTotal = document.getElementById('cartTopTotalVal');
    if (topCount) topCount.textContent = effectiveCount;
    if (btnCount) btnCount.textContent = effectiveCount;
    if (topTotal) topTotal.textContent = formattedTotal;
  }

  if (footer) {
    footer.style.display = 'flex';
    const totalEl = document.getElementById('cartSubtotalVal') || document.getElementById('cartTotalDisplay');
    if (totalEl) totalEl.textContent = formattedTotal;
  }
}

function checkoutCartWhatsApp() {
  const selectedItems = cart.filter(x => x.checked !== false);
  const itemsToCheckout = selectedItems.length > 0 ? selectedItems : cart;
  if (itemsToCheckout.length === 0) return;

  let text = "Hi Lally Computers, I would like to purchase / reserve the following items from your in-store stock:\n\n";
  let total = 0;
  itemsToCheckout.forEach((item, idx) => {
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
  document.getElementById('labReportId').textContent = rep.reportId || 'SIL-LAB-VERIFIED';
  document.getElementById('labTestedDate').textContent = rep.testedDate || rep.testDate || 'Verified In-Store';
  document.getElementById('labGradeBadge').textContent = rep.overallGrade || rep.grade || 'GRADE A+';
  document.getElementById('labOverallNotes').textContent =
    rep.overallNotes || 'Passed all 25-point physical, thermal, electrical, and component integrity benchmarks at Supreme Infosys Lab, Sodhi Nagar, Moga.';
  document.getElementById('labInspector').textContent = rep.technician || rep.inspector || 'Senior Hardware Engineer';

  const tbody = document.getElementById('labChecklistTbody');
  if (tbody) {
    let checks = Array.isArray(rep.checklist) && rep.checklist.length ? rep.checklist : [];
    if (checks.length === 0) {
      const fieldMap = [
        ['Battery Health', rep.batteryHealth],
        ['CPU & Thermal Stress', rep.cpuStress],
        ['SSD S.M.A.R.T. Health', rep.ssdHealth],
        ['Display Panel & Backlight', rep.screenStatus],
        ['Keyboard & Trackpad', rep.keyboardTrackpad],
        ['Motherboard & Power Rail', rep.motherboardPower],
        ['Ports & I/O Interfaces', rep.portsIo],
        ['Chassis & Hinges', rep.casingHinges]
      ];
      checks = fieldMap
        .filter(([, val]) => val && String(val).trim().length > 0)
        .map(([point, result]) => ({ point, result, status: 'PASS' }));
    }

    tbody.innerHTML = checks.map(chk => `
      <tr>
        <td class="lab-point-name">${chk.point}</td>
        <td class="lab-point-result">${chk.result} <span class="lab-pass-tag">✓ ${chk.status || 'PASS'}</span></td>
      </tr>
    `).join('');
  }

  const waBtn = document.getElementById('labReportWaBtn');
  if (waBtn) {
    waBtn.href = `https://wa.me/919872010193?text=${encodeURIComponent(`Hi Lally Computers, I reviewed Lab Diagnostic Report ${rep.reportId || ''} for ${item.title}. Can I inspect it in Sodhi Nagar?`)}`;
  }

  Modal.open('labReportModal');
}

function closeLabReportModal() {
  Modal.close('labReportModal');
}

function openSpecSheet(id) {
  if (id) {
    window.location.href = `product.html?id=${encodeURIComponent(id)}`;
    return;
  }
}

function closeSpecSheet() {
  Modal.close('appleModal');
}

/* ==========================================================================
   GOOGLE SHEETS LIVE STOCK SYNC (GLOBAL DEFAULT + LIVE UPDATES)
   ========================================================================== */
const DEFAULT_LIVE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1dPrip8jyf-zaRk_Bm0fQWb9R3P2sNTSX-FbtXQoH4V4/edit?usp=sharing';

const CATEGORY_FALLBACK_IMAGES = {
  laptops_used: 'images/products/lap-used-1.svg',
  laptops_new: 'images/products/lap-new-1.svg',
  laptops_gaming: 'images/products/lap-game-1.svg',
  pc: 'images/products/pc-1.svg',
  pc_components: 'images/products/pcc-1.svg',
  pc_peripherals: 'images/products/per-1.svg',
  monitors: 'images/products/mon-1.svg',
  watches: 'images/products/wat-1.svg',
  gadgets: 'images/products/gad-1.svg',
  gym: 'images/products/gym-1.svg',
  suitcases: 'images/products/suit-1.svg',
  appliances: 'images/products/app-1.svg',
  repairs: 'images/products/rep-1.svg'
};

function getCategoryFallbackImage(category) {
  return CATEGORY_FALLBACK_IMAGES[category] || 'images/products/lap-used-1.svg';
}

function normalizeProductImageUrl(url) {
  if (!url) return '';
  const clean = url.trim();
  if (!clean) return '';
  // Convert Google Drive share links into direct embeddable image URLs
  const driveFileMatch = clean.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (driveFileMatch) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}=w800`;
  }
  const driveIdMatch = clean.match(/drive\.google\.com\/(?:open|uc)\?.*id=([a-zA-Z0-9-_]+)/);
  if (driveIdMatch) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}=w800`;
  }
  return clean;
}

function normalizeGoogleSheetUrl(url) {
  if (!url) return '';
  url = url.trim();
  if (url.includes('output=csv') || url.includes('tqx=out:csv') || url.includes('/export?format=csv')) {
    return url;
  }

  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) return url;
  const sheetId = match[1];

  let gid = '0';
  const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
  if (gidMatch) gid = gidMatch[1];

  // gviz CSV endpoint supports browser CORS and reflects edits quickly
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let entry = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (insideQuote && text[i + 1] === '"') {
        entry += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (ch === ',' && !insideQuote) {
      row.push(entry.trim());
      entry = '';
    } else if ((ch === '\n' || ch === '\r') && !insideQuote) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(entry.trim());
      if (row.some(cell => cell.length > 0)) rows.push(row);
      row = [];
      entry = '';
    } else {
      entry += ch;
    }
  }
  if (entry.length > 0 || row.length > 0) {
    row.push(entry.trim());
    if (row.some(cell => cell.length > 0)) rows.push(row);
  }
  return rows;
}

function isUnavailableStatus(statusStr) {
  if (!statusStr) return false;
  const s = statusStr.trim().toLowerCase();
  return (
    s === 'sold' ||
    s === 'sold out' ||
    s === 'out of stock' ||
    s === 'unavailable' ||
    s === 'hidden' ||
    s === 'archived' ||
    s === 'inactive' ||
    s === 'no' ||
    s === '0' ||
    s === 'false'
  );
}

function mapCsvToProducts(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.replace(/^\uFEFF/, '').trim().toLowerCase());
  const defaultById = {};
  (window.DEFAULT_PRODUCTS || []).forEach(p => {
    defaultById[p.id] = p;
  });

  const products = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] || '').trim();
    });

    if (!obj.id && !obj.title) continue;
    if (isUnavailableStatus(obj.status)) continue;

    const id = obj.id || `csv-${i}`;
    const base = defaultById[id] || {};
    const category = obj.category || base.category || 'laptops_used';

    const rawPriceNum = parseFloat((obj.pricenum || obj.price || '').replace(/[^0-9.]/g, ''));
    const pNum = !isNaN(rawPriceNum) ? rawPriceNum : (base.priceNum || 0);
    const rawMrpNum = parseFloat((obj.mrpnum || obj.mrp || '').replace(/[^0-9.]/g, ''));
    const mrpNum = !isNaN(rawMrpNum) && rawMrpNum > 0 ? rawMrpNum : (base.mrpNum || 0);

    const specsList = obj.specs
      ? obj.specs.split('|').map(s => s.trim()).filter(Boolean)
      : (base.specs || []);

    const statusLower = (obj.status || '').toLowerCase();
    const isLowStock = statusLower.includes('low') || statusLower.includes('last');

    // Rebuild 25-Point Lab Report if lab columns are present in sheet (or inherit from default)
    const hasCsvLab =
      obj.labreportid || obj.overallgrade || obj.batteryhealth || obj.cpustress || obj.ssdhealth || obj.screenstatus;
    const labReport = hasCsvLab
      ? {
          reportId: obj.labreportid || (base.labReport && base.labReport.reportId) || `SIL-LAB-${i}`,
          overallGrade: obj.overallgrade || (base.labReport && base.labReport.overallGrade) || 'Grade A+',
          batteryHealth: obj.batteryhealth || '',
          cpuStress: obj.cpustress || '',
          ssdHealth: obj.ssdhealth || '',
          screenStatus: obj.screenstatus || '',
          keyboardTrackpad: obj.keyboardtrackpad || '',
          motherboardPower: obj.motherboardpower || '',
          portsIo: obj.portsio || '',
          casingHinges: obj.casinghinges || '',
          technician: obj.technician || (base.labReport && base.labReport.technician) || 'Supreme Infosys Lab Engineer',
          testedDate: obj.testeddate || (base.labReport && base.labReport.testedDate) || 'Verified In-Store'
        }
      : (base.labReport || null);

    const resolvedImg =
      normalizeProductImageUrl(obj.image) ||
      base.image ||
      getCategoryFallbackImage(category);

    const computedDiscount =
      obj.discount ||
      (mrpNum > pNum && pNum > 0 ? `${Math.round(((mrpNum - pNum) / mrpNum) * 100)}% off` : (base.discount || ''));

    products.push({
      id: id,
      status: obj.status || 'In Stock',
      isLowStock: isLowStock,
      category: category,
      brand: obj.brand || base.brand || 'Supreme',
      title: obj.title || base.title || 'In-Store Product',
      desc: obj.desc || base.desc || '',
      price: obj.price || (pNum ? `₹${pNum.toLocaleString('en-IN')}` : (base.price || 'Inquire for Price')),
      priceNum: pNum,
      budget: obj.budget || base.budget || '',
      size: obj.size || base.size || '',
      panel: obj.panel || base.panel || '',
      mrp: obj.mrp || (mrpNum ? `₹${mrpNum.toLocaleString('en-IN')}` : (base.mrp || '')),
      mrpNum: mrpNum,
      discount: computedDiscount,
      badge: obj.badge || base.badge || '',
      condition: obj.condition || base.condition || 'new',
      warranty: obj.warranty || base.warranty || 'Warranty Included',
      specs: specsList,
      details: obj.details ? { 'Specifications': obj.details } : (base.details || {}),
      labReport: labReport,
      image: resolvedImg,
      rating: parseFloat(obj.rating) || base.rating || 4.5,
      reviewsCount: parseInt(obj.reviewscount, 10) || base.reviewsCount || 120,
      boughtPastMonth: obj.boughtpastmonth || base.boughtPastMonth || '100+ bought in past month',
      delivery: obj.delivery || base.delivery || 'In-Store Pickup · Sodhi Nagar, Moga',
      fastDelivery: obj.fastdelivery || base.fastDelivery || 'Same-Day Pickup Available'
    });
  }
  return products;
}

const STOCK_CACHE_KEY = 'lally_stock_cache_v1';

function hydrateCachedStock(activeUrl) {
  try {
    const raw = localStorage.getItem(STOCK_CACHE_KEY);
    if (!raw) return false;
    const cached = JSON.parse(raw);
    if (!cached || cached.url !== activeUrl || !Array.isArray(cached.products) || cached.products.length === 0) {
      return false;
    }
    window.PRODUCTS = cached.products;
    const currentSourceEl = document.getElementById('sheetCurrentStatus');
    const badgeEl = document.getElementById('sheetSyncBadgeText');
    const indicatorEl = document.getElementById('sheetStatusIndicator');
    if (currentSourceEl) currentSourceEl.textContent = `Live Google Sheet (${cached.products.length} In-Stock Items)`;
    if (badgeEl) badgeEl.textContent = `Live Stock (${cached.products.length} Items)`;
    if (indicatorEl) indicatorEl.className = 'dot-status dot-open';
    return true;
  } catch (e) {
    return false;
  }
}

function fetchAndSyncGoogleSheet(csvUrl, isManual) {
  if (isManual) showTopLoader();
  const baseUrl = normalizeGoogleSheetUrl(csvUrl);
  const sep = baseUrl.includes('?') ? '&' : '?';
  const fetchUrl = `${baseUrl}${sep}_t=${Date.now()}`;

  const statusEl = document.getElementById('sheetSyncStatus');
  const currentSourceEl = document.getElementById('sheetCurrentStatus');
  const badgeEl = document.getElementById('sheetSyncBadgeText');
  const indicatorEl = document.getElementById('sheetStatusIndicator');

  if (statusEl && isManual) {
    statusEl.innerHTML = '<span style="color:#60a5fa">Connecting to Google Sheets...</span>';
  }

  fetch(fetchUrl, { cache: 'no-store' })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then(csvText => {
      const rows = parseCSV(csvText);
      const newProducts = mapCsvToProducts(rows);
      if (newProducts.length === 0) throw new Error('No in-stock products found in sheet.');

      const prevJson = JSON.stringify(window.PRODUCTS || []);
      const nextJson = JSON.stringify(newProducts);
      const changed = prevJson !== nextJson;

      window.PRODUCTS = newProducts;
      try {
        localStorage.setItem(STOCK_CACHE_KEY, JSON.stringify({ url: csvUrl, ts: Date.now(), products: newProducts }));
        if (isManual) localStorage.setItem('lally_sheet_url', csvUrl);
      } catch (e) { }

      if (statusEl) {
        statusEl.innerHTML = `<span style="color:#34d399">✓ Synced ${newProducts.length} live in-stock items!</span>`;
      }
      if (currentSourceEl) {
        currentSourceEl.textContent = `Live Google Sheet (${newProducts.length} In-Stock Items)`;
      }
      if (badgeEl) badgeEl.textContent = `Live Stock (${newProducts.length} Items)`;
      if (indicatorEl) indicatorEl.className = 'dot-status dot-open';

      if (changed || isManual) {
        renderCategories();
        const space = document.getElementById('catalogueSpace');
        if (space && space.classList.contains('is-open')) {
          renderCategoryFilters(activeCategory);
          renderSpaceProducts();
        }
      }

      if (isManual) {
        finishTopLoader();
        setTimeout(closeSheetSyncModal, 1200);
        showToast(`Stock synced from Google Sheets (${newProducts.length} items)`);
      }
    })
    .catch(err => {
      console.warn('Google Sheet sync error:', err);
      if (isManual) finishTopLoader();
      if (statusEl && isManual) {
        statusEl.innerHTML = `<span style="color:#f87171">Sync failed. Ensure sheet sharing is "Anyone with the link can view". (${err.message})</span>`;
      }
      if (!window.PRODUCTS || window.PRODUCTS.length === 0) {
        if (currentSourceEl) currentSourceEl.textContent = 'In-Store Default Catalogue (Fallback)';
        if (badgeEl) badgeEl.textContent = 'Live Google Sheet Stock Manager';
        if (indicatorEl) indicatorEl.className = 'dot-status dot-closed';
      }
    });
}

function openSheetSyncModal() {
  const input = document.getElementById('sheetUrlInput');
  const activeUrl = localStorage.getItem('lally_sheet_url') || DEFAULT_LIVE_SHEET_URL;
  if (input && activeUrl) input.value = activeUrl;
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
  if (input) input.value = DEFAULT_LIVE_SHEET_URL;
  const currentSourceEl = document.getElementById('sheetCurrentStatus');
  if (currentSourceEl) currentSourceEl.textContent = 'In-Store Default Catalogue (Offline)';
  const badgeEl = document.getElementById('sheetSyncBadgeText');
  if (badgeEl) badgeEl.textContent = 'Live Google Sheet Stock Manager';
  const indicatorEl = document.getElementById('sheetStatusIndicator');
  if (indicatorEl) indicatorEl.className = 'dot-status dot-closed';
  const statusEl = document.getElementById('sheetSyncStatus');
  if (statusEl) statusEl.innerHTML = '<span style="color:#94a3b8">Default offline catalogue restored.</span>';

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
  } else if (time >= 9.5 && time < 19) {
    if (dot) dot.className = 'dot-status dot-open';
    text.textContent = 'Open Now · Closes at 7:00 PM';
  } else if (time < 9.5) {
    if (dot) dot.className = 'dot-status dot-closed';
    text.textContent = 'Closed Now · Opens at 9:30 AM';
  } else {
    if (dot) dot.className = 'dot-status dot-closed';
    text.textContent = 'Closed for the day · Opens tomorrow at 9:30 AM';
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

  // Initialize Mobile Modal Swipe-Down-To-Dismiss Gestures
  initModalSwipeToDismiss();

  // Initialize Carousel Pagination Dots with Manual Movement & Arrow Controls
  initSliderWithDots('whySliderWrap', 'whyTrack', 'whyDots', 6, 42, 'whyPrevBtn', 'whyNextBtn');
  initSliderWithDots('reviewsSliderWrap', 'reviewsTrack', 'reviewsDots', 4, 40, 'reviewsPrevBtn', 'reviewsNextBtn');

  // Instant hydration from cached live Google Sheet stock (0ms reload, no count jump)
  const activeSheetUrl = localStorage.getItem('lally_sheet_url') || DEFAULT_LIVE_SHEET_URL;
  if (activeSheetUrl) {
    hydrateCachedStock(activeSheetUrl);
  }

  // Render Categories (defer hidden Catalogue Space DOM until user opens it)
  renderCategories();
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

  // Silently revalidate live Google Sheet stock in background without blocking paint
  if (activeSheetUrl) {
    const startSync = () => fetchAndSyncGoogleSheet(activeSheetUrl, false);
    if ('requestIdleCallback' in window) {
      requestIdleCallback(startSync, { timeout: 1200 });
    } else {
      setTimeout(startSync, 150);
    }
  }

  // Interactive Kinetic Grid Background (start after first paint)
  requestAnimationFrame(() => initKineticGrid());

  // Cinematic Hero Video Banner (hero-720.mp4, non-interactive)
  initHeroVideo();

  // Apple-Style Full-Width Mega-Menu Flyout & Mobile Drawer
  initAppleMegaMenu();
});

/* ==========================================================================
   APPLE-STYLE MEGA-MENU FLYOUT & FILTER HELPER
   ========================================================================== */
function openCatalogueWithFilter(catId, opts) {
  openCatalogueSpace(catId);
  if (!opts) return;

  const brandSelect = document.getElementById('brandFilterSelect');
  const budgetSelect = document.getElementById('budgetFilterSelect');
  const sizeSelect = document.getElementById('sizeFilterSelect');
  const panelSelect = document.getElementById('panelFilterSelect');
  const searchInput = document.getElementById('spaceSearchInput');

  if (opts.brand && brandSelect) {
    brandSelect.value = opts.brand;
  }
  if (opts.budget && budgetSelect) {
    budgetSelect.value = opts.budget;
  }
  if (opts.size && sizeSelect) {
    sizeSelect.value = opts.size;
  }
  if (opts.panel && panelSelect) {
    panelSelect.value = opts.panel;
  }
  if (opts.search && searchInput) {
    searchInput.value = opts.search;
  }
  applyFilters();
}

function initAppleMegaMenu() {
  const nav = document.getElementById('appleNav');
  const menu = document.getElementById('appleMegaMenu');
  const content = document.getElementById('appleMegaContent');
  const backdrop = document.getElementById('appleMegaBackdrop');
  const triggers = Array.from(document.querySelectorAll('.nav-mega-trigger'));
  const mobileBtn = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('appleMobileDrawer');
  const mobileContent = document.getElementById('appleMobileDrawerContent');

  if (!nav || !menu || !content || !backdrop || triggers.length === 0) return;

  const WA_BASE = 'https://wa.me/919872010193?text=';

  function countFor(catId) {
    return (window.PRODUCTS || []).filter(p => p.category === catId).length;
  }

  function getMenuData(key) {
    const MAP = {
      laptops: {
        title: 'Laptops',
        col1Heading: 'Explore Laptops',
        primary: [
          { label: 'Explore All Laptops', cat: 'laptops_used' },
          { label: 'Pre-Owned Laptops', cat: 'laptops_used', count: countFor('laptops_used') },
          { label: 'Brand New Laptops', cat: 'laptops_new', count: countFor('laptops_new') },
          { label: 'Gaming Laptops', cat: 'laptops_gaming', count: countFor('laptops_gaming') },
          { label: 'Apple MacBook Series', cat: 'laptops_used', filter: { brand: 'Apple' } },
          { label: 'ThinkPad Corporate', cat: 'laptops_used', filter: { brand: 'Lenovo' } }
        ],
        sub: [
          { label: 'Under ₹25,000 Pre-Owned', cat: 'laptops_used', filter: { budget: 'under-25k' } },
          { label: '25-Point Lab Verification', href: '#why' }
        ],
        col2Heading: 'Shop by Brand',
        col2: [
          { label: 'Lenovo ThinkPad & IdeaPad', cat: 'laptops_used', filter: { brand: 'Lenovo' } },
          { label: 'Dell Latitude & Inspiron', cat: 'laptops_used', filter: { brand: 'Dell' } },
          { label: 'HP EliteBook & Victus', cat: 'laptops_used', filter: { brand: 'HP' } },
          { label: 'Apple MacBook Air M1 / M3', cat: 'laptops_new', filter: { brand: 'Apple' } },
          { label: 'ASUS Creator & RTX', cat: 'laptops_new', filter: { brand: 'Asus' } }
        ],
        col3Heading: 'More from Supreme',
        col3: [
          { label: '25-Point Lab Reports', href: '#why' },
          { label: '6-Month Pre-Owned Warranty', href: '#why' },
          { label: 'Genuine GST Tax Invoice', href: '#why' },
          { label: '709 Verified Google Reviews', href: '#reviews' },
          { label: 'WhatsApp Laptop Quote', external: WA_BASE + encodeURIComponent('Hi Supreme Infosys, I am looking for a laptop in Moga. Can you share current models?') }
        ]
      },
      pcs: {
        title: 'PCs & Parts',
        col1Heading: 'Explore PCs & Hardware',
        primary: [
          { label: 'Custom PCs & Workstations', cat: 'pc', count: countFor('pc') },
          { label: 'PC Components & GPUs', cat: 'pc_components', count: countFor('pc_components') },
          { label: 'Monitors & Displays', cat: 'monitors', count: countFor('monitors') },
          { label: 'Peripherals & Desk Gear', cat: 'pc_peripherals', count: countFor('pc_peripherals') }
        ],
        sub: [
          { label: 'RTX Gaming Builds', cat: 'pc', filter: { search: 'RTX' } },
          { label: '144Hz–180Hz Gaming Monitors', cat: 'monitors', filter: { panel: '144Hz' } }
        ],
        col2Heading: 'Shop Components',
        col2: [
          { label: 'NVIDIA RTX Graphics Cards', cat: 'pc_components', filter: { size: 'GPU' } },
          { label: 'Intel & AMD Processors', cat: 'pc_components', filter: { size: 'CPU' } },
          { label: 'Motherboards (DDR5 / WiFi)', cat: 'pc_components', filter: { size: 'Motherboard' } },
          { label: 'DDR5 RAM & Gen4 NVMe SSDs', cat: 'pc_components', filter: { size: 'RAM' } },
          { label: '80+ Gold PSUs & Cabinets', cat: 'pc_components', filter: { size: 'PSU' } },
          { label: 'Mechanical Keyboards & Mice', cat: 'pc_peripherals', filter: { size: 'Keyboard' } }
        ],
        col3Heading: 'Build Services',
        col3: [
          { label: 'Custom Assembly in Moga', href: '#why' },
          { label: 'Thermal & FPS Stress Testing', href: '#why' },
          { label: 'Full Brand Component Warranty', href: '#why' },
          { label: 'WhatsApp Custom PC Quote', external: WA_BASE + encodeURIComponent('Hi Supreme Infosys, I want to get a custom PC built. Can we discuss specs and pricing?') }
        ]
      },
      gadgets: {
        title: 'Gadgets',
        col1Heading: 'Explore Gadgets & Lifestyle',
        primary: [
          { label: 'Smart & Classic Watches', cat: 'watches', count: countFor('watches') },
          { label: 'Gadgets & Audio', cat: 'gadgets', count: countFor('gadgets') },
          { label: 'Gym & Fitness Gear', cat: 'gym', count: countFor('gym') },
          { label: 'Travel Suitcases & Luggage', cat: 'suitcases', count: countFor('suitcases') },
          { label: 'Washing Machines', cat: 'appliances', count: countFor('appliances') }
        ],
        sub: [
          { label: 'Browse All 13 Departments', href: '#lineup' },
          { label: 'Same-Day Pickup in Sodhi Nagar', href: '#visit' }
        ],
        col2Heading: 'Popular Picks',
        col2: [
          { label: 'Apple Watch & Casio G-Shock', cat: 'watches' },
          { label: 'ANC Earbuds & JBL Speakers', cat: 'gadgets', filter: { size: 'Earbuds' } },
          { label: '65W GaN Chargers & Routers', cat: 'gadgets', filter: { size: 'Charger' } },
          { label: 'Treadmills & Hex Dumbbells', cat: 'gym' },
          { label: 'Polycarbonate Cabin Trolleys', cat: 'suitcases' },
          { label: '5-Star Inverter Washers', cat: 'appliances' }
        ],
        col3Heading: 'Store Benefits',
        col3: [
          { label: '100% Factory Sealed Units', href: '#why' },
          { label: 'Official Pan-India Warranty', href: '#why' },
          { label: 'GST Tax Invoice Included', href: '#why' },
          { label: 'Inquire on WhatsApp', external: WA_BASE + encodeURIComponent('Hi Supreme Infosys, I want to check stock on watches / gadgets / appliances in Sodhi Nagar.') }
        ]
      },
      repairs: {
        title: 'Repairs',
        col1Heading: 'Chip-Level Repair Lab',
        primary: [
          { label: 'Explore All Repair Services', cat: 'repairs', count: countFor('repairs') },
          { label: 'Motherboard BGA Rework', cat: 'repairs', filter: { size: 'BGA' } },
          { label: 'Broken Display & Screen Swap', cat: 'repairs', filter: { size: 'Screen' } },
          { label: 'Liquid Spill Recovery', cat: 'repairs', filter: { size: 'Liquid' } },
          { label: 'Thermal Overhaul & Repaste', cat: 'repairs', filter: { size: 'Thermal' } }
        ],
        sub: [
          { label: 'Free Fault Diagnostics', cat: 'repairs' },
          { label: 'In-House Sodhi Nagar Lab', href: '#visit' }
        ],
        col2Heading: 'Devices We Service',
        col2: [
          { label: 'Apple MacBook Logic Boards', cat: 'repairs' },
          { label: 'ThinkPad, Dell & HP Laptops', cat: 'repairs' },
          { label: 'RTX Gaming Laptops & Cooling', cat: 'repairs' },
          { label: 'Custom Desktop PCs & GPUs', cat: 'repairs' },
          { label: 'SSD & RAM Speed Upgrades', cat: 'pc_components' }
        ],
        col3Heading: 'Lab Guarantee',
        col3: [
          { label: 'Zero Outsourcing — Done In-Store', href: '#why' },
          { label: 'Same-Day Express Turnaround', href: '#why' },
          { label: 'Call Lab: 098720 10193', href: 'tel:+919872010193' },
          { label: 'Book Repair on WhatsApp', external: WA_BASE + encodeURIComponent('Hi Supreme Infosys Lab, I need a laptop/PC repair diagnostic in Sodhi Nagar, Moga.') }
        ]
      },
      store: {
        title: 'Store',
        col1Heading: 'Visit Supreme Infosys',
        primary: [
          { label: 'All 13 Departments', href: '#lineup' },
          { label: 'Why Buy From Us', href: '#why' },
          { label: 'Verified Customer Reviews', href: '#reviews' },
          { label: 'Store Location & Directions', href: '#visit' }
        ],
        sub: [
          { label: '5-A, Sodhi Nagar, Moga 142001', href: '#visit' },
          { label: 'Mon–Sat · 9:30 AM – 7:00 PM', href: '#visit' }
        ],
        col2Heading: 'Direct Contact',
        col2: [
          { label: 'Call 098720 10193', href: 'tel:+919872010193' },
          { label: 'Chat on WhatsApp', external: WA_BASE + encodeURIComponent('Hi Supreme Infosys (Lally Computers), I have an enquiry.') },
          { label: 'Google Maps Directions', external: 'https://www.google.com/maps/dir/?api=1&destination=Supreme%20Infosys%20(Lally%20Computers)%2C%205-A%2C%20Sodhi%20Nagar%2C%20Moga%2C%20Punjab%20142001' }
        ],
        col3Heading: 'Store Tools',
        col3: [
          { label: 'Shopping Cart', action: 'cart' },
          { label: 'Live Google Sheet Stock', action: 'sheet' },
          { label: 'Privacy Policy', href: 'privacy.html' }
        ]
      }
    };
    return MAP[key] || MAP.laptops;
  }

  function renderLinkItem(item, cls) {
    const countHtml = typeof item.count === 'number' ? `<span class="apple-mega-count">${item.count}</span>` : '';
    if (item.external) {
      return `<li><a class="${cls}" href="${item.external}" target="_blank" rel="noopener">${item.label} ↗</a></li>`;
    }
    if (item.href) {
      return `<li><a class="${cls}" href="${item.href}" data-mega-close>${item.label}</a></li>`;
    }
    if (item.action) {
      return `<li><button type="button" class="${cls}" data-mega-action="${item.action}">${item.label}</button></li>`;
    }
    const filterAttr = item.filter ? ` data-mega-filter='${JSON.stringify(item.filter)}'` : '';
    return `<li><button type="button" class="${cls}" data-mega-cat="${item.cat}"${filterAttr}>${item.label}${countHtml}</button></li>`;
  }

  let activeKey = null;
  let closeTimer = null;

  function renderMegaContent(key) {
    const data = getMenuData(key);
    content.innerHTML = `
      <div class="apple-mega-col">
        <p class="apple-mega-heading">${data.col1Heading}</p>
        <ul class="apple-mega-primary-list">
          ${data.primary.map(it => renderLinkItem(it, 'apple-mega-primary-link')).join('')}
        </ul>
        ${data.sub && data.sub.length ? `
          <ul class="apple-mega-sub-list">
            ${data.sub.map(it => renderLinkItem(it, 'apple-mega-sub-link')).join('')}
          </ul>
        ` : ''}
      </div>
      <div class="apple-mega-col">
        <p class="apple-mega-heading">${data.col2Heading}</p>
        <ul class="apple-mega-secondary-list">
          ${data.col2.map(it => renderLinkItem(it, 'apple-mega-secondary-link')).join('')}
        </ul>
      </div>
      <div class="apple-mega-col">
        <p class="apple-mega-heading">${data.col3Heading}</p>
        <ul class="apple-mega-secondary-list">
          ${data.col3.map(it => renderLinkItem(it, 'apple-mega-secondary-link')).join('')}
        </ul>
      </div>
    `;
  }

  function openMega(key) {
    clearTimeout(closeTimer);
    if (activeKey !== key) {
      activeKey = key;
      renderMegaContent(key);
    }
    nav.classList.add('is-mega-open');
    menu.classList.add('is-open');
    backdrop.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    triggers.forEach(t => {
      const isAct = t.getAttribute('data-mega') === key;
      t.classList.toggle('is-active', isAct);
      t.setAttribute('aria-expanded', isAct ? 'true' : 'false');
    });
  }

  function closeMega() {
    clearTimeout(closeTimer);
    activeKey = null;
    nav.classList.remove('is-mega-open');
    menu.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    triggers.forEach(t => {
      t.classList.remove('is-active');
      t.setAttribute('aria-expanded', 'false');
    });
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(closeMega, 140);
  }

  function handleMenuInteraction(e) {
    const catBtn = e.target.closest('[data-mega-cat]');
    if (catBtn) {
      const cat = catBtn.getAttribute('data-mega-cat');
      const filterStr = catBtn.getAttribute('data-mega-filter');
      let filterObj = null;
      if (filterStr) {
        try { filterObj = JSON.parse(filterStr); } catch (err) { }
      }
      closeMega();
      closeMobileDrawer();
      openCatalogueWithFilter(cat, filterObj);
      return;
    }

    const actionBtn = e.target.closest('[data-mega-action]');
    if (actionBtn) {
      const act = actionBtn.getAttribute('data-mega-action');
      closeMega();
      closeMobileDrawer();
      if (act === 'cart') openCartModal();
      else if (act === 'sheet') openSheetSyncModal();
      return;
    }

    const closeLink = e.target.closest('[data-mega-close], a[target="_blank"]');
    if (closeLink) {
      closeMega();
      closeMobileDrawer();
    }
  }

  // Desktop hover + click triggers
  triggers.forEach(btn => {
    const key = btn.getAttribute('data-mega');
    btn.addEventListener('mouseenter', () => {
      if (window.innerWidth > 980) openMega(key);
    });
    btn.addEventListener('focus', () => {
      if (window.innerWidth > 980) openMega(key);
    });
    btn.addEventListener('click', () => {
      if (activeKey === key) closeMega();
      else openMega(key);
    });
  });

  nav.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  nav.addEventListener('mouseleave', scheduleClose);
  menu.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  menu.addEventListener('mouseleave', scheduleClose);
  backdrop.addEventListener('click', closeMega);
  content.addEventListener('click', handleMenuInteraction);

  // Mobile drawer accordion rendering
  function renderMobileDrawer() {
    if (!mobileContent) return;
    const keys = ['laptops', 'pcs', 'gadgets', 'repairs', 'store'];
    mobileContent.innerHTML = keys.map((k, idx) => {
      const d = getMenuData(k);
      return `
        <div class="mobile-mega-group ${idx === 0 ? 'is-expanded' : ''}">
          <button class="mobile-mega-group-btn" type="button" aria-expanded="${idx === 0 ? 'true' : 'false'}">
            <span>${d.title}</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div class="mobile-mega-group-body">
            <div class="mobile-mega-subgrid">
              <div>
                <p class="apple-mega-heading">${d.col1Heading}</p>
                <ul class="apple-mega-primary-list">
                  ${d.primary.map(it => renderLinkItem(it, 'apple-mega-primary-link')).join('')}
                </ul>
              </div>
              <div>
                <p class="apple-mega-heading">${d.col2Heading}</p>
                <ul class="apple-mega-secondary-list">
                  ${d.col2.map(it => renderLinkItem(it, 'apple-mega-secondary-link')).join('')}
                </ul>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function openMobileDrawer() {
    if (!mobileDrawer || !mobileBtn) return;
    renderMobileDrawer();
    nav.classList.add('is-mobile-open');
    mobileDrawer.classList.add('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    mobileBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    pushNavigationState('mobileDrawer');
  }

  function closeMobileDrawer(syncHistory = true) {
    if (!mobileDrawer || !mobileBtn) return;
    nav.classList.remove('is-mobile-open');
    mobileDrawer.classList.remove('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    mobileBtn.setAttribute('aria-expanded', 'false');
    if (!document.querySelector('.modal-backdrop.is-open')) {
      document.body.style.overflow = '';
    }
    if (syncHistory) {
      popNavigationStateIfMatches('mobileDrawer');
    }
  }

  window.closeAppleMobileDrawer = closeMobileDrawer;

  if (mobileBtn && mobileDrawer && mobileContent) {
    mobileBtn.addEventListener('click', () => {
      if (mobileDrawer.classList.contains('is-open')) closeMobileDrawer();
      else openMobileDrawer();
    });

    mobileContent.addEventListener('click', (e) => {
      const groupBtn = e.target.closest('.mobile-mega-group-btn');
      if (groupBtn) {
        const group = groupBtn.closest('.mobile-mega-group');
        const expanded = group.classList.toggle('is-expanded');
        groupBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        return;
      }
      handleMenuInteraction(e);
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (activeKey) closeMega();
      if (mobileDrawer && mobileDrawer.classList.contains('is-open')) closeMobileDrawer();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth <= 980 && activeKey) closeMega();
    if (window.innerWidth > 980 && mobileDrawer && mobileDrawer.classList.contains('is-open')) closeMobileDrawer();
  }, { passive: true });
}

function initHeroVideo() {
  const hero = document.getElementById('top');
  const video = document.getElementById('heroVideo');
  if (!hero || !video) return;

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    video.pause();
    return;
  }

  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {});
  }

  // Pause video when scrolled off-screen to save battery/GPU
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } else {
        video.pause();
      }
    }, { threshold: 0.05 });
    obs.observe(hero);
  }
}

/* ==========================================================================
   INTERACTIVE KINETIC GRID BACKGROUND (OPTIMIZED CANVAS 2D WITH IDLE SLEEP)
   ========================================================================== */
function initKineticGrid() {
  const canvas = document.getElementById('kineticGridCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const CELL_SIZE = 55;
  const INFLUENCE_RADIUS = 260;
  const MAX_WARP = 24;
  const DOT_SPACING = 28;
  const LERP_SPEED = 0.08;
  const NODE_BASE_RADIUS = 1.8;
  const NODE_ACTIVE_RADIUS = 3.2;

  const THEMES = {
    dark: {
      key: 'dark',
      bg: '#000000',
      dot: 'rgba(255,255,255,0.05)',
      lineBaseStr: 'rgba(255,255,255,0.130)',
      nodeBaseStr: 'rgba(255,255,255,0.200)',
      lineBase: { r: 255, g: 255, b: 255, a: 0.13 },
      lineActive: { r: 74, g: 158, b: 255, a: 0.9 },
      nodeBase: { r: 255, g: 255, b: 255, a: 0.2 },
      nodeActive: { r: 74, g: 158, b: 255, a: 1.0 },
      glow: '74,158,255',
      ripple: '100,180,255'
    },
    light: {
      key: 'light',
      bg: '#f5f5f7',
      dot: 'rgba(15,23,42,0.045)',
      lineBaseStr: 'rgba(15,23,42,0.085)',
      nodeBaseStr: 'rgba(15,23,42,0.160)',
      lineBase: { r: 15, g: 23, b: 42, a: 0.085 },
      lineActive: { r: 0, g: 113, b: 227, a: 0.78 },
      nodeBase: { r: 15, g: 23, b: 42, a: 0.16 },
      nodeActive: { r: 0, g: 113, b: 227, a: 0.95 },
      glow: '0,113,227',
      ripple: '0,113,227'
    }
  };

  function isLightTheme() {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light') return true;
    if (attr === 'dark') return false;
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
  }

  function lerpN(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpColor(base, active, t) {
    const r = Math.round(lerpN(base.r, active.r, t));
    const g = Math.round(lerpN(base.g, active.g, t));
    const b = Math.round(lerpN(base.b, active.b, t));
    const a = lerpN(base.a, active.a, t);
    return `rgba(${r},${g},${b},${a.toFixed(3)})`;
  }

  const mouse = { x: -9999, y: -9999 };
  const targetMouse = { x: -9999, y: -9999 };
  const ripples = [];
  let W = 0;
  let H = 0;
  let dpr = 1;
  let rafId = 0;

  // Offscreen static dot background cache (1 blit instead of ~2,000 arc() calls per frame)
  const bgCache = document.createElement('canvas');
  const bgCtx = bgCache.getContext('2d');
  let bgCacheTheme = '';

  function rebuildBgCache(theme) {
    if (!bgCtx || W <= 0 || H <= 0) return;
    bgCache.width = Math.floor(W * dpr);
    bgCache.height = Math.floor(H * dpr);
    bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bgCtx.fillStyle = theme.bg;
    bgCtx.fillRect(0, 0, W, H);
    bgCtx.fillStyle = theme.dot;
    bgCtx.beginPath();
    for (let x = DOT_SPACING / 2; x < W; x += DOT_SPACING) {
      for (let y = DOT_SPACING / 2; y < H; y += DOT_SPACING) {
        bgCtx.moveTo(x + 0.7, y);
        bgCtx.arc(x, y, 0.7, 0, Math.PI * 2);
      }
    }
    bgCtx.fill();
    bgCacheTheme = theme.key;
  }

  function setSize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bgCacheTheme = '';
    wake();
  }

  function getWarpedPoint(gx, gy, col, row, cols, rows) {
    const edgeMargin = 1.5;
    const colPin = Math.min(col / edgeMargin, (cols - 1 - col) / edgeMargin, 1);
    const rowPin = Math.min(row / edgeMargin, (rows - 1 - row) / edgeMargin, 1);
    const pinFactor = colPin * colPin * rowPin * rowPin;

    const dx = gx - mouse.x;
    const dy = gy - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const proximity = Math.max(0, 1 - dist / INFLUENCE_RADIUS) * pinFactor;

    let rx = 0;
    let ry = 0;
    for (let i = 0; i < ripples.length; i++) {
      const r = ripples[i];
      const rdx = gx - r.x;
      const rdy = gy - r.y;
      const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
      const waveWidth = 55;
      const diff = rdist - r.radius;
      if (Math.abs(diff) < waveWidth) {
        const strength = (1 - Math.abs(diff) / waveWidth) * r.opacity * 18 * pinFactor;
        const angle = Math.atan2(rdy, rdx);
        const sign = diff < 0 ? -1 : 1;
        rx += Math.cos(angle) * strength * sign * -1;
        ry += Math.sin(angle) * strength * sign * -1;
      }
    }

    if (dist < INFLUENCE_RADIUS && dist > 0 && pinFactor > 0) {
      const t = dist / INFLUENCE_RADIUS;
      const eased = t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, dist / 60);
      const warpAmt = eased * MAX_WARP * pinFactor;
      const angle = Math.atan2(dy, dx);
      return {
        pt: {
          x: gx - Math.cos(angle) * warpAmt + rx,
          y: gy - Math.sin(angle) * warpAmt + ry
        },
        proximity
      };
    }

    return { pt: { x: gx + rx, y: gy + ry }, proximity };
  }

  function draw(now) {
    const theme = isLightTheme() ? THEMES.light : THEMES.dark;
    if (bgCacheTheme !== theme.key) rebuildBgCache(theme);

    // Blit pre-rendered background + dot matrix in 1 call
    ctx.drawImage(bgCache, 0, 0, W, H);

    // Update ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      const age = (now - r.born) / 1000;
      r.radius = Math.max(0, age * 400);
      r.opacity = Math.max(0, 1 - age * 1.2);
      if (r.opacity <= 0) ripples.splice(i, 1);
    }

    // Build warped grid
    const cols = Math.max(2, Math.ceil(W / CELL_SIZE)) + 1;
    const rows = Math.max(2, Math.ceil(H / CELL_SIZE)) + 1;
    const cellW = W / (cols - 1);
    const cellH = H / (rows - 1);

    const pts = [];
    const prox = [];
    for (let row = 0; row < rows; row++) {
      pts[row] = [];
      prox[row] = [];
      for (let col = 0; col < cols; col++) {
        const res = getWarpedPoint(col * cellW, row * cellH, col, row, cols, rows);
        pts[row][col] = res.pt;
        prox[row][col] = res.proximity;
      }
    }

    // Batch all inactive grid segments into 1 path, draw active segments individually
    ctx.lineCap = 'butt';
    ctx.beginPath();
    const activeSegs = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - 1; col++) {
        const p1 = pts[row][col], p2 = pts[row][col + 1];
        const avg = (prox[row][col] + prox[row][col + 1]) * 0.5;
        if (avg < 0.005) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        } else {
          activeSegs.push(p1, p2, avg);
        }
      }
    }
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows - 1; row++) {
        const p1 = pts[row][col], p2 = pts[row + 1][col];
        const avg = (prox[row][col] + prox[row + 1][col]) * 0.5;
        if (avg < 0.005) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        } else {
          activeSegs.push(p1, p2, avg);
        }
      }
    }
    ctx.strokeStyle = theme.lineBaseStr;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    for (let i = 0; i < activeSegs.length; i += 3) {
      const p1 = activeSegs[i], p2 = activeSegs[i + 1], avg = activeSegs[i + 2];
      const t = avg * avg * (3 - 2 * avg);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = lerpColor(theme.lineBase, theme.lineActive, t);
      ctx.lineWidth = lerpN(0.8, 1.5, t);
      ctx.stroke();
    }

    // Batch inactive intersection nodes into 1 path, draw active nodes + glows
    ctx.beginPath();
    const activeNodes = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const p = pts[row][col];
        const pr = prox[row][col];
        if (pr < 0.005) {
          ctx.moveTo(p.x + NODE_BASE_RADIUS, p.y);
          ctx.arc(p.x, p.y, NODE_BASE_RADIUS, 0, Math.PI * 2);
        } else {
          activeNodes.push(p, pr);
        }
      }
    }
    ctx.fillStyle = theme.nodeBaseStr;
    ctx.fill();

    for (let i = 0; i < activeNodes.length; i += 2) {
      const p = activeNodes[i], pr = activeNodes[i + 1];
      const t = pr * pr * (3 - 2 * pr);
      const r = lerpN(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, t);

      if (t > 0.3) {
        const glowR = r + lerpN(0, 6, (t - 0.3) / 0.7);
        const grd = ctx.createRadialGradient(p.x, p.y, r * 0.5, p.x, p.y, glowR);
        grd.addColorStop(0, `rgba(${theme.glow},${(t * 0.3).toFixed(3)})`);
        grd.addColorStop(1, `rgba(${theme.glow},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = lerpColor(theme.nodeBase, theme.nodeActive, t);
      ctx.fill();
    }

    // Draw click ripple rings
    for (let i = 0; i < ripples.length; i++) {
      const r = ripples[i];
      const safeRadius = Math.max(0, r.radius);
      ctx.beginPath();
      ctx.arc(r.x, r.y, safeRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${theme.ripple},${(r.opacity * 0.28).toFixed(3)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function animate(now) {
    rafId = 0;
    const dx = targetMouse.x - mouse.x;
    const dy = targetMouse.y - mouse.y;
    const settled = Math.abs(dx) < 0.35 && Math.abs(dy) < 0.35;
    if (settled) {
      mouse.x = targetMouse.x;
      mouse.y = targetMouse.y;
    } else {
      mouse.x += dx * LERP_SPEED;
      mouse.y += dy * LERP_SPEED;
    }

    draw(now);

    if (!settled || ripples.length > 0) {
      rafId = requestAnimationFrame(animate);
    }
  }

  function wake() {
    if (!rafId) rafId = requestAnimationFrame(animate);
  }

  window.__redrawKineticGrid = () => {
    bgCacheTheme = '';
    wake();
  };

  setSize();
  window.addEventListener('resize', setSize, { passive: true });

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    draw(performance.now());
    return;
  }

  window.addEventListener('mousemove', (e) => {
    targetMouse.x = e.clientX;
    targetMouse.y = e.clientY;
    wake();
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    targetMouse.x = -9999;
    targetMouse.y = -9999;
    wake();
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      targetMouse.x = e.touches[0].clientX;
      targetMouse.y = e.touches[0].clientY;
      wake();
    }
  }, { passive: true });

  window.addEventListener('click', (e) => {
    ripples.push({
      x: e.clientX,
      y: e.clientY,
      radius: 0,
      opacity: 1,
      born: performance.now()
    });
    wake();
  }, { passive: true });
}
