/* Brand and order settings: edit here to update products, prices, contact and seasonal messaging. */
const SITE_CONFIG = {
  businessName: "Maa's Mishti",
  tagline: "A Mother's Touch. Bengal's Mithaas.",
  whatsappNumber: "919967590265",
  whatsappDisplay: "99675 90265",
  currency: "₹",
  unitPrice: 15,
  orderNoticeHours: 6,
  deliveryMethod: "Porter",
  deliveryArea: "Selected Mumbai locations",
  announcement: "Homemade Bengali Sweets  •  Order {hours} Hours Before Delivery  •  Mumbai Delivery via {method}",
  heroTitleMain: "A little taste of Bengal,",
  heroTitleEmphasis: "made with a mother's love.",
  seasonalBanner: {
    enabled: false,
    theme: "durga-puja",
    message: "A little extra sweetness for the festive season."
  },
  products: [
    {
      id: "rasgulla",
      name: "Bengali-Style Rasgulla",
      shortName: "Rasgulla",
      description: "Soft, spongy Bengali-style sweets soaked in delicate sugar syrup.",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Rasgulla_With_Rabdi.jpg/960px-Rasgulla_With_Rabdi.jpg",
      imageAlt: "Rasgulla served with rabdi",
      imageCredit: "Photo: Prakrutim · CC BY-SA 4.0",
      imageCreditUrl: "https://commons.wikimedia.org/wiki/File:Rasgulla_With_Rabdi.jpg",
      objectPosition: "50% 50%",
      category: "A BENGALI CLASSIC"
    },
    {
      id: "gulab-jamun",
      name: "Gulab Jamun",
      shortName: "Gulab Jamun",
      description: "Soft, golden milk-solid sweets soaked in fragrant sugar syrup.",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Gulab_Jamun_1.jpg/960px-Gulab_Jamun_1.jpg",
      imageAlt: "Gulab jamun served on a plate",
      imageCredit: "Photo: Gaurav Dhwaj Khadka · CC BY-SA 4.0",
      imageCreditUrl: "https://commons.wikimedia.org/wiki/File:Gulab_Jamun_1.jpg",
      objectPosition: "50% 50%",
      category: "A MUCH-LOVED FAVOURITE"
    }
  ],
  story: "At Maa's Mishti, every sweet begins with care, patience and the warmth of homemade cooking. We are starting with two timeless favourites—Bengali-style Rasgulla and Gulab Jamun—prepared in small batches to bring a little taste of Bengal to homes across Mumbai."
};

const cart = new Map();
let lastOrderMessage = "";
let toastTimeout;
const rupees = value => `${SITE_CONFIG.currency}${value}`;
const productById = id => SITE_CONFIG.products.find(product => product.id === id);
const unitPriceFor = product => product.unitPrice ?? SITE_CONFIG.unitPrice;
const cartPieces = () => [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
const cartSubtotal = () => [...cart.entries()].reduce((sum, [id, quantity]) => sum + quantity * unitPriceFor(productById(id)), 0);

function renderProducts() {
  const grid = document.querySelector("#product-grid");
  grid.innerHTML = SITE_CONFIG.products.map((product, index) => `
    <article class="product-card" data-product-card="${product.id}">
      <div class="product-image-wrap"><img src="${product.image}" alt="${product.imageAlt}" loading="lazy" width="620" height="760" style="object-position:${product.objectPosition}"><span class="image-index">MISHTI No. 0${index + 1}</span><a class="image-credit" href="${product.imageCreditUrl}" target="_blank" rel="noopener noreferrer">${product.imageCredit}</a></div>
      <div class="product-info">
        <p class="product-kind">${product.category}</p>
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="price-options" aria-label="Price options">${[1, 6, 12, 24].map(count => `<span class="price-option">${count} pc${count === 1 ? "" : "s"} <strong>${rupees(count * unitPriceFor(product))}</strong></span>`).join("")}</div>
        <p class="unit-price">${rupees(unitPriceFor(product))} <span>per piece</span></p>
        <div class="quantity-control" aria-label="Choose ${product.shortName} quantity">
          <button type="button" data-quantity-step="-1" data-product="${product.id}" aria-label="Decrease ${product.shortName} quantity">−</button>
          <input type="number" inputmode="numeric" min="1" max="999" value="6" data-quantity="${product.id}" aria-label="${product.shortName} quantity in pieces">
          <button type="button" data-quantity-step="1" data-product="${product.id}" aria-label="Increase ${product.shortName} quantity">+</button>
        </div>
        <button type="button" class="add-button" data-add-product="${product.id}"><span>Add to basket</span><span aria-hidden="true">＋</span></button>
      </div>
    </article>`).join("");
  grid.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("pointermove", event => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const bounds = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
      card.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
    });
  });
}

function renderCart() {
  const entries = [...cart.entries()];
  const pieces = cartPieces();
  const subtotal = cartSubtotal();
  const countText = `${pieces} ${pieces === 1 ? "piece" : "pieces"}`;
  document.querySelector("#cart-count").textContent = countText;
  document.querySelector("#cart-total").textContent = rupees(subtotal);
  document.querySelector("#mini-count").textContent = countText;
  document.querySelector("#mini-total").textContent = rupees(subtotal);
  document.querySelector("#mini-cart").setAttribute("aria-label", `Open your basket, ${countText}, ${rupees(subtotal)}`);
  const container = document.querySelector("#cart-items");
  if (!entries.length) {
    container.innerHTML = '<p class="empty-cart">Your basket is waiting for something sweet.</p>';
    return;
  }
  container.innerHTML = entries.map(([id, quantity]) => {
    const product = productById(id);
    return `<div class="cart-row">
      <div><span class="cart-product-name">${product.name}</span><span class="cart-product-unit">${rupees(unitPriceFor(product))} per piece</span></div>
      <div class="cart-quantity" aria-label="${product.shortName} quantity">
        <button type="button" data-cart-step="-1" data-product="${id}" aria-label="Remove one ${product.shortName}">−</button><span>${quantity}</span><button type="button" data-cart-step="1" data-product="${id}" aria-label="Add one ${product.shortName}">+</button>
      </div>
      <span class="cart-row-total">${rupees(quantity * unitPriceFor(product))}</span>
      <button class="cart-remove" type="button" data-remove="${id}" aria-label="Remove ${product.shortName} from basket">Remove</button>
    </div>`;
  }).join("");
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 2700);
}

function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getEarliestDeliveryTime() {
  return new Date(Date.now() + SITE_CONFIG.orderNoticeHours * 60 * 60 * 1000);
}

function updateDateTimeConstraints() {
  const form = document.querySelector("#order-form");
  const dateInput = form.elements.date;
  const timeInput = form.elements.time;
  const earliest = getEarliestDeliveryTime();
  const earliestDate = localDateString(earliest);
  dateInput.min = earliestDate;
  if (!dateInput.value || dateInput.value < earliestDate) dateInput.value = earliestDate;
  timeInput.min = dateInput.value === earliestDate
    ? `${String(earliest.getHours()).padStart(2, "0")}:${String(earliest.getMinutes()).padStart(2, "0")}`
    : "00:00";
  if (dateInput.value === earliestDate && timeInput.value && timeInput.value < timeInput.min) timeInput.value = "";
}

function getOrderMessage(formData) {
  const lines = [
    `Hello ${SITE_CONFIG.businessName}!`,
    "",
    "I'd like to place an order.",
    "",
    "Order:",
    ...[...cart.entries()].flatMap(([id, quantity]) => {
      const product = productById(id);
      return [`• ${product.shortName} — ${quantity} ${quantity === 1 ? "piece" : "pieces"} — ${rupees(quantity * unitPriceFor(product))}`, ""];
    }),
    `Total Pieces: ${cartPieces()}`,
    "",
    `Item Subtotal: ${rupees(cartSubtotal())}`,
    "",
    "Delivery Charges: Please confirm.",
    "",
    "Customer:",
    `Name: ${formData.get("name").trim()}`,
    `Phone: ${formData.get("phone").trim()}`,
    `Address: ${formData.get("address").trim()}`,
    `Area: ${formData.get("area").trim()}`,
    `PIN: ${formData.get("pin").trim()}`,
    `Delivery Date: ${formData.get("date")}`,
    `Delivery Time: ${formData.get("time")}`,
    `Special Instructions: ${formData.get("instructions").trim() || "None"}`,
    "",
    `I understand that orders must be placed at least ${SITE_CONFIG.orderNoticeHours} hours before delivery.`
  ];
  return lines.join("\n");
}

function buildSchemas() {
  const products = SITE_CONFIG.products.map(product => ({
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    brand: { "@type": "Brand", name: SITE_CONFIG.businessName },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: unitPriceFor(product),
      availability: "https://schema.org/InStock",
      url: "https://example.com/#sweets"
    }
  }));
  document.querySelector("#product-schema").textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_CONFIG.businessName} Sweets`,
    itemListElement: products.map((item, index) => ({ "@type": "ListItem", position: index + 1, item }))
  });
  document.querySelector("#business-schema").textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: SITE_CONFIG.businessName,
    description: "Homemade Bengali-style sweets in Mumbai. Orders confirmed through WhatsApp.",
    telephone: `+${SITE_CONFIG.whatsappNumber}`,
    address: { "@type": "PostalAddress", addressLocality: "Mumbai", addressRegion: "Maharashtra", addressCountry: "IN" },
    areaServed: SITE_CONFIG.deliveryArea,
    sameAs: [`https://wa.me/${SITE_CONFIG.whatsappNumber}`],
    url: "https://example.com/"
  });
}

function setupInteractions() {
  document.querySelector("#announcement").textContent = SITE_CONFIG.announcement
    .replace("{hours}", String(SITE_CONFIG.orderNoticeHours))
    .replace("{method}", SITE_CONFIG.deliveryMethod);
  if (SITE_CONFIG.seasonalBanner.enabled) {
    document.body.dataset.season = SITE_CONFIG.seasonalBanner.theme;
    const seasonalBanner = document.querySelector("#seasonal-banner");
    seasonalBanner.textContent = SITE_CONFIG.seasonalBanner.message;
    seasonalBanner.hidden = false;
  }
  document.querySelector("#year").textContent = new Date().getFullYear();
  document.querySelector("#hero-title-main").textContent = SITE_CONFIG.heroTitleMain;
  document.querySelector("#hero-title-em").textContent = SITE_CONFIG.heroTitleEmphasis;
  document.querySelector("#story-text").textContent = SITE_CONFIG.story;
  document.querySelectorAll(".brand-name").forEach(element => { element.textContent = SITE_CONFIG.businessName; });
  document.querySelectorAll(".brand-tagline").forEach(element => { element.textContent = SITE_CONFIG.tagline; });
  document.querySelectorAll(".business-name").forEach(element => { element.textContent = SITE_CONFIG.businessName; });
  document.querySelector("#splash-name").textContent = SITE_CONFIG.businessName;
  document.querySelectorAll(".whatsapp-display").forEach(element => { element.textContent = SITE_CONFIG.whatsappDisplay; });
  document.querySelectorAll(".delivery-method").forEach(element => { element.textContent = SITE_CONFIG.deliveryMethod; });
  document.querySelectorAll(".delivery-area").forEach(element => { element.textContent = SITE_CONFIG.deliveryArea; });
  document.querySelectorAll(".order-notice").forEach(element => { element.textContent = `${SITE_CONFIG.orderNoticeHours} hours`; });
  document.title = `${SITE_CONFIG.businessName} — ${SITE_CONFIG.tagline}`;
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[name="twitter:title"]').content = document.title;
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link => {
    link.href = `https://wa.me/${SITE_CONFIG.whatsappNumber}`;
  });
  document.querySelector("#mini-cart").addEventListener("click", () => {
    document.querySelector("#order").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelector("#product-grid").addEventListener("click", event => {
    const stepButton = event.target.closest("[data-quantity-step]");
    if (stepButton) {
      const input = document.querySelector(`[data-quantity="${stepButton.dataset.product}"]`);
      input.value = Math.max(1, Math.min(999, (Number(input.value) || 1) + Number(stepButton.dataset.quantityStep)));
      return;
    }
    const addButton = event.target.closest("[data-add-product]");
    if (addButton) {
      const id = addButton.dataset.addProduct;
      const input = document.querySelector(`[data-quantity="${id}"]`);
      const quantity = Number(input.value);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
        input.setCustomValidity("Choose a quantity from 1 to 999 pieces.");
        input.reportValidity();
        input.addEventListener("input", () => input.setCustomValidity(""), { once: true });
        return;
      }
      if ((cart.get(id) || 0) + quantity > 999) {
        showToast("The maximum basket quantity for one sweet is 999 pieces.");
        return;
      }
      cart.set(id, (cart.get(id) || 0) + quantity);
      renderCart();
      showToast(`${quantity} ${quantity === 1 ? "piece" : "pieces"} of ${productById(id).shortName} added`);
    }
  });
  document.querySelector("#cart-items").addEventListener("click", event => {
    const step = event.target.closest("[data-cart-step]");
    if (step) {
      const id = step.dataset.product;
      const updated = (cart.get(id) || 0) + Number(step.dataset.cartStep);
      if (updated <= 0) cart.delete(id);
      else if (updated > 999) {
        showToast("The maximum basket quantity for one sweet is 999 pieces.");
        return;
      }
      else cart.set(id, updated);
      renderCart();
      return;
    }
    const remove = event.target.closest("[data-remove]");
    if (remove) {
      cart.delete(remove.dataset.remove);
      renderCart();
      showToast("Removed from your basket");
    }
  });

  const form = document.querySelector("#order-form");
  ["name", "address", "area"].forEach(name => {
    form.elements[name].addEventListener("input", () => form.elements[name].setCustomValidity(""));
  });
  updateDateTimeConstraints();
  form.elements.date.addEventListener("change", updateDateTimeConstraints);
  form.elements.time.addEventListener("focus", updateDateTimeConstraints);
  setInterval(updateDateTimeConstraints, 60_000);
  form.addEventListener("submit", event => {
    event.preventDefault();
    const message = document.querySelector("#form-message");
    message.textContent = "";
    if (!cart.size) {
      message.textContent = "Add at least one sweet to your basket before continuing.";
      document.querySelector("#sweets").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    updateDateTimeConstraints();
    if (!form.reportValidity()) return;
    const emptyField = ["name", "address", "area"].find(name => !form.elements[name].value.trim());
    if (emptyField) {
      form.elements[emptyField].setCustomValidity("Please enter this information.");
      form.reportValidity();
      form.elements[emptyField].focus();
      return;
    }
    const phoneDigits = form.elements.phone.value.replace(/\D/g, "").length;
    if (phoneDigits < 8 || phoneDigits > 15) {
      form.elements.phone.setCustomValidity("Enter a valid phone number with 8 to 15 digits.");
      form.elements.phone.reportValidity();
      form.elements.phone.focus();
      form.elements.phone.addEventListener("input", () => form.elements.phone.setCustomValidity(""), { once: true });
      return;
    }
    const requested = new Date(`${form.elements.date.value}T${form.elements.time.value}`);
    if (Number.isNaN(requested.getTime()) || requested.getTime() < getEarliestDeliveryTime().getTime()) {
      message.textContent = `Please choose a delivery time at least ${SITE_CONFIG.orderNoticeHours} hours from now.`;
      form.elements.time.focus();
      return;
    }
    lastOrderMessage = getOrderMessage(new FormData(form));
    const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(lastOrderMessage)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    document.querySelector("#open-whatsapp").href = whatsappUrl;
    document.querySelector("#fallback-actions").hidden = false;
    showToast("Your order is ready. Send it in WhatsApp to request confirmation.");
  });

  document.querySelector("#copy-message").addEventListener("click", async () => {
    if (!lastOrderMessage) return;
    try {
      await navigator.clipboard.writeText(lastOrderMessage);
      showToast("Order message copied");
    } catch (error) {
      const temp = document.createElement("textarea");
      temp.value = lastOrderMessage;
      temp.setAttribute("readonly", "");
      temp.style.position = "fixed";
      temp.style.opacity = "0";
      document.body.append(temp);
      temp.select();
      const copied = document.execCommand("copy");
      temp.remove();
      if (copied) showToast("Order message copied");
      else showToast("Please select and copy the order message in the WhatsApp tab.");
    }
  });

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#site-nav");
  function closeMenu() {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  });
  nav.addEventListener("click", event => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  const progress = document.querySelector("#scroll-progress");
  function updateProgress() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${total > 0 ? (window.scrollY / total) * 100 : 0}%`;
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
  } else {
    document.querySelectorAll(".reveal").forEach(element => element.classList.add("is-visible"));
  }

  const splash = document.querySelector("#splash");
  const hideSplash = () => splash.classList.add("is-hidden");
  if (document.readyState === "complete") setTimeout(hideSplash, 1000);
  else window.addEventListener("load", hideSplash, { once: true });
  setTimeout(hideSplash, 1600);
}

renderProducts();
renderCart();
buildSchemas();
setupInteractions();
