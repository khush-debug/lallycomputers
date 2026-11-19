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
├── index.html                  # Main webpage (Clean HTML5 structure)
├── css/
│   └── styles.css              # Consolidated design system, themes, and responsive rules
├── js/
│   ├── data.js                 # Centralized catalogue and inventory dataset
│   └── app.js                  # Store interactivity, cart, modals, search, and Google Sheets sync
├── categories.json             # 12 Store departments metadata
├── products.json               # 67 In-store verified products
├── stock-inventory-template.csv # Ready-to-use CSV template for managing stock in Google Sheets
├── hero-1080.mp4               # High-resolution raytraced 3D circuit board video (desktop)
├── hero-720.mp4                # Mobile-optimized circuit board video
├── hero-1080.webm              # High-resolution WebM fallback
├── hero-720.webm               # Mobile WebM fallback
├── poster.jpg                  # Poster image displayed before video loads
├── og.jpg                      # OpenGraph / social share preview image
├── favicon.svg                 # High-resolution vector circuit favicon
├── start.sh                    # One-click local preview launch script
├── package.json                # Node.js project manifest & scripts
├── vercel.json                 # 1-click Vercel deployment configuration
├── netlify.toml                # 1-click Netlify deployment configuration
└── hero-render-source/         # Python & WebGL2 source used to generate the 3D board
    ├── gen_board.py            # Generates procedural circuit-board textures
    ├── index.html              # WebGL2 raymarching renderer
    └── gltest.py               # WebGL test script
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

## ✨ Features

- **Raytraced 3D Hero Animation**: Procedurally rendered circuit board camera dolly with lightweight, muted looping video and poster fallbacks.
- **Responsive Layout**: Designed for ultra-wide screens down to compact mobile phones.
- **Theme Switcher**: Dark mode & Light mode toggle with automatic system preference detection and localStorage persistence.
- **WhatsApp Integration**: Direct click-to-chat links for inquiries on specific laptops, Apple Watches, repairs, and general quotes.
- **Real-Time Store Hours Badge**: Automatically calculates current Indian Standard Time (IST) to display whether the store is currently *Open* or *Closed*.
- **Embedded Google Maps**: Interactive map embed showing the exact location in Sodhi Nagar, Moga, Punjab with 1-click directions.
- **One-Click Phone Number Copy**: Easy contact copying with visual feedback.
- **SEO & Social Metadata**: Rich schema.org JSON-LD for local business, OpenGraph cards, Twitter preview cards, and semantic HTML5.

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
