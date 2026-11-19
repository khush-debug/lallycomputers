# Lally Computers (Supreme Infosys), Moga

Official website for **Supreme Infosys (Lally Computers)**, an electronics, computer sales, and repair store located at **5-A, Sodhi Nagar, Moga, Punjab 142001**.

---

## 🚀 Live Preview & Quick Start

You can run the website locally with zero dependencies using Python 3:

```bash
# Option 1: Run with start.sh
./start.sh

# Option 2: Or directly with python
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 📁 Project Structure

```
lallycomputers/
├── index.html                  # Main webpage (HTML5 semantic layout, Schema.org JSON-LD)
├── css/
│   └── styles.css              # Consolidated design system, dark/light themes, animations & responsive rules
├── js/
│   └── app.js                  # Store engine, cart, modals, search, Google Sheets sync & mobile popstate navigation
├── categories.json             # 13 Store department definitions & metadata
├── products.json               # 72 Curated in-store products & 25-Point Lab verification reports
├── stock-inventory-template.csv # 72-row ready-to-use CSV template for managing stock via Google Sheets
├── hero-720.mp4                # High-efficiency circuit board video fallback
├── hero-720.webm               # WebM video fallback
├── og.jpg                      # OpenGraph & social preview image (1200x630)
├── favicon.png                 # High-resolution app icon & touch icon
├── favicon.svg                 # Scalable vector favicon
├── manifest.json               # PWA web app manifest
├── privacy.html                # Privacy policy page
├── 404.html                    # Branded 404 not found page
├── robots.txt                  # Search engine crawl directives
├── sitemap.xml                 # XML sitemap with canonical endpoints
├── package.json                # Project manifest & metadata
├── vercel.json                 # Vercel Edge caching & security headers
└── start.sh                    # One-click local preview launch script
```

---

## 📊 Free & Zero-Token Stock Management (Google Sheets Sync)

You can add, edit, or remove store inventory at any time **without touching any code and without spending AI tokens**:

1. **Open Catalogue Space**: Click **"Browse Full Catalogue"** on the website.
2. **Click "Sync Google Sheet"**: Located in the top bar of the catalogue modal.
3. **Download Template**: Click **Download Template (.csv)** to get `stock-inventory-template.csv`.
4. **Import to Google Sheets**:
   - Go to [Google Sheets](https://sheets.new) and create a new spreadsheet.
   - Click **File > Import > Upload** and select `stock-inventory-template.csv`.
   - Click **Share** (top right) > change access to **"Anyone with the link can view"** > Copy link.
5. **Paste & Connect**: Paste your Google Sheet sharing link into the modal and click **Save & Sync Now**.

**How It Works:**
- Every time a customer visits the catalogue, the website fetches the latest inventory directly from your Google Sheet in real-time.
- Mark an item as `Sold` in the `status` column to remove it from stock.
- Add new rows to add new items.
- If Google Sheets is unavailable or offline, the site automatically falls back to the preloaded stock.

---

## ✨ Key Features & Architecture

- **Animated Geometric Mosaic Banner**: 8-tile modular hero featuring an animated mechanical keyboard typing LALLY, floating hardware chassis, split laptop with sheen sweep, GaN fast charger with breathing LED, rotating 12-node circuit ring, and diagnostic spheres. Fully adaptive across both light and dark modes.
- **Apple-Style Full-Width Frosted Mega-Menu**: Multi-column desktop flyout with backdrop blur, deep category linking, and slide-in mobile navigation drawer.
- **Zero-Cost Headless CMS (Google Sheets Sync)**: Live real-time inventory management through a standard Google Sheet via CORS-friendly Google Visualization API (`/gviz/tq?tqx=out:csv`). Zero hosting fees, zero backend database overhead, zero tokens.
- **25-Point Lab Diagnostic Reports**: Detailed hardware audit modal for pre-owned enterprise laptops (ThinkPads, Latitudes, EliteBooks, MacBooks) with component serial numbers, battery health, thermal testing, and grading.
- **Amazon-Style Dedicated Catalogue Space**: In-depth filterable product launcher by department, budget, brand, screen size, and refresh rate with real-time text search.
- **Mobile-Native UX & Android Back Button**: Full `popstate` History API integration. Tapping the phone's physical or on-screen Back button (`◁`) or back-swiping smoothly closes modals, sheets, and drawers without exiting the website.
- **WhatsApp Commerce Cart**: Customer adds items to basket and clicks checkout to generate a structured, formatted WhatsApp inquiry with item names, quantities, and pricing.
- **Local SEO & Rich Snippets**: Complete Schema.org `ComputerStore` JSON-LD, OpenGraph preview cards (`og.jpg`), Twitter metadata, `robots.txt`, and canonical XML sitemap.
- **Clean Apple-Grade Surfaces**: Polished solid light/dark theme backgrounds with zero noisy background canvas redraws or CPU overhead.

---

## 🌐 Free 1-Click Deployment

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel` (or link your GitHub repo at [vercel.com](https://vercel.com))
2. Run:
   ```bash
   vercel
   ```

### Deploy to Netlify
1. Drag and drop this folder directly into [app.netlify.com/drop](https://app.netlify.com/drop)
2. Or use Netlify CLI:
   ```bash
   netlify deploy --prod
   ```

### Deploy to GitHub Pages
1. Push this folder to a GitHub repository.
2. In **Settings > Pages**, set the source branch to `main` and root directory `/`.
