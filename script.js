// Each entry: { id, item, shop, price }
let entries = [];

const form = document.getElementById("priceForm");
const itemInput = document.getElementById("item");
const shopInput = document.getElementById("shop");
const priceInput = document.getElementById("price");
const searchInput = document.getElementById("search");
const results = document.getElementById("results");

// Load saved data (works when opened from a normal browser)
try {
  entries = JSON.parse(localStorage.getItem("priceEntries")) || [];
} catch (e) {
  entries = [];
}

function save() {
  try {
    localStorage.setItem("priceEntries", JSON.stringify(entries));
  } catch (e) {
    // Storage not available; the app still works for this session
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const item = itemInput.value.trim();
  const shop = shopInput.value.trim();
  const price = parseFloat(priceInput.value);

  if (!item || !shop || isNaN(price)) return;

  entries.push({ id: Date.now(), item: item, shop: shop, price: price });
  save();
  render();

  shopInput.value = "";
  priceInput.value = "";
  shopInput.focus(); // item name stays so you can add the next shop quickly
});

searchInput.addEventListener("input", render);

results.addEventListener("click", function (event) {
  const button = event.target.closest("[data-id]");
  if (!button) return;
  entries = entries.filter(function (e) { return e.id !== Number(button.dataset.id); });
  save();
  render();
});

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function render() {
  const query = searchInput.value.trim().toLowerCase();

  // Group entries by item name (case-insensitive)
  const groups = {};
  entries.forEach(function (e) {
    const key = e.item.toLowerCase();
    if (query && key.indexOf(query) === -1) return;
    if (!groups[key]) groups[key] = { name: e.item, list: [] };
    groups[key].list.push(e);
  });

  const keys = Object.keys(groups);

  if (keys.length === 0) {
    results.innerHTML = '<p class="empty">' +
      (entries.length ? "No items match your search." : "No prices yet. Add an item, a shop and its price above.") +
      "</p>";
    return;
  }

  results.innerHTML = keys.map(function (key) {
    const group = groups[key];
    const sorted = group.list.slice().sort(function (a, b) { return a.price - b.price; });
    const lowest = sorted[0].price;

    const rows = sorted.map(function (e) {
      const isBest = e.price === lowest && sorted.length > 1;
      return '<div class="row' + (isBest ? " best" : "") + '">' +
        "<span>" + escapeHtml(e.shop) + (isBest ? '<span class="tag">Cheapest</span>' : "") + "</span>" +
        '<span class="price">₹' + e.price.toFixed(2) + "</span>" +
        '<button class="remove" data-id="' + e.id + '" aria-label="Remove ' + escapeHtml(e.shop) + '">×</button>' +
        "</div>";
    }).join("");

    return '<article class="item"><h2>' + escapeHtml(group.name) + "</h2>" + rows + "</article>";
  }).join("");
}

render();