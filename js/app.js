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
              Explore Stock (<span>${cnt}</span>) <span class="arrow">&rarr;</span>
            </button>
            <a class="btn-quick-wa" href="https://wa.me/919872010193?text=${waMsg}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
              Inquire on WhatsApp ↗
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
  if (catId) activeCategory = catId;
  const space = document.getElementById('catalogueSpace');
  if (!space) return;

  space.classList.add('is-open');

  const catObj = window.CATEGORIES.find(c => c.id === activeCategory);
  if (catObj) {
    const titleEl = document.getElementById('spaceCurrentCatTitle');
    const descEl = document.getElementById('spaceCurrentCatDesc');
    const badgeEl = document.getElementById('spaceCurrentCatBadge');
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

  resetFilters();
  renderSpaceProducts();

  space.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeCatalogueSpace() {
  const space = document.getElementById('catalogueSpace');
  if (space) space.classList.remove('is-open');
  document.querySelectorAll('.chap-item').forEach(btn => btn.classList.remove('is-active'));
  const lineup = document.getElementById('lineup');
  if (lineup) lineup.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function switchSpaceCategory(catId) {
  activeCategory = catId;
  const catObj = window.CATEGORIES.find(c => c.id === catId);
  if (catObj) {
    const titleEl = document.getElementById('spaceCurrentCatTitle');
    const descEl = document.getElementById('spaceCurrentCatDesc');
    const badgeEl = document.getElementById('spaceCurrentCatBadge');
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

  resetFilters();
  renderSpaceProducts();
}

/* ==========================================================================
   PRODUCT FILTERING
   ========================================================================== */
function applyFilters() {
  const searchInput = document.getElementById('spaceSearchInput');
  const brandSelect = document.getElementById('spaceBrandSelect');
  const budgetSelect = document.getElementById('spaceBudgetSelect');
  const sizeSelect = document.getElementById('spaceSizeSelect');
  const panelSelect = document.getElementById('spacePanelSelect');

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

  const ids = ['spaceSearchInput', 'spaceBrandSelect', 'spaceBudgetSelect', 'spaceSizeSelect', 'spacePanelSelect'];
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
   AMAZON-STYLE VERTICAL PRODUCT CATALOGUE
   ========================================================================== */
function renderSpaceProducts() {
  const grid = document.getElementById('spaceLineupGrid');
  if (!grid) return;

  const items = window.PRODUCTS.filter(item => {
    if (item.category !== activeCategory) return false;
    if (brandFilter && item.brand !== brandFilter) return false;
    if (budgetFilter && item.budget !== budgetFilter) return false;
    if (sizeFilter && item.size !== sizeFilter) return false;
    if (panelFilter && item.panel !== panelFilter) return false;
    if (searchFilter) {
      const q = searchFilter;
      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const descMatch = (item.desc || '').toLowerCase().includes(q);
      const brandMatch = (item.brand || '').toLowerCase().includes(q);
      const specsMatch = (item.specs || []).join(' ').toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !brandMatch && !specsMatch) return false;
    }
    return true;
  });

  // Update count badge & active filter chips
  const countBadge = document.getElementById('spaceResultsCount');
  if (countBadge) countBadge.textContent = `${items.length} Product${items.length === 1 ? '' : 's'}`;

  const tagsContainer = document.getElementById('activeFilterTags');
  if (tagsContainer) {
    const activeTags = [];
    if (searchFilter) activeTags.push({ label: `"${searchFilter}"`, type: 'search' });
    if (brandFilter) activeTags.push({ label: `Brand: ${brandFilter}`, type: 'brand' });
    if (budgetFilter) activeTags.push({ label: `Budget: ${budgetFilter}`, type: 'budget' });
    if (sizeFilter) activeTags.push({ label: `Size: ${sizeFilter}`, type: 'size' });
    if (panelFilter) activeTags.push({ label: `Type: ${panelFilter}`, type: 'panel' });

    if (activeTags.length > 0) {
      tagsContainer.innerHTML = activeTags.map(t => `<span class="filter-chip">${t.label}</span>`).join('') +
        '<button class="filter-clear-all" onclick="resetFilters()">Clear Filters &times;</button>';
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
    const fastDelivery = item.fastDelivery || 'Or fastest delivery Tomorrow, 17 Nov';
    const offers = item.offers && item.offers.length ? item.offers : [
      'Save extra with No Cost EMI & Card Offers',
      'Official Brand Warranty with 100% Genuine Tax Invoice'
    ];
    const image = item.image || `images/products/${item.id}.svg`;
    const waText = encodeURIComponent(`Hi Lally Computers, I want to inquire about ${item.title} (${item.price}). Is this currently in stock at Sodhi Nagar?`);

    const badgesHtml = `
      <div class="amz-badge-box">
        ${item.condition === 'service' ? '<span class="amz-badge amz-badge--lab">In-Store Lab</span>' : ''}
        ${item.condition === 'used' ? '<span class="amz-badge amz-badge--choice">Lab Tested A+</span>' : ''}
        ${item.condition === 'new' ? '<span class="amz-badge amz-badge--deal">Brand New Sealed</span>' : ''}
        ${item.badge ? `<span class="amz-badge">${item.badge}</span>` : ''}
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

    const offersHtml = offers.map(o => `
      <div class="amz-offer-item">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span>${o}</span>
      </div>
    `).join('');

    return `
      <article class="amz-product-row" id="product-${item.id}">
        <div class="amz-img-col">
          <div class="amz-img-container">
            <img class="amz-product-img" src="${image}" alt="${item.title}" loading="lazy" width="280" height="245">
            ${badgesHtml}
          </div>
        </div>

        <div class="amz-info-col">
          <h3 class="amz-product-title" data-specs-id="${item.id}">${item.title}</h3>
          <p class="amz-product-desc">${item.desc}</p>
          ${specsHtml}

          <div class="amz-rating-row">
            <span class="amz-rating-num">${rating.toFixed(1)}</span>
            <div class="amz-stars">${renderStars(rating)}</div>
            <a class="amz-review-link" href="#reviews">${reviews.toLocaleString()} ratings</a>
            <span class="amz-bought-tag">${bought}</span>
          </div>

          <div class="amz-price-row">
            <span class="amz-price-current">${item.price}</span>
            ${mrpHtml}
            ${item.warranty ? `<span class="amz-warranty-badge">${item.warranty}</span>` : ''}
          </div>

          ${labBtnHtml}

          <div class="amz-offers-group">
            ${offersHtml}
          </div>

          <div class="amz-delivery-info">
            <div class="amz-delivery-primary">${delivery}</div>
            <div class="amz-delivery-secondary">${fastDelivery}</div>
          </div>

          <div class="amz-actions-row">
            <button class="amz-btn-cart" data-cart-id="${item.id}" type="button">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span>Add to cart</span>
            </button>
            <a class="amz-btn-wa" href="https://wa.me/919872010193?text=${waText}" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.677.15-.2.301-.777.98-.952 1.18-.175.201-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.894-.799-1.498-1.786-1.674-2.087-.175-.3-.019-.463.132-.612.136-.134.301-.351.451-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.631-.928-2.233-.244-.585-.493-.506-.677-.515-.175-.009-.376-.011-.577-.011-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.91 1.228 3.111.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.379.197 1.898.12.579-.086 1.782-.728 2.033-1.431.251-.703.251-1.305.175-1.431-.075-.126-.276-.201-.577-.351zM12.04 2C6.516 2 2.023 6.49 2.023 12.013c0 1.942.555 3.756 1.517 5.292L2 22l4.834-1.503a10.007 10.007 0 0 0 5.206 1.516c5.524 0 10.017-4.49 10.017-10.013C22.057 6.49 17.564 2 12.04 2z"/>
              </svg>
              <span>WhatsApp Inquiry</span>
            </a>
            <button class="amz-btn-view" data-specs-id="${item.id}" type="button">Quick View</button>
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
    const totalEl = document.getElementById('cartTotalDisplay');
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

      if (isManual) {
        setTimeout(closeSheetSyncModal, 1200);
        showToast(`Stock synced from Google Sheets (${newProducts.length} items)`);
      }
    })
    .catch(err => {
      console.warn("Google Sheet sync error:", err);
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

// Global Event Delegation & Setup
document.addEventListener('DOMContentLoaded', () => {
  // Render Categories & Initial Products
  renderCategories();
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

  // Hero Video Loader
  const video = document.getElementById('heroVideo');
  if (video && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const isSmall = window.matchMedia('(max-width: 760px)').matches;
    const ext = video.canPlayType('video/mp4; codecs="avc1.640028"') ? 'mp4' : 'webm';
    video.muted = true;
    video.addEventListener('playing', () => video.classList.add('is-on'), { once: true });
    video.src = (isSmall ? 'hero-720.' : 'hero-1080.') + ext;
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
  }
});
