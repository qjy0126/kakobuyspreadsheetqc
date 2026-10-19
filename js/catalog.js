/* Category covers from kakobuysheetlink product library (KF.categories). */
window.KQS = window.KQS || {};

KQS.sheetOrigin = "https://kakobuysheetlink.com";

KQS.categories = [
  { slug: "shoes", label: "Shoes", image: "7652933295.webp" },
  { slug: "t-shirts", label: "T-Shirts", image: "7758836739.webp" },
  { slug: "hoodies", label: "Hoodies", image: "7769976357.webp" },
  { slug: "jackets", label: "Jackets", image: "7761891898.webp" },
  { slug: "pants", label: "Pants/Shorts", image: "7761875477.webp" },
  { slug: "headwear", label: "Headwear", image: "7769887549.webp" },
  { slug: "sets", label: "Sets", image: "7758909715.webp" },
  { slug: "underwear", label: "Underpants", image: "7761903780.webp" },
  { slug: "jersey", label: "Jersey", image: "7772857134.webp" },
  { slug: "accessories", label: "Accessories", image: "7773007666.webp" },
  { slug: "other", label: "Other Stuff", image: "7770013729.webp" },
];

KQS.asset = (file) => "assets/categories/" + String(file || "").replace(/^\//, "");
KQS.catHref = (slug) => KQS.sheetOrigin + "/" + slug + "/";
