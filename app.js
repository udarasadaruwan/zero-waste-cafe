/* Data: one source of truth for the menu, separate from presentation. */
const menu = {
  plates: [
    {
      name: "Fire-roasted cauliflower",
      description: "Herb oil, smoked cashew cream, a little chilli.",
      price: 2400,
      diet: "VG",
    },
    {
      name: "Charred chicken",
      description: "Lime, black pepper, slow-roasted garlic.",
      price: 3200,
    },
    {
      name: "Catch over coals",
      description: "Market fish, curry leaf butter, burnt lemon.",
      price: 3800,
    },
    {
      name: "Mushroom & miso rice",
      description: "Roasted mushrooms, miso, crisp shallots.",
      price: 2600,
      diet: "VG",
    },
  ],
  sides: [
    {
      name: "Crisp potatoes",
      description: "Sea salt, rosemary, smoked garlic dip.",
      price: 950,
      diet: "V",
    },
    {
      name: "Greens from the grill",
      description: "Seasonal greens, lime, toasted sesame.",
      price: 850,
      diet: "VG",
    },
  ],
  drinks: [
    {
      name: "The slow cooler",
      description: "Passion fruit, lime, soda. Alcohol-free.",
      price: 750,
    },
    {
      name: "Cold-brew Ceylon tea",
      description: "Black tea, orange peel, a touch of jaggery.",
      price: 650,
    },
  ],
};
const menuContainer = document.querySelector("#menu-items");
const categoryButtons = document.querySelectorAll("[data-category]");
/* Rendering: textContent keeps text separate from HTML markup. */
function renderMenu(category) {
  if (!Object.hasOwn(menu, category)) throw new Error("Unknown menu category.");
  menuContainer.classList.remove("is-ready");
  menuContainer.replaceChildren();
  menu[category].forEach((dish, index) => {
    const article = document.createElement("article");
    article.className = "dish";
    article.style.setProperty("--stagger", index);
    const details = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = dish.name;
    if (dish.diet) {
      const badge = document.createElement("span");
      badge.className = "diet";
      badge.textContent = dish.diet;
      title.append(badge);
    }
    const description = document.createElement("p");
    description.textContent = dish.description;
    const price = document.createElement("span");
    price.className = "dish-price";
    price.textContent = dish.price.toLocaleString("en-LK");
    details.append(title, description);
    article.append(details, price);
    menuContainer.append(article);
  });
  categoryButtons.forEach((button) => {
    const selected = button.dataset.category === category;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  requestAnimationFrame(() => menuContainer.classList.add("is-ready"));
  return { category, dishes: menu[category] };
}
categoryButtons.forEach((button) =>
  button.addEventListener("click", () => renderMenu(button.dataset.category)),
);
renderMenu("plates");
/* Navigation: a single function keeps visual and accessible state in sync. */
const navToggle = document.querySelector(".nav-toggle");
const navigation = document.querySelector("#navigation");
function setNavigation(open) {
  navToggle.setAttribute("aria-expanded", String(open));
  navigation.classList.toggle("is-open", open);
}
navToggle.addEventListener("click", () =>
  setNavigation(navToggle.getAttribute("aria-expanded") !== "true"),
);
navigation
  .querySelectorAll("a")
  .forEach((link) =>
    link.addEventListener("click", () => setNavigation(false)),
  );
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setNavigation(false);
});
/* Motion: reveal existing sections gently as they enter the viewport. */
const revealTargets = document.querySelectorAll(
  ".section-heading, .approach-inner, .visit-section, .footer",
);
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.16 },
  );
  revealTargets.forEach((target) => {
    target.classList.add("reveal-on-scroll");
    revealObserver.observe(target);
  });
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}
/* Reservation preview: deliberately no network requests or personal data storage. */
const dialog = document.querySelector("#booking-dialog");
const form = document.querySelector("#booking-form");
const result = document.querySelector("#booking-result");
const dateInput = document.querySelector("#booking-date");
const cafeWhatsAppNumber = "94787110449";
function localDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function resetBooking() {
  form.hidden = false;
  result.hidden = true;
  document.querySelector("#booking-error").textContent = "";
}
function openBooking() {
  resetBooking();
  dateInput.min = localDateString();
  if (!dateInput.value || dateInput.value < dateInput.min)
    dateInput.value = dateInput.min;
  if (!dialog.open) dialog.showModal();
}
document
  .querySelectorAll("[data-book]")
  .forEach((button) => button.addEventListener("click", openBooking));
document
  .querySelector(".close-button")
  .addEventListener("click", () => dialog.close());
document.querySelector("#booking-reset").addEventListener("click", () => {
  resetBooking();
  dateInput.focus();
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const values = new FormData(form);
  const name = String(values.get("name")).trim();
  const date = values.get("date");
  const parsedDate = new Date(`${date}T12:00:00`);
  const error = document.querySelector("#booking-error");
  if (!name) {
    error.textContent = "Please add your name.";
    return;
  }
  if (date < localDateString()) {
    error.textContent = "Please choose today or a future date.";
    return;
  }
  if (parsedDate.getDay() === 1) {
    error.textContent = "Mondays are our day off. Choose Tuesday to Sunday.";
    return;
  }
  error.textContent = "";
  const formattedDate = parsedDate.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
  const guests = values.get("guests");
  const note = String(values.get("note")).trim() || "No special note.";
  const message = [
    "Hello EMBER, I would like to reserve a table.",
    "",
    `Name: ${name}`,
    `Date: ${formattedDate}`,
    `Time: ${values.get("time")}`,
    `Guests: ${guests}`,
    `Note: ${note}`,
    "",
    "Please confirm availability. Thank you.",
  ].join("\n");
  const whatsappUrl = `https://wa.me/${cafeWhatsAppNumber}?text=${encodeURIComponent(message)}`;
  const whatsappWindow = window.open(whatsappUrl, "_blank");
  if (!whatsappWindow) window.location.href = whatsappUrl;
  document.querySelector("#booking-summary").textContent =
    `${guests} ${guests === "1" ? "guest" : "guests"} · ${formattedDate} · ${values.get("time")}`;
  form.hidden = true;
  result.hidden = false;
  document.querySelector("#booking-reset").focus();
});
/* Optional browser agent integration. Normal browsing never depends on this API. */
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  try {
    Promise.resolve(
      document.modelContext.registerTool(
        {
          name: "show_menu_category",
          description:
            "Display one restaurant menu category. Does not order food or book a table.",
          inputSchema: {
            type: "object",
            properties: {
              category: { type: "string", enum: ["plates", "sides", "drinks"] },
            },
            required: ["category"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            if (
              !input ||
              typeof input !== "object" ||
              Object.keys(input).length !== 1 ||
              typeof input.category !== "string"
            )
              throw new Error("Provide one valid category.");
            return renderMenu(input.category);
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
  } catch {
    /* Unsupported experimental registration must not break the menu. */
  }
  window.addEventListener("pagehide", () => lifecycle.abort(), { once: true });
}
