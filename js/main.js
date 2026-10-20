(() => {
  const products = Array.isArray(window.KQS_PRODUCTS) ? window.KQS_PRODUCTS : [];
  const categories = Array.isArray(window.KQS_CATEGORIES) ? window.KQS_CATEGORIES : [];
  const featuredRail = document.querySelector("#featured-rail");
  const bestsellerGrid = document.querySelector("#bestseller-grid");
  const productsGrid = document.querySelector("#products-grid");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");

  /* Kakobuy invite / affiliate — https://ikako.vip/r/9v88f */
  const KAKOBUY_AFFCODE = "9v88f";

  function withAffcode(url) {
    const raw = String(url || "").trim();
    if (!raw) return raw;
    try {
      const u = new URL(raw, "https://www.kakobuy.com");
      if (!/kakobuy\.com$/i.test(u.hostname) && !/\.kakobuy\.com$/i.test(u.hostname)) {
        return raw;
      }
      u.searchParams.set("affcode", KAKOBUY_AFFCODE);
      return u.toString();
    } catch (_) {
      if (/[?&]affcode=/i.test(raw)) {
        return raw.replace(/([?&]affcode=)[^&]*/i, `$1${KAKOBUY_AFFCODE}`);
      }
      return raw + (raw.includes("?") ? "&" : "?") + "affcode=" + KAKOBUY_AFFCODE;
    }
  }

  function kakobuyItemUrl(sourceUrl) {
    return withAffcode(
      `https://www.kakobuy.com/item/details?url=${encodeURIComponent(sourceUrl || "")}`
    );
  }

  function priceHTML(p) {
    if (p.price == null || p.price === "") return "";
    const n = Number(p.price);
    if (Number.isNaN(n)) return `<p class="price">${p.price}</p>`;
    return `<p class="price">${n.toFixed(2)}$</p>`;
  }

  /* Product thumbs: jsdmirror (CN-friendly), fall back to jsdelivr / raw GitHub */
  function imgFallbacks(src) {
    const s = String(src || "");
    if (!s) return [];
    const gh = s.match(
      /(?:cdn\.jsd(?:elivr\.net|mirror\.(?:com|cn))\/gh\/|raw\.githubusercontent\.com\/)([^/@]+)\/([^/@]+)(?:@[^/]+)?\/(.+)/i
    );
    if (!gh) return [s];
    const [, user, repo, path] = gh;
    const clean = path.replace(/^main\//, "");
    return [
      `https://cdn.jsdmirror.com/gh/${user}/${repo}@main/${clean}`,
      `https://cdn.jsdmirror.cn/gh/${user}/${repo}@main/${clean}`,
      `https://cdn.jsdelivr.net/gh/${user}/${repo}@main/${clean}`,
      `https://raw.githubusercontent.com/${user}/${repo}/main/${clean}`,
    ].filter((u, i, arr) => arr.indexOf(u) === i);
  }

  function onImgError(img) {
    const chain = imgFallbacks(img.getAttribute("data-src") || img.src);
    let i = Number(img.dataset.cdnTry || 0) + 1;
    while (i < chain.length && chain[i] === img.src) i += 1;
    if (i < chain.length) {
      img.dataset.cdnTry = String(i);
      img.src = chain[i];
      return;
    }
    img.removeAttribute("onerror");
  }

  window.__kqsImgError = onImgError;

  function productPath(p) {
    const map = window.KQS_PRODUCT_PATHS || {};
    return map[String(p.id || "")] || "";
  }

  function cardHTML(p) {
    const tag = p.categoryLabel || (p.tags && p.tags[0]) || "Kakobuy";
    const buy = withAffcode(p.buy) || kakobuyItemUrl(p.link);
    const qc = kakobuyItemUrl(p.link);
    const img = p.image || "";
    const primary = imgFallbacks(img)[0] || img;
    const detail = productPath(p);
    const title = detail
      ? `<h3><a href="${detail}">${p.name}</a></h3>`
      : `<h3>${p.name}</h3>`;
    const thumb = detail
      ? `<a class="thumb" href="${detail}"><img src="${primary}" data-src="${img || primary}" alt="${p.name}" loading="lazy" decoding="async" width="400" height="400" onerror="window.__kqsImgError&&window.__kqsImgError(this)" /></a>`
      : `<div class="thumb"><img src="${primary}" data-src="${img || primary}" alt="${p.name}" loading="lazy" decoding="async" width="400" height="400" onerror="window.__kqsImgError&&window.__kqsImgError(this)" /></div>`;
    return `
      <article class="product-card">
        ${thumb}
        ${title}
        ${priceHTML(p)}
        <p class="tags">${tag}</p>
        <div class="actions">
          <a class="btn btn-buy" href="${buy}" target="_blank" rel="noopener">Buy on Kakobuy</a>
          <a class="btn btn-qc" href="${qc}" target="_blank" rel="noopener">Quality Check</a>
        </div>
      </article>`;
  }

  /* Product detail pages: /p/{slug-id}/ rewritten to product.html */
  const productDetail = document.querySelector("#product-detail");
  if (productDetail && document.body && document.body.dataset.page === "product") {
    const idMatch = location.pathname.match(/(\d+)\/?$/);
    const pid = idMatch ? idMatch[1] : "";
    const hit = products.find((p) => String(p.id) === pid);
    if (!hit) {
      productDetail.innerHTML = `<p class="empty-state">Product not found. <a href="products.html">Browse products</a></p>`;
    } else {
      const path = productPath(hit) || location.pathname;
      const canonical = `https://kakobuyspreadsheetqc.online${path.endsWith("/") ? path : path + "/"}`;
      const title = `${hit.name} | Kakobuy Spreadsheet QC`;
      const desc = `QC photos and Buy on Kakobuy for ${hit.name}. Curated on kakobuyspreadsheetqc.online.`;
      document.title = title;
      const setMeta = (sel, attr, val) => {
        const el = document.querySelector(sel);
        if (el) el.setAttribute(attr, val);
      };
      setMeta('meta[name="description"]', "content", desc);
      setMeta('link[rel="canonical"]', "href", canonical);
      setMeta('meta[property="og:title"]', "content", title);
      setMeta('meta[property="og:description"]', "content", desc);
      setMeta('meta[property="og:url"]', "content", canonical);
      const img = imgFallbacks(hit.image || "")[0] || hit.image || "";
      const buy = withAffcode(hit.buy) || kakobuyItemUrl(hit.link);
      const qc = kakobuyItemUrl(hit.link);
      productDetail.innerHTML = `
        <article class="product-card product-detail-card">
          <div class="thumb">
            <img src="${img}" data-src="${hit.image || img}" alt="${hit.name}" width="560" height="560" onerror="window.__kqsImgError&&window.__kqsImgError(this)" />
          </div>
          <h1 class="page-title" style="margin-top:1rem">${hit.name}</h1>
          ${priceHTML(hit)}
          <p class="tags">${hit.categoryLabel || hit.category || "Kakobuy"}</p>
          <div class="actions">
            <a class="btn btn-buy" href="${buy}" target="_blank" rel="noopener">Buy on Kakobuy</a>
            <a class="btn btn-qc" href="${qc}" target="_blank" rel="noopener">Quality Check</a>
            <a class="btn btn-glow" href="products.html">Browse more finds</a>
          </div>
        </article>`;
      const ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: hit.name,
        image: hit.image,
        url: canonical,
        sku: String(hit.id || ""),
        category: hit.categoryLabel || hit.category,
        offers: {
          "@type": "Offer",
          url: buy || canonical,
          priceCurrency: "USD",
          price: String(hit.price || ""),
          availability: "https://schema.org/InStock",
        },
      });
      document.head.appendChild(ld);
    }
  }

  const featured = products.filter((p) => p.featured).slice(0, 8);
  const popular = products.filter((p) => p.popular).slice(0, 12);

  if (featuredRail) {
    const list = featured.length ? featured : products.slice(0, 8);
    featuredRail.innerHTML = list.length
      ? list.map(cardHTML).join("")
      : `<p class="empty-state">Catalog loading… refresh if this stays empty.</p>`;
  }

  if (bestsellerGrid) {
    const list = popular.length ? popular : products.slice(0, 12);
    bestsellerGrid.innerHTML = list.length
      ? list.map(cardHTML).join("")
      : `<p class="empty-state">Catalog loading… refresh if this stays empty.</p>`;
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => nav.classList.remove("is-open"));
    });
  }

  /* Best Versions — brand tiles */
  const brandGrid = document.querySelector("#brand-grid");
  if (brandGrid) {
    const brands = Array.isArray(window.KQS_BRANDS) ? window.KQS_BRANDS : [];
    brandGrid.innerHTML = brands
      .map((b) => {
        const imgs = (b.images || []).slice(0, 4);
        const collage = imgs
          .map((src) => {
            const primary = imgFallbacks(src)[0] || src;
            return `<img src="${primary}" data-src="${src || primary}" alt="" loading="lazy" decoding="async" onerror="window.__kqsImgError&&window.__kqsImgError(this)" />`;
          })
          .join("");
        return `
          <a class="brand-tile" href="${b.href}" aria-label="${b.name}">
            <div class="brand-tile-bg">${collage}</div>
            <span class="brand-tile-name">${b.name}</span>
          </a>`;
      })
      .join("");
  }

  /* Search modal (sheetlink-style) */
  const POPULAR = [
    "Nike",
    "Essentials",
    "Jordan 4",
    "Chrome Hearts",
    "Balenciaga",
    "Ralph Lauren",
    "Corteiz",
    "Trapstar",
  ];
  const MODAL_CATS = Array.isArray(window.KQS_CATEGORIES)
    ? window.KQS_CATEGORIES.slice(0, 8)
    : [];

  if (!document.querySelector("#search-overlay")) {
    const catLinks = MODAL_CATS.map(
      (c) =>
        `<a href="products.html?cat=${encodeURIComponent(c.slug)}"><span>${c.label}</span></a>`
    ).join("");
    const popularLinks = POPULAR.map(
      (term) =>
        `<a href="products.html?q=${encodeURIComponent(term)}">${term}</a>`
    ).join("");
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div class="search-overlay" id="search-overlay" hidden></div>
      <div class="search-modal" id="search-modal" role="dialog" aria-modal="true" aria-label="Search" hidden>
        <label class="search-modal-field">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input class="search-modal-input" id="global-search" placeholder="Search finds, brands, categories..." autocomplete="off" />
          <button type="button" class="search-esc" id="search-esc">Esc</button>
        </label>
        <div class="search-browse" id="search-browse">
          <div class="search-block">
            <h3>Popular</h3>
            <div class="search-popular">${popularLinks}</div>
          </div>
          <div class="search-block">
            <h3>Categories</h3>
            <div class="search-cats">${catLinks}</div>
          </div>
        </div>
        <div class="search-hits" id="search-hits" hidden></div>
      </div>`
    );
  }

  const searchOverlay = document.querySelector("#search-overlay");
  const searchModal = document.querySelector("#search-modal");
  const globalSearch = document.querySelector("#global-search");
  const searchBrowse = document.querySelector("#search-browse");
  const searchHits = document.querySelector("#search-hits");
  const searchEsc = document.querySelector("#search-esc");
  const headerSearch = document.querySelector("#header-search");
  const productSearchTrigger = document.querySelector("#product-search");
  let modalHitIndex = -1;

  const modalTerms = (() => {
    const map = new Map();
    const add = (term, weight) => {
      const t = String(term || "").replace(/\s+/g, " ").trim();
      if (t.length < 2 || t.length > 40 || /^\d+$/.test(t)) return;
      const key = t.toLowerCase();
      const prev = map.get(key);
      if (!prev) map.set(key, { label: t, weight });
      else prev.weight += weight;
    };
    products.forEach((p) => {
      add(p.categoryLabel, 6);
      (p.tags || []).forEach((tag) => add(tag, 5));
      const words = String(p.name || "").split(/[^a-zA-Z0-9+]+/).filter((w) => w.length > 1);
      for (let i = 0; i < words.length; i++) {
        add(words[i], 2);
        if (words[i + 1]) add(`${words[i]} ${words[i + 1]}`, 3);
      }
    });
    return Array.from(map.values()).sort((a, b) => b.weight - a.weight || a.label.length - b.label.length);
  })();

  function markQuery(text, q) {
    const esc = (s) =>
      String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(text);
    return `${esc(text.slice(0, i))}<mark>${esc(text.slice(i, i + q.length))}</mark>${esc(
      text.slice(i + q.length)
    )}`;
  }

  function modalSuggestions(q) {
    const ql = q.toLowerCase();
    if (!ql) return [];
    return modalTerms
      .filter((item) => item.label.toLowerCase().includes(ql) && item.label.toLowerCase() !== ql)
      .map((item) => ({
        text: item.label,
        n: item.weight,
        starts: item.label.toLowerCase().startsWith(ql),
      }))
      .sort((a, b) => {
        if (a.starts !== b.starts) return a.starts ? -1 : 1;
        if (b.n !== a.n) return b.n - a.n;
        return a.text.length - b.text.length;
      })
      .slice(0, 10);
  }

  function renderModalHits(q) {
    modalHitIndex = -1;
    if (!searchHits || !searchBrowse) return;
    if (!q) {
      searchHits.hidden = true;
      searchHits.innerHTML = "";
      searchBrowse.hidden = false;
      return;
    }
    searchBrowse.hidden = true;
    searchHits.hidden = false;
    const items = modalSuggestions(q);
    searchHits.innerHTML = items.length
      ? items
          .map(
            (item) => `
        <a class="search-suggest" href="products.html?q=${encodeURIComponent(item.text)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <span>${markQuery(item.text, q)}</span>
        </a>`
          )
          .join("")
      : `<p class="search-empty">No matches.</p>`;
  }

  function closeSearchModal() {
    if (searchOverlay) searchOverlay.hidden = true;
    if (searchModal) searchModal.hidden = true;
    document.body.classList.remove("search-open");
  }

  function openSearchModal(seed) {
    if (!searchModal || !searchOverlay) return;
    if (headerSearch) headerSearch.blur();
    if (productSearchTrigger) productSearchTrigger.blur();
    searchOverlay.hidden = false;
    searchModal.hidden = false;
    document.body.classList.add("search-open");
    if (globalSearch) {
      globalSearch.value = seed || "";
      renderModalHits(globalSearch.value.trim());
      setTimeout(() => globalSearch.focus(), 0);
    }
  }

  function goSearch(value) {
    const q = String(value || "").trim();
    if (!q) return;
    location.href = `products.html?q=${encodeURIComponent(q)}`;
  }

  if (searchOverlay) searchOverlay.addEventListener("click", closeSearchModal);
  if (searchEsc) searchEsc.addEventListener("click", closeSearchModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("search-open")) {
      closeSearchModal();
    }
  });

  if (globalSearch) {
    globalSearch.addEventListener("input", () => renderModalHits(globalSearch.value.trim()));
    globalSearch.addEventListener("keydown", (e) => {
      const links = searchHits ? [...searchHits.querySelectorAll(".search-suggest")] : [];
      if (e.key === "ArrowDown" && links.length) {
        e.preventDefault();
        modalHitIndex = (modalHitIndex + 1) % links.length;
        links.forEach((el, i) => el.classList.toggle("is-on", i === modalHitIndex));
        return;
      }
      if (e.key === "ArrowUp" && links.length) {
        e.preventDefault();
        modalHitIndex = (modalHitIndex - 1 + links.length) % links.length;
        links.forEach((el, i) => el.classList.toggle("is-on", i === modalHitIndex));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (modalHitIndex >= 0 && links[modalHitIndex]) {
          location.href = links[modalHitIndex].href;
          return;
        }
        goSearch(globalSearch.value);
      }
    });
  }

  if (headerSearch) {
    const urlQ = new URLSearchParams(location.search).get("q");
    if (urlQ) headerSearch.value = urlQ;
    const openFromHeader = (e) => {
      e.preventDefault();
      openSearchModal(headerSearch.value.trim());
    };
    headerSearch.addEventListener("focus", openFromHeader);
    headerSearch.addEventListener("click", openFromHeader);
    headerSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        goSearch(headerSearch.value);
      } else if (e.key.length === 1 || e.key === "Backspace") {
        e.preventDefault();
        openSearchModal(headerSearch.value + (e.key.length === 1 ? e.key : ""));
      }
    });
  }

  /* Products page search also opens modal */
  if (productSearchTrigger) {
    productSearchTrigger.addEventListener("focus", () => {
      openSearchModal(productSearchTrigger.value.trim());
    });
    productSearchTrigger.addEventListener("click", () => {
      openSearchModal(productSearchTrigger.value.trim());
    });
  }

  /* Products page — category filters from kakobuysheetlink */
  if (!productsGrid) return;

  const chipsEl = document.querySelector("#filter-chips");
  const chipsMore = document.querySelector("#chips-more");
  const searchInput = document.querySelector("#product-search");
  const suggestEl = document.querySelector("#search-suggest");
  const resultsMeta = document.querySelector("#results-meta");
  const productsMore = document.querySelector("#products-more");

  const CHIP_VISIBLE = 12;
  const PAGE_SIZE = 24;
  const SUGGEST_MAX = 8;
  let suggestIndex = -1;

  /* Build autocomplete vocabulary from names, tags, categories */
  const suggestTerms = (() => {
    const map = new Map();
    const add = (term, weight) => {
      const t = String(term || "").trim();
      if (t.length < 2) return;
      const key = t.toLowerCase();
      const prev = map.get(key);
      if (!prev || weight > prev.weight || t.length < prev.label.length) {
        map.set(key, { label: t, weight: (prev ? prev.weight : 0) + weight });
      } else {
        prev.weight += weight;
      }
    };
    products.forEach((p) => {
      add(p.categoryLabel, 6);
      (p.tags || []).forEach((tag) => add(tag, 5));
      String(p.name || "")
        .split(/[\s\/\-&+,]+/)
        .forEach((w) => {
          if (/^[a-zA-Z0-9]{2,}$/.test(w)) add(w, 2);
        });
      add(p.name, 1);
    });
    return Array.from(map.values()).sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label));
  })();

  function getSuggestions(q) {
    const needle = q.trim().toLowerCase();
    if (needle.length < 1) return [];
    const starts = [];
    const contains = [];
    for (const term of suggestTerms) {
      const low = term.label.toLowerCase();
      if (low === needle) continue;
      if (low.startsWith(needle)) starts.push(term.label);
      else if (low.includes(needle)) contains.push(term.label);
      if (starts.length >= SUGGEST_MAX) break;
    }
    return starts.concat(contains).slice(0, SUGGEST_MAX);
  }

  function hideSuggest() {
    if (!suggestEl) return;
    suggestEl.hidden = true;
    suggestEl.innerHTML = "";
    suggestIndex = -1;
    if (searchInput) searchInput.setAttribute("aria-expanded", "false");
  }

  function showSuggest(items) {
    if (!suggestEl || !searchInput) return;
    if (!items.length) {
      hideSuggest();
      return;
    }
    suggestIndex = -1;
    suggestEl.innerHTML = items
      .map(
        (label, i) =>
          `<li role="option" class="search-suggest-item" data-index="${i}" id="suggest-${i}">${label}</li>`
      )
      .join("");
    suggestEl.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
    suggestEl.querySelectorAll(".search-suggest-item").forEach((el) => {
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        applySearch(el.textContent || "");
      });
    });
  }

  function highlightSuggest() {
    if (!suggestEl) return;
    suggestEl.querySelectorAll(".search-suggest-item").forEach((el, i) => {
      el.classList.toggle("is-active", i === suggestIndex);
    });
  }

  function applySearch(value) {
    query = String(value || "").trim();
    if (searchInput) searchInput.value = query;
    visibleCount = PAGE_SIZE;
    hideSuggest();
    syncUrl();
    render();
  }

  const params = new URLSearchParams(location.search);
  const bodyCat = (document.body && document.body.dataset.cat) || "";
  const bodyQ = (document.body && document.body.dataset.q) || "";
  let activeCat = params.get("cat") || bodyCat || "All";
  let query = (params.get("q") || bodyQ || "").trim();
  let visibleCount = PAGE_SIZE;

  const chipList = [
    { slug: "All", label: "All" },
    ...categories.map((c) => ({ slug: c.slug, label: c.label })),
  ];

  function matches(p) {
    const catOk =
      activeCat === "All" ||
      p.category === activeCat ||
      (p.tags || []).includes(activeCat) ||
      p.categoryLabel === activeCat;
    if (!catOk) return false;
    if (!query) return true;
    const hay = `${p.name} ${(p.tags || []).join(" ")} ${p.categoryLabel || ""}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  }

  function renderChips() {
    if (!chipsEl) return;
    const collapsed = chipsEl.dataset.collapsed === "true";
    const shown = collapsed ? chipList.slice(0, CHIP_VISIBLE) : chipList;

    chipsEl.innerHTML = shown
      .map(
        (cat) => `
      <button type="button" class="chip${cat.slug === activeCat || cat.label === activeCat ? " is-active" : ""}" data-cat="${cat.slug}">
        ${cat.label}
      </button>`
      )
      .join("");

    if (chipsMore) {
      const needMore = chipList.length > CHIP_VISIBLE;
      chipsMore.hidden = !needMore;
      chipsMore.textContent = collapsed ? "Load more" : "Show less";
    }

    chipsEl.querySelectorAll("[data-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCat = btn.getAttribute("data-cat") || "All";
        visibleCount = PAGE_SIZE;
        syncUrl();
        render();
      });
    });
  }

  function syncUrl() {
    const next = new URL(location.href);
    if (activeCat && activeCat !== "All") next.searchParams.set("cat", activeCat);
    else next.searchParams.delete("cat");
    if (query) next.searchParams.set("q", query);
    else next.searchParams.delete("q");
    history.replaceState(null, "", next);
  }

  function activeLabel() {
    const hit = chipList.find((c) => c.slug === activeCat || c.label === activeCat);
    return hit ? hit.label : activeCat;
  }

  function render() {
    renderChips();
    const filtered = products.filter(matches);
    const page = filtered.slice(0, visibleCount);

    productsGrid.innerHTML = page.length
      ? page.map(cardHTML).join("")
      : `<p class="empty-state">No products match this filter.</p>`;

    if (resultsMeta) {
      resultsMeta.textContent = `${filtered.length.toLocaleString()} product${
        filtered.length === 1 ? "" : "s"
      }${activeCat !== "All" ? ` · ${activeLabel()}` : ""}${
        query ? ` · “${query}”` : ""
      }`;
    }

    if (productsMore) {
      productsMore.hidden = page.length >= filtered.length;
    }

    if (searchInput && searchInput.value !== query) {
      searchInput.value = query;
    }
  }

  if (chipsMore) {
    chipsMore.addEventListener("click", () => {
      const collapsed = chipsEl.dataset.collapsed === "true";
      chipsEl.dataset.collapsed = collapsed ? "false" : "true";
      renderChips();
    });
  }

  if (productsMore) {
    productsMore.addEventListener("click", () => {
      visibleCount += PAGE_SIZE;
      render();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value;
      showSuggest(getSuggestions(q));
    });

    searchInput.addEventListener("focus", () => {
      const q = searchInput.value;
      if (q.trim()) showSuggest(getSuggestions(q));
    });

    searchInput.addEventListener("blur", () => {
      setTimeout(hideSuggest, 120);
    });

    searchInput.addEventListener("keydown", (e) => {
      const items = suggestEl ? suggestEl.querySelectorAll(".search-suggest-item") : [];
      const open = suggestEl && !suggestEl.hidden && items.length;

      if (e.key === "ArrowDown" && open) {
        e.preventDefault();
        suggestIndex = (suggestIndex + 1) % items.length;
        highlightSuggest();
        return;
      }
      if (e.key === "ArrowUp" && open) {
        e.preventDefault();
        suggestIndex = suggestIndex <= 0 ? items.length - 1 : suggestIndex - 1;
        highlightSuggest();
        return;
      }
      if (e.key === "Escape") {
        hideSuggest();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (open && suggestIndex >= 0 && items[suggestIndex]) {
          applySearch(items[suggestIndex].textContent || "");
        } else {
          applySearch(searchInput.value);
        }
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (!searchInput || !suggestEl) return;
    if (e.target === searchInput || suggestEl.contains(e.target)) return;
    hideSuggest();
  });

  render();
})();
