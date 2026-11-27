/**
 * Lally Computers (Supreme Infosys) - Product Detail Page (PDP)
 * Real inspection gallery, exact specs, full 25-point lab report, and compatible recommendations.
 */

(function () {
  'use strict';

  let currentProduct = null;
  let currentQty = 1;
  let cart = [];

  try {
    cart = JSON.parse(localStorage.getItem('lally_cart')) || [];
  } catch (e) {
    cart = [];
  }

  function getUrlProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || 'lap-used-1';
  }

  function getAllProducts() {
    let prods = (window.DEFAULT_PRODUCTS || window.PRODUCTS || []).slice(0);
    try {
      const cached = localStorage.getItem('lally_stock_cache_v1');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
          prods = parsed.products;
        }
      }
    } catch (e) {}
    return prods;
  }

  function renderStarsHtml(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.4 ? 1 : 0;
    const empty = 5 - full - half;
    let s = '';
    for (let i = 0; i < full; i++) {
      s += '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
    }
    if (half) {
      s += '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 15.4V6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24z"/></svg>';
    }
    for (let i = 0; i < empty; i++) {
      s += '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
    }
    return s;
  }

  const CATEGORY_NAMES = {
    laptops_used: 'Used Laptops',
    laptops_new: 'New Laptops',
    laptops_gaming: 'Gaming',
    pc: 'Custom PCs',
    pc_components: 'Components',
    accessories: 'Accessories',
    pc_peripherals: 'Accessories',
    monitors: 'Accessories',
    gadgets: 'Accessories',
    repairs: 'Repairs',
    other: 'Other Departments',
    watches: 'Other Departments',
    gym: 'Other Departments',
    suitcases: 'Other Departments',
    appliances: 'Other Departments'
  };

  function renderProductPage() {
    const prodId = getUrlProductId();
    const allProducts = getAllProducts();
    currentProduct = allProducts.find(p => p.id === prodId) || allProducts[0];
    if (!currentProduct) return;

    const p = currentProduct;
    const catName = CATEGORY_NAMES[p.category] || 'Showroom Stock';
    const brand = p.brand || 'Lally Computers';

    document.title = `${p.title} | Lally Computers (Supreme Infosys)`;

    const bcCat = document.getElementById('bcCategoryLink');
    if (bcCat) {
      bcCat.textContent = catName;
      bcCat.href = 'index.html#lineup';
    }
    const bcBrand = document.getElementById('bcBrand');
    if (bcBrand) bcBrand.textContent = brand;
    const bcTitle = document.getElementById('bcTitle');
    if (bcTitle) bcTitle.textContent = p.title;

    // Gallery Stage & Multi-Angle Inspection Photos
    const gallery = Array.isArray(p.gallery) && p.gallery.length
      ? p.gallery
      : [{ label: 'Product View', src: p.image || `images/products/${p.id}.svg` }];

    const mainImg = document.getElementById('pdpMainImage');
    const angleCaption = document.getElementById('pdpAngleCaption');
    if (mainImg) {
      mainImg.src = gallery[0].src;
      mainImg.alt = `${p.title} - ${gallery[0].label}`;
      mainImg.onerror = function () {
        this.onerror = null;
        this.src = 'images/store-banner.jpg';
      };
    }
    if (angleCaption) {
      angleCaption.textContent = `Viewing: ${gallery[0].label}`;
    }

    const badgesOverlay = document.getElementById('pdpBadgesOverlay');
    if (badgesOverlay) {
      let bHtml = '';
      if (p.condition === 'used') {
        bHtml += '<span class="pdp-badge-tag pdp-badge-tag--used">25-Point Lab Tested</span>';
      } else if (p.condition === 'new') {
        bHtml += '<span class="pdp-badge-tag pdp-badge-tag--new">Factory Sealed</span>';
      } else if (p.condition === 'service') {
        bHtml += '<span class="pdp-badge-tag pdp-badge-tag--lab">In-House Lab Service</span>';
      }
      if (p.badge) {
        bHtml += `<span class="pdp-badge-tag pdp-badge-tag--grade">${p.badge}</span>`;
      }
      badgesOverlay.innerHTML = bHtml;
    }

    const thumbsRow = document.getElementById('pdpThumbsRow');
    if (thumbsRow) {
      thumbsRow.innerHTML = gallery.map((a, idx) => `
        <button class="pdp-thumb-btn ${idx === 0 ? 'active' : ''}" type="button" aria-label="${a.label}" title="${a.label}" onclick="switchPdpImage('${a.src}', '${a.label.replace(/'/g, "\\'")}', this)">
          <img src="${a.src}" alt="${a.label}" onerror="this.onerror=null;this.src='images/store-banner.jpg';">
          <span class="pdp-thumb-label">${a.label}</span>
        </button>
      `).join('');
    }

    const wearCallout = document.getElementById('pdpWearCallout');
    if (wearCallout) {
      if (p.wearNote) {
        const noteHeading = p.condition === 'new' ? 'Factory Packaging &amp; Seal Inspection:' : 'Cosmetic Condition Note:';
        wearCallout.innerHTML = `<strong>${noteHeading}</strong> ${p.wearNote}`;
        wearCallout.style.display = 'block';
      } else {
        wearCallout.style.display = 'none';
      }
    }

    // Header & Title
    const brandLink = document.getElementById('pdpBrandLink');
    if (brandLink) {
      brandLink.textContent = `${brand} · Lally Computers`;
      brandLink.href = 'index.html#lineup';
    }
    const skuPill = document.getElementById('pdpSkuPill');
    if (skuPill) skuPill.textContent = `UNIT: ${p.id.toUpperCase()}`;

    const titleEl = document.getElementById('pdpTitle');
    if (titleEl) titleEl.textContent = p.title;

    const condPill = document.getElementById('pdpConditionPill');
    if (condPill) {
      condPill.textContent = p.conditionLabel || (p.condition === 'used' ? 'Pre-Owned · Lab Tested' : 'Brand New · Sealed');
    }

    // Pricing (White price, only show Official MRP on brand new retail items)
    const pNum = p.priceNum || parseFloat((p.price || '').replace(/[^0-9.]/g, '')) || 0;
    const mrpNum = p.mrpNum || parseFloat((p.mrp || '').replace(/[^0-9.]/g, '')) || 0;

    const priceEl = document.getElementById('pdpPriceMain');
    if (priceEl) priceEl.textContent = p.price || (pNum ? `₹${pNum.toLocaleString('en-IN')}` : 'Quote in Store');

    const mrpStrike = document.getElementById('pdpMrpStrike');
    const mrpRow = document.getElementById('pdpMrpRow');
    if (mrpStrike && mrpRow) {
      if (p.condition === 'new' && p.mrp && mrpNum > pNum) {
        mrpStrike.textContent = p.mrp;
        mrpRow.style.display = 'block';
      } else {
        mrpRow.style.display = 'none';
      }
    }

    const wLabel = document.getElementById('pdpWarrantyLabel');
    if (wLabel) wLabel.textContent = p.warranty || 'Warranty Included';

    // Quick Specifications Table
    const qTable = document.getElementById('pdpQuickSpecsTable');
    if (qTable) {
      const qRows = [];
      qRows.push(['Brand', brand]);
      qRows.push(['Exact Model', (p.details && p.details.Model) || p.title]);
      qRows.push(['Condition', p.conditionLabel || (p.condition === 'used' ? 'Pre-Owned (Lab Tested)' : 'Brand New Sealed')]);
      qRows.push(['Availability', p.availability || 'In Stock · Moga']);

      if (p.specs && p.specs.length) {
        p.specs.slice(0, 4).forEach((s, i) => {
          qRows.push([`Key Spec ${i + 1}`, s]);
        });
      }

      qTable.querySelector('tbody').innerHTML = qRows.map(([k, v]) => `
        <tr>
          <th>${k}</th>
          <td>${v}</td>
        </tr>
      `).join('');
    }

    // Buy Box
    const bbPrice = document.getElementById('pdpBbPrice');
    if (bbPrice) bbPrice.textContent = p.price || (pNum ? `₹${pNum.toLocaleString('en-IN')}` : 'Quote in Store');

    const bbDelivery = document.getElementById('pdpBbDelivery');
    if (bbDelivery) {
      bbDelivery.innerHTML = `<b>${p.delivery || 'In-Store Pickup · Sodhi Nagar, Moga'}</b><br><span style="font-size:12px;color:var(--pdp-text-muted);">Test the exact unit hands-on before paying.</span>`;
    }

    const bbStock = document.getElementById('pdpBbStockText');
    if (bbStock) {
      bbStock.textContent = p.availability || 'In Stock · Moga';
    }

    const waUrl = `https://wa.me/919872010193?text=${encodeURIComponent(
      `Hi Lally Computers (Supreme Infosys), I would like to enquire about:\n\n*${p.title}*\nUnit ID: ${p.id}\nPrice: ${p.price}\nLink: https://lallycomputers.vercel.app/product.html?id=${p.id}\n\nIs this unit currently available for in-store inspection in Sodhi Nagar, Moga?`
    )}`;

    const waBtn = document.getElementById('pdpWhatsAppBtn');
    if (waBtn) waBtn.href = waUrl;
    const mobWaBtn = document.getElementById('pdpMobileWaBtn');
    if (mobWaBtn) mobWaBtn.href = waUrl;

    const mobPrice = document.getElementById('pdpMobilePrice');
    if (mobPrice) mobPrice.textContent = p.price || (pNum ? `₹${pNum.toLocaleString('en-IN')}` : 'Quote in Store');

    // About This Configuration
    const bulletsList = document.getElementById('pdpAboutBullets');
    if (bulletsList) {
      const bullets = [];
      if (p.desc) bullets.push(`<strong>Overview:</strong> ${p.desc}`);
      if (p.wearNote) bullets.push(`<strong>Cosmetic Condition:</strong> ${p.wearNote}`);
      if (p.specs && p.specs.length) {
        p.specs.forEach(s => bullets.push(`<strong>Specification:</strong> ${s}`));
      }
      if (p.details) {
        Object.keys(p.details).forEach(k => {
          bullets.push(`<strong>${k}:</strong> ${p.details[k]}`);
        });
      }
      bulletsList.innerHTML = bullets.map(b => `<li>${b}</li>`).join('');
    }

    // Technical Details 2-Column Grid
    const tableLeft = document.getElementById('pdpSpecsTableLeft');
    const tableRight = document.getElementById('pdpSpecsTableRight');
    if (tableLeft && tableRight) {
      const allDetails = [
        ['Brand', brand],
        ['Model', (p.details && p.details.Model) || p.title],
        ['Department', catName],
        ['Condition', p.conditionLabel || (p.condition === 'used' ? 'Pre-Owned (Lab Tested)' : 'Brand New Sealed')],
        ['Availability', p.availability || 'In Stock · Moga'],
        ['Warranty', p.warranty || 'Store Warranty + GST Invoice']
      ];

      if (p.details) {
        Object.keys(p.details).forEach(k => {
          if (!allDetails.some(([existing]) => existing === k)) {
            allDetails.push([k, p.details[k]]);
          }
        });
      }

      const half = Math.ceil(allDetails.length / 2);
      tableLeft.querySelector('tbody').innerHTML = allDetails.slice(0, half).map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('');
      tableRight.querySelector('tbody').innerHTML = allDetails.slice(half).map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('');
    }

    // 25-Point Lab Diagnostic Certificate
    const labSection = document.getElementById('labReport');
    const labNavLi = document.getElementById('labReportNavLi');
    if (p.labReport) {
      if (labSection) labSection.style.display = 'block';
      if (labNavLi) labNavLi.style.display = 'inline-block';

      const rep = p.labReport;
      const labGrade = document.getElementById('pdpLabGrade');
      if (labGrade) labGrade.textContent = rep.overallGrade || 'Grade A';
      const labRepId = document.getElementById('pdpLabReportId');
      if (labRepId) labRepId.textContent = rep.reportId || `LC-26-${p.id.toUpperCase()}`;
      const labTech = document.getElementById('pdpLabTech');
      if (labTech) labTech.textContent = rep.technician || 'Er. Harpreet Singh';
      const labDate = document.getElementById('pdpLabDate');
      if (labDate) labDate.textContent = rep.testedDate || '22-Nov-2026';

      const labWaBtn = document.getElementById('pdpLabWhatsAppBtn');
      if (labWaBtn) {
        labWaBtn.href = `https://wa.me/919872010193?text=${encodeURIComponent(
          `Hi Lally Computers, I want to inspect ${p.title} (Report ${rep.reportId || ''}) on your testing bench in Sodhi Nagar.`
        )}`;
      }

      const labTable = document.getElementById('pdpLabTable');
      if (labTable) {
        let checks = Array.isArray(rep.checklist) && rep.checklist.length ? rep.checklist : null;
        if (!checks) {
          checks = [
            { point: 'Battery Health & Cycles (Summary)', result: rep.batteryHealth || 'Verified on bench', status: 'PASS' },
            { point: 'CPU & Thermal Stress (Summary)', result: rep.cpuStress || 'Passed load test', status: 'PASS' },
            { point: 'SSD S.M.A.R.T. Health (Summary)', result: rep.ssdHealth || 'Verified healthy', status: 'PASS' },
            { point: 'Display Panel & Backlight (Summary)', result: rep.screenStatus || 'Zero dead pixels', status: 'PASS' },
            { point: 'Keyboard & Trackpad (Summary)', result: rep.keyboardTrackpad || 'All keys responsive', status: 'PASS' },
            { point: 'Motherboard Power Rails (Summary)', result: rep.motherboardPower || 'Clean logic board', status: 'PASS' },
            { point: 'Ports & Wireless I/O (Summary)', result: rep.portsIo || 'All ports verified', status: 'PASS' },
            { point: 'Chassis & Hinges (Summary)', result: rep.casingHinges || 'Hinges firm', status: 'PASS' }
          ];
        }

        labTable.querySelector('tbody').innerHTML = checks.map(c => `
          <tr>
            <th>${c.point}</th>
            <td>${c.result} <span class="pdp-lab-pass">&check; ${c.status || 'PASS'}</span></td>
          </tr>
        `).join('');
      }
    } else {
      if (labSection) labSection.style.display = 'none';
      if (labNavLi) labNavLi.style.display = 'none';
    }

    // Store Google Reviews
    const revStars = document.getElementById('pdpReviewStars');
    if (revStars) revStars.innerHTML = renderStarsHtml(4.2);

    const feed = document.getElementById('pdpReviewsFeed');
    if (feed) {
      const storeReviews = [
        {
          name: 'Anmol Saini',
          text: 'Lally Computers is by far the best store in Moga for genuine laptops and custom builds. Transparent testing with 25-point reports and honest pricing.'
        },
        {
          name: 'Brar Balli',
          text: 'We are regular customers from 2008. Very good service, honest pricing, and they stand behind every machine sold. Best laptop experience in Punjab.'
        },
        {
          name: 'Lovepreet Ramghariya',
          text: 'Best price with GST Bill. Unmatched for after-sale service and chip-level motherboard repair in Sodhi Nagar. Got my dead ThinkPad motherboard fixed same day.'
        }
      ];

      feed.innerHTML = storeReviews.map(r => `
        <div class="pdp-review-card">
          <div class="pdp-reviewer">
            <div class="pdp-avatar">${r.name.split(' ').map(n => n[0]).join('')}</div>
            <span>${r.name}</span>
            <a class="pdp-verified-tag" href="https://www.google.com/maps/search/?api=1&amp;query=Supreme+Infosys+5-A+Sodhi+Nagar+Moga+Punjab+142001" target="_blank" rel="noopener">Google Maps Review &nearr;</a>
          </div>
          <div class="pdp-rating-stars">${renderStarsHtml(5)}</div>
          <p style="margin:0; font-size:14px; line-height:1.55; color:var(--pdp-text-secondary);">"${r.text}"</p>
        </div>
      `).join('');
    }

    // Similar Models
    const similarTrack = document.getElementById('pdpSimilarTrack');
    if (similarTrack) {
      const similar = allProducts
        .filter(item => item.id !== p.id && item.category === p.category)
        .slice(0, 4);

      similarTrack.innerHTML = similar.map(s => {
        const sImg = s.image || `images/products/${s.id}.svg`;
        const sPrice = s.price || `₹${(s.priceNum || 0).toLocaleString('en-IN')}`;
        return `
          <a class="pdp-mini-card" href="product.html?id=${s.id}">
            <img class="pdp-mini-card-img" src="${sImg}" alt="${s.title}" loading="lazy" onerror="this.onerror=null;this.src='images/store-banner.jpg';">
            <div class="pdp-mini-card-title">${s.title}</div>
            <div class="pdp-mini-card-price">${sPrice}</div>
            <div style="font-size:11.5px;color:#22C55E;font-weight:600;">${s.availability || 'In Stock · Moga'}</div>
          </a>
        `;
      }).join('');
    }

    // Compatible Accessories & Upgrades (Priority 5: never show desktop GPUs/cases/PSUs on laptop pages)
    const accTrack = document.getElementById('pdpAccessoriesTrack');
    const accTitle = document.getElementById('pdpAccessoriesTitle');
    const accNavLink = document.getElementById('accessoriesNavLink');
    const isLaptop = p.category === 'laptops_used' || p.category === 'laptops_new' || p.category === 'laptops_gaming';
    const isDesktop = p.category === 'pc' || p.category === 'pc_components';
    const isMonitor = p.category === 'monitors';

    if (accTitle) {
      accTitle.textContent = isLaptop
        ? 'Pair with Laptop — Compatible Mice, Bags, Docks & Upgrades'
        : (isMonitor
            ? 'Pair with Monitor — High-Speed Cables, Docks & Desk Gear'
            : (isDesktop ? 'Pair with Desktop Setup' : 'Recommended Accessories'));
    }
    if (accNavLink) {
      accNavLink.textContent = isLaptop ? 'Pair with Laptop' : (isMonitor ? 'Pair with Monitor' : 'Compatible Gear');
    }

    if (accTrack) {
      let accessories = [];
      if (isLaptop) {
        accessories = allProducts.filter(item =>
          item.id !== p.id &&
          Array.isArray(item.compatibleWith) &&
          item.compatibleWith.includes(p.category)
        );
      } else if (isMonitor) {
        accessories = allProducts.filter(item =>
          item.id !== p.id &&
          (item.category === 'accessories' || item.category === 'pc')
        );
      } else if (isDesktop) {
        accessories = allProducts.filter(item =>
          item.id !== p.id &&
          (item.category === 'accessories' || item.category === 'pc_components')
        );
      } else {
        accessories = allProducts.filter(item => item.id !== p.id && item.category === 'accessories');
      }

      accTrack.innerHTML = accessories.slice(0, 6).map(a => {
        const aImg = a.image || `images/products/${a.id}.svg`;
        const aPrice = a.price || `₹${(a.priceNum || 0).toLocaleString('en-IN')}`;
        return `
          <a class="pdp-mini-card" href="product.html?id=${a.id}">
            <img class="pdp-mini-card-img" src="${aImg}" alt="${a.title}" loading="lazy" onerror="this.onerror=null;this.src='images/store-banner.jpg';">
            <div class="pdp-mini-card-title">${a.title}</div>
            <div class="pdp-mini-card-price">${aPrice}</div>
            <div style="font-size:11.5px;color:var(--pdp-link);font-weight:600;">View Details &rarr;</div>
          </a>
        `;
      }).join('');
    }

    updateCartUI();
  }

  window.switchPdpImage = function (src, label, btn) {
    const main = document.getElementById('pdpMainImage');
    const caption = document.getElementById('pdpAngleCaption');
    if (main) {
      main.style.opacity = '0.5';
      setTimeout(() => {
        main.src = src;
        if (label) main.alt = `${currentProduct ? currentProduct.title : 'Product'} - ${label}`;
        main.style.opacity = '1';
      }, 100);
    }
    if (caption && label) {
      caption.textContent = `Viewing: ${label}`;
    }
    document.querySelectorAll('.pdp-thumb-btn').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
  };

  window.incrementQty = function () {
    currentQty++;
    const qVal = document.getElementById('pdpQtyVal');
    if (qVal) qVal.textContent = currentQty;
  };

  window.decrementQty = function () {
    if (currentQty > 1) {
      currentQty--;
      const qVal = document.getElementById('pdpQtyVal');
      if (qVal) qVal.textContent = currentQty;
    }
  };

  window.addProductToCart = function () {
    if (!currentProduct) return;
    const existing = cart.find(c => c.id === currentProduct.id);
    if (existing) {
      existing.qty = (existing.qty || 1) + currentQty;
    } else {
      cart.push({
        id: currentProduct.id,
        title: currentProduct.title,
        price: currentProduct.price,
        priceNum: currentProduct.priceNum || 0,
        image: currentProduct.image || `images/products/${currentProduct.id}.svg`,
        qty: currentQty,
        category: currentProduct.category
      });
    }
    saveCart();
    updateCartUI();
    showToast(`Added ${currentQty} × "${currentProduct.title}" to Basket`);
    openCartModal();
  };

  function saveCart() {
    try { localStorage.setItem('lally_cart', JSON.stringify(cart)); } catch (e) {}
  }

  window.updateCartItemQty = function (id, delta) {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.qty = (item.qty || 1) + delta;
    if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
    saveCart();
    updateCartUI();
  };

  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const badge = document.getElementById('navCartBadge');
    if (badge) {
      badge.textContent = totalItems;
      badge.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    }
    const drawerBadge = document.getElementById('cartDrawerCount');
    if (drawerBadge) drawerBadge.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
    const footerCount = document.getElementById('cartFooterCount');
    if (footerCount) footerCount.textContent = totalItems;

    const list = document.getElementById('cartItemsList');
    const footer = document.getElementById('cartDrawerFooter');
    if (!list) return;

    if (cart.length === 0) {
      list.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <h4 class="cart-empty-title">Your Inquiry Basket is Empty</h4>
          <p class="cart-empty-desc">Add laptops, custom PCs, or accessories to enquire with our Moga store.</p>
          <button class="cart-empty-btn" type="button" onclick="closeCartModal(); window.location.href='index.html#featured';">
            <span>Browse Store Stock</span> &rarr;
          </button>
        </div>
      `;
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = 'flex';

    let totalVal = 0;
    list.innerHTML = cart.map(item => {
      const pNum = item.priceNum || 0;
      const subtotal = pNum * (item.qty || 1);
      totalVal += subtotal;
      return `
        <div class="cart-item-card" id="cart-item-${item.id}">
          <div class="cart-item-main">
            <a class="cart-item-thumb-link" href="product.html?id=${item.id}" aria-label="${item.title}">
              <img class="cart-item-img" src="${item.image}" alt="${item.title}" onerror="this.onerror=null;this.src='images/store-banner.jpg';">
            </a>
            <div class="cart-item-details">
              <a class="cart-item-title" href="product.html?id=${item.id}" title="${item.title}">${item.title}</a>
              <div class="cart-item-unit-price">${item.price} each</div>
              <div class="cart-item-status-pill">In Stock · Sodhi Nagar, Moga</div>
            </div>
          </div>
          <div class="cart-item-bottom-bar">
            <div class="cart-qty-pill-stepper">
              <button class="cart-qty-btn cart-qty-minus" type="button" onclick="updateCartItemQty('${item.id}', -1)" aria-label="Decrease quantity">&minus;</button>
              <span class="cart-qty-number">${item.qty}</span>
              <button class="cart-qty-btn cart-qty-plus" type="button" onclick="updateCartItemQty('${item.id}', 1)" aria-label="Increase quantity">&plus;</button>
            </div>
            <div class="cart-item-price-col">
              <span class="cart-item-subtotal-price">₹${subtotal.toLocaleString('en-IN')}</span>
              <button class="cart-item-delete-btn" type="button" onclick="removeCartItem('${item.id}')">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const subVal = document.getElementById('cartSubtotalVal');
    if (subVal) subVal.textContent = `₹${totalVal.toLocaleString('en-IN')}`;

    const waCheckoutBtn = document.getElementById('cartWhatsAppCheckoutBtn');
    if (waCheckoutBtn) {
      let msg = 'Hi Lally Computers (Supreme Infosys), I would like to enquire about these items:\n\n';
      cart.forEach((c, idx) => {
        const itemSub = (c.priceNum || 0) * (c.qty || 1);
        msg += `${idx + 1}. *${c.title}*\n   Qty: ${c.qty} × ${c.price}${itemSub > 0 ? ` = ₹${itemSub.toLocaleString('en-IN')}` : ''}\n`;
      });
      msg += `\n*Estimated Total: ₹${totalVal.toLocaleString('en-IN')}*\nCan I inspect these at your Sodhi Nagar, Moga store?`;
      waCheckoutBtn.href = `https://wa.me/919872010193?text=${encodeURIComponent(msg)}`;
    }
  }

  window.removeCartItem = function (id) {
    cart = cart.filter(c => c.id !== id);
    saveCart();
    updateCartUI();
  };

  window.clearCart = function () {
    cart = [];
    saveCart();
    updateCartUI();
  };

  window.openCartModal = function () {
    const modal = document.getElementById('cartModal');
    if (modal) {
      modal.classList.add('is-open', 'active');
      document.documentElement.style.overflow = 'hidden';
    }
  };

  window.closeCartModal = function () {
    const modal = document.getElementById('cartModal');
    if (modal) {
      modal.classList.remove('is-open', 'active');
      document.documentElement.style.overflow = '';
    }
  };

  function showToast(msg) {
    const toast = document.getElementById('appleToast');
    const text = document.getElementById('toastMessage');
    if (!toast || !text) return;
    text.textContent = msg;
    toast.classList.add('show');
    clearTimeout(window._pdpToastTimer);
    window._pdpToastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function initTheme() {
    const toggleBtn = document.getElementById('themeToggleBtn');
    if (!toggleBtn) return;

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      try { localStorage.setItem('lally_apple_theme', theme); } catch (e) {}
      const sun = toggleBtn.querySelector('.theme-icon-sun');
      const moon = toggleBtn.querySelector('.theme-icon-moon');
      if (sun && moon) {
        sun.style.display = theme === 'dark' ? 'none' : 'block';
        moon.style.display = theme === 'dark' ? 'block' : 'none';
      }
    }

    applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');
    toggleBtn.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme');
      applyTheme(active === 'dark' ? 'light' : 'dark');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderProductPage();

    const cartTrigger = document.getElementById('navCartBtn');
    if (cartTrigger) cartTrigger.addEventListener('click', openCartModal);

    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
      cartModal.addEventListener('click', e => {
        if (e.target === cartModal) closeCartModal();
      });
    }

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeCartModal();
    });
  });
})();
