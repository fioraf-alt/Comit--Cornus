const productsContainer = document.getElementById("products");
const orderContainer = document.getElementById("order");
const totalElement = document.getElementById("total");
const undoButton = document.getElementById("undo");
const resetButton = document.getElementById("reset");

const products = PRODUCT_GROUPS.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    groupTitle: group.title,
    className: group.className
  }))
);

const quantities = Array(products.length).fill(0);
let history = [];

function formatPrice(value) {
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR"
  });
}

function buildProducts() {
  productsContainer.innerHTML = "";

  let currentGroup = "";
  let currentGrid = null;

  products.forEach((product, index) => {
    if (product.groupTitle !== currentGroup) {
      currentGroup = product.groupTitle;

      const title = document.createElement("div");
      title.className = "section-title";
      title.textContent = currentGroup;
      productsContainer.appendChild(title);

      currentGrid = document.createElement("section");
      currentGrid.className = "products-grid";
      productsContainer.appendChild(currentGrid);
    }

    const card = document.createElement("article");
    card.className = `product ${product.className}`;

    card.innerHTML = `
      <div>
        <div class="product-name">${product.name}</div>
        <div class="product-price">${formatPrice(product.price)}</div>
      </div>

      <div class="controls">
        <button
          type="button"
          class="minus"
          aria-label="Retirer ${product.name}"
        >
          −
        </button>

        <div class="quantity" id="quantity-${index}">0</div>

        <button
          type="button"
          class="plus"
          aria-label="Ajouter ${product.name}"
        >
          +
        </button>
      </div>
    `;

    card.querySelector(".minus").addEventListener("click", () => {
      changeQuantity(index, -1);
    });

    card.querySelector(".plus").addEventListener("click", () => {
      changeQuantity(index, 1);
    });

    currentGrid.appendChild(card);
  });
}

function changeQuantity(index, change) {
  if (change < 0 && quantities[index] === 0) {
    return;
  }

  quantities[index] += change;
  history.push({ index, change });

  document.getElementById(`quantity-${index}`).textContent = quantities[index];

  renderOrder();
}

function renderOrder() {
  let total = 0;
  const lines = [];

  products.forEach((product, index) => {
    const quantity = quantities[index];

    if (quantity > 0) {
      const lineTotal = quantity * product.price;
      total += lineTotal;

      lines.push(`
        <div class="order-line">
          <span>${quantity} × ${product.name}</span>
          <strong>${formatPrice(lineTotal)}</strong>
        </div>
      `);
    }
  });

  orderContainer.className = lines.length > 0 ? "" : "empty";
  orderContainer.innerHTML =
    lines.length > 0
      ? lines.join("")
      : "Aucun article pour le moment.";

  totalElement.textContent = formatPrice(total);
  undoButton.disabled = history.length === 0;
}

undoButton.addEventListener("click", () => {
  const lastAction = history.pop();

  if (!lastAction) {
    return;
  }

  quantities[lastAction.index] -= lastAction.change;

  document.getElementById(
    `quantity-${lastAction.index}`
  ).textContent = quantities[lastAction.index];

  renderOrder();
});

resetButton.addEventListener("click", () => {
  quantities.fill(0);
  history = [];

  document.querySelectorAll(".quantity").forEach((element) => {
    element.textContent = "0";
  });

  renderOrder();
  window.scrollTo(0, 0);
});

buildProducts();
renderOrder();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}
