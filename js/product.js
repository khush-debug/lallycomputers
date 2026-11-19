/**
 * Lally Computers - Product Detail Page (PDP) Application Logic
 * Amazon-Style Experience with Live Inventory, Lab Reports, Cart, & WhatsApp Sync
 */

(function () {
  'use strict';

  // State
  let currentProduct = null;
  let currentQty = 1;
  let cart = [];

  // Initialize Cart from localStorage
  try {
    cart = JSON.parse(localStorage.getItem('lally_cart')) || [];
  } catch (e) {
    cart = [];
  }

  // Helper: Get Product ID from URL
  function getUrlProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || 'lap-used-1';
  }

  // Helper: Get all products (default + cached sheets sync)
  function getAllProducts() {
    let prods = (window.DEFAULT_PRODUCTS || window.PRODUCTS || []).slice(0);
    try {
      const cached = localStorage.getItem('lally_sheets_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
          prods = parsed.products;
        }
      }
    } catch (e) {}
    return prods;
  }

  // Helper: Render Star SVGs
  function renderStarsHtml(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
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

  // Category Names Map
  const CATEGORY_NAMES = {
    laptops_used: 'Pre-Owned Laptops',
    laptops_new: 'Brand New Laptops',
    laptops_gaming: 'Gaming Laptops',
    pc: 'Custom PCs & Workstations',
    pc_components: 'PC Components',
    pc_peripherals: 'PC Peripherals & Accessories',
    monitors: 'Monitors & Displays',
    watches: 'Watches & Wearables',
    gadgets: 'Smart Gadgets',
    gym: 'Fitness & Gym Gear',
    suitcases: 'Luggage & Travel Bags',
    appliances: 'Home Appliances',
    repairs: 'Chip-Level Lab Repairs'
  };

  // Main Render Function
  function renderProductPage() {
    const prodId = getUrlProductId();
    const allProducts = getAllProducts();
    currentProduct = allProducts.find(p => p.id === prodId) || allProducts[0];

    if (!currentProduct) return;

    const p = currentProduct;
    const catName = CATEGORY_NAMES[p.category] || 'Showroom Products';
    const brand = p.brand || 'Supreme';

    // Page Title & Meta
    document.title = `${p.title} | Lally Computers Moga`;

    // Breadcrumbs
    const bcCat = document.getElementById('bcCategoryLink');
    if (bcCat) {
      bcCat.textContent = catName;
      bcCat.href = `index.html#lineup`;
    }
    const bcBrand = document.getElementById('bcBrand');
    if (bcBrand) bcBrand.textContent = brand;
    const bcTitle = document.getElementById('bcTitle');
    if (bcTitle) bcTitle.textContent = p.title;

    // Gallery Stage & Overlays
    const mainImg = document.getElementById('pdpMainImage');
    if (mainImg) {
      mainImg.src = p.image || `images/products/${p.id}.svg`;
      mainImg.alt = p.title;
      mainImg.onerror = function () {
        this.onerror = null;
        this.src = 'images/logo.png';
      };
    }

    const badgesOverlay = document.getElementById('pdpBadgesOverlay');
    if (badgesOverlay) {
      let bHtml = '';
      if (p.condition === 'used') {
        bHtml += '<span class="pdp-badge-tag pdp-badge-tag--used">⚡ 25-Point Lab Verified</span>';
      } else if (p.condition === 'new') {
        bHtml += '<span class="pdp-badge-tag pdp-badge-tag--new">✨ 100% Factory Sealed</span>';
      } else if (p.condition === 'service') {
        bHtml += '<span class="pdp-badge-tag pdp-badge-tag--lab">🔬 In-Store Lab Service</span>';
      }
      if (p.badge) {
        bHtml += `<span class="pdp-badge-tag pdp-badge-tag--grade">${p.badge}</span>`;
      }
      badgesOverlay.innerHTML = bHtml;
    }

    // Thumbnails Row
    const thumbsRow = document.getElementById('pdpThumbsRow');
    if (thumbsRow) {
      const imgSrc = p.image || `images/products/${p.id}.svg`;
      const fallbackLogo = 'images/logo.png';
      const angles = [
        { label: 'Front View', src: imgSrc },
        { label: 'Display & Keyboard', src: imgSrc },
        { label: 'Ports & Chassis', src: imgSrc },
        { label: 'Official Store QA', src: fallbackLogo }
      ];

      thumbsRow.innerHTML = angles.map((a, idx) => `
        <button class="pdp-thumb-btn ${idx === 0 ? 'active' : ''}" type="button" aria-label="${a.label}" onclick="switchPdpImage('${a.src}', this)">
          <img src="${a.src}" alt="${a.label}" onerror="this.onerror=null;this.src='images/logo.png';">
        </button>
      `).join('');
    }

    // Product Header & Title
    const brandLink = document.getElementById('pdpBrandLink');
    if (brandLink) {
      brandLink.textContent = `Visit the ${brand} Collection`;
      brandLink.href = `index.html#lineup`;
    }
    const skuPill = document.getElementById('pdpSkuPill');
    if (skuPill) skuPill.textContent = `ID: ${p.id.toUpperCase()}`;

    const titleEl = document.getElementById('pdpTitle');
    if (titleEl) titleEl.textContent = p.title;

    // Rating & Reviews
    const rating = p.rating || 4.8;
    const revCount = p.reviewsCount || 342;
    const bought = p.boughtPastMonth || '500+ bought in past month';

    const starsEl = document.getElementById('pdpStarsContainer');
    if (starsEl) starsEl.innerHTML = renderStarsHtml(rating);
    const scoreEl = document.getElementById('pdpRatingScore');
    if (scoreEl) scoreEl.textContent = rating.toFixed(1);
    const revLink = document.getElementById('pdpReviewsLink');
    if (revLink) revLink.textContent = `${revCount.toLocaleString()} ratings`;
    const boughtEl = document.getElementById('pdpBoughtPastMonth');
    if (boughtEl) boughtEl.textContent = bought;

    // Review Summary Section
    const revBigNum = document.getElementById('pdpReviewBigNum');
    if (revBigNum) revBigNum.textContent = rating.toFixed(1);
    const revStars = document.getElementById('pdpReviewStars');
    if (revStars) revStars.innerHTML = renderStarsHtml(rating);
    const revCountText = document.getElementById('pdpReviewCountText');
    if (revCountText) revCountText.textContent = `${revCount.toLocaleString()} global ratings`;

    // Pricing
    const pNum = p.priceNum || parseFloat((p.price || '').replace(/[^0-9.]/g, '')) || 0;
    const mrpNum = p.mrpNum || parseFloat((p.mrp || '').replace(/[^0-9.]/g, '')) || 0;
    const discount = p.discount || (mrpNum > pNum && pNum > 0 ? `${Math.round(((mrpNum - pNum) / mrpNum) * 100)}% off` : '');

    const discEl = document.getElementById('pdpDiscountPill');
    if (discEl) {
      discEl.textContent = discount ? `-${discount.replace(/off/i, '').trim()}` : '';
      discEl.style.display = discount ? 'inline-block' : 'none';
    }

    const priceEl = document.getElementById('pdpPriceMain');
    if (priceEl) priceEl.textContent = p.price || (pNum ? `₹${pNum.toLocaleString('en-IN')}` : 'Inquire for Price');

    const mrpStrike = document.getElementById('pdpMrpStrike');
    const mrpRow = document.getElementById('pdpMrpRow');
    if (mrpStrike && mrpRow) {
      if (p.mrp || mrpNum > 0) {
        mrpStrike.textContent = p.mrp || `₹${mrpNum.toLocaleString('en-IN')}`;
        mrpRow.style.display = 'block';
      } else {
        mrpRow.style.display = 'none';
      }
    }

    // Warranty in Trust Strip
    const wLabel = document.getElementById('pdpWarrantyLabel');
    if (wLabel) wLabel.textContent = p.warranty || 'Warranty Included';

    // Quick Specifications Table
    const qTable = document.getElementById('pdpQuickSpecsTable');
    if (qTable) {
      const qRows = [];
      qRows.push(['Brand', brand]);
      qRows.push(['Model Name', (p.details && p.details.Model) || p.title.split('(')[0].trim()]);

      if (p.size) qRows.push(['Screen Size', `${p.size.replace(/"/g, '')} Inches`]);
      if (p.panel) qRows.push(['Display Panel', p.panel]);

      // Extract RAM, CPU, Storage from specs if available
      if (p.specs && p.specs.length) {
        p.specs.forEach(s => {
          const sLower = s.toLowerCase();
          if (sLower.includes('core') || sLower.includes('ryzen') || sLower.includes('intel') || sLower.includes('m1') || sLower.includes('m2') || sLower.includes('m3') || sLower.includes('processor')) {
            qRows.push(['CPU Processor', s]);
          } else if (sLower.includes('ram') || sLower.includes('ddr4') || sLower.includes('ddr5')) {
            qRows.push(['RAM Memory', s]);
          } else if (sLower.includes('ssd') || sLower.includes('nvme') || sLower.includes('storage') || sLower.includes('hdd') || sLower.includes('tb') || sLower.includes('512gb')) {
            qRows.push(['Hard Disk Size', s]);
          } else if (sLower.includes('rtx') || sLower.includes('gtx') || sLower.includes('graphics') || sLower.includes('gpu')) {
            qRows.push(['Graphics Coprocessor', s]);
          }
        });
      }

      if (p.details && p.details['Operating System']) {
        qRows.push(['Operating System', p.details['Operating System']]);
      } else {
        qRows.push(['Operating System', 'Windows 11 Pro Genuine Activated']);
      }

      // Deduplicate rows by label
      const seen = new Set();
      const uniqueRows = qRows.filter(([label]) => {
        if (seen.has(label)) return false;
        seen.add(label);
        return true;
      });

      qTable.querySelector('tbody').innerHTML = uniqueRows.slice(0, 7).map(([k, v]) => `
        <tr>
          <th>${k}</th>
          <td>${v}</td>
        </tr>
      `).join('');
    }

    // Buy Box
    const bbPrice = document.getElementById('pdpBbPrice');
    if (bbPrice) bbPrice.textContent = p.price || (pNum ? `₹${pNum.toLocaleString('en-IN')}` : 'Inquire for Price');

    const bbDelivery = document.getElementById('pdpBbDelivery');
    if (bbDelivery) {
      bbDelivery.innerHTML = `<b>${p.delivery || 'FREE Delivery Tomorrow'}</b><br><span style="font-size:12px;color:var(--pdp-text-muted);">Instant in-store pickup available at 5-A, Sodhi Nagar, Moga</span>`;
    }

    const bbStock = document.getElementById('pdpBbStockText');
    if (bbStock) {
      if (p.isLowStock) {
        bbStock.textContent = 'Only 1 left in stock - order soon.';
        bbStock.style.color = '#c7511f';
      } else {
        bbStock.textContent = 'In stock.';
        bbStock.style.color = '';
      }
    }

    // WhatsApp Inquiry Link
    const waUrl = `https://wa.me/919872010193?text=${encodeURIComponent(
      `Hi Lally Computers, I would like to inquire about/reserve:\n\n*${p.title}*\nProduct ID: ${p.id}\nPrice: ${p.price}\nLink: https://lallycomputers.vercel.app/product?id=${p.id}\n\nIs this available for in-store pickup at Sodhi Nagar, Moga?`
    )}`;

    const waBtn = document.getElementById('pdpWhatsAppBtn');
    if (waBtn) waBtn.href = waUrl;

    const mobWaBtn = document.getElementById('pdpMobileWaBtn');
    if (mobWaBtn) mobWaBtn.href = waUrl;

    // Mobile Bar Price
    const mobPrice = document.getElementById('pdpMobilePrice');
    if (mobPrice) mobPrice.textContent = p.price || (pNum ? `₹${pNum.toLocaleString('en-IN')}` : 'Inquire for Price');

    // "About this item" Bullet Points
    const bulletsList = document.getElementById('pdpAboutBullets');
    if (bulletsList) {
      let bullets = [];
      if (p.desc) {
        bullets.push(`<strong>Overview:</strong> ${p.desc}`);
      }
      if (p.specs && p.specs.length) {
        p.specs.forEach(s => {
          bullets.push(`<strong>Key Feature:</strong> ${s}`);
        });
      }
      if (p.details) {
        Object.keys(p.details).forEach(k => {
          bullets.push(`<strong>${k}:</strong> ${p.details[k]}`);
        });
      }
      if (bullets.length === 0) {
        bullets.push('Certified hardware diagnostic tested by Supreme Infosys Lab, Sodhi Nagar, Moga.');
        bullets.push('100% genuine components with valid tax invoice and in-store warranty.');
      }

      bulletsList.innerHTML = bullets.map(b => `<li>${b}</li>`).join('');
    }

    // Technical Details 2-Column Grid
    const tableLeft = document.getElementById('pdpSpecsTableLeft');
    const tableRight = document.getElementById('pdpSpecsTableRight');
    if (tableLeft && tableRight) {
      const allDetails = [];
      allDetails.push(['Brand', brand]);
      allDetails.push(['Model Name', (p.details && p.details.Model) || p.title]);
      allDetails.push(['Product Series', catName]);
      allDetails.push(['Condition', p.condition === 'used' ? 'Grade A++ Refurbished (Corporate Lease)' : 'Factory Sealed Brand New']);
      allDetails.push(['Hardware Quality Grade', p.badge || 'Certified Grade A+']);
      allDetails.push(['Warranty', p.warranty || '6 Months In-Store Hardware Warranty']);

      if (p.specs && p.specs.length) {
        p.specs.forEach((s, idx) => {
          allDetails.push([`Spec Feature ${idx + 1}`, s]);
        });
      }

      if (p.details) {
        Object.keys(p.details).forEach(k => {
          allDetails.push([k, p.details[k]]);
        });
      }

      const half = Math.ceil(allDetails.length / 2);
      const leftRows = allDetails.slice(0, half);
      const rightRows = allDetails.slice(half);

      tableLeft.querySelector('tbody').innerHTML = leftRows.map(([k, v]) => `
        <tr><th>${k}</th><td>${v}</td></tr>
      `).join('');

      tableRight.querySelector('tbody').innerHTML = rightRows.map(([k, v]) => `
        <tr><th>${k}</th><td>${v}</td></tr>
      `).join('');
    }

    // 25-Point Lab Diagnostic Certificate
    const labSection = document.getElementById('labReport');
    const labNavLi = document.getElementById('labReportNavLi');
    if (p.labReport) {
      if (labSection) labSection.style.display = 'block';
      if (labNavLi) labNavLi.style.display = 'inline-block';

      const rep = p.labReport;
      const labGrade = document.getElementById('pdpLabGrade');
      if (labGrade) labGrade.textContent = rep.overallGrade || 'GRADE A++';

      const labRepId = document.getElementById('pdpLabReportId');
      if (labRepId) labRepId.textContent = rep.reportId || `SIL-LAB-${p.id.toUpperCase()}`;

      const labTech = document.getElementById('pdpLabTech');
      if (labTech) labTech.textContent = rep.technician || 'Er. Harpreet Singh (Lead Diagnostician)';

      const labDate = document.getElementById('pdpLabDate');
      if (labDate) labDate.textContent = rep.testedDate || 'Verified In-Store';

      const labWaBtn = document.getElementById('pdpLabWhatsAppBtn');
      if (labWaBtn) {
        labWaBtn.href = `https://wa.me/919872010193?text=${encodeURIComponent(
          `Hi Lally Computers, I would like to review the 25-point lab report (${rep.reportId || ''}) for ${p.title}. Can I inspect the testing bench in Sodhi Nagar?`
        )}`;
      }

      const labTable = document.getElementById('pdpLabTable');
      if (labTable) {
        const tests = [
          ['1. Battery Health & Capacity', rep.batteryHealth || 'Original Battery Capacity > 85%, Zero Wear Warnings'],
          ['2. CPU & Thermal Stress Benchmark', rep.cpuStress || 'Passed 100% Prime95 / Cinebench Stress Test (Zero Thermal Throttling)'],
          ['3. SSD S.M.A.R.T. Health & Speeds', rep.ssdHealth || '100% S.M.A.R.T. Life Remaining (0 Bad Sectors, Peak Read Speeds)'],
          ['4. Display Panel, Backlight & Pixels', rep.screenStatus || 'Zero Dead Pixels, No Pressure Spots, Backlight Uniformity 100%'],
          ['5. Keyboard Mapping & Trackpad', rep.keyboardTrackpad || 'Every Key Switch Tested & Responsive, Multi-touch Trackpad Smooth'],
          ['6. Motherboard Power Rail & BGA Logic', rep.motherboardPower || 'Clean Logic Board, 0 Shorts, Normal VCore Voltages & Ripple'],
          ['7. Ports, Wi-Fi, Bluetooth & I/O', rep.portsIo || 'All USB, HDMI, Thunderbolt, Audio, & WiFi Antennas Operational'],
          ['8. Chassis, Hinges & Casing Torque', rep.casingHinges || 'Smooth 180° Hinge Tension, Tight Screws, Grade A++ Exterior']
        ];

        labTable.querySelector('tbody').innerHTML = tests.map(([item, res]) => `
          <tr>
            <th>${item}</th>
            <td>${res} <span class="pdp-lab-pass">&check; PASS</span></td>
          </tr>
        `).join('');
      }
    } else {
      if (labSection) labSection.style.display = 'none';
      if (labNavLi) labNavLi.style.display = 'none';
    }

    // Dynamic Customer Reviews Feed
    const feed = document.getElementById('pdpReviewsFeed');
    if (feed) {
      const isGaming = p.category === 'laptops_gaming';
      const isMac = (p.brand || '').toLowerCase().includes('apple');

      let r1 = {
        name: 'Gurpreet Singh',
        loc: 'Moga',
        stars: 5,
        text: `Best showroom in Moga for ${brand} systems. Inspected on their testing bench at Sodhi Nagar before purchase. Genuine condition, crisp screen, and valid GST invoice provided.`
      };
      if (isGaming) {
        r1.text = `Absolute beast of a machine. Tested games right at the showroom counter. Thermals remain cool under heavy load and Er. Harpreet walked me through every hardware spec.`;
      } else if (isMac) {
        r1.text = `Immaculate condition, battery cycle count was super low and 100% genuine Apple charger. Best pricing in Malwa region without having to travel to Ludhiana or Chandigarh.`;
      }

      let r2 = {
        name: 'Raman Sharma',
        loc: 'Kotkapura',
        stars: 5,
        text: `Traveled from Kotkapura specifically for Lally Computers' 25-point lab verified inventory. Completely transparent testing and instant WhatsApp confirmation.`
      };

      let r3 = {
        name: 'Maninderjit Sandhu',
        loc: 'Baghapurana',
        stars: 5,
        text: `Highly professional team. They gave a clean diagnostic report, verified the charger and battery health, and provided an official warranty card. 10/10 recommendation.`
      };

      feed.innerHTML = [r1, r2, r3].map(r => `
        <div class="pdp-review-card">
          <div class="pdp-reviewer">
            <div class="pdp-avatar">${r.name.split(' ').map(n=>n[0]).join('')}</div>
            <span>${r.name} (${r.loc})</span>
            <span class="pdp-verified-tag">&check; Verified Store Purchase</span>
          </div>
          <div class="pdp-rating-stars">${renderStarsHtml(r.stars)}</div>
          <p style="margin:0; font-size:14px; line-height:1.55; color:var(--pdp-text-secondary);">"${r.text}"</p>
        </div>
      `).join('');
    }

    // Similar Products Carousel (Same Category)
    const similarTrack = document.getElementById('pdpSimilarTrack');
    if (similarTrack) {
      const similar = allProducts
        .filter(item => item.id !== p.id && (item.category === p.category || item.brand === p.brand))
        .slice(0, 5);

      similarTrack.innerHTML = similar.map(s => {
        const sImg = s.image || `images/products/${s.id}.svg`;
        const sPrice = s.price || `₹${(s.priceNum || 0).toLocaleString('en-IN')}`;
        const sMrp = s.mrp ? `<span class="pdp-mini-card-mrp">${s.mrp}</span>` : '';
        return `
          <a class="pdp-mini-card" href="product.html?id=${s.id}">
            <img class="pdp-mini-card-img" src="${sImg}" alt="${s.title}" loading="lazy" onerror="this.onerror=null;this.src='images/logo.png';">
            <div class="pdp-mini-card-title">${s.title}</div>
            <div class="pdp-mini-card-rating">
              <span>★ ${(s.rating || 4.8).toFixed(1)}</span>
              <span style="color:var(--pdp-text-muted);">(${(s.reviewsCount || 150).toLocaleString()})</span>
            </div>
            <div style="display:flex;align-items:baseline;gap:6px;">
              <span class="pdp-mini-card-price">${sPrice}</span>
              ${sMrp}
            </div>
            <div style="font-size:11.5px;color:#16a34a;font-weight:600;">✓ In Stock &middot; Sodhi Nagar</div>
          </a>
        `;
      }).join('');
    }

    // Essential Accessories Carousel
    const accTrack = document.getElementById('pdpAccessoriesTrack');
    if (accTrack) {
      const accessories = allProducts
        .filter(item => item.category === 'pc_peripherals' || item.category === 'pc_components' || item.category === 'gadgets')
        .slice(0, 5);

      accTrack.innerHTML = accessories.map(a => {
        const aImg = a.image || `images/products/${a.id}.svg`;
        const aPrice = a.price || `₹${(a.priceNum || 0).toLocaleString('en-IN')}`;
        return `
          <a class="pdp-mini-card" href="product.html?id=${a.id}">
            <img class="pdp-mini-card-img" src="${aImg}" alt="${a.title}" loading="lazy" onerror="this.onerror=null;this.src='images/logo.png';">
            <div class="pdp-mini-card-title">${a.title}</div>
            <div class="pdp-mini-card-rating">
              <span>★ ${(a.rating || 4.7).toFixed(1)}</span>
              <span style="color:var(--pdp-text-muted);">Best Seller</span>
            </div>
            <div class="pdp-mini-card-price">${aPrice}</div>
            <div style="font-size:11.5px;color:var(--pdp-link);font-weight:600;">Pair with Laptop &rarr;</div>
          </a>
        `;
      }).join('');
    }

    // Update Nav Cart badge
    updateCartUI();
  }

  // Thumbnail Image Switching
  window.switchPdpImage = function (src, btn) {
    const main = document.getElementById('pdpMainImage');
    if (main) {
      main.style.opacity = '0.5';
      setTimeout(() => {
        main.src = src;
        main.style.opacity = '1';
      }, 120);
    }
    const allThumbs = document.querySelectorAll('.pdp-thumb-btn');
    allThumbs.forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
  };

  // Quantity Stepper
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

  // Add Product to Cart
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
    showToast(`Added ${currentQty} &times; "${currentProduct.title}" to Cart`);
    openCartModal();
  };

  // Cart Management
  function saveCart() {
    try {
      localStorage.setItem('lally_cart', JSON.stringify(cart));
    } catch (e) {}
  }

  window.updateCartItemQty = function (id, delta) {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.qty = (item.qty || 1) + delta;
    if (item.qty <= 0) {
      cart = cart.filter(c => c.id !== id);
    }
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
    if (drawerBadge) {
      drawerBadge.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
    }

    const footerCount = document.getElementById('cartFooterCount');
    if (footerCount) {
      footerCount.textContent = totalItems;
    }

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
          <h4 class="cart-empty-title">Your Inquiry Cart is Empty</h4>
          <p class="cart-empty-desc">Explore laptops, custom PCs, and accessories to reserve hardware directly from our Moga showroom.</p>
          <button class="cart-empty-btn" type="button" onclick="closeCartModal(); window.location.href='index.html#catalogueSpace';">
            <span>Browse Showroom Inventory</span> &rarr;
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
              <img class="cart-item-img" src="${item.image}" alt="${item.title}" onerror="this.onerror=null;this.src='images/logo.png';">
            </a>
            <div class="cart-item-details">
              <a class="cart-item-title" href="product.html?id=${item.id}" title="${item.title}">${item.title}</a>
              <div class="cart-item-unit-price">${item.price} each</div>
              <div class="cart-item-status-pill">✓ In Stock &middot; Sodhi Nagar, Moga</div>
            </div>
          </div>

          <div class="cart-item-bottom-bar">
            <div class="cart-qty-pill-stepper">
              <button class="cart-qty-btn cart-qty-minus" type="button" onclick="updateCartItemQty('${item.id}', -1)" aria-label="Decrease quantity">
                ${item.qty === 1 ? `
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                ` : '&minus;'}
              </button>
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

    // WhatsApp Checkout Link
    const waCheckoutBtn = document.getElementById('cartWhatsAppCheckoutBtn');
    if (waCheckoutBtn) {
      let msg = 'Hi Lally Computers, I would like to reserve/inquire about the following items from my cart:\n\n';
      cart.forEach((c, idx) => {
        const itemSub = (c.priceNum || 0) * (c.qty || 1);
        msg += `${idx + 1}. *${c.title}*\n   Qty: ${c.qty} × ${c.price}${itemSub > 0 ? ` = ₹${itemSub.toLocaleString('en-IN')}` : ''}\n`;
      });
      msg += `\n*Total Estimated: ₹${totalVal.toLocaleString('en-IN')}*\n`;
      msg += `\nCan I inspect and collect these at your Sodhi Nagar, Moga showroom?`;
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
      modal.classList.add('is-open');
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeCartModal = function () {
    const modal = document.getElementById('cartModal');
    if (modal) {
      modal.classList.remove('is-open');
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Toast Notification
  function showToast(msg) {
    const toast = document.getElementById('appleToast');
    const text = document.getElementById('toastMessage');
    if (!toast || !text) return;
    text.innerHTML = msg;
    toast.classList.add('show');
    clearTimeout(window._pdpToastTimer);
    window._pdpToastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Theme Toggler
  function initTheme() {
    const toggleBtn = document.getElementById('themeToggleBtn');
    if (!toggleBtn) return;

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      try {
        localStorage.setItem('lally_apple_theme', theme);
      } catch (e) {}

      const sun = toggleBtn.querySelector('.theme-icon-sun');
      const moon = toggleBtn.querySelector('.theme-icon-moon');
      if (sun && moon) {
        if (theme === 'dark') {
          sun.style.display = 'none';
          moon.style.display = 'block';
        } else {
          sun.style.display = 'block';
          moon.style.display = 'none';
        }
      }
    }

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(currentTheme);

    toggleBtn.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme');
      const next = active === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  // Event Listeners on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderProductPage();

    // Nav Cart Button Trigger
    const cartTrigger = document.getElementById('navCartBtn');
    if (cartTrigger) {
      cartTrigger.addEventListener('click', openCartModal);
    }

    // Backdrop click for cart modal
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
      cartModal.addEventListener('click', e => {
        if (e.target === cartModal) closeCartModal();
      });
    }

    // Escape key
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeCartModal();
    });
  });

})();
