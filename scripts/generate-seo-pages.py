#!/usr/bin/env python3
"""Generate category / brand / product pages + sitemap for GSC."""

from __future__ import annotations

import json
import re
from pathlib import Path
from html import escape
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://kakobuyspreadsheetqc.online"


def slugify(text: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", str(text or "").lower()).strip("-")
    return re.sub(r"-+", "-", s)[:60] or "item"


def load_products():
    s = (ROOT / "js/products.js").read_text()
    start = s.find("window.KQS_PRODUCTS = ") + len("window.KQS_PRODUCTS = ")
    end = s.find("];\nwindow.KQS_CATEGORIES")
    products = json.loads(s[start : end + 1])
    cats = json.loads(re.search(r"window\.KQS_CATEGORIES = (\[.*\]);\s*$", s, re.S).group(1))
    return products, cats


def load_brands():
    raw = (ROOT / "js/brands.js").read_text()
    # brands file is window.KQS_BRANDS = [...];
    data = raw.replace("window.KQS_BRANDS = ", "", 1).rstrip().rstrip(";")
    return json.loads(data)


def asset_prefix(depth: int) -> str:
    return "../" * depth if depth else "./"


def chrome(title: str, description: str, canonical: str, depth: int, active: str = "", body_attrs: str = "", main_html: str = "", extra_head: str = "") -> str:
    p = asset_prefix(depth)
    nav = {
        "home": "",
        "products": "",
        "best": "",
    }
    if active in nav:
        nav[active] = ' class="is-active"'
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="{p}assets/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" href="{p}assets/favicon-32.png" sizes="32x32" />
  <link rel="apple-touch-icon" href="{p}assets/apple-touch-icon.png" />
  <title>{escape(title)}</title>
  <meta name="description" content="{escape(description)}" />
  <link rel="canonical" href="{canonical}" />
  <meta property="og:title" content="{escape(title)}" />
  <meta property="og:description" content="{escape(description)}" />
  <meta property="og:url" content="{canonical}" />
  <meta property="og:image" content="{SITE}/assets/logo.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="{p}css/styles.css" />
  {extra_head}
</head>
<body{body_attrs}>
  <div class="bg-glow" aria-hidden="true"></div>
  <header class="site-header">
    <a class="logo" href="{p}index.html" aria-label="kakobuyspreadsheet">
      <img class="logo-img" src="{p}assets/logo.png" alt="kakobuysheet" width="140" height="105" />
      <span class="logo-text">kakobuyspreadsheet</span>
    </a>
    <nav class="nav" data-nav>
      <a href="{p}index.html"{nav['home']}>HOME</a>
      <a href="{p}products.html"{nav['products']}>PRODUCTS</a>
      <a href="{p}best-versions.html"{nav['best']}>BEST VERSIONS</a>
      <a href="{p}index.html#howto">HOW TO</a>
      <a href="{p}index.html#faq">FAQ</a>
    </nav>
    <div class="header-actions">
      <div class="header-search">
        <label class="sr-only" for="header-search">Search</label>
        <input type="search" id="header-search" class="header-search-input" placeholder="Search..." autocomplete="off" />
      </div>
      <a class="btn btn-glow" href="https://discord.gg/7DRMaMAADv" target="_blank" rel="noopener">JOIN THE DISCORD</a>
      <button class="nav-toggle" type="button" aria-label="Menu" data-nav-toggle>
        <span></span><span></span>
      </button>
    </div>
  </header>
  {main_html}
  <footer class="site-footer">
    <p class="footer-brand">kakobuyspreadsheet</p>
    <p class="footer-note">
      kakobuyspreadsheetqc.online is not affiliated with Weidian, Taobao, 1688, or Tmall.
      Product info comes from third-party sellers. Buyers should review listings carefully.
    </p>
    <div class="footer-links">
      <a href="{p}index.html">HOME</a>
      <a href="{p}products.html">PRODUCTS</a>
      <a href="{p}best-versions.html">BEST VERSIONS</a>
      <a href="{p}about.html">ABOUT</a>
      <a href="{p}contact.html">CONTACT</a>
      <a href="{p}privacy.html">PRIVACY</a>
    </div>
    <p class="footer-copy">Copyright © 2026 kakobuyspreadsheetqc.online — All rights reserved.</p>
  </footer>
  <script src="{p}js/products.js"></script>
  <script src="{p}js/product-paths.js"></script>
  <script src="{p}js/main.js"></script>
  <script src="{p}js/seo.js"></script>
</body>
</html>
"""


def listing_main(h1: str) -> str:
    return f"""
  <main class="products-page">
    <h1 class="page-title">{escape(h1)}</h1>
    <div class="filter-panel">
      <div class="filter-chips" id="filter-chips" data-collapsed="true"></div>
      <button class="btn btn-load-more" type="button" id="chips-more" hidden>Load more</button>
      <div class="search-wrap">
        <label class="sr-only" for="product-search">Search products</label>
        <input type="search" id="product-search" class="search-input" placeholder="Search... and press Enter" autocomplete="off" />
        <ul class="search-suggest" id="search-suggest" role="listbox" hidden></ul>
      </div>
    </div>
    <p class="results-meta" id="results-meta"></p>
    <div class="product-grid products-catalog" id="products-grid"></div>
    <button class="btn btn-load-more" type="button" id="products-more" hidden>Load more</button>
  </main>
"""


def product_main(p: dict, depth: int) -> str:
    pref = asset_prefix(depth)
    name = p.get("name") or "Kakobuy find"
    img = p.get("image") or ""
    price = p.get("price")
    price_txt = f"{float(price):.2f}$" if price is not None and str(price) != "" else ""
    cat = p.get("categoryLabel") or p.get("category") or "Kakobuy"
    buy = p.get("buy") or "#"
    link = p.get("link") or ""
    qc = f"https://www.kakobuy.com/item/details?url={quote(link, safe='')}"
    return f"""
  <main class="products-page product-detail">
    <article class="product-card product-detail-card">
      <div class="thumb">
        <img src="{escape(img)}" alt="{escape(name)}" width="560" height="560" />
      </div>
      <h1 class="page-title" style="margin-top:1rem">{escape(name)}</h1>
      <p class="price">{escape(price_txt)}</p>
      <p class="tags">{escape(str(cat))}</p>
      <div class="actions">
        <a class="btn btn-buy" href="{escape(buy)}" target="_blank" rel="noopener">Buy on Kakobuy</a>
        <a class="btn btn-qc" href="{escape(qc)}" target="_blank" rel="noopener">Quality Check</a>
        <a class="btn btn-glow" href="{pref}products.html">Browse more finds</a>
      </div>
    </article>
  </main>
"""


def product_jsonld(p: dict, canonical: str) -> str:
    data = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": p.get("name"),
        "image": p.get("image"),
        "url": canonical,
        "sku": str(p.get("id") or ""),
        "category": p.get("categoryLabel") or p.get("category"),
        "offers": {
            "@type": "Offer",
            "url": p.get("buy") or canonical,
            "priceCurrency": "USD",
            "price": str(p.get("price") or ""),
            "availability": "https://schema.org/InStock",
        },
    }
    return f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>'


def write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)


def main():
    products, cats = load_products()
    brands = load_brands()
    urls = [
        (f"{SITE}/", "1.0", "daily"),
        (f"{SITE}/products", "0.9", "daily"),
        (f"{SITE}/best-versions", "0.8", "weekly"),
        (f"{SITE}/about", "0.6", "monthly"),
        (f"{SITE}/contact", "0.5", "monthly"),
        (f"{SITE}/privacy", "0.4", "monthly"),
    ]

    # Categories
    for c in cats:
        slug = c["slug"]
        label = c["label"]
        canonical = f"{SITE}/c/{slug}/"
        html = chrome(
            title=f"{label} | Kakobuy Spreadsheet QC",
            description=f"Browse {label} finds with QC photos on kakobuyspreadsheet. Filter and Buy on Kakobuy.",
            canonical=canonical,
            depth=2,
            active="products",
            body_attrs=f' data-page="products" data-cat="{escape(slug)}"',
            main_html=listing_main(label),
        )
        write(ROOT / "c" / slug / "index.html", html)
        urls.append((canonical, "0.7", "daily"))

    # Brands — update hrefs in brands.js as well
    brand_href_map = {}
    for b in brands:
        slug = slugify(b["name"])
        brand_href_map[b["name"]] = f"/b/{slug}/"
        canonical = f"{SITE}/b/{slug}/"
        html = chrome(
            title=f"{b['name']} Finds | Kakobuy Spreadsheet QC",
            description=f"Best {b['name']} finds with QC photos. Browse curated Kakobuy Spreadsheet links.",
            canonical=canonical,
            depth=2,
            active="best",
            body_attrs=f' data-page="products" data-q="{escape(b["name"])}"',
            main_html=listing_main(f"{b['name']} finds"),
        )
        write(ROOT / "b" / slug / "index.html", html)
        urls.append((canonical, "0.7", "weekly"))
        b["href"] = f"/b/{slug}/"

    (ROOT / "js/brands.js").write_text(
        "window.KQS_BRANDS = " + json.dumps(brands, ensure_ascii=False, indent=2) + ";\n"
    )

    # Product URLs (served via /p/* → product.html rewrite; no per-file HTML)
    for p in products:
        pid = str(p.get("id") or "")
        if not pid:
            continue
        slug = slugify(p.get("name") or "item")
        folder = f"{slug}-{pid}"
        canonical = f"{SITE}/p/{folder}/"
        urls.append((canonical, "0.6", "weekly"))
        p["_path"] = f"/p/{folder}/"

    # Patch main.js card links to product pages via id map file
    id_map = {str(p["id"]): p["_path"] for p in products if p.get("id") and p.get("_path")}
    write(
        ROOT / "js/product-paths.js",
        "window.KQS_PRODUCT_PATHS = " + json.dumps(id_map, ensure_ascii=False) + ";\n",
    )

    # Sitemap index: main (pages+cats+brands) + split product files
    from datetime import date

    today = date.today().isoformat()
    static = [u for u in urls if "/c/" not in u[0] and "/b/" not in u[0] and "/p/" not in u[0]]
    cats_u = [u for u in urls if "/c/" in u[0]]
    brands_u = [u for u in urls if "/b/" in u[0]]
    prods_u = [u for u in urls if "/p/" in u[0]]
    main_u = static + cats_u + brands_u
    mid = (len(prods_u) + 1) // 2

    def write_urlset(path: Path, entries):
        lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ]
        for loc, pri, freq in entries:
            lines += [
                "  <url>",
                f"    <loc>{loc}</loc>",
                f"    <lastmod>{today}</lastmod>",
                f"    <changefreq>{freq}</changefreq>",
                f"    <priority>{pri}</priority>",
                "  </url>",
            ]
        lines.append("</urlset>")
        path.write_text("\n".join(lines) + "\n")

    write_urlset(ROOT / "sitemap-main.xml", main_u)
    write_urlset(ROOT / "sitemap-products-1.xml", prods_u[:mid])
    write_urlset(ROOT / "sitemap-products-2.xml", prods_u[mid:])

    (ROOT / "sitemap.xml").write_text(
        f"""<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>{SITE}/sitemap-main.xml</loc><lastmod>{today}</lastmod></sitemap>
  <sitemap><loc>{SITE}/sitemap-products-1.xml</loc><lastmod>{today}</lastmod></sitemap>
  <sitemap><loc>{SITE}/sitemap-products-2.xml</loc><lastmod>{today}</lastmod></sitemap>
</sitemapindex>
"""
    )

    (ROOT / "_headers").write_text(
        """/sitemap.xml
  Content-Type: application/xml; charset=utf-8
  X-Content-Type-Options: nosniff
  Cache-Control: public, max-age=300

/robots.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=300

/llms.txt
  Content-Type: text/plain; charset=utf-8

/sitemap-main.xml
  Content-Type: application/xml; charset=utf-8

/sitemap-products-1.xml
  Content-Type: application/xml; charset=utf-8

/sitemap-products-2.xml
  Content-Type: application/xml; charset=utf-8
"""
    )

    print(
        f"generated categories={len(cats_u)} brands={len(brands_u)} products={len(prods_u)} total_urls={len(urls)}"
    )


if __name__ == "__main__":
    main()
