#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os

with open('/Users/khushmansingh/.gemini/antigravity/scratch/lally-computers-website/categories.json') as f:
    cat_data = json.load(f)
    categories = cat_data['categories']

with open('/Users/khushmansingh/.gemini/antigravity/scratch/lally-computers-website/products.json') as f:
    products = json.load(f)

print(f"Loaded {len(categories)} categories and {len(products)} products.")

# Build HTML
html = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lally Computers Moga | Supreme Infosys</title>
  <meta name="description" content="Lally Computers (Supreme Infosys) in Sodhi Nagar, Moga: browse new and pre-owned laptops with lab reports, custom PCs, components, gadgets, gym gear, and expert chip-level repairs.">
  <meta name="theme-color" content="#000000">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Lally Computers (Supreme Infosys), Moga">
  <meta property="og:description" content="Browse laptops with diagnostic lab reports, custom PCs, building materials, gadgets, and repair services at 5-A, Sodhi Nagar, Moga.">
  <meta property="og:image" content="og.jpg">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
  
  <style>
  /* ==========================================================================
     APPLE-INSPIRED DESIGN SYSTEM & VARIABLES
     ========================================================================== */
  :root {
    --bg-main: #000000;
    --bg-surface: #121214;
    --bg-surface-elevated: #1c1c1e;
    --bg-subtle: #242426;
    --border-subtle: rgba(255, 255, 255, 0.12);
    --border-strong: rgba(255, 255, 255, 0.24);
    --text-primary: #f5f5f7;
    --text-secondary: #86868b;
    --text-tertiary: #6e6e73;
    --apple-blue: #2997ff;
    --apple-blue-hover: #0077ed;
    --apple-gold: #f5c563;
    --circuit-green: #25d366;
    --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Hanken Grotesk", "Helvetica Neue", sans-serif;
    --font-mono: "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace;
    --nav-height: 52px;
    --max-w: 1180px;
    --radius-card: 18px;
    --radius-pill: 980px;
    color-scheme: dark;
  }

  :root[data-theme="light"] {
    --bg-main: #fbfbfd;
    --bg-surface: #ffffff;
    --bg-surface-elevated: #f5f5f7;
    --bg-subtle: #e8e8ed;
    --border-subtle: rgba(0, 0, 0, 0.08);
    --border-strong: rgba(0, 0, 0, 0.16);
    --text-primary: #1d1d1f;
    --text-secondary: #86868b;
    --text-tertiary: #a1a1a6;
    --apple-blue: #0071e3;
    --apple-blue-hover: #0077ed;
    --apple-gold: #b38600;
    color-scheme: light;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
  body {
    background: var(--bg-main);
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: 16px;
    line-height: 1.48;
    font-weight: 400;
    letter-spacing: -0.02em;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; text-decoration: none; }
  :focus-visible { outline: 2px solid var(--apple-blue); outline-offset: 3px; }

  .inner {
    width: 100%;
    max-width: var(--max-w);
    margin-inline: auto;
    padding-inline: max(22px, env(safe-area-inset-left, 0px));
  }

  /* ==========================================================================
     GLOBAL FROSTED NAVIGATION BAR
     ========================================================================== */
  .apple-nav {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: var(--nav-height);
    background: rgba(0, 0, 0, 0.78);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    border-bottom: 1px solid var(--border-subtle);
    z-index: 1000;
    transition: background 0.3s;
  }
  :root[data-theme="light"] .apple-nav {
    background: rgba(255, 255, 255, 0.82);
  }
  .apple-nav__inner {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
  }
  .nav-brand {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .nav-brand svg {
    width: 22px; height: 22px; color: var(--apple-blue); flex: none;
  }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    list-style: none;
  }
  .nav-links a {
    font-size: 13px;
    color: var(--text-secondary);
    transition: color 0.2s ease;
  }
  .nav-links a:hover { color: var(--text-primary); }
  .nav-actions {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }
  .nav-cat-space-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: var(--radius-pill);
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-subtle);
    color: var(--apple-blue);
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }
  .nav-cat-space-btn:hover {
    background: var(--bg-subtle);
    border-color: var(--apple-blue);
  }
  .nav-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 12px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: var(--radius-pill);
    background: var(--apple-blue);
    color: #ffffff !important;
    transition: background 0.2s, transform 0.15s;
  }
  .nav-cta-btn:hover {
    background: var(--apple-blue-hover);
    transform: scale(1.02);
  }
  .theme-toggle-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    padding: 6px;
    display: flex;
    align-items: center;
    cursor: pointer;
    border-radius: 50%;
    transition: color 0.2s;
  }
  .theme-toggle-btn:hover { color: var(--text-primary); }
  .theme-toggle-btn svg { width: 17px; height: 17px; }
  :root[data-theme="light"] .theme-toggle-btn .icon-sun { display: none; }
  :root[data-theme="light"] .theme-toggle-btn .icon-moon { display: block; }
  :root:not([data-theme="light"]) .theme-toggle-btn .icon-sun { display: block; }
  :root:not([data-theme="light"]) .theme-toggle-btn .icon-moon { display: none; }

  /* ==========================================================================
     HERO SECTION
     ========================================================================== */
  .hero-apple {
    position: relative;
    overflow: hidden;
    min-height: clamp(34rem, 80svh, 50rem);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding-bottom: clamp(3.5rem, 7vw, 5.5rem);
    color: #ffffff;
    background: #000000;
  }
  .hero-apple__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .hero-apple__bg img,
  .hero-apple__bg video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hero-apple__bg video { opacity: 0; transition: opacity 0.8s ease; }
  .hero-apple__bg video.is-on { opacity: 1; }
  .hero-apple__overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.85) 100%),
      linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%);
  }
  .hero-apple__content {
    position: relative;
    z-index: 2;
    max-width: 680px;
  }
  .hero-eyebrow {
    font-size: clamp(13px, 1.8vw, 15px);
    font-weight: 600;
    color: var(--apple-blue);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.5rem;
  }
  .hero-headline {
    font-size: clamp(2.6rem, 7.5vw, 4.8rem);
    line-height: 1.05;
    font-weight: 700;
    letter-spacing: -0.035em;
    color: #ffffff;
    margin-bottom: 0.9rem;
  }
  .hero-subhead {
    font-size: clamp(1.05rem, 2.2vw, 1.25rem);
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.85);
    max-width: 580px;
    margin-bottom: 1.8rem;
  }
  .hero-cta-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.9rem;
  }
  .apple-pill-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 11px 22px;
    border-radius: var(--radius-pill);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: transform 0.18s, background 0.18s;
  }
  .apple-pill-btn--primary {
    background: var(--apple-blue);
    color: #ffffff !important;
  }
  .apple-pill-btn--primary:hover {
    background: var(--apple-blue-hover);
    transform: scale(1.02);
  }
  .apple-pill-btn--secondary {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    color: #ffffff !important;
    border: 1px solid rgba(255, 255, 255, 0.25);
  }
  .apple-pill-btn--secondary:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.02);
  }
  .apple-pill-btn--whatsapp {
    background: #25d366;
    color: #072615 !important;
  }
  .apple-pill-btn--whatsapp:hover {
    background: #1ebc57;
    transform: scale(1.02);
  }
  .apple-pill-btn--whatsapp svg { width: 18px; height: 18px; }
  .apple-link-btn {
    font-size: 15px;
    color: var(--apple-blue);
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }
  .apple-link-btn:hover { text-decoration: underline; }

  .hero-badge-strip {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    margin-top: 1.6rem;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }
  .hero-badge-strip svg { width: 15px; height: 15px; color: var(--apple-gold); }

  /* ==========================================================================
     CHAPTER NAV / CATEGORY RIBBON
     ========================================================================== */
  .chapter-ribbon {
    position: sticky;
    top: var(--nav-height);
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: saturate(180%) blur(16px);
    -webkit-backdrop-filter: saturate(180%) blur(16px);
    border-bottom: 1px solid var(--border-subtle);
    z-index: 900;
    padding-block: 0.75rem;
  }
  :root[data-theme="light"] .chapter-ribbon {
    background: rgba(251, 251, 253, 0.85);
  }
  .chapter-ribbon__scroller {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.4rem;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding-inline: 4px;
  }
  .chapter-ribbon__scroller::-webkit-scrollbar { display: none; }
  .chap-item {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    padding: 7px 12px;
    border-radius: 12px;
    border: 1px solid transparent;
    color: var(--text-secondary);
    cursor: pointer;
    background: transparent;
    transition: color 0.18s, background 0.18s, border-color 0.18s;
  }
  .chap-item svg { width: 20px; height: 20px; flex: none; }
  .chap-item span {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }
  .chap-item:hover {
    color: var(--text-primary);
    background: var(--border-subtle);
  }
  .chap-item.is-active {
    color: var(--text-primary);
    background: var(--bg-surface-elevated);
    border-color: var(--border-subtle);
  }
  .chap-item.is-active span { font-weight: 600; color: var(--apple-blue); }

  /* ==========================================================================
     SECTION HEADINGS
     ========================================================================== */
  .apple-section {
    padding-block: clamp(3.2rem, 6vw, 5.5rem);
  }
  .apple-section--alt {
    background: var(--bg-surface);
  }
  .section-intro {
    max-width: 720px;
    margin-bottom: clamp(1.8rem, 4vw, 3rem);
  }
  .section-eyebrow {
    font-size: 13px;
    font-weight: 600;
    color: var(--apple-blue);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 0.4rem;
  }
  .section-headline {
    font-size: clamp(2rem, 4.5vw, 3.2rem);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.03em;
    color: var(--text-primary);
    margin-bottom: 0.6rem;
  }
  .section-desc {
    font-size: clamp(1rem, 1.8vw, 1.18rem);
    color: var(--text-secondary);
    line-height: 1.46;
  }

  /* ==========================================================================
     SEPARATE CATEGORY OPTIONS GRID (NORMAL VIEW - CLOSED BY DEFAULT)
     ========================================================================== */
  .category-options-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
  }
  .cat-opt-card {
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-card);
    padding: 1.6rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1.2rem;
    transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s;
  }
  .cat-opt-card:hover {
    transform: translateY(-3px);
    border-color: var(--border-strong);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
  .cat-opt-top {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .cat-opt-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.2rem;
  }
  .cat-opt-icon {
    width: 42px; height: 42px; border-radius: 12px;
    background: var(--bg-subtle); display: flex; align-items: center; justify-content: center;
    color: var(--apple-blue);
  }
  .cat-opt-icon svg { width: 22px; height: 22px; }
  .cat-opt-count-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: var(--radius-pill);
    background: var(--bg-subtle);
    color: var(--text-secondary);
  }
  .cat-opt-card h3 {
    font-size: 1.25rem; font-weight: 700; letter-spacing: -0.015em; color: var(--text-primary); margin: 0;
  }
  .cat-opt-card p {
    font-size: 13.5px; color: var(--text-secondary); line-height: 1.45;
  }
  .cat-opt-feature-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 11px;
    font-weight: 600;
    color: #34d399;
    background: rgba(52, 211, 153, 0.12);
    padding: 2px 8px;
    border-radius: var(--radius-pill);
    width: fit-content;
    margin-top: 2px;
  }
  .cat-opt-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-subtle);
  }
  .btn-open-cat {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: var(--radius-pill);
    background: var(--apple-blue);
    color: #ffffff !important;
    border: none;
    cursor: pointer;
    transition: background 0.18s, transform 0.15s;
  }
  .btn-open-cat:hover {
    background: var(--apple-blue-hover);
    transform: scale(1.02);
  }
  .btn-quick-wa {
    font-size: 12.5px;
    color: var(--text-secondary);
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }
  .btn-quick-wa:hover { color: #25d366; text-decoration: underline; }

  /* ==========================================================================
     DEDICATED IMMERSIVE CATALOGUE SPACE (OPENS SEPARATELY)
     ========================================================================== */
  .catalogue-space {
    display: none;
    position: relative;
    background: var(--bg-surface);
    border-top: 1px solid var(--border-subtle);
    border-bottom: 1px solid var(--border-subtle);
    padding-block: 2rem 4rem;
    animation: fadeIn 0.25s ease-out;
  }
  .catalogue-space.is-open { display: block; }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .space-top-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-subtle);
    margin-bottom: 1.5rem;
  }
  .space-title-group h2 {
    font-size: clamp(1.6rem, 3.5vw, 2.2rem);
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--text-primary);
  }
  .space-title-group p {
    font-size: 14px; color: var(--text-secondary); margin-top: 2px;
  }
  .space-top-actions {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }
  .btn-exit-space {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 18px;
    border-radius: var(--radius-pill);
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-strong);
    color: var(--text-primary);
    cursor: pointer;
    transition: background 0.18s, color 0.18s;
  }
  .btn-exit-space:hover {
    background: var(--bg-subtle);
    color: var(--apple-blue);
  }

  /* Category switcher inside dedicated space */
  .space-categories-scroller {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 1.2rem;
    margin-bottom: 1.4rem;
    border-bottom: 1px solid var(--border-subtle);
  }
  .space-categories-scroller::-webkit-scrollbar { display: none; }
  .space-cat-btn {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 12.5px;
    font-weight: 500;
    padding: 7px 15px;
    border-radius: var(--radius-pill);
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .space-cat-btn:hover {
    color: var(--text-primary);
    border-color: var(--border-strong);
  }
  .space-cat-btn.is-active {
    background: var(--apple-blue);
    border-color: var(--apple-blue);
    color: #ffffff;
    font-weight: 600;
  }

  /* Filter Panel */
  .filter-panel {
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-card);
    padding: 1.2rem;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .filter-panel-row {
    display: grid;
    grid-template-columns: 1.8fr repeat(4, 1fr) auto;
    gap: 0.8rem;
    align-items: center;
  }
  .filter-search-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .filter-search-wrap svg {
    position: absolute; left: 12px; width: 16px; height: 16px; color: var(--text-tertiary); pointer-events: none;
  }
  .filter-search-wrap input {
    width: 100%;
    padding: 8px 12px 8px 34px;
    border-radius: 8px;
    border: 1px solid var(--border-subtle);
    background: var(--bg-main);
    color: var(--text-primary);
    font-size: 13.5px;
    outline: none;
  }
  .filter-search-wrap input:focus { border-color: var(--apple-blue); }

  .filter-select {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--border-subtle);
    background: var(--bg-main);
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
    cursor: pointer;
  }
  .filter-select:focus { border-color: var(--apple-blue); }

  .btn-reset-filters {
    font-size: 12.5px;
    font-weight: 500;
    padding: 8px 14px;
    border-radius: 8px;
    background: var(--bg-subtle);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    cursor: pointer;
    white-space: nowrap;
    transition: color 0.18s, background 0.18s;
  }
  .btn-reset-filters:hover {
    color: var(--text-primary);
    background: var(--border-strong);
  }

  .filter-status-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: var(--text-secondary);
    padding-top: 0.4rem;
  }
  .active-filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .filter-tag {
    font-size: 11px;
    background: var(--bg-subtle);
    border: 1px solid var(--border-subtle);
    padding: 2px 8px;
    border-radius: 4px;
    color: var(--text-primary);
  }

  /* Product Cards Grid */
  .lineup-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.4rem;
  }
  .apple-card {
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-card);
    padding: 1.6rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1.3rem;
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  }
  .apple-card:hover {
    transform: translateY(-2px);
    border-color: var(--border-strong);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  }
  .card-top { display: flex; flex-direction: column; gap: 0.6rem; }
  .card-badge-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .apple-badge {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 3px 8px;
    border-radius: var(--radius-pill);
    background: var(--bg-subtle);
    color: var(--apple-blue);
  }
  .apple-badge--new { color: #34d399; background: rgba(52, 211, 153, 0.12); }
  .apple-badge--gold { color: var(--apple-gold); background: rgba(245, 197, 99, 0.12); }
  .card-warranty { font-size: 12px; color: var(--text-tertiary); }
  .card-title {
    font-size: 1.28rem; font-weight: 700; line-height: 1.22; letter-spacing: -0.015em; color: var(--text-primary);
  }
  .card-desc { font-size: 13.5px; color: var(--text-secondary); line-height: 1.45; }
  .card-spec-list {
    list-style: none; display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.3rem;
  }
  .card-spec-list li {
    font-size: 11px; font-family: var(--font-mono); padding: 3px 7px;
    background: var(--bg-main); border-radius: 4px; color: var(--text-primary);
    border: 1px solid var(--border-subtle);
  }

  .card-bottom {
    padding-top: 1rem; border-top: 1px solid var(--border-subtle);
    display: flex; flex-direction: column; gap: 0.8rem;
  }
  .card-price-row {
    display: flex; align-items: baseline; justify-content: space-between;
  }
  .card-price-label { font-size: 11px; text-transform: uppercase; color: var(--text-tertiary); }
  .card-price-val { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
  
  .card-actions {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 0.5rem;
  }
  .btn-card-wa {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem;
    font-size: 13px; font-weight: 600; padding: 8px 14px; border-radius: var(--radius-pill);
    background: #25d366; color: #072615 !important; transition: transform 0.15s, background 0.15s;
    text-align: center;
  }
  .btn-card-wa:hover { background: #1ebc57; transform: scale(1.02); }
  .btn-card-wa svg { width: 15px; height: 15px; flex: none; }
  .btn-card-specs {
    font-size: 13px; font-weight: 500; padding: 8px 13px; border-radius: var(--radius-pill);
    background: var(--bg-subtle); color: var(--text-primary); border: 1px solid var(--border-subtle);
    cursor: pointer; transition: background 0.15s;
  }
  .btn-card-specs:hover { background: var(--border-strong); }
  
  .btn-card-lab {
    display: inline-flex; align-items: center; gap: 0.35rem;
    font-size: 12.5px; font-weight: 600; padding: 8px 13px; border-radius: var(--radius-pill);
    background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3);
    cursor: pointer; transition: all 0.15s ease;
  }
  .btn-card-lab:hover {
    background: rgba(52, 211, 153, 0.25);
    border-color: #34d399;
  }

  /* ==========================================================================
     WHY US & REVIEWS & VISIT
     ========================================================================== */
  .why-grid {
    display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.25rem;
  }
  .why-card {
    background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle);
    border-radius: var(--radius-card); padding: 1.8rem 1.5rem; display: flex; flex-direction: column; gap: 0.9rem;
  }
  .why-icon {
    width: 44px; height: 44px; border-radius: 12px; background: var(--bg-subtle);
    display: flex; align-items: center; justify-content: center; color: var(--apple-blue); margin-bottom: 0.3rem;
  }
  .why-icon svg { width: 22px; height: 22px; }
  .why-card h3 { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); }
  .why-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.48; }

  .reviews-summary {
    display: flex; flex-wrap: wrap; align-items: baseline; gap: 1rem 1.8rem; margin-bottom: 2rem;
  }
  .reviews-score {
    font-size: clamp(3rem, 6vw, 4.2rem); font-weight: 800; color: var(--apple-gold); line-height: 1;
  }
  .reviews-meta { font-size: 14px; color: var(--text-secondary); }
  .reviews-meta a { color: var(--apple-blue); font-weight: 500; display: inline-block; margin-top: 3px; }
  .reviews-meta a:hover { text-decoration: underline; }
  .quotes-grid {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.25rem;
  }
  .quote-card {
    background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle);
    border-radius: var(--radius-card); padding: 1.8rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1.2rem;
  }
  .quote-card blockquote { font-size: 15.5px; line-height: 1.48; color: var(--text-primary); font-weight: 500; }
  .quote-author { font-size: 13px; color: var(--text-secondary); }
  .quote-author b { display: block; color: var(--text-primary); font-weight: 600; font-size: 14px; margin-bottom: 2px; }

  .store-panel {
    background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle);
    border-radius: var(--radius-card); padding: clamp(1.8rem, 4vw, 2.8rem); display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); gap: 2.5rem; align-items: start;
  }
  .store-info { display: flex; flex-direction: column; gap: 1.2rem; }
  .store-status-pill {
    display: inline-flex; align-items: center; gap: 0.5rem; font-size: 13px; font-weight: 600;
    padding: 6px 14px; border-radius: var(--radius-pill); background: var(--bg-subtle); border: 1px solid var(--border-subtle);
    width: fit-content;
  }
  .dot-status { width: 9px; height: 9px; border-radius: 50%; }
  .dot-open { background: #34d399; box-shadow: 0 0 8px #34d399; }
  .dot-closed { background: #f59e0b; }
  .store-title { font-size: clamp(1.8rem, 3.5vw, 2.4rem); font-weight: 700; }
  .store-address { font-style: normal; font-size: 15.5px; color: var(--text-secondary); line-height: 1.5; }
  .store-phone-link { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; color: var(--apple-blue); }
  .store-phone-link:hover { text-decoration: underline; }
  .store-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }

  .map-card {
    border-radius: 14px; overflow: hidden; border: 1px solid var(--border-subtle);
    height: 100%; min-height: 280px; background: var(--bg-main);
  }
  .map-card iframe { display: block; width: 100%; height: 100%; min-height: 280px; border: none; }

  .apple-footer {
    background: var(--bg-main); border-top: 1px solid var(--border-subtle);
    padding-block: 2.5rem; font-size: 12px; color: var(--text-tertiary);
  }
  .apple-footer__grid {
    display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.2rem;
  }
  .footer-fine { line-height: 1.5; border-top: 1px solid var(--border-subtle); padding-top: 1.2rem; }

  /* ==========================================================================
     MODALS: SPECS & LAB REPORT SHEET
     ========================================================================== */
  .modal-backdrop {
    position: fixed; inset: 0; z-index: 2000;
    background: rgba(0, 0, 0, 0.78); backdrop-filter: blur(14px);
    display: none; align-items: center; justify-content: center; padding: 1.2rem;
  }
  .modal-backdrop.is-open { display: flex; }
  .modal-sheet {
    background: var(--bg-surface); border: 1px solid var(--border-strong);
    border-radius: 20px; max-width: 640px; width: 100%; max-height: 88vh; overflow-y: auto;
    padding: clamp(1.6rem, 4vw, 2.4rem); position: relative; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
  }
  .modal-sheet-close {
    position: absolute; right: 1.2rem; top: 1.2rem; width: 32px; height: 32px; border-radius: 50%;
    border: none; background: var(--bg-subtle); color: var(--text-primary); display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.18s;
  }
  .modal-sheet-close:hover { background: var(--border-strong); }
  .modal-spec-table { width: 100%; border-collapse: collapse; margin: 1.2rem 0 1.5rem; }
  .modal-spec-table tr { border-bottom: 1px solid var(--border-subtle); }
  .modal-spec-table th, .modal-spec-table td { padding: 0.7rem 0.3rem; font-size: 13.5px; text-align: left; }
  .modal-spec-table th { color: var(--text-tertiary); font-weight: 500; width: 34%; }
  .modal-spec-table td { color: var(--text-primary); }

  /* LAB REPORT CERTIFICATE STYLING */
  .lab-cert-header {
    background: linear-gradient(135deg, rgba(52, 211, 153, 0.12) 0%, rgba(41, 151, 255, 0.08) 100%);
    border: 1px solid rgba(52, 211, 153, 0.3);
    border-radius: 14px;
    padding: 1.2rem;
    margin: 1rem 0 1.5rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  .lab-cert-id {
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    color: #34d399;
  }
  .lab-grade-badge {
    font-size: 14px;
    font-weight: 700;
    color: #072615;
    background: #34d399;
    padding: 5px 14px;
    border-radius: var(--radius-pill);
    box-shadow: 0 0 12px rgba(52, 211, 153, 0.4);
  }
  .lab-check-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.4rem;
  }
  .lab-check-table tr {
    border-bottom: 1px solid var(--border-subtle);
  }
  .lab-check-table td {
    padding: 0.65rem 0.3rem;
    font-size: 13px;
    vertical-align: top;
  }
  .lab-point-name {
    font-weight: 600;
    color: var(--text-primary);
    width: 32%;
  }
  .lab-point-result {
    color: var(--text-secondary);
  }
  .lab-pass-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 700;
    color: #34d399;
    background: rgba(52, 211, 153, 0.12);
    padding: 2px 7px;
    border-radius: 4px;
    float: right;
  }
  .lab-inspector-box {
    border-top: 1px dashed var(--border-subtle);
    padding-top: 1rem;
    margin-top: 0.8rem;
    font-size: 12px;
    color: var(--text-tertiary);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .wa-float-apple {
    position: fixed; bottom: 24px; right: 24px; z-index: 800;
    display: flex; align-items: center; gap: 8px; background: #25d366; color: #072615 !important;
    font-size: 14px; font-weight: 600; padding: 11px 18px; border-radius: var(--radius-pill);
    box-shadow: 0 4px 20px rgba(0,0,0,0.35); transition: transform 0.2s, box-shadow 0.2s;
  }
  .wa-float-apple:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 6px 26px rgba(37, 211, 102, 0.4); }
  .wa-float-apple svg { width: 20px; height: 20px; }

  /* Responsive styles */
  @media (max-width: 1040px) {
    .filter-panel-row { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 960px) {
    .category-options-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .why-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .quotes-grid { grid-template-columns: minmax(0, 1fr); }
    .store-panel { grid-template-columns: minmax(0, 1fr); }
  }
  @media (max-width: 640px) {
    .category-options-grid { grid-template-columns: minmax(0, 1fr); }
    .lineup-grid { grid-template-columns: minmax(0, 1fr); }
    .why-grid { grid-template-columns: minmax(0, 1fr); }
    .filter-panel-row { grid-template-columns: 1fr; }
    .nav-links { display: none; }
    .card-actions { grid-template-columns: 1fr; }
    .wa-float-apple span { display: none; }
    .wa-float-apple { padding: 12px; border-radius: 50%; }
  }
  </style>
</head>
<body>

  <!-- ========================================================================
       APPLE GLOBAL TOP NAVIGATION
       ======================================================================== -->
  <header class="apple-nav">
    <div class="inner apple-nav__inner">
      <a class="nav-brand" href="#top">
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor">
          <rect x="14" y="14" width="36" height="36" rx="8" stroke-width="3.6"/>
          <path d="M8 24h6M8 32h6M8 40h6M50 24h6M50 32h6M50 40h6" stroke-width="3.2" stroke-linecap="round"/>
          <path d="M26 21v16l6 6h8" stroke="currentColor" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="40" cy="43" r="3.4" fill="currentColor" stroke="none"/>
        </svg>
        <span>Lally Computers</span>
      </a>

      <nav aria-label="Main Navigation">
        <ul class="nav-links">
          <li><a href="#lineup">Departments</a></li>
          <li><a href="#why">Why Supreme</a></li>
          <li><a href="#reviews">Reviews</a></li>
          <li><a href="#visit">Location</a></li>
        </ul>
      </nav>

      <div class="nav-actions">
        <button class="nav-cat-space-btn" type="button" onclick="openCatalogueSpace('laptops_used')">
          <span>Explore Stock &rarr;</span>
        </button>
        <button id="themeToggle" class="theme-toggle-btn" type="button" aria-label="Toggle dark/light mode">
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <a class="nav-cta-btn" href="tel:+919872010193">Call</a>
      </div>
    </div>
  </header>

  <!-- ========================================================================
       HERO SECTION
       ======================================================================== -->
  <section class="hero-apple" id="top">
    <div class="hero-apple__bg">
      <img src="poster.jpg" width="1600" height="900" alt="" fetchpriority="high">
      <video id="heroVideo" muted loop playsinline autoplay preload="auto" poster="poster.jpg" aria-hidden="true"></video>
      <div class="hero-apple__overlay"></div>
    </div>

    <div class="inner">
      <div class="hero-apple__content">
        <p class="hero-eyebrow">Supreme Infosys &middot; Sodhi Nagar, Moga</p>
        <h1 class="hero-headline">Lally Computers.</h1>
        <p class="hero-subhead">Certified pre-owned laptops with 25-point lab reports, factory-sealed new laptops, custom PC rigs, gaming components, gadgets, gym gear, and chip-level repairs.</p>
        
        <div class="hero-cta-group">
          <button class="apple-pill-btn apple-pill-btn--primary" type="button" onclick="openCatalogueSpace('laptops_used')">
            Open Catalogue Space
          </button>
          <a class="apple-pill-btn apple-pill-btn--secondary" href="#lineup">
            View 12 Departments ↓
          </a>
          <a class="apple-pill-btn apple-pill-btn--whatsapp" href="https://wa.me/919872010193?text=Hi%20Lally%20Computers%2C%20I%20have%20an%20enquiry%20regarding%20in-store%20stock." target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.677.15-.2.301-.777.98-.952 1.18-.175.201-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.894-.799-1.498-1.786-1.674-2.087-.175-.3-.019-.463.132-.612.136-.134.301-.351.451-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.631-.928-2.233-.244-.585-.493-.506-.677-.515-.175-.009-.376-.011-.577-.011-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.91 1.228 3.111.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.379.197 1.898.12.579-.086 1.782-.728 2.033-1.431.251-.703.251-1.305.175-1.431-.075-.126-.276-.201-.577-.351zM12.04 2C6.516 2 2.023 6.49 2.023 12.013c0 1.942.555 3.756 1.517 5.292L2 22l4.834-1.503a10.007 10.007 0 0 0 5.206 1.516c5.524 0 10.017-4.49 10.017-10.013C22.057 6.49 17.564 2 12.04 2z"/></svg>
            <span>WhatsApp Us</span>
          </a>
        </div>

        <div class="hero-badge-strip">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>
          <span><b>4.2</b> rating from 709 reviews on Google &middot; GST Bill Included</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================
       APPLE CHAPTER NAV / ICON RIBBON
       ======================================================================== -->
  <nav class="chapter-ribbon" aria-label="Lineup Categories">
    <div class="inner">
      <div class="chapter-ribbon__scroller" id="categoryScroller">
'''

for cat in categories:
    html += f'''        <button class="chap-item" onclick="openCatalogueSpace('{cat["id"]}')">
          {cat["icon"]}
          <span>{cat["name"]}</span>
        </button>
'''

html += '''      </div>
    </div>
  </nav>

  <!-- ========================================================================
       DEDICATED IMMERSIVE CATALOGUE SPACE (OPENS SEPARATELY)
       ======================================================================== -->
  <section class="catalogue-space" id="catalogueSpace">
    <div class="inner">
      
      <!-- Top control bar -->
      <div class="space-top-bar">
        <div class="space-title-group">
          <p class="section-eyebrow" id="spaceEyebrow">Department Inventory</p>
          <h2 id="spaceTitle">Pre-Owned Laptops</h2>
          <p id="spaceDesc">Certified corporate lease returns with 25-point hardware diagnostic lab reports.</p>
        </div>
        <div class="space-top-actions">
          <button class="btn-exit-space" type="button" onclick="closeCatalogueSpace()">
            <span>&larr; Back to Overview</span>
          </button>
        </div>
      </div>

      <!-- Category Pills Switcher inside Space -->
      <div class="space-categories-scroller" id="spaceCatScroller">
'''

for cat in categories:
    html += f'''        <button class="space-cat-btn" data-cat="{cat["id"]}" onclick="switchSpaceCategory('{cat["id"]}')">
          {cat["name"]} ({cat["count"]})
        </button>
'''

html += '''      </div>

      <!-- Multi-Faceted Filter Panel -->
      <div class="filter-panel">
        <div class="filter-panel-row">
          <div class="filter-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="spaceSearchInput" placeholder="Search by model, specs, brand..." aria-label="Search stock">
          </div>

          <select class="filter-select" id="brandFilterSelect" onchange="applyFilters()">
            <option value="">All Brands</option>
            <option value="Apple">Apple</option>
            <option value="Lenovo">Lenovo</option>
            <option value="Dell">Dell</option>
            <option value="HP">HP</option>
            <option value="Asus">Asus</option>
            <option value="Samsung">Samsung</option>
            <option value="LG">LG</option>
            <option value="ZOTAC">ZOTAC</option>
            <option value="Corsair">Corsair</option>
            <option value="Logitech">Logitech</option>
            <option value="Casio">Casio</option>
            <option value="Custom Rig">Custom Rig</option>
            <option value="Safari">Safari</option>
            <option value="Fitline">Fitline</option>
          </select>

          <select class="filter-select" id="budgetFilterSelect" onchange="applyFilters()">
            <option value="">All Budgets</option>
            <option value="under-5k">Under ₹5,000</option>
            <option value="5k-20k">₹5,000 - ₹20,000</option>
            <option value="20k-40k">₹20,000 - ₹40,000</option>
            <option value="40k-75k">₹40,000 - ₹75,000</option>
            <option value="50k-80k">₹50,000 - ₹80,000</option>
            <option value="80k+">₹80,000 & Above</option>
          </select>

          <select class="filter-select" id="sizeFilterSelect" onchange="applyFilters()">
            <option value="">All Sizes</option>
            <option value="13-14">13" - 14" Display</option>
            <option value="15-16">15" - 16" Display</option>
            <option value="24">24" Monitor</option>
            <option value="27">27" Monitor</option>
            <option value="32+">32"+ Screen / TV</option>
            <option value="Cabin 20\"">Cabin Carry-On (20")</option>
            <option value="Full Set">Full Luggage Set (3-Pcs)</option>
          </select>

          <select class="filter-select" id="panelFilterSelect" onchange="applyFilters()">
            <option value="">All Panels / Types</option>
            <option value="IPS">IPS Panel</option>
            <option value="OLED">OLED / Retina</option>
            <option value="144Hz+">144Hz+ High Refresh</option>
            <option value="Curved">Curved Display</option>
            <option value="LED/LCD">Smart TV LED/LCD</option>
            <option value="Classic Non-Display">Classic Non-Display Watch</option>
            <option value="Smart OLED">Smartwatch (OLED/Retina)</option>
            <option value="Graphic Card">Graphic Card (GPU)</option>
            <option value="Cabinet">PC Cabinet</option>
            <option value="Power Supply">Power Supply (PSU)</option>
            <option value="Mouse">Mouse</option>
            <option value="Keyboard">Keyboard</option>
            <option value="Laptop Stand">Laptop Stand</option>
            <option value="Front Load">Front Load Washer</option>
            <option value="Top Load">Top Load Washer</option>
          </select>

          <button class="btn-reset-filters" type="button" onclick="resetFilters()">
            Reset Filters
          </button>
        </div>

        <div class="filter-status-strip">
          <span id="resultsCount">Showing items...</span>
          <div class="active-filter-tags" id="activeFilterTags"></div>
        </div>
      </div>

      <!-- Product Cards Grid -->
      <div class="lineup-grid" id="spaceLineupGrid">
        <!-- Rendered dynamically -->
      </div>

    </div>
  </section>

  <!-- ========================================================================
       STOCK LINEUP (SEPARATE CATEGORY OPTIONS - CLOSED BY DEFAULT)
       ======================================================================== -->
  <section class="apple-section" id="lineup">
    <div class="inner">
      <div class="section-intro">
        <p class="section-eyebrow">In-Store Departments</p>
        <h2 class="section-headline">Explore the Departments.</h2>
        <p class="section-desc">Click any category below to open its dedicated catalogue space with detailed specs, verified lab reports, and live WhatsApp inquiry.</p>
      </div>

      <!-- 12 SEPARATE CATEGORY OPTIONS GRID -->
      <div class="category-options-grid" id="categoryOptionsGrid">
'''

for cat in categories:
    html += f'''        <div class="cat-opt-card" onclick="openCatalogueSpace('{cat["id"]}')">
          <div class="cat-opt-top">
            <div class="cat-opt-header-row">
              <div class="cat-opt-icon">
                {cat["icon"]}
              </div>
              <span class="cat-opt-count-badge">{cat["count"]} Items</span>
            </div>
            <h3>{cat["name"]}</h3>
            <span class="cat-opt-feature-tag">{cat["badge"]}</span>
            <p>{cat["desc"]}</p>
          </div>
          <div class="cat-opt-actions">
            <button class="btn-open-cat" type="button">Open Stock ({cat["count"]}) &rarr;</button>
            <a class="btn-quick-wa" href="https://wa.me/919872010193?text=Hi%20Lally%20Computers%2C%20what%20do%20you%20have%20in%20{cat['name'].replace('&', 'and')}%3F" target="_blank" rel="noopener" onclick="event.stopPropagation()">Inquire on WhatsApp</a>
          </div>
        </div>
'''

html += '''      </div>
    </div>
  </section>

  <!-- ========================================================================
       WHY LALLY COMPUTERS (APPLE FEATURE GRID)
       ======================================================================== -->
  <section class="apple-section apple-section--alt" id="why">
    <div class="inner">
      <div class="section-intro">
        <p class="section-eyebrow">The Experience</p>
        <h2 class="section-headline">Why Supreme Infosys.</h2>
        <p class="section-desc">Trusted by students, professionals, and businesses across Moga since 2008.</p>
      </div>

      <div class="why-grid">
        <div class="why-card">
          <div class="why-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3>25-Point Lab Verified</h3>
          <p>Every pre-owned laptop is benchmarked in our in-house lab: battery health %, CPU thermal limits, SSD health 100%, and logic board stability.</p>
        </div>

        <div class="why-card">
          <div class="why-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <h3>GST Tax Invoices</h3>
          <p>100% genuine legal billing for all laptops, desktop rigs, appliances, and components so you can claim business input tax credit.</p>
        </div>

        <div class="why-card">
          <div class="why-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <h3>Chip-Level Lab</h3>
          <p>In-house precision SMD soldering, BGA rework, and motherboard diagnostics. Fast turnaround for dead laptops and screen swaps.</p>
        </div>

        <div class="why-card">
          <div class="why-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h3>After-Sale Support</h3>
          <p>Customers stay with us for decades because we stand behind every machine sold with prompt warranty assistance and software support.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================
       CUSTOMER REVIEWS
       ======================================================================== -->
  <section class="apple-section" id="reviews">
    <div class="inner">
      <div class="section-intro">
        <p class="section-eyebrow">Google Reviews</p>
        <h2 class="section-headline">Customer Words.</h2>
      </div>

      <div class="reviews-summary">
        <div class="reviews-score">4.2</div>
        <div class="reviews-meta">
          <span>Overall rating based on <b>709 Google Reviews</b></span><br>
          <a href="https://www.google.com/maps/search/?api=1&amp;query=Supreme%20Infosys%20(Lally%20Computers)%20Moga" target="_blank" rel="noopener">Read all reviews on Google &rarr;</a>
        </div>
      </div>

      <div class="quotes-grid">
        <div class="quote-card">
          <blockquote>"Lallycomputers is the best store in Moga for genuine laptops and builds."</blockquote>
          <div class="quote-author">
            <b>Anmol Saini</b>
            <span>Local Guide &middot; Google review</span>
          </div>
        </div>

        <div class="quote-card">
          <blockquote>"We are regular customer from 2008. Very good service and honest pricing."</blockquote>
          <div class="quote-author">
            <b>Brar Balli</b>
            <span>Verified Customer &middot; Google review</span>
          </div>
        </div>

        <div class="quote-card">
          <blockquote>"Best price with GST Bill &hellip; best for after-sale service and chip-level repairs."</blockquote>
          <div class="quote-author">
            <b>Lovepreet Singh Ramghariya</b>
            <span>Local Guide &middot; Google review</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================
       STORE LOCATION & LIVE STATUS
       ======================================================================== -->
  <section class="apple-section apple-section--alt" id="visit">
    <div class="inner">
      <div class="store-panel">
        <div class="store-info">
          <div id="storeBadge" class="store-status-pill">
            <span class="dot-status dot-open"></span>
            <span id="storeStatusText">Open Now &middot; Closes at 7:00 PM</span>
          </div>

          <h2 class="store-title">Visit the Store.</h2>
          <address class="store-address">
            Supreme Infosys (Lally Computers)<br>
            5-A, Sodhi Nagar<br>
            Moga, Punjab 142001
          </address>

          <div>
            <p style="font-size:12px; text-transform:uppercase; color:var(--text-tertiary); letter-spacing:0.05em; margin-bottom:4px;">Direct Phone</p>
            <a class="store-phone-link" href="tel:+919872010193">098720 10193</a>
          </div>

          <div class="store-actions">
            <a class="apple-pill-btn apple-pill-btn--primary" href="https://www.google.com/maps/dir/?api=1&amp;destination=Supreme%20Infosys%20(Lally%20Computers)%2C%205-A%2C%20Sodhi%20Nagar%2C%20Moga%2C%20Punjab%20142001" target="_blank" rel="noopener">
              Get Directions &rarr;
            </a>
            <a class="apple-pill-btn apple-pill-btn--whatsapp" href="https://wa.me/919872010193?text=Hi%20Lally%20Computers%2C%20are%20you%20open%20today%3F" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.677.15-.2.301-.777.98-.952 1.18-.175.201-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.894-.799-1.498-1.786-1.674-2.087-.175-.3-.019-.463.132-.612.136-.134.301-.351.451-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.631-.928-2.233-.244-.585-.493-.506-.677-.515-.175-.009-.376-.011-.577-.011-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.91 1.228 3.111.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.379.197 1.898.12.579-.086 1.782-.728 2.033-1.431.251-.703.251-1.305.175-1.431-.075-.126-.276-.201-.577-.351zM12.04 2C6.516 2 2.023 6.49 2.023 12.013c0 1.942.555 3.756 1.517 5.292L2 22l4.834-1.503a10.007 10.007 0 0 0 5.206 1.516c5.524 0 10.017-4.49 10.017-10.013C22.057 6.49 17.564 2 12.04 2z"/></svg>
              <span>Confirm on WhatsApp</span>
            </a>
          </div>
        </div>

        <div class="map-card">
          <iframe
            title="Supreme Infosys Sodhi Nagar Moga Map"
            src="https://maps.google.com/maps?q=Supreme+Infosys+5-A+Sodhi+Nagar+Moga+Punjab+142001&t=&z=15&ie=UTF8&iwloc=&output=embed"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================
       APPLE FOOTER
       ======================================================================== -->
  <footer class="apple-footer">
    <div class="inner">
      <div class="apple-footer__grid">
        <span>&copy; Supreme Infosys (Lally Computers). All rights reserved.</span>
        <span>5-A, Sodhi Nagar, Moga, Punjab 142001 &middot; Tel: 098720 10193</span>
      </div>
      <div class="footer-fine">
        Disclaimer: This website serves as an in-store showcase for inventory availability, 25-point lab test results, and repair consultations. No online purchases or payments are conducted on this website. Customer reviews are quoted as submitted on Google Maps.
      </div>
    </div>
  </footer>

  <!-- ========================================================================
       SPECS MODAL (APPLE SHEET)
       ======================================================================== -->
  <div class="modal-backdrop" id="appleModal" role="dialog" aria-modal="true">
    <div class="modal-sheet">
      <button class="modal-sheet-close" id="modalCloseBtn" aria-label="Close details">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <p style="font-size:12px; text-transform:uppercase; letter-spacing:0.06em; color:var(--apple-blue); font-weight:600;" id="modalCategory"></p>
      <h3 style="font-size:1.6rem; font-weight:700; margin:0.3rem 0 0.8rem; letter-spacing:-0.02em;" id="modalTitle"></h3>
      <p style="font-size:13.5px; color:var(--text-secondary); margin-bottom:1.2rem;" id="modalDesc"></p>

      <table class="modal-spec-table" id="modalTable">
        <tbody></tbody>
      </table>

      <div style="display:flex; flex-wrap:wrap; gap:0.75rem;">
        <a class="apple-pill-btn apple-pill-btn--whatsapp" id="modalWaBtn" href="#" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.677.15-.2.301-.777.98-.952 1.18-.175.201-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.894-.799-1.498-1.786-1.674-2.087-.175-.3-.019-.463.132-.612.136-.134.301-.351.451-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.631-.928-2.233-.244-.585-.493-.506-.677-.515-.175-.009-.376-.011-.577-.011-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.91 1.228 3.111.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.379.197 1.898.12.579-.086 1.782-.728 2.033-1.431.251-.703.251-1.305.175-1.431-.075-.126-.276-.201-.577-.351zM12.04 2C6.516 2 2.023 6.49 2.023 12.013c0 1.942.555 3.756 1.517 5.292L2 22l4.834-1.503a10.007 10.007 0 0 0 5.206 1.516c5.524 0 10.017-4.49 10.017-10.013C22.057 6.49 17.564 2 12.04 2z"/></svg>
          <span>Inquire on WhatsApp</span>
        </a>
        <a class="apple-pill-btn apple-pill-btn--primary" href="tel:+919872010193">
          Call Store
        </a>
      </div>
    </div>
  </div>

  <!-- ========================================================================
       LAB REPORT DIAGNOSTIC SHEET MODAL (FOR PRE-OWNED LAPTOPS)
       ======================================================================== -->
  <div class="modal-backdrop" id="labReportModal" role="dialog" aria-modal="true">
    <div class="modal-sheet">
      <button class="modal-sheet-close" id="labModalCloseBtn" aria-label="Close lab report">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.3rem;">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#34d399" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
        <span style="font-size:12px; text-transform:uppercase; letter-spacing:0.07em; color:#34d399; font-weight:700;">Supreme Infosys Diagnostic Lab</span>
      </div>
      
      <h3 style="font-size:1.6rem; font-weight:700; margin:0 0 0.4rem; letter-spacing:-0.02em;" id="labLaptopTitle">Lenovo ThinkPad T480</h3>
      <p style="font-size:13.5px; color:var(--text-secondary); margin-bottom:1rem;">25-Point Physical, Electrical, and Stress Benchmarking Report.</p>

      <div class="lab-cert-header">
        <div>
          <div style="font-size:11px; text-transform:uppercase; color:var(--text-tertiary); letter-spacing:0.05em;">Verification Report ID</div>
          <div class="lab-cert-id" id="labReportId">SIL-LAB-9102</div>
          <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;" id="labTestedDate">Inspected: 12-Nov-2024</div>
        </div>
        <div>
          <span class="lab-grade-badge" id="labOverallGrade">GRADE A++ (98/100)</span>
        </div>
      </div>

      <table class="lab-check-table">
        <tbody>
          <tr>
            <td class="lab-point-name">Battery Health</td>
            <td class="lab-point-result">
              <span id="labBattery">92% Capacity (218 Cycles, High Health)</span>
              <span class="lab-pass-tag">&check; PASSED</span>
            </td>
          </tr>
          <tr>
            <td class="lab-point-name">CPU Thermal Stress</td>
            <td class="lab-point-result">
              <span id="labCpu">Peak 67&deg;C under Prime95 (0% Throttling)</span>
              <span class="lab-pass-tag">&check; PASSED</span>
            </td>
          </tr>
          <tr>
            <td class="lab-point-name">Storage S.M.A.R.T.</td>
            <td class="lab-point-result">
              <span id="labSsd">100% Health, 0 Bad Blocks, 3180 MB/s Read</span>
              <span class="lab-pass-tag">&check; PASSED</span>
            </td>
          </tr>
          <tr>
            <td class="lab-point-name">Display &amp; Backlight</td>
            <td class="lab-point-result">
              <span id="labScreen">0 Dead Pixels, 0 White Spots, Uniform Backlight</span>
              <span class="lab-pass-tag">&check; PASSED</span>
            </td>
          </tr>
          <tr>
            <td class="lab-point-name">Keyboard &amp; Trackpad</td>
            <td class="lab-point-result">
              <span id="labKeyboard">All keys mapped &amp; responsive, Multi-touch gestures OK</span>
              <span class="lab-pass-tag">&check; PASSED</span>
            </td>
          </tr>
          <tr>
            <td class="lab-point-name">Motherboard &amp; Power</td>
            <td class="lab-point-result">
              <span id="labMotherboard">0 Short-circuits, DC ripple &lt; 15mV, Clean logic board</span>
              <span class="lab-pass-tag">&check; PASSED</span>
            </td>
          </tr>
          <tr>
            <td class="lab-point-name">Ports &amp; Connectivity</td>
            <td class="lab-point-result">
              <span id="labPorts">Thunderbolt / USB-C, HDMI, Wi-Fi 6, Audio all operational</span>
              <span class="lab-pass-tag">&check; PASSED</span>
            </td>
          </tr>
          <tr>
            <td class="lab-point-name">Chassis &amp; 180&deg; Hinges</td>
            <td class="lab-point-result">
              <span id="labCasing">Firm alloy hinges, 0 cracks, Clean cooling assembly</span>
              <span class="lab-pass-tag">&check; PASSED</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="lab-inspector-box">
        <div>
          <span>Verified By: </span><b style="color:var(--text-primary);" id="labTechnician">Er. Harpreet Singh</b><br>
          <span>Laboratory: Supreme Infosys Quality Center, Sodhi Nagar, Moga</span>
        </div>
        <div style="text-align:right;">
          <span style="color:#34d399; font-weight:600;">6 Mos Store Warranty</span>
        </div>
      </div>

      <div style="margin-top:1.5rem; display:flex; flex-wrap:wrap; gap:0.75rem;">
        <a class="apple-pill-btn apple-pill-btn--whatsapp" id="labWaInquireBtn" href="#" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.677.15-.2.301-.777.98-.952 1.18-.175.201-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.894-.799-1.498-1.786-1.674-2.087-.175-.3-.019-.463.132-.612.136-.134.301-.351.451-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.631-.928-2.233-.244-.585-.493-.506-.677-.515-.175-.009-.376-.011-.577-.011-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.91 1.228 3.111.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.379.197 1.898.12.579-.086 1.782-.728 2.033-1.431.251-.703.251-1.305.175-1.431-.075-.126-.276-.201-.577-.351zM12.04 2C6.516 2 2.023 6.49 2.023 12.013c0 1.942.555 3.756 1.517 5.292L2 22l4.834-1.503a10.007 10.007 0 0 0 5.206 1.516c5.524 0 10.017-4.49 10.017-10.013C22.057 6.49 17.564 2 12.04 2z"/></svg>
          <span>Inquire This Verified Laptop on WhatsApp</span>
        </a>
      </div>
    </div>
  </div>

  <!-- FLOATING WHATSAPP PILL -->
  <a class="wa-float-apple" href="https://wa.me/919872010193?text=Hi%20Lally%20Computers%2C%20I%20have%20an%20enquiry." target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.677.15-.2.301-.777.98-.952 1.18-.175.201-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.894-.799-1.498-1.786-1.674-2.087-.175-.3-.019-.463.132-.612.136-.134.301-.351.451-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.631-.928-2.233-.244-.585-.493-.506-.677-.515-.175-.009-.376-.011-.577-.011-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.91 1.228 3.111.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.379.197 1.898.12.579-.086 1.782-.728 2.033-1.431.251-.703.251-1.305.175-1.431-.075-.126-.276-.201-.577-.351zM12.04 2C6.516 2 2.023 6.49 2.023 12.013c0 1.942.555 3.756 1.517 5.292L2 22l4.834-1.503a10.007 10.007 0 0 0 5.206 1.516c5.524 0 10.017-4.49 10.017-10.013C22.057 6.49 17.564 2 12.04 2z"/></svg>
    <span>Chat with Us</span>
  </a>

  <!-- ========================================================================
       DATA & JAVASCRIPT
       ======================================================================== -->
  <script>
  var CATEGORIES = ''' + json.dumps(categories) + ''';
  var PRODUCTS = ''' + json.dumps(products) + ''';

  var activeCategory = 'laptops_used';
  var searchFilter = '';
  var brandFilter = '';
  var budgetFilter = '';
  var sizeFilter = '';
  var panelFilter = '';

  /* OPEN DEDICATED CATALOGUE SPACE */
  function openCatalogueSpace(catId) {
    if (catId) activeCategory = catId;
    var space = document.getElementById('catalogueSpace');
    if (!space) return;

    space.classList.add('is-open');

    // Update cat info
    var cat = CATEGORIES.find(function(c) { return c.id === activeCategory; }) || CATEGORIES[0];
    document.getElementById('spaceTitle').textContent = cat.name;
    document.getElementById('spaceDesc').textContent = cat.desc;
    document.getElementById('spaceEyebrow').textContent = cat.eyebrow;

    // Update buttons
    var catBtns = document.querySelectorAll('.space-cat-btn');
    catBtns.forEach(function(b) {
      if (b.getAttribute('data-cat') === activeCategory) {
        b.classList.add('is-active');
      } else {
        b.classList.remove('is-active');
      }
    });

    // Update ribbon active state
    var chapItems = document.querySelectorAll('.chap-item');
    chapItems.forEach(function(c) {
      if (c.getAttribute('onclick') && c.getAttribute('onclick').indexOf(activeCategory) !== -1) {
        c.classList.add('is-active');
      } else {
        c.classList.remove('is-active');
      }
    });

    renderSpaceProducts();

    // Smooth scroll to catalogue space
    space.scrollIntoView({ behavior: 'smooth' });
  }

  /* CLOSE DEDICATED CATALOGUE SPACE */
  function closeCatalogueSpace() {
    var space = document.getElementById('catalogueSpace');
    if (space) space.classList.remove('is-open');

    // Clear ribbon active state
    var chapItems = document.querySelectorAll('.chap-item');
    chapItems.forEach(function(c) { c.classList.remove('is-active'); });

    // Scroll back to departments overview
    var lineup = document.getElementById('lineup');
    if (lineup) lineup.scrollIntoView({ behavior: 'smooth' });
  }

  /* SWITCH CATEGORY INSIDE SPACE */
  function switchSpaceCategory(catId) {
    activeCategory = catId;
    var cat = CATEGORIES.find(function(c) { return c.id === activeCategory; }) || CATEGORIES[0];
    document.getElementById('spaceTitle').textContent = cat.name;
    document.getElementById('spaceDesc').textContent = cat.desc;
    document.getElementById('spaceEyebrow').textContent = cat.eyebrow;

    var catBtns = document.querySelectorAll('.space-cat-btn');
    catBtns.forEach(function(b) {
      if (b.getAttribute('data-cat') === activeCategory) {
        b.classList.add('is-active');
      } else {
        b.classList.remove('is-active');
      }
    });

    // Reset filters on category switch for clean experience
    resetFilters();
  }

  /* APPLY ALL FILTERS */
  function applyFilters() {
    var searchInput = document.getElementById('spaceSearchInput');
    searchFilter = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    brandFilter = document.getElementById('brandFilterSelect').value;
    budgetFilter = document.getElementById('budgetFilterSelect').value;
    sizeFilter = document.getElementById('sizeFilterSelect').value;
    panelFilter = document.getElementById('panelFilterSelect').value;

    renderSpaceProducts();
  }

  /* RESET FILTERS */
  function resetFilters() {
    searchFilter = '';
    brandFilter = '';
    budgetFilter = '';
    sizeFilter = '';
    panelFilter = '';

    var s = document.getElementById('spaceSearchInput');
    if (s) s.value = '';
    var b = document.getElementById('brandFilterSelect');
    if (b) b.value = '';
    var bu = document.getElementById('budgetFilterSelect');
    if (bu) bu.value = '';
    var sz = document.getElementById('sizeFilterSelect');
    if (sz) sz.value = '';
    var p = document.getElementById('panelFilterSelect');
    if (p) p.value = '';

    renderSpaceProducts();
  }

  /* RENDER PRODUCTS IN THE SPACE */
  function renderSpaceProducts() {
    var grid = document.getElementById('spaceLineupGrid');
    var countEl = document.getElementById('resultsCount');
    var tagsEl = document.getElementById('activeFilterTags');
    if (!grid) return;

    // Filter items
    var filtered = PRODUCTS.filter(function(item) {
      if (item.category !== activeCategory) return false;

      // Brand filter
      if (brandFilter && item.brand !== brandFilter) return false;

      // Budget filter
      if (budgetFilter && item.budget !== budgetFilter) return false;

      // Size filter
      if (sizeFilter && item.size !== sizeFilter) return false;

      // Panel filter
      if (panelFilter && item.panel !== panelFilter) return false;

      // Text search
      if (searchFilter) {
        var inTitle = item.title.toLowerCase().indexOf(searchFilter) !== -1;
        var inDesc = item.desc.toLowerCase().indexOf(searchFilter) !== -1;
        var inBrand = (item.brand || '').toLowerCase().indexOf(searchFilter) !== -1;
        var inSpecs = item.specs.some(function(s) { return s.toLowerCase().indexOf(searchFilter) !== -1; });
        if (!inTitle && !inDesc && !inBrand && !inSpecs) return false;
      }

      return true;
    });

    // Update count & active tags
    if (countEl) countEl.textContent = 'Showing ' + filtered.length + ' item(s) in this department';

    if (tagsEl) {
      var tagsHtml = '';
      if (brandFilter) tagsHtml += '<span class="filter-tag">Brand: ' + brandFilter + '</span>';
      if (budgetFilter) tagsHtml += '<span class="filter-tag">Budget: ' + budgetFilter + '</span>';
      if (sizeFilter) tagsHtml += '<span class="filter-tag">Size: ' + sizeFilter + '</span>';
      if (panelFilter) tagsHtml += '<span class="filter-tag">Type: ' + panelFilter + '</span>';
      if (searchFilter) tagsHtml += '<span class="filter-tag">Search: "' + searchFilter + '"</span>';
      tagsEl.innerHTML = tagsHtml;
    }

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem 1rem;">' +
        '<p style="color:var(--text-secondary); margin-bottom:1rem; font-size:15px;">No products match your current search or filters.</p>' +
        '<button class="apple-pill-btn apple-pill-btn--primary" onclick="resetFilters()">Reset All Filters</button>' +
        '</div>';
      return;
    }

    var html = '';
    filtered.forEach(function(item) {
      var waMsg = encodeURIComponent('Hi Lally Computers, I saw "' + item.title + '" on your website catalogue. Is this available at your Sodhi Nagar store and what is today\'s best price?');
      if (item.labReport) {
        waMsg = encodeURIComponent('Hi Lally Computers, I saw "' + item.title + '" with Lab Report ID #' + item.labReport.reportId + ' on your website. Is this certified unit available for store pickup in Sodhi Nagar?');
      }
      var waUrl = 'https://wa.me/919872010193?text=' + waMsg;

      var specTags = item.specs.map(function(s) {
        return '<li>' + s + '</li>';
      }).join('');

      var labBtn = '';
      if (item.labReport) {
        labBtn = '<button class="btn-card-lab" type="button" onclick="openLabReportModal(\'' + item.id + '\')">' +
          '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>' +
          '<span>Lab Report</span>' +
        '</button>';
      }

      html += '<div class="apple-card" data-id="' + item.id + '">' +
        '<div class="card-top">' +
          '<div class="card-badge-row">' +
            '<span class="' + (item.badgeClass || 'apple-badge') + '">' + item.badge + '</span>' +
            '<span class="card-warranty">' + item.warranty + '</span>' +
          '</div>' +
          '<h3 class="card-title">' + item.title + '</h3>' +
          '<p class="card-desc">' + item.desc + '</p>' +
          '<ul class="card-spec-list">' + specTags + '</ul>' +
        '</div>' +
        '<div class="card-bottom">' +
          '<div class="card-price-row">' +
            '<span class="card-price-label">Price Range</span>' +
            '<span class="card-price-val">' + item.price + '</span>' +
          '</div>' +
          '<div class="card-actions">' +
            '<a class="btn-card-wa" href="' + waUrl + '" target="_blank" rel="noopener">' +
              '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.677.15-.2.301-.777.98-.952 1.18-.175.201-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.894-.799-1.498-1.786-1.674-2.087-.175-.3-.019-.463.132-.612.136-.134.301-.351.451-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.631-.928-2.233-.244-.585-.493-.506-.677-.515-.175-.009-.376-.011-.577-.011-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.91 1.228 3.111.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.379.197 1.898.12.579-.086 1.782-.728 2.033-1.431.251-.703.251-1.305.175-1.431-.075-.126-.276-.201-.577-.351zM12.04 2C6.516 2 2.023 6.49 2.023 12.013c0 1.942.555 3.756 1.517 5.292L2 22l4.834-1.503a10.007 10.007 0 0 0 5.206 1.516c5.524 0 10.017-4.49 10.017-10.013C22.057 6.49 17.564 2 12.04 2z"/></svg>' +
              '<span>Inquire WhatsApp</span>' +
            '</a>' +
            labBtn +
            '<button class="btn-card-specs" type="button" onclick="openSpecSheet(\'' + item.id + '\')">Specs &rarr;</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });

    grid.innerHTML = html;
  }

  /* LAB REPORT MODAL */
  function openLabReportModal(id) {
    var item = PRODUCTS.find(function(x) { return x.id === id; });
    if (!item || !item.labReport) return;

    var rep = item.labReport;
    document.getElementById('labLaptopTitle').textContent = item.title;
    document.getElementById('labReportId').textContent = 'REPORT ID: #' + rep.reportId;
    document.getElementById('labTestedDate').textContent = 'Tested & Benchmark Date: ' + rep.testedDate;
    document.getElementById('labOverallGrade').textContent = rep.overallGrade;
    document.getElementById('labBattery').textContent = rep.batteryHealth;
    document.getElementById('labCpu').textContent = rep.cpuStress;
    document.getElementById('labSsd').textContent = rep.ssdHealth;
    document.getElementById('labScreen').textContent = rep.screenStatus;
    document.getElementById('labKeyboard').textContent = rep.keyboardTrackpad;
    document.getElementById('labMotherboard').textContent = rep.motherboardPower;
    document.getElementById('labPorts').textContent = rep.portsIo;
    document.getElementById('labCasing').textContent = rep.casingHinges;
    document.getElementById('labTechnician').textContent = rep.technician;

    var waMsg = encodeURIComponent('Hi Lally Computers, I reviewed the 25-Point Diagnostic Lab Report for "' + item.title + '" (Report ID #' + rep.reportId + ', ' + rep.overallGrade + '). Is this certified laptop ready for in-store pickup at Sodhi Nagar, Moga?');
    document.getElementById('labWaInquireBtn').href = 'https://wa.me/919872010193?text=' + waMsg;

    var modal = document.getElementById('labReportModal');
    if (modal) {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLabReportModal() {
    var modal = document.getElementById('labReportModal');
    if (modal) modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /* SPECS SHEET MODAL */
  function openSpecSheet(id) {
    var item = PRODUCTS.find(function(x) { return x.id === id; });
    if (!item) return;

    var modal = document.getElementById('appleModal');
    document.getElementById('modalCategory').textContent = item.badge + ' · In-Store Inventory';
    document.getElementById('modalTitle').textContent = item.title;
    document.getElementById('modalDesc').textContent = item.desc;

    var waMsg = encodeURIComponent('Hi Lally Computers, I would like to inquire regarding "' + item.title + '" shown on your website catalogue. Is this currently in stock at your Sodhi Nagar store and what is today\'s price?');
    document.getElementById('modalWaBtn').href = 'https://wa.me/919872010193?text=' + waMsg;

    var tbody = document.querySelector('#modalTable tbody');
    tbody.innerHTML = '';
    for (var key in item.details) {
      if (item.details.hasOwnProperty(key)) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<th>' + key + '</th><td>' + item.details[key] + '</td>';
        tbody.appendChild(tr);
      }
    }

    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeSpecSheet() {
    var modal = document.getElementById('appleModal');
    if (modal) modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /* Page initialization */
  document.addEventListener('DOMContentLoaded', function() {
    var search = document.getElementById('spaceSearchInput');
    if (search) {
      search.addEventListener('input', function() {
        applyFilters();
      });
    }

    var closeBtn = document.getElementById('modalCloseBtn');
    var modal = document.getElementById('appleModal');
    if (closeBtn) closeBtn.addEventListener('click', closeSpecSheet);
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) closeSpecSheet();
      });
    }

    var labClose = document.getElementById('labModalCloseBtn');
    var labModal = document.getElementById('labReportModal');
    if (labClose) labClose.addEventListener('click', closeLabReportModal);
    if (labModal) {
      labModal.addEventListener('click', function(e) {
        if (e.target === labModal) closeLabReportModal();
      });
    }

    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeSpecSheet();
        closeLabReportModal();
      }
    });

    // Theme toggle
    var themeBtn = document.getElementById('themeToggle');
    var savedTheme = localStorage.getItem('lally_apple_theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    if (themeBtn) {
      themeBtn.addEventListener('click', function() {
        var current = document.documentElement.getAttribute('data-theme');
        var isLight = current === 'light' || (!current && window.matchMedia('(prefers-color-scheme: light)').matches);
        var next = isLight ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('lally_apple_theme', next);
      });
    }

    // Live store status in IST (UTC+5:30)
    function updateHours() {
      var now = new Date();
      var utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      var ist = new Date(utc + (3600000 * 5.5));
      var day = ist.getDay(); // 0 = Sunday
      var hour = ist.getHours();
      var min = ist.getMinutes();
      var time = hour + min / 60;
      var text = document.getElementById('storeStatusText');
      var badge = document.getElementById('storeBadge');
      if (!text || !badge) return;

      if (day === 0) {
        badge.querySelector('.dot-status').className = 'dot-status dot-closed';
        text.textContent = 'Sunday · Closed today (Call for urgent repairs)';
      } else if (time >= 10 && time < 19) {
        badge.querySelector('.dot-status').className = 'dot-status dot-open';
        text.textContent = 'Open Now · Closes at 7:00 PM';
      } else if (time < 10) {
        badge.querySelector('.dot-status').className = 'dot-status dot-closed';
        text.textContent = 'Closed Now · Opens at 10:00 AM';
      } else {
        badge.querySelector('.dot-status').className = 'dot-status dot-closed';
        text.textContent = 'Closed for the day · Opens tomorrow at 10:00 AM';
      }
    }
    updateHours();

    // Video loader
    var video = document.getElementById('heroVideo');
    if (video && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var isSmall = window.matchMedia('(max-width: 760px)').matches;
      var ext = video.canPlayType('video/mp4; codecs="avc1.640028"') ? 'mp4' : 'webm';
      var src = (isSmall ? 'hero-720.' : 'hero-1080.') + ext;
      video.muted = true;
      video.addEventListener('playing', function() { video.classList.add('is-on'); }, { once: true });
      video.src = src;
      var p = video.play();
      if (p && p.catch) { p.catch(function() {}); }
    }
  });
  </script>
</body>
</html>
'''

with open('/Users/khushmansingh/.gemini/antigravity/scratch/lally-computers-website/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Successfully written index.html!")
