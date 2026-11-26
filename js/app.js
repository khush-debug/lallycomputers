/**
 * Lally Computers (Supreme Infosys) - Storefront & Catalogue Controller
 */

window.CATEGORIES = window.CATEGORIES || [];
window.DEFAULT_PRODUCTS = window.DEFAULT_PRODUCTS || [];
window.PRODUCTS = window.DEFAULT_PRODUCTS.slice(0);

let activeCategory = 'laptops_used';
let searchFilter = '';
let sortPriceFilter = '';
let cpuGenFilter = '';
let ramFilter = '';
let ssdFilter = '';
let conditionFilter = '';
let availabilityFilter = '';

function normalizeCategory(cat) {
  if (!cat) return 'laptops_used';
  if (['pc_peripherals', 'gadgets'].includes(cat)) return 'accessories';
  if (['appliances', 'suitcases', 'gym', 'watches'].includes(cat)) return 'other';
  return cat;
}

/* ==========================================================================
   THEME SWITCHER
   ========================================================================== */
function toggleSiteTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('lally_apple_theme', next); } catch (e) { }
}

/* ==========================================================================
   MOBILE HISTORY & BACK GESTURE MANAGER
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

window.addEventListener('popstate', () => {
  isHandlingPopState = true;
  try {
    const openModal = document.querySelector('.modal-backdrop.is-open');
    if (openModal) {
      Modal.close(openModal.id, false);
      return;
    }
    const mobileDrawer = document.getElementById('appleMobileDrawer');
    if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
      if (typeof window.closeAppleMobileDrawer === 'function') window.closeAppleMobileDrawer(false);
      return;
    }
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
   MODAL CONTROLLER
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
    if (syncHistory) popNavigationStateIfMatches('modal');
  }
};

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
   FEATURED STOCK & HARDWARE CATALOGUE (HOMEPAGE)
   ========================================================================== */
const CATALOGUE_TABS = [
  { label: 'All hardware', key: 'all' },
  { label: 'Pre-owned', key: 'laptops_used' },
  { label: 'New laptops', key: 'laptops_new' },
  { label: 'Gaming laptops', key: 'laptops_gaming' },
  { label: 'Custom PCs', key: 'pc' },
  { label: 'Monitors', key: 'monitors' },
  { label: 'Components', key: 'pc_components' },
  { label: 'Accessories', key: 'accessories' }
];
let activeCatalogueCategory = 'all';
let catalogueSearchQuery = '';
let catalogueBudgetCeiling = 0;
let catalogueSortOrder = 'featured';

function getNumericPrice(val) {
  if (typeof val === 'number') return val;
  return Number(String(val || '').replace(/[^0-9]/g, '')) || 0;
}

function formatCardSpecs(specs) {
  if (!specs || !specs.length) return '';
  return specs.slice(0, 3).map(s => {
    return String(s)
      .replace(/ \(.*?\)/g, '')
      .replace(/Intel Core /g, 'Core ')
      .replace(/\s*(DDR[45]|Unified)\s*(RAM|Memory)?$/i, '')
      .replace(/\s*(NVMe |Gen4 )?SSD$/i, ' SSD');
  }).join(' · ');
}

function getShortlist() {
  try {
    return JSON.parse(localStorage.getItem('lally_shortlist') || '[]');
  } catch (e) {
    return [];
  }
}

function toggleShortlist(id) {
  if (!id) return;
  let list = getShortlist();
  const exists = list.includes(id);
  if (exists) {
    list = list.filter(item => item !== id);
  } else {
    list.push(id);
  }
  try {
    localStorage.setItem('lally_shortlist', JSON.stringify(list));
  } catch (e) {}

  document.querySelectorAll(`.fav[data-save="${id}"]`).forEach(btn => {
    btn.setAttribute('aria-pressed', !exists);
    btn.setAttribute('aria-label', (!exists ? 'Remove from' : 'Add to') + ' shortlist');
  });

  if (typeof showToast === 'function') {
    showToast(!exists ? 'Saved to shortlist' : 'Removed from shortlist');
  }
}

function renderFeaturedStock() {
  const grid = document.getElementById('featuredStockGrid');
  if (!grid) return;

  const products = window.PRODUCTS || window.DEFAULT_PRODUCTS || [];
  let items = [];

  const isDefaultView = activeCatalogueCategory === 'all' &&
    !catalogueSearchQuery &&
    !catalogueBudgetCeiling &&
    catalogueSortOrder === 'featured';

  if (isDefaultView) {
    // Curated 8 items across hardware categories (matching prototype 2 rows of 4)
    const featuredIds = ['lap-used-1', 'lap-new-1', 'lap-used-6', 'mon-1', 'pc-2', 'lap-new-4', 'mon-3', 'lap-used-2'];
    items = featuredIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean);
    if (items.length < 8) {
      items = products.slice(0, 8);
    }
  } else {
    items = products.filter(p => {
      // Category filter
      if (activeCatalogueCategory !== 'all') {
        const cat = normalizeCategory(p.category);
        if (cat !== activeCatalogueCategory) return false;
      }
      // Budget filter
      if (catalogueBudgetCeiling > 0) {
        if (getNumericPrice(p.price) > catalogueBudgetCeiling) return false;
      }
      // Search filter
      if (catalogueSearchQuery) {
        const hay = [
          p.title,
          p.name,
          p.brand,
          p.id,
          p.category,
          p.condition,
          p.conditionLabel,
          (p.specs || []).join(' ')
        ].filter(Boolean).join(' ').toLowerCase();

        const words = catalogueSearchQuery.split(/\s+/).filter(Boolean);
        const matches = words.every(w => hay.includes(w));
        if (!matches) return false;
      }
      return true;
    });

    // Sorting
    if (catalogueSortOrder === 'asc') {
      items.sort((a, b) => getNumericPrice(a.price) - getNumericPrice(b.price));
    } else if (catalogueSortOrder === 'desc') {
      items.sort((a, b) => getNumericPrice(b.price) - getNumericPrice(a.price));
    }
  }

  const savedList = getShortlist();

  if (!items.length) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 12px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">No matching hardware</h3>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem;">Try another keyword or widen your filters.</p>
        <button class="btn-hero orange" type="button" onclick="resetCatalogueFilters()">Clear all filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(item => {
    const img = normalizeProductImageUrl(item.image) || getCategoryFallbackImage(item.category);
    const isSaved = savedList.includes(item.id);
    const condLabel = item.conditionLabel ? item.conditionLabel.split(' · ')[0] : (item.condition === 'used' ? 'Pre-owned' : (item.category === 'pc' ? 'Custom Rig' : 'New'));
    const brand = item.brand || (item.title ? item.title.split(' ')[0] : 'HARDWARE');
    const brief = formatCardSpecs(item.specs);
    const isSvg = img.endsWith('.svg');

    return `
      <article class="card">
        <a class="product-link" href="product.html?id=${item.id}" data-product="${item.id}">
          <div class="product-photo">
            <img class="${isSvg ? 'illustration' : ''}" loading="lazy" src="${img}" alt="${item.title}" onerror="this.onerror=null;this.src='images/store-banner.jpg';">
            <span class="pill">${condLabel}</span>
          </div>
          <div class="card-info">
            <span class="brand-meta">${brand}</span>
            <strong class="card-title">${item.title}</strong>
            <span class="brief">${brief}</span>
          </div>
        </a>
        <button class="fav" type="button" data-save="${item.id}" aria-pressed="${isSaved}" aria-label="${isSaved ? 'Remove from' : 'Add to'} shortlist: ${item.title}">
          <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4Z"/>
          </svg>
        </button>
        <div class="card-foot">
          <b class="price">${item.price}</b>
          <a class="view" href="product.html?id=${item.id}" aria-label="View ${item.title} details">Details</a>
        </div>
      </article>
    `;
  }).join('');
}

function initCatalogueControls() {
  const tabsContainer = document.getElementById('categoriesTabs');
  if (tabsContainer && !tabsContainer.dataset.initialized) {
    tabsContainer.dataset.initialized = 'true';
    tabsContainer.innerHTML = CATALOGUE_TABS.map(tab => {
      const isPressed = tab.key === activeCatalogueCategory;
      return `<button class="tab" type="button" role="tab" data-cat="${tab.key}" aria-pressed="${isPressed}">${tab.label}</button>`;
    }).join('');

    tabsContainer.addEventListener('click', e => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      activeCatalogueCategory = btn.dataset.cat;
      tabsContainer.querySelectorAll('.tab').forEach(t => {
        t.setAttribute('aria-pressed', t.dataset.cat === activeCatalogueCategory);
      });
      renderFeaturedStock();
    });
  }

  const searchInput = document.getElementById('searchHardwareInput');
  if (searchInput && !searchInput.dataset.initialized) {
    searchInput.dataset.initialized = 'true';
    searchInput.addEventListener('input', () => {
      catalogueSearchQuery = searchInput.value.trim().toLowerCase();
      renderFeaturedStock();
    });
  }

  const filterBtn = document.getElementById('filterToggleBtn');
  const filtersPanel = document.getElementById('catalogueFilters');
  const filterActiveDot = document.getElementById('filterActiveDot');
  if (filterBtn && filtersPanel && !filterBtn.dataset.initialized) {
    filterBtn.dataset.initialized = 'true';
    filterBtn.addEventListener('click', () => {
      const isHidden = filtersPanel.hidden;
      filtersPanel.hidden = !isHidden;
      filterBtn.setAttribute('aria-expanded', isHidden);
    });
  }

  const budgetSelect = document.getElementById('budgetFilter');
  if (budgetSelect && !budgetSelect.dataset.initialized) {
    budgetSelect.dataset.initialized = 'true';
    budgetSelect.addEventListener('change', () => {
      catalogueBudgetCeiling = Number(budgetSelect.value) || 0;
      if (filterActiveDot) {
        filterActiveDot.hidden = catalogueBudgetCeiling === 0 && catalogueSortOrder === 'featured';
      }
      renderFeaturedStock();
    });
  }

  const sortSelect = document.getElementById('sortFilter');
  if (sortSelect && !sortSelect.dataset.initialized) {
    sortSelect.dataset.initialized = 'true';
    sortSelect.addEventListener('change', () => {
      catalogueSortOrder = sortSelect.value || 'featured';
      if (filterActiveDot) {
        filterActiveDot.hidden = catalogueBudgetCeiling === 0 && catalogueSortOrder === 'featured';
      }
      renderFeaturedStock();
    });
  }

  const resetBtn = document.getElementById('resetCatalogueFilters');
  if (resetBtn && !resetBtn.dataset.initialized) {
    resetBtn.dataset.initialized = 'true';
    resetBtn.addEventListener('click', resetCatalogueFilters);
  }

  const grid = document.getElementById('featuredStockGrid');
  if (grid && !grid.dataset.favInitialized) {
    grid.dataset.favInitialized = 'true';
    grid.addEventListener('click', e => {
      const favBtn = e.target.closest('.fav');
      if (favBtn) {
        e.preventDefault();
        e.stopPropagation();
        toggleShortlist(favBtn.dataset.save);
      }
    });
  }
}

function resetCatalogueFilters() {
  activeCatalogueCategory = 'all';
  catalogueSearchQuery = '';
  catalogueBudgetCeiling = 0;
  catalogueSortOrder = 'featured';
  const searchInput = document.getElementById('searchHardwareInput');
  if (searchInput) searchInput.value = '';
  const budgetSelect = document.getElementById('budgetFilter');
  if (budgetSelect) budgetSelect.value = '0';
  const sortSelect = document.getElementById('sortFilter');
  if (sortSelect) sortSelect.value = 'featured';
  const filterActiveDot = document.getElementById('filterActiveDot');
  if (filterActiveDot) filterActiveDot.hidden = true;
  const tabsContainer = document.getElementById('categoriesTabs');
  if (tabsContainer) {
    tabsContainer.querySelectorAll('.tab').forEach(t => {
      t.setAttribute('aria-pressed', t.dataset.cat === 'all');
    });
  }
  renderFeaturedStock();
}

/* ==========================================================================
   FEATURED BRAND NEW LAPTOPS (PAGE 2 BELOW USED LAPTOPS ON HOMEPAGE)
   ========================================================================== */
function renderFeaturedNewStock() {
  const grid = document.getElementById('featuredNewStockGrid');
  if (!grid) return;

  const newItems = window.PRODUCTS.filter(p => normalizeCategory(p.category) === 'laptops_new');

  grid.innerHTML = newItems.map(item => {
    const specs = (item.specs || []).slice(0, 4);
    const img = normalizeProductImageUrl(item.image) || getCategoryFallbackImage(item.category);

    return `
      <article class="featured-card">
        <a class="featured-card__img-wrap" href="product.html?id=${item.id}">
          <img src="${img}" alt="${item.title}" loading="lazy" onerror="this.onerror=null;this.src='images/store-banner.jpg';">
        </a>
        <div class="featured-card__body">
          <div class="featured-card__meta">
            <span class="featured-card__cond" style="color: #22C55E;">Brand New · Sealed</span>
            <span class="featured-card__avail">${item.availability || 'In Stock · Moga'}</span>
          </div>
          <a href="product.html?id=${item.id}" class="featured-card__title-link">
            <h3 class="featured-card__title">${item.title}</h3>
          </a>
          <ul class="featured-card__specs">
            ${specs.map(s => `<li>${s}</li>`).join('')}
          </ul>
          <div class="featured-card__footer">
            <div>
              <div class="featured-card__price">${item.price}</div>
              <div class="featured-card__warranty">${item.warranty || '1-Year Official Warranty'}</div>
            </div>
            <a class="btn-card-primary" href="product.html?id=${item.id}">Multi-Angle Views &rarr;</a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/* ==========================================================================
   FEATURED MONITORS & DISPLAYS SHOWCASE (PAGE / SECTION BELOW LAPTOPS)
   ========================================================================== */
function renderFeaturedMonitors() {
  const grid = document.getElementById('featuredMonitorsGrid');
  if (!grid) return;

  const monitorItems = window.PRODUCTS.filter(p => normalizeCategory(p.category) === 'monitors');

  grid.innerHTML = monitorItems.map(item => {
    const specs = (item.specs || []).slice(0, 4);
    const img = normalizeProductImageUrl(item.image) || getCategoryFallbackImage(item.category);

    return `
      <article class="featured-card">
        <a class="featured-card__img-wrap" href="product.html?id=${item.id}">
          <img src="${img}" alt="${item.title}" loading="lazy" onerror="this.onerror=null;this.src='images/store-banner.jpg';">
        </a>
        <div class="featured-card__body">
          <div class="featured-card__meta">
            <span class="featured-card__cond" style="color: #22C55E;">Brand New · Sealed</span>
            <span class="featured-card__avail">${item.availability || 'In Stock · Moga'}</span>
          </div>
          <a href="product.html?id=${item.id}" class="featured-card__title-link">
            <h3 class="featured-card__title">${item.title}</h3>
          </a>
          <ul class="featured-card__specs">
            ${specs.map(s => `<li>${s}</li>`).join('')}
          </ul>
          <div class="featured-card__footer">
            <div>
              <div class="featured-card__price">${item.price}</div>
              <div class="featured-card__warranty">${item.warranty || 'Official Brand Warranty'}</div>
            </div>
            <a class="btn-card-primary" href="product.html?id=${item.id}">Multi-Angle Views &rarr;</a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/* ==========================================================================
   CATEGORY NAVIGATION & RENDERING (SINGLE HORIZONTAL SELECTOR)
   ========================================================================== */
function renderCategories() {
  const counts = {};
  window.PRODUCTS.forEach(p => {
    const cat = normalizeCategory(p.category);
    counts[cat] = (counts[cat] || 0) + 1;
  });

  const spaceScrollerEl = document.getElementById('spaceCatScroller');
  const gridEl = document.getElementById('categoryOptionsGrid');

  if (spaceScrollerEl) {
    spaceScrollerEl.innerHTML = window.CATEGORIES.map(c => {
      const cnt = counts[c.id] || 0;
      return `
        <button class="space-cat-btn ${c.id === activeCategory ? 'is-active' : ''}" data-cat="${c.id}" role="tab" aria-selected="${c.id === activeCategory ? 'true' : 'false'}" onclick="switchSpaceCategory('${c.id}')">
          <span class="space-cat-name">${c.name}</span>
          <span class="space-cat-count">(${cnt})</span>
        </button>
      `;
    }).join('');
  }

  if (gridEl) {
    gridEl.innerHTML = window.CATEGORIES.map(c => {
      const cnt = counts[c.id] || 0;
      const title = c.cardName || c.name;
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
            <button class="btn-open-cat" type="button" onclick="event.stopPropagation(); openCatalogueSpace('${c.id}')">
              Browse ${title} &rarr;
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

function openCatalogueSpace(catId) {
  showTopLoader();
  if (catId) activeCategory = normalizeCategory(catId);
  const space = document.getElementById('catalogueSpace');
  if (!space) {
    finishTopLoader();
    return;
  }

  space.classList.add('is-open');
  pushNavigationState('catalogueSpace', activeCategory);

  const catObj = window.CATEGORIES.find(c => c.id === activeCategory);
  if (catObj) {
    const titleEl = document.getElementById('spaceTitle');
    const descEl = document.getElementById('spaceDesc');
    const badgeEl = document.getElementById('spaceEyebrow');
    if (titleEl) titleEl.textContent = catObj.name;
    if (descEl) descEl.textContent = catObj.desc;
    if (badgeEl) badgeEl.textContent = catObj.badge;
  }

  document.querySelectorAll('.space-cat-btn').forEach(btn => {
    const isAct = btn.getAttribute('data-cat') === activeCategory;
    btn.classList.toggle('is-active', isAct);
    btn.setAttribute('aria-selected', isAct ? 'true' : 'false');
  });

  resetFilters();
  space.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(finishTopLoader, 140);
}

function closeCatalogueSpace(syncHistory = true) {
  const space = document.getElementById('catalogueSpace');
  if (space) space.classList.remove('is-open');
  const featured = document.getElementById('featured');
  if (featured) featured.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (syncHistory) popNavigationStateIfMatches('catalogueSpace');
}

function switchSpaceCategory(catId) {
  showTopLoader();
  activeCategory = normalizeCategory(catId);
  const catObj = window.CATEGORIES.find(c => c.id === activeCategory);
  if (catObj) {
    const titleEl = document.getElementById('spaceTitle');
    const descEl = document.getElementById('spaceDesc');
    const badgeEl = document.getElementById('spaceEyebrow');
    if (titleEl) titleEl.textContent = catObj.name;
    if (descEl) descEl.textContent = catObj.desc;
    if (badgeEl) badgeEl.textContent = catObj.badge;
  }

  document.querySelectorAll('.space-cat-btn').forEach(btn => {
    const isAct = btn.getAttribute('data-cat') === activeCategory;
    btn.classList.toggle('is-active', isAct);
    btn.setAttribute('aria-selected', isAct ? 'true' : 'false');
  });

  resetFilters();
  const spaceEl = document.getElementById('catalogueSpace');
  if (spaceEl && spaceEl.classList.contains('is-open')) {
    spaceEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  setTimeout(finishTopLoader, 140);
}

/* ==========================================================================
   PRODUCT FILTERING & PRICE SORTING
   ========================================================================== */
function applyFilters() {
  const searchInput = document.getElementById('spaceSearchInput');
  const sortSelect = document.getElementById('sortPriceSelect');
  const cpuSelect = document.getElementById('cpuGenFilterSelect');
  const ramSelect = document.getElementById('ramFilterSelect');
  const ssdSelect = document.getElementById('ssdFilterSelect');
  const condSelect = document.getElementById('conditionFilterSelect');
  const availSelect = document.getElementById('availabilityFilterSelect');

  searchFilter = searchInput ? searchInput.value.trim().toLowerCase() : '';
  sortPriceFilter = sortSelect ? sortSelect.value : '';
  cpuGenFilter = cpuSelect ? cpuSelect.value : '';
  ramFilter = ramSelect ? ramSelect.value : '';
  ssdFilter = ssdSelect ? ssdSelect.value : '';
  conditionFilter = condSelect ? condSelect.value : '';
  availabilityFilter = availSelect ? availSelect.value : '';

  renderSpaceProducts();
}

function resetFilters() {
  searchFilter = '';
  sortPriceFilter = '';
  cpuGenFilter = '';
  ramFilter = '';
  ssdFilter = '';
  conditionFilter = '';
  availabilityFilter = '';

  [
    'spaceSearchInput',
    'sortPriceSelect',
    'cpuGenFilterSelect',
    'ramFilterSelect',
    'ssdFilterSelect',
    'conditionFilterSelect',
    'availabilityFilterSelect'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  renderSpaceProducts();
}

function renderSpaceProducts() {
  const grid = document.getElementById('spaceLineupGrid');
  if (!grid) return;

  let items = window.PRODUCTS.filter(item => {
    if (normalizeCategory(item.category) !== activeCategory) return false;

    if (cpuGenFilter) {
      const cpuText = `${item.cpuGen || ''} ${item.title || ''} ${(item.specs || []).join(' ')}`.toLowerCase();
      if (!cpuText.includes(cpuGenFilter.toLowerCase())) return false;
    }

    if (ramFilter) {
      const ramText = `${item.ramGb || ''} ${item.title || ''} ${(item.specs || []).join(' ')}`.toLowerCase();
      if (!ramText.includes(ramFilter.toLowerCase())) return false;
    }

    if (ssdFilter) {
      const ssdText = `${item.ssdGb || ''} ${item.title || ''} ${(item.specs || []).join(' ')}`.toLowerCase();
      if (!ssdText.includes(ssdFilter.toLowerCase())) return false;
    }

    if (conditionFilter) {
      if ((item.condition || 'new') !== conditionFilter) return false;
    }

    if (availabilityFilter) {
      const itemStatus = item.availabilityStatus || (item.isLowStock ? 'low_stock' : 'in_stock');
      if (itemStatus !== availabilityFilter) return false;
    }

    if (searchFilter) {
      const q = searchFilter;
      const hay = `${item.title || ''} ${item.desc || ''} ${item.brand || ''} ${(item.specs || []).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });

  if (sortPriceFilter === 'price-asc') {
    items = items.slice().sort((a, b) => (a.priceNum || 0) - (b.priceNum || 0));
  } else if (sortPriceFilter === 'price-desc') {
    items = items.slice().sort((a, b) => (b.priceNum || 0) - (a.priceNum || 0));
  }

  const countBadge = document.getElementById('resultsCount');
  if (countBadge) countBadge.textContent = `${items.length} Listing${items.length === 1 ? '' : 's'}`;

  const tagsContainer = document.getElementById('activeFilterTags');
  if (tagsContainer) {
    const activeTags = [];
    if (searchFilter) activeTags.push(`"${searchFilter}"`);
    if (sortPriceFilter) activeTags.push(sortPriceFilter === 'price-asc' ? 'Price: Low to High' : 'Price: High to Low');
    if (cpuGenFilter) activeTags.push(`CPU: ${cpuGenFilter}`);
    if (ramFilter) activeTags.push(`RAM: ${ramFilter}`);
    if (ssdFilter) activeTags.push(`SSD: ${ssdFilter}`);
    if (conditionFilter) activeTags.push(`Condition: ${conditionFilter}`);
    if (availabilityFilter) activeTags.push(availabilityFilter === 'low_stock' ? 'Low Stock' : 'In Stock');

    if (activeTags.length > 0) {
      tagsContainer.innerHTML = activeTags.map(t => `<span class="filter-chip">${t}</span>`).join('') +
        '<button class="filter-clear-all" type="button" onclick="resetFilters()">Clear &times;</button>';
      tagsContainer.style.display = 'flex';
    } else {
      tagsContainer.innerHTML = '';
      tagsContainer.style.display = 'none';
    }
  }

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="space-empty-state">
        <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <h3>No matching listings</h3>
        <p>Try clearing your active filters or switching to another department.</p>
        <button class="apple-pill-btn apple-pill-btn--primary" type="button" onclick="resetFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(item => {
    const fallbackImg = getCategoryFallbackImage(item.category);
    const image = normalizeProductImageUrl(item.image) || fallbackImg;
    const keySpecs = (item.specs || []).slice(0, 4);
    const isLow = item.availabilityStatus === 'low_stock' || item.isLowStock;

    return `
      <article class="amz-product-row" id="product-${item.id}">
        <div class="amz-img-col">
          <a class="amz-img-link" href="product.html?id=${item.id}" aria-label="View details for ${item.title}">
            <div class="amz-img-container">
              <img class="amz-product-img" src="${image}" alt="${item.title}" loading="lazy" width="180" height="150" onerror="this.onerror=null;this.src='${fallbackImg}';">
            </div>
          </a>
        </div>

        <div class="amz-info-col">
          <div class="amz-badge-strip">
            <span class="amz-badge-tag ${item.condition === 'used' ? 'amz-badge-tag--used' : 'amz-badge-tag--new'}">
              ${item.conditionLabel || (item.condition === 'used' ? 'Pre-Owned · Lab Tested' : (item.condition === 'service' ? 'In-House Lab Service' : 'Brand New · Sealed'))}
            </span>
            <span class="amz-availability-inline ${isLow ? 'is-low' : ''}">
              ${item.availability || 'In Stock · Moga'}
            </span>
          </div>

          <a class="amz-title-link" href="product.html?id=${item.id}">
            <h3 class="amz-product-title">${item.title}</h3>
          </a>

          <div class="amz-specs-list">
            ${keySpecs.map(s => `<span class="amz-spec-pill">${s}</span>`).join('')}
          </div>

          <div class="amz-meta-row">
            <div class="amz-pricing-inline">
              <span class="amz-price-current">${item.price}</span>
              ${item.condition === 'new' && item.mrp ? `<span class="amz-mrp-group">Official MRP: <span class="amz-mrp">${item.mrp}</span></span>` : ''}
            </div>
            <span class="amz-warranty-item">${item.warranty || 'Warranty + GST Invoice'}</span>
          </div>

          <div class="amz-actions-row">
            <a class="btn-card-primary" href="product.html?id=${item.id}">View Details &amp; Photos &rarr;</a>
            ${item.labReport ? `<button class="amz-btn-lab-link" data-lab-id="${item.id}" type="button">25-Point Lab Report</button>` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Catalogue Page Navigation (Below Used Laptops)
  const paginationEl = document.getElementById('spacePagination');
  if (paginationEl) {
    if (activeCategory === 'laptops_used') {
      paginationEl.innerHTML = `
        <div class="catalogue-pagination-bar">
          <div class="pagination-counter">Page <strong>1 of 3</strong> &middot; Used Laptops (7 verified units)</div>
          <div class="pagination-page-pills">
            <button class="pagination-pill is-active" type="button" aria-current="page" disabled>1</button>
            <button class="pagination-pill" type="button" onclick="switchSpaceCategory('laptops_new')" aria-label="Go to Page 2: Brand New Laptops">2</button>
            <button class="pagination-pill" type="button" onclick="switchSpaceCategory('monitors')" aria-label="Go to Page 3: Gaming &amp; IPS Monitors">3</button>
          </div>
        </div>
        <div class="pagination-next-card" onclick="switchSpaceCategory('laptops_new')" role="button" tabindex="0">
          <div class="pagination-next-content">
            <span class="pagination-next-badge">Next Page: Brand New Stock</span>
            <h4 class="pagination-next-title">Looking for Brand New Sealed Laptops? Go to Page 2 &rarr;</h4>
            <p class="pagination-next-desc">Browse factory-sealed systems from Apple, Lenovo, Dell, and HP with official manufacturer warranty, genuine GST invoices, and multi-angle packaging inspection.</p>
          </div>
          <div class="pagination-next-action">
            <span class="btn-primary-blue">Open Page 2: New Laptops &rarr;</span>
          </div>
        </div>
      `;
      paginationEl.style.display = 'flex';
    } else if (activeCategory === 'laptops_new') {
      paginationEl.innerHTML = `
        <div class="catalogue-pagination-bar">
          <div class="pagination-counter">Page <strong>2 of 3</strong> &middot; Brand New Laptops (5 factory-sealed units)</div>
          <div class="pagination-page-pills">
            <button class="pagination-pill" type="button" onclick="switchSpaceCategory('laptops_used')" aria-label="Go to Page 1: Used Laptops">1</button>
            <button class="pagination-pill is-active" type="button" aria-current="page" disabled>2</button>
            <button class="pagination-pill" type="button" onclick="switchSpaceCategory('monitors')" aria-label="Go to Page 3: Gaming &amp; IPS Monitors">3</button>
          </div>
        </div>
        <div class="pagination-next-card" onclick="switchSpaceCategory('monitors')" role="button" tabindex="0">
          <div class="pagination-next-content">
            <span class="pagination-next-badge">Next Page: Monitors &amp; Displays</span>
            <h4 class="pagination-next-title">Looking for High-Refresh &amp; IPS Monitors? Go to Page 3 &rarr;</h4>
            <p class="pagination-next-desc">Browse 144Hz–165Hz gaming monitors, Dell UltraSharp IPS Black displays, and Samsung 1000R curved ultrawides with zero-dead-pixel inspection.</p>
          </div>
          <div class="pagination-next-action">
            <span class="btn-primary-blue">Open Page 3: Monitors &rarr;</span>
          </div>
        </div>
      `;
      paginationEl.style.display = 'flex';
    } else if (activeCategory === 'monitors') {
      paginationEl.innerHTML = `
        <div class="catalogue-pagination-bar">
          <div class="pagination-counter">Page <strong>3 of 3</strong> &middot; Monitors &amp; Displays (4 factory-sealed units)</div>
          <div class="pagination-page-pills">
            <button class="pagination-pill" type="button" onclick="switchSpaceCategory('laptops_used')" aria-label="Go to Page 1: Used Laptops">1</button>
            <button class="pagination-pill" type="button" onclick="switchSpaceCategory('laptops_new')" aria-label="Go to Page 2: Brand New Laptops">2</button>
            <button class="pagination-pill is-active" type="button" aria-current="page" disabled>3</button>
          </div>
        </div>
        <div class="pagination-next-card" onclick="switchSpaceCategory('laptops_used')" role="button" tabindex="0">
          <div class="pagination-next-content">
            <span class="pagination-next-badge">Return to Laptops</span>
            <h4 class="pagination-next-title">&larr; Return to Page 1: Used Laptops (25-Point Lab Tested)</h4>
            <p class="pagination-next-desc">Browse tested pre-owned enterprise ThinkPads, Latitudes, and MacBooks with dated hardware diagnostics and honest cosmetic wear photos.</p>
          </div>
          <div class="pagination-next-action">
            <span class="btn-primary-blue">&larr; Open Page 1: Used Laptops</span>
          </div>
        </div>
      `;
      paginationEl.style.display = 'flex';
    } else {
      paginationEl.innerHTML = '';
      paginationEl.style.display = 'none';
    }
  }
}

/* ==========================================================================
   SHOPPING CART / INQUIRY BASKET
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
      delivery: item.delivery || 'In-Store Pickup · Sodhi Nagar, Moga',
      qty: 1,
      checked: true
    });
  }

  saveCart();
  updateCartUI();
  showToast(`Added "${item.title.substring(0, 28)}" to basket`);
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
    item.checked = item.checked === false;
    saveCart();
    renderCartModal();
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
        <h4 class="cart-empty-title">Your enquiry basket is empty</h4>
        <p class="cart-empty-desc">Add individual laptops, custom PCs, or accessories to enquire with our Moga store.</p>
        <button class="cart-empty-btn" type="button" onclick="closeCartModal(); openCatalogueSpace('laptops_used');">
          <span>Browse Store Inventory</span>
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
    const waItemText = encodeURIComponent(`Hi Lally Computers, I want to enquire about ${item.title} (${item.price}). Is it in stock at Sodhi Nagar, Moga?`);

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
              <img class="cart-item-thumb" src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.onerror=null;this.src='images/store-banner.jpg';">
            </a>
          </div>
          <div class="cart-item-info">
            <a href="product.html?id=${item.id}" style="text-decoration:none;color:inherit;">
              <h4 class="cart-item-title">${item.title}</h4>
            </a>
            <div class="cart-item-price-row">
              <span class="cart-item-price">${item.price}</span>
            </div>
            <div class="cart-item-stock">In stock · Sodhi Nagar, Moga</div>
          </div>
        </div>
        <div class="cart-item-actions-toolbar">
          <div class="cart-stepper-pill">
            <button class="cart-stepper-btn cart-stepper-minus" type="button" onclick="updateCartQty('${item.id}', -1)" aria-label="Decrease quantity">&minus;</button>
            <span class="cart-stepper-val">${item.qty}</span>
            <button class="cart-stepper-btn cart-stepper-plus" type="button" onclick="updateCartQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
          </div>
          <button class="cart-tool-btn" type="button" onclick="removeFromCart('${item.id}')">Remove</button>
          <a class="cart-tool-btn" href="https://wa.me/919872010193?text=${waItemText}" target="_blank" rel="noopener">Enquire</a>
        </div>
      </div>
    `;
  }).join('');

  const formattedTotal = totalNum > 0 ? `₹${totalNum.toLocaleString('en-IN')}` : 'Quote in store';
  const effectiveCount = selectedCount > 0 ? selectedCount : totalCount;

  if (mobileHeaderBadge) mobileHeaderBadge.textContent = `${totalCount} item${totalCount === 1 ? '' : 's'}`;
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
    const totalEl = document.getElementById('cartSubtotalVal');
    if (totalEl) totalEl.textContent = formattedTotal;
  }
}

function checkoutCartWhatsApp() {
  const selectedItems = cart.filter(x => x.checked !== false);
  const itemsToCheckout = selectedItems.length > 0 ? selectedItems : cart;
  if (itemsToCheckout.length === 0) return;

  let text = "Hi Lally Computers (Supreme Infosys), I would like to enquire about these items:\n\n";
  let total = 0;
  itemsToCheckout.forEach((item, idx) => {
    text += `${idx + 1}. ${item.title} (Qty: ${item.qty}) - ${item.price}\n`;
    total += (item.priceNum || 0) * item.qty;
  });
  text += `\nEstimated Total: ₹${total.toLocaleString('en-IN')}\nStore: 5-A, Sodhi Nagar, Moga`;
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
  toast.innerHTML = `<span>${msg}</span><button class="amz-toast-btn" onclick="openCartModal()">View Basket</button>`;
  toast.classList.add('is-visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

/* ==========================================================================
   LAB REPORT MODAL (ALL 25 CHECKS)
   ========================================================================== */
function openLabReportModal(id) {
  const item = window.PRODUCTS.find(x => x.id === id);
  if (!item || !item.labReport) return;

  const rep = item.labReport;
  document.getElementById('labLaptopTitle').textContent = item.title;
  document.getElementById('labReportId').textContent = rep.reportId || `LC-26-${item.id.toUpperCase()}`;
  document.getElementById('labTestedDate').textContent = rep.testedDate || '22-Nov-2026';
  document.getElementById('labGradeBadge').textContent = rep.overallGrade || 'Grade A';
  document.getElementById('labOverallNotes').textContent =
    rep.overallNotes || 'Passed 25-point physical, thermal, electrical, and component inspection at Lally Computers (Supreme Infosys), Moga.';
  document.getElementById('labInspector').textContent = rep.technician || 'Er. Harpreet Singh';

  const tbody = document.getElementById('labChecklistTbody');
  if (tbody) {
    let checks = Array.isArray(rep.checklist) && rep.checklist.length ? rep.checklist : [];
    if (checks.length === 0) {
      const fieldMap = [
        ['Battery Health (Summary)', rep.batteryHealth],
        ['CPU & Thermal Stress (Summary)', rep.cpuStress],
        ['SSD S.M.A.R.T. Health (Summary)', rep.ssdHealth],
        ['Display Panel & Backlight (Summary)', rep.screenStatus],
        ['Keyboard & Trackpad (Summary)', rep.keyboardTrackpad],
        ['Motherboard & Power Rail (Summary)', rep.motherboardPower],
        ['Ports & I/O Interfaces (Summary)', rep.portsIo],
        ['Chassis & Hinges (Summary)', rep.casingHinges]
      ];
      checks = fieldMap
        .filter(([, val]) => val && String(val).trim().length > 0)
        .map(([point, result]) => ({ point, result, status: 'PASS' }));
    }

    tbody.innerHTML = checks.map(chk => `
      <tr>
        <td class="lab-point-name">${chk.point}</td>
        <td class="lab-point-result">${chk.result} <span class="lab-pass-tag">${chk.status || 'PASS'}</span></td>
      </tr>
    `).join('');
  }

  const waBtn = document.getElementById('labReportWaBtn');
  if (waBtn) {
    waBtn.href = `https://wa.me/919872010193?text=${encodeURIComponent(`Hi Lally Computers, I reviewed Lab Report ${rep.reportId || ''} for ${item.title}. Can I inspect it at Sodhi Nagar?`)}`;
  }

  Modal.open('labReportModal');
}

function closeLabReportModal() {
  Modal.close('labReportModal');
}

function openSpecSheet(id) {
  if (id) window.location.href = `product.html?id=${encodeURIComponent(id)}`;
}

function closeSpecSheet() {
  Modal.close('appleModal');
}

/* ==========================================================================
   GOOGLE SHEETS LIVE STOCK SYNC
   ========================================================================== */
const DEFAULT_LIVE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1dPrip8jyf-zaRk_Bm0fQWb9R3P2sNTSX-FbtXQoH4V4/edit?usp=sharing';

const CATEGORY_FALLBACK_IMAGES = {
  laptops_used: 'images/products/photos/lap-used-1-front.jpg',
  laptops_new: 'images/products/photos/lap-used-7-front.jpg',
  laptops_gaming: 'images/products/photos/lap-game-front.jpg',
  monitors: 'images/products/photos/mon-dell-front.jpg',
  pc: 'images/products/pc-1.svg',
  pc_components: 'images/products/pcc-1.svg',
  accessories: 'images/products/per-1.svg',
  other: 'images/products/app-1.svg',
  repairs: 'images/products/photos/lab-repair-bench.jpg'
};

function getCategoryFallbackImage(category) {
  return CATEGORY_FALLBACK_IMAGES[normalizeCategory(category)] || 'images/store-banner.jpg';
}

function normalizeProductImageUrl(url) {
  if (!url) return '';
  const clean = url.trim();
  if (!clean) return '';
  const driveFileMatch = clean.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (driveFileMatch) return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}=w800`;
  const driveIdMatch = clean.match(/drive\.google\.com\/(?:open|uc)\?.*id=([a-zA-Z0-9-_]+)/);
  if (driveIdMatch) return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}=w800`;
  return clean;
}

function normalizeGoogleSheetUrl(url) {
  if (!url) return '';
  url = url.trim();
  if (url.includes('output=csv') || url.includes('tqx=out:csv') || url.includes('/export?format=csv')) return url;
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) return url;
  const sheetId = match[1];
  let gid = '0';
  const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
  if (gidMatch) gid = gidMatch[1];
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
  return ['sold', 'sold out', 'out of stock', 'unavailable', 'hidden', 'archived', 'inactive', 'no', '0', 'false'].includes(s);
}

function mapCsvToProducts(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.replace(/^\uFEFF/, '').trim().toLowerCase());
  const defaultById = {};
  (window.DEFAULT_PRODUCTS || []).forEach(p => { defaultById[p.id] = p; });

  const products = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] || '').trim(); });

    if (!obj.id && !obj.title) continue;
    if (isUnavailableStatus(obj.status)) continue;

    const id = obj.id || `csv-${i}`;
    const base = defaultById[id] || {};
    const category = normalizeCategory(obj.category || base.category || 'laptops_used');
    const rawPriceNum = parseFloat((obj.pricenum || obj.price || '').replace(/[^0-9.]/g, ''));
    const pNum = !isNaN(rawPriceNum) ? rawPriceNum : (base.priceNum || 0);
    const rawMrpNum = parseFloat((obj.mrpnum || obj.mrp || '').replace(/[^0-9.]/g, ''));
    const mrpNum = !isNaN(rawMrpNum) && rawMrpNum > 0 ? rawMrpNum : (base.mrpNum || 0);

    const specsList = obj.specs
      ? obj.specs.split('|').map(s => s.trim()).filter(Boolean).slice(0, 4)
      : (base.specs || []).slice(0, 4);

    const statusLower = (obj.status || '').toLowerCase();
    const isLowStock = statusLower.includes('low') || statusLower.includes('last');

    const hasCsvLab = obj.labreportid || obj.overallgrade || obj.batteryhealth || obj.cpustress || obj.ssdhealth || obj.screenstatus;
    const labReport = hasCsvLab
      ? {
        reportId: obj.labreportid || (base.labReport && base.labReport.reportId) || `LC-26-${i}`,
        overallGrade: obj.overallgrade || (base.labReport && base.labReport.overallGrade) || 'Grade A',
        batteryHealth: obj.batteryhealth || '',
        cpuStress: obj.cpustress || '',
        ssdHealth: obj.ssdhealth || '',
        screenStatus: obj.screenstatus || '',
        keyboardTrackpad: obj.keyboardtrackpad || '',
        motherboardPower: obj.motherboardpower || '',
        portsIo: obj.portsio || '',
        casingHinges: obj.casinghinges || '',
        technician: obj.technician || (base.labReport && base.labReport.technician) || 'Er. Harpreet Singh',
        testedDate: obj.testeddate || (base.labReport && base.labReport.testedDate) || '22-Nov-2026',
        checklist: base.labReport && base.labReport.checklist ? base.labReport.checklist : undefined
      }
      : (base.labReport || null);

    // Keep local real photography over legacy svg paths from sheet
    const sheetImg = normalizeProductImageUrl(obj.image);
    const resolvedImg = (sheetImg && !sheetImg.endsWith('.svg')) ? sheetImg : (base.image || sheetImg || getCategoryFallbackImage(category));
    const normCond = (obj.condition || base.condition || 'new').toLowerCase().includes('used')
      ? 'used'
      : ((obj.condition || base.condition || 'new').toLowerCase().includes('service') ? 'service' : 'new');

    products.push({
      id,
      status: obj.status || 'In Stock',
      isLowStock,
      category,
      brand: obj.brand || base.brand || 'Lally Computers',
      title: (obj.title || base.title || 'In-Store Product').replace(/^From\s+/i, ''),
      desc: obj.desc || base.desc || '',
      price: (obj.price || (pNum ? `₹${pNum.toLocaleString('en-IN')}` : (base.price || 'Quote in Store'))).replace(/^From\s+/i, ''),
      priceNum: pNum,
      cpuGen: obj.cpugen || base.cpuGen || '',
      ramGb: obj.ram || base.ramGb || '',
      ssdGb: obj.ssd || base.ssdGb || '',
      size: obj.size || base.size || '',
      panel: obj.panel || base.panel || '',
      mrp: normCond === 'new' ? (obj.mrp || base.mrp || '') : '',
      mrpNum: normCond === 'new' ? mrpNum : 0,
      badge: obj.badge || base.badge || '',
      condition: normCond,
      conditionLabel: base.conditionLabel || (normCond === 'used' ? 'Pre-Owned · Lab Tested' : (normCond === 'service' ? 'Lab Service' : 'Brand New · Sealed')),
      availability: base.availability || (isLowStock ? 'Low Stock (1 unit)' : 'In Stock · Moga'),
      availabilityStatus: isLowStock ? 'low_stock' : 'in_stock',
      compatibleWith: base.compatibleWith,
      warranty: obj.warranty || base.warranty || 'Warranty + GST Invoice',
      specs: specsList,
      details: obj.details ? { 'Specifications': obj.details } : (base.details || {}),
      labReport,
      image: resolvedImg,
      gallery: base.gallery,
      wearNote: base.wearNote,
      delivery: obj.delivery || base.delivery || 'In-Store Pickup · Sodhi Nagar, Moga'
    });
  }
  return products;
}

const STOCK_CACHE_KEY = 'lally_stock_cache_v4';

function hydrateCachedStock(activeUrl) {
  try {
    const raw = localStorage.getItem(STOCK_CACHE_KEY);
    if (!raw) return false;
    const cached = JSON.parse(raw);
    if (!cached || cached.url !== activeUrl || !Array.isArray(cached.products) || cached.products.length === 0) return false;
    window.PRODUCTS = cached.products;
    const currentSourceEl = document.getElementById('sheetCurrentStatus');
    const badgeEl = document.getElementById('sheetSyncBadgeText');
    const indicatorEl = document.getElementById('sheetStatusIndicator');
    if (currentSourceEl) currentSourceEl.textContent = `Live Google Sheet (${cached.products.length} Items)`;
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

  if (statusEl && isManual) statusEl.innerHTML = '<span style="color:#3B82F6">Connecting to Google Sheets...</span>';

  fetch(fetchUrl, { cache: 'no-store' })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then(csvText => {
      const rows = parseCSV(csvText);
      const newProducts = mapCsvToProducts(rows);
      if (newProducts.length === 0) throw new Error('No in-stock products found in sheet.');

      // Preserve local split models and compatible accessories if missing in sheet
      const sheetIds = new Set(newProducts.map(x => x.id));
      (window.DEFAULT_PRODUCTS || []).forEach(def => {
        if (!sheetIds.has(def.id)) newProducts.push(def);
      });

      window.PRODUCTS = newProducts;
      try {
        localStorage.setItem(STOCK_CACHE_KEY, JSON.stringify({ url: csvUrl, ts: Date.now(), products: newProducts }));
        if (isManual) localStorage.setItem('lally_sheet_url', csvUrl);
      } catch (e) { }

      if (statusEl) statusEl.innerHTML = `<span style="color:#22C55E">Synced ${newProducts.length} live items</span>`;
      if (currentSourceEl) currentSourceEl.textContent = `Live Google Sheet (${newProducts.length} Items)`;
      if (badgeEl) badgeEl.textContent = `Live Stock (${newProducts.length} Items)`;
      if (indicatorEl) indicatorEl.className = 'dot-status dot-open';

      renderFeaturedStock();
      renderFeaturedNewStock();
      renderFeaturedMonitors();
      renderCategories();
      const space = document.getElementById('catalogueSpace');
      if (space && space.classList.contains('is-open')) renderSpaceProducts();

      if (isManual) {
        finishTopLoader();
        setTimeout(closeSheetSyncModal, 1000);
        showToast(`Stock synced (${newProducts.length} items)`);
      }
    })
    .catch(err => {
      console.warn('Google Sheet sync error:', err);
      if (isManual) finishTopLoader();
      if (statusEl && isManual) {
        statusEl.innerHTML = `<span style="color:#ef4444">Sync failed (${err.message}). Ensure sharing is "Anyone with the link can view".</span>`;
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
  try {
    localStorage.removeItem('lally_sheet_url');
    localStorage.removeItem(STOCK_CACHE_KEY);
  } catch (e) { }
  window.PRODUCTS = window.DEFAULT_PRODUCTS.slice(0);
  renderFeaturedStock();
  initCatalogueControls();
  renderFeaturedNewStock();
  renderFeaturedMonitors();
  renderCategories();
  renderSpaceProducts();
  showToast('Restored default catalogue');
  setTimeout(closeSheetSyncModal, 800);
}

/* ==========================================================================
   STORE HOURS, COOKIE BANNER & TOP LOADER
   ========================================================================== */
function updateHours() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (3600000 * 5.5));
  const day = ist.getDay();
  const time = ist.getHours() + ist.getMinutes() / 60;
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

function initCookieBanner() {
  try {
    if (!localStorage.getItem('lally_cookie_consent')) {
      setTimeout(() => {
        const banner = document.getElementById('cookieBanner');
        if (banner) banner.classList.add('is-visible');
      }, 900);
    }
  } catch (e) { }
}

function acceptCookies() {
  try { localStorage.setItem('lally_cookie_consent', 'all'); } catch (e) { }
  document.getElementById('cookieBanner')?.classList.remove('is-visible');
}

function dismissCookies() {
  try { localStorage.setItem('lally_cookie_consent', 'essential'); } catch (e) { }
  document.getElementById('cookieBanner')?.classList.remove('is-visible');
}

function openCookieBannerAgain() {
  document.getElementById('cookieBanner')?.classList.add('is-visible');
}

function showTopLoader() {
  const bar = document.getElementById('topLoaderBar');
  if (!bar) return;
  bar.classList.add('is-loading');
  bar.style.width = '30%';
  setTimeout(() => {
    if (bar.classList.contains('is-loading')) bar.style.width = '75%';
  }, 100);
}

function finishTopLoader() {
  const bar = document.getElementById('topLoaderBar');
  if (!bar) return;
  bar.style.width = '100%';
  setTimeout(() => {
    bar.classList.remove('is-loading');
    setTimeout(() => { bar.style.width = '0%'; }, 180);
  }, 220);
}

/* ==========================================================================
   CAROUSEL PAGINATION & CONTINUOUS MARQUEE SLIDER CONTROLLER
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

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initCookieBanner();
  initModalSwipeToDismiss();

  // Initialize Animated Smooth Minimalistic Sliders
  initSliderWithDots('whySliderWrap', 'whyTrack', 'whyDots', 6, 42, 'whyPrevBtn', 'whyNextBtn');
  initSliderWithDots('reviewsSliderWrap', 'reviewsTrack', 'reviewsDots', 8, 48, 'reviewsPrevBtn', 'reviewsNextBtn');

  // Pause animations when swiped/scrolled away from the specific section
  if ('IntersectionObserver' in window) {
    const pauseObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const track = entry.target.querySelector('.why-slider-track, .reviews-slider-track');
        if (track && !track.classList.contains('is-manual-nav')) {
          track.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        }
      });
    }, { threshold: 0.05 });
    const whySec = document.getElementById('why');
    const revSec = document.getElementById('reviews');
    if (whySec) pauseObserver.observe(whySec);
    if (revSec) pauseObserver.observe(revSec);
  }

  // Pause animations when browser tab is hidden to save resources
  document.addEventListener('visibilitychange', () => {
    const whyTrack = document.getElementById('whyTrack');
    const revTrack = document.getElementById('reviewsTrack');
    const state = document.visibilityState === 'visible' ? 'running' : 'paused';
    if (whyTrack && !whyTrack.classList.contains('is-manual-nav')) whyTrack.style.animationPlayState = state;
    if (revTrack && !revTrack.classList.contains('is-manual-nav')) revTrack.style.animationPlayState = state;
  });

  const activeSheetUrl = localStorage.getItem('lally_sheet_url') || DEFAULT_LIVE_SHEET_URL;
  if (activeSheetUrl) hydrateCachedStock(activeSheetUrl);

  renderFeaturedStock();
  initCatalogueControls();
  renderFeaturedNewStock();
  renderFeaturedMonitors();
  renderCategories();
  updateCartUI();
  updateHours();

  const searchInput = document.getElementById('spaceSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchFilter = searchInput.value.trim().toLowerCase();
      renderSpaceProducts();
    });
  }

  const grid = document.getElementById('spaceLineupGrid');
  if (grid) {
    grid.addEventListener('click', e => {
      const labBtn = e.target.closest('[data-lab-id]');
      if (labBtn) {
        openLabReportModal(labBtn.getAttribute('data-lab-id'));
      }
    });
  }

  document.addEventListener('click', e => {
    if (e.target.matches('.modal-backdrop, .modal-sheet-close, [data-close-modal]') || e.target.closest('[data-close-modal]')) {
      Modal.close();
    }
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') Modal.close();
  });

  if (activeSheetUrl) {
    const startSync = () => fetchAndSyncGoogleSheet(activeSheetUrl, false);
    if ('requestIdleCallback' in window) requestIdleCallback(startSync, { timeout: 1200 });
    else setTimeout(startSync, 200);
  }

  initAppleMegaMenu();
});

/* ==========================================================================
   MEGA-MENU FLYOUT & MOBILE DRAWER
   ========================================================================== */
function openCatalogueWithFilter(catId, opts) {
  openCatalogueSpace(catId);
  if (!opts) return;
  if (opts.cpuGen && document.getElementById('cpuGenFilterSelect')) document.getElementById('cpuGenFilterSelect').value = opts.cpuGen;
  if (opts.ram && document.getElementById('ramFilterSelect')) document.getElementById('ramFilterSelect').value = opts.ram;
  if (opts.ssd && document.getElementById('ssdFilterSelect')) document.getElementById('ssdFilterSelect').value = opts.ssd;
  if (opts.condition && document.getElementById('conditionFilterSelect')) document.getElementById('conditionFilterSelect').value = opts.condition;
  if (opts.availability && document.getElementById('availabilityFilterSelect')) document.getElementById('availabilityFilterSelect').value = opts.availability;
  if (opts.search && document.getElementById('spaceSearchInput')) document.getElementById('spaceSearchInput').value = opts.search;
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
    return (window.PRODUCTS || []).filter(p => normalizeCategory(p.category) === catId).length;
  }

  function getMenuData(key) {
    const MAP = {
      laptops: {
        title: 'Laptops',
        col1Heading: 'Laptop Departments',
        primary: [
          { label: 'Used Laptops', cat: 'laptops_used', count: countFor('laptops_used') },
          { label: 'New Laptops', cat: 'laptops_new', count: countFor('laptops_new') },
          { label: 'Gaming', cat: 'laptops_gaming', count: countFor('laptops_gaming') }
        ],
        sub: [
          { label: 'Intel 8th Gen ThinkPads & Latitudes', cat: 'laptops_used', filter: { cpuGen: '8th Gen' } },
          { label: 'Intel 10th Gen Systems', cat: 'laptops_used', filter: { cpuGen: '10th Gen' } }
        ],
        col2Heading: 'Quick Filters',
        col2: [
          { label: '16GB RAM Laptops', cat: 'laptops_used', filter: { ram: '16GB' } },
          { label: '512GB SSD Laptops', cat: 'laptops_used', filter: { ssd: '512GB' } },
          { label: 'Apple M1 / M2 / M3', cat: 'laptops_new', filter: { search: 'MacBook' } }
        ],
        col3Heading: 'Inspection & Warranty',
        col3: [
          { label: '25-Point Bench Testing', href: '#why' },
          { label: 'Genuine Google Reviews', href: '#reviews' },
          { label: 'WhatsApp Laptop Enquiry', external: WA_BASE + encodeURIComponent('Hi Lally Computers, I want to enquire about laptops in Moga.') }
        ]
      },
      pcs: {
        title: 'Custom PCs',
        col1Heading: 'Desktops & Hardware',
        primary: [
          { label: 'Custom PCs', cat: 'pc', count: countFor('pc') },
          { label: 'Components', cat: 'pc_components', count: countFor('pc_components') }
        ],
        sub: [
          { label: 'RTX Gaming Builds', cat: 'pc', filter: { search: 'RTX' } },
          { label: 'Office & Tally PCs', cat: 'pc', filter: { search: 'Office' } }
        ],
        col2Heading: 'Components',
        col2: [
          { label: 'Graphics Cards (GPU)', cat: 'pc_components', filter: { search: 'RTX' } },
          { label: 'Intel & AMD Processors', cat: 'pc_components', filter: { search: 'Processor' } },
          { label: 'NVMe SSD & RAM Upgrades', cat: 'pc_components', filter: { search: 'SSD' } }
        ],
        col3Heading: 'Build Services',
        col3: [
          { label: 'In-Store Assembly in Moga', href: '#why' },
          { label: 'WhatsApp PC Quote', external: WA_BASE + encodeURIComponent('Hi Lally Computers, I want a custom PC quote.') }
        ]
      },
      accessories: {
        title: 'Accessories',
        col1Heading: 'Gear & Lifestyle',
        primary: [
          { label: 'Accessories', cat: 'accessories', count: countFor('accessories') },
          { label: 'Other Departments', cat: 'other', count: countFor('other') }
        ],
        sub: [
          { label: 'Laptop Bags, Docks & Mice', cat: 'accessories', filter: { search: 'Laptop' } },
          { label: 'Monitors & Displays', cat: 'accessories', filter: { search: 'Monitor' } }
        ],
        col2Heading: 'Other Departments',
        col2: [
          { label: 'Washing Machines', cat: 'other', filter: { search: 'Wash' } },
          { label: 'Luggage & Suitcases', cat: 'other', filter: { search: 'Luggage' } },
          { label: 'Gym Equipment', cat: 'other', filter: { search: 'Treadmill' } },
          { label: 'Watches', cat: 'other', filter: { search: 'Watch' } }
        ],
        col3Heading: 'Store Info',
        col3: [
          { label: '5-A, Sodhi Nagar, Moga', href: '#visit' },
          { label: 'Enquire on WhatsApp', external: WA_BASE + encodeURIComponent('Hi Lally Computers, I want to check accessory availability.') }
        ]
      },
      repairs: {
        title: 'Repairs',
        col1Heading: 'In-House Repair Lab',
        primary: [
          { label: 'Repairs', cat: 'repairs', count: countFor('repairs') }
        ],
        sub: [
          { label: 'Motherboard BGA Rework', cat: 'repairs', filter: { search: 'Motherboard' } },
          { label: 'Display Replacement', cat: 'repairs', filter: { search: 'Display' } },
          { label: 'Thermal Servicing', cat: 'repairs', filter: { search: 'Thermal' } }
        ],
        col2Heading: 'Bench Diagnostics',
        col2: [
          { label: 'Free Fault Diagnostics', cat: 'repairs' },
          { label: 'Laptop RAM & SSD Upgrades', cat: 'pc_components', filter: { search: 'SO-DIMM' } }
        ],
        col3Heading: 'Book Inspection',
        col3: [
          { label: 'Call 098720 10193', href: 'tel:+919872010193' },
          { label: 'Book on WhatsApp', external: WA_BASE + encodeURIComponent('Hi Lally Computers Lab, I need a laptop/PC repair check in Moga.') }
        ]
      },
      store: {
        title: 'Store',
        col1Heading: 'Lally Computers (Supreme Infosys)',
        primary: [
          { label: 'Featured Stock', href: '#featured' },
          { label: 'Main Departments', href: '#lineup' },
          { label: 'Testing & Warranty', href: '#why' },
          { label: 'Genuine Reviews', href: '#reviews' },
          { label: 'Store Location', href: '#visit' }
        ],
        sub: [],
        col2Heading: 'Contact',
        col2: [
          { label: 'Call 098720 10193', href: 'tel:+919872010193' },
          { label: 'Chat on WhatsApp', external: WA_BASE + encodeURIComponent('Hi Lally Computers, I have an enquiry.') },
          { label: 'Google Maps Directions', external: 'https://www.google.com/maps/dir/?api=1&destination=Supreme%20Infosys%20(Lally%20Computers)%2C%205-A%2C%20Sodhi%20Nagar%2C%20Moga%2C%20Punjab%20142001' }
        ],
        col3Heading: 'Tools',
        col3: [
          { label: 'Inquiry Basket', action: 'cart' },
          { label: 'Live Google Sheet Stock', action: 'sheet' },
          { label: 'Privacy Policy', href: 'privacy.html' }
        ]
      }
    };
    return MAP[key] || MAP.laptops;
  }

  function renderLinkItem(item, cls) {
    const countHtml = typeof item.count === 'number' ? `<span class="apple-mega-count">${item.count}</span>` : '';
    if (item.external) return `<li><a class="${cls}" href="${item.external}" target="_blank" rel="noopener">${item.label} &nearr;</a></li>`;
    if (item.href) return `<li><a class="${cls}" href="${item.href}" data-mega-close>${item.label}</a></li>`;
    if (item.action) return `<li><button type="button" class="${cls}" data-mega-action="${item.action}">${item.label}</button></li>`;
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
        <ul class="apple-mega-primary-list">${data.primary.map(it => renderLinkItem(it, 'apple-mega-primary-link')).join('')}</ul>
        ${data.sub && data.sub.length ? `<ul class="apple-mega-sub-list">${data.sub.map(it => renderLinkItem(it, 'apple-mega-sub-link')).join('')}</ul>` : ''}
      </div>
      <div class="apple-mega-col">
        <p class="apple-mega-heading">${data.col2Heading}</p>
        <ul class="apple-mega-secondary-list">${data.col2.map(it => renderLinkItem(it, 'apple-mega-secondary-link')).join('')}</ul>
      </div>
      <div class="apple-mega-col">
        <p class="apple-mega-heading">${data.col3Heading}</p>
        <ul class="apple-mega-secondary-list">${data.col3.map(it => renderLinkItem(it, 'apple-mega-secondary-link')).join('')}</ul>
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

    if (e.target.closest('[data-mega-close], a[target="_blank"]')) {
      closeMega();
      closeMobileDrawer();
    }
  }

  triggers.forEach(btn => {
    const key = btn.getAttribute('data-mega');
    btn.addEventListener('mouseenter', () => { if (window.innerWidth > 980) openMega(key); });
    btn.addEventListener('focus', () => { if (window.innerWidth > 980) openMega(key); });
    btn.addEventListener('click', () => { if (activeKey === key) closeMega(); else openMega(key); });
  });

  nav.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  nav.addEventListener('mouseleave', scheduleClose);
  menu.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  menu.addEventListener('mouseleave', scheduleClose);
  backdrop.addEventListener('click', closeMega);
  content.addEventListener('click', handleMenuInteraction);

  function renderMobileDrawer() {
    if (!mobileContent) return;
    const keys = ['laptops', 'pcs', 'accessories', 'repairs', 'store'];
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
                <ul class="apple-mega-primary-list">${d.primary.map(it => renderLinkItem(it, 'apple-mega-primary-link')).join('')}</ul>
              </div>
              <div>
                <p class="apple-mega-heading">${d.col2Heading}</p>
                <ul class="apple-mega-secondary-list">${d.col2.map(it => renderLinkItem(it, 'apple-mega-secondary-link')).join('')}</ul>
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
    if (!document.querySelector('.modal-backdrop.is-open')) document.body.style.overflow = '';
    if (syncHistory) popNavigationStateIfMatches('mobileDrawer');
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
