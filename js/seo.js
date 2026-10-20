(() => {
  const SITE = "https://kakobuyspreadsheetqc.online";
  const products = Array.isArray(window.KQS_PRODUCTS) ? window.KQS_PRODUCTS : [];
  const AFFCODE = "9v88f";

  function withAffcode(url) {
    const raw = String(url || "").trim();
    if (!raw) return raw;
    try {
      const u = new URL(raw, "https://www.kakobuy.com");
      if (!/kakobuy\.com$/i.test(u.hostname) && !/\.kakobuy\.com$/i.test(u.hostname)) return raw;
      u.searchParams.set("affcode", AFFCODE);
      return u.toString();
    } catch (_) {
      return raw;
    }
  }

  function inject(data) {
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);
  }

  inject({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "kakobuyspreadsheet",
    url: SITE + "/",
    logo: SITE + "/assets/logo.png",
    sameAs: ["https://discord.gg/7DRMaMAADv"],
    email: "contact@kakobuyspreadsheetqc.com",
    description:
      "Independent Kakobuy Spreadsheet with curated finds, QC photos, and Buy on Kakobuy links.",
  });

  inject({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kakobuy Spreadsheet QC",
    url: SITE + "/",
    description:
      "Kakobuy Spreadsheet 2026: curated Taobao & Weidian finds with QC photos on kakobuyspreadsheetqc.online.",
    publisher: { "@type": "Organization", name: "kakobuyspreadsheet", url: SITE + "/" },
    potentialAction: {
      "@type": "SearchAction",
      target: SITE + "/products.html?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  });

  if (document.body && document.body.dataset.page === "home") {
    inject({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is kakobuyspreadsheet?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A curated Kakobuy product discovery site — spreadsheet finds as a clean shoppable UI on kakobuyspreadsheetqc.online.",
          },
        },
        {
          "@type": "Question",
          name: "How do I buy a product?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Click Buy on Kakobuy on any card. Checkout, warehouse QC, and shipping happen on Kakobuy.",
          },
        },
        {
          "@type": "Question",
          name: "What is Quality Check?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "QC photos let you inspect the actual item at the warehouse before international shipping.",
          },
        },
        {
          "@type": "Question",
          name: "Is kakobuyspreadsheet affiliated with Kakobuy?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We are an independent discovery resource. Links may be affiliate links. We do not sell products or handle payments.",
          },
        },
      ],
    });
  }

  const listHost =
    document.querySelector("#bestseller-grid") ||
    document.querySelector("#products-grid") ||
    document.querySelector("#featured-rail");
  if (listHost && products.length) {
    const slice = products.slice(0, 24);
    inject({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: document.title || "Kakobuy Spreadsheet Finds",
      numberOfItems: products.length,
      itemListElement: slice.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.name,
          image: p.image,
          url: withAffcode(p.buy) || SITE + "/products",
          brand: p.tags && p.tags[0] ? { "@type": "Brand", name: p.tags[0] } : undefined,
          offers: p.price
            ? {
                "@type": "Offer",
                price: String(p.price),
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                url: withAffcode(p.buy),
              }
            : undefined,
        },
      })),
    });
  }
})();
