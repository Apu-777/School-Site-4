// Shapla Ideal School & College — shared behaviour

/* ---------------------------------------------------------------
   Language switcher (Bengali default, English optional)
   - Bengali text is written directly in the HTML.
   - English lives in data-en (inner HTML) and data-en-<attr>
     (placeholder, alt, aria-label, title) on the same element.
   - The choice is remembered in localStorage under "site-lang".
---------------------------------------------------------------- */
var SiteLang = (function () {
  var KEY = "site-lang";
  var ATTRS = ["placeholder", "alt", "aria-label", "title"];
  var BN_DIGITS = "০১২৩৪৫৬৭৮৯";
  var listeners = [];
  var current = "bn";

  function stored() {
    try { return localStorage.getItem(KEY) === "en" ? "en" : "bn"; } catch (e) { return "bn"; }
  }
  function remember(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) { /* storage unavailable: still switch for this page */ }
  }

  function apply(lang) {
    current = lang;
    var root = document.documentElement;
    root.lang = lang;

    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (el._bn === undefined) el._bn = el.innerHTML;
      el.innerHTML = lang === "en" ? el.getAttribute("data-en") : el._bn;
    });

    ATTRS.forEach(function (attr) {
      document.querySelectorAll("[data-en-" + attr + "]").forEach(function (el) {
        var key = "_bn_" + attr;
        if (el[key] === undefined) el[key] = el.getAttribute(attr) || "";
        el.setAttribute(attr, lang === "en" ? el.getAttribute("data-en-" + attr) : el[key]);
      });
    });

    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === lang ? "true" : "false");
    });

    root.classList.remove("lang-pending");
    listeners.forEach(function (fn) { fn(lang); });
  }

  // Western digits -> Bengali digits when the page is in Bengali.
  function num(str) {
    return current === "en" ? String(str) : String(str).replace(/[0-9]/g, function (d) { return BN_DIGITS[d]; });
  }

  document.querySelectorAll(".lang-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.getAttribute("data-lang");
      if (lang === current) return;
      remember(lang);
      apply(lang);
    });
  });

  // Bengali is already in the markup, so only switch when English was chosen.
  if (stored() === "en") apply("en");
  else document.documentElement.classList.remove("lang-pending");

  return {
    current: function () { return current; },
    num: num,
    onChange: function (fn) { listeners.push(fn); }
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  const $ = (s, p = document) => p.querySelector(s), $$ = (s, p = document) => [...p.querySelectorAll(s)];

  // Mobile navigation
  const menu = $(".menu-btn"), nav = $(".nav-links");
  if (menu) menu.addEventListener("click", () => nav.classList.toggle("open"));
  $$(".nav-links a").forEach(a => a.addEventListener("click", () => nav?.classList.remove("open")));

  // Hero image carousel
  const slides = $$(".hero-slide"), dots = $$(".slider-dot");
  let current = 0, timer;
  function showSlide(i) {
    if (!slides.length) return;
    current = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle("active", n === current));
    dots.forEach((d, n) => d.classList.toggle("active", n === current));
  }
  function auto() { clearInterval(timer); timer = setInterval(() => showSlide(current + 1), 6000) }
  $$(".slider-dot").forEach((d, i) => d.addEventListener("click", () => { showSlide(i); auto() }));
  $(".hero-next")?.addEventListener("click", () => { showSlide(current + 1); auto() });
  $(".hero-prev")?.addEventListener("click", () => { showSlide(current - 1); auto() });
  if (slides.length) { showSlide(0); auto() }

  // Generic horizontal carousels
  function carousel(trackSelector, cardSelector, stepFactor = 1) {
    const track = $(trackSelector); if (!track) return;
    const cards = $$(cardSelector, track); if (!cards.length) return;
    const next = track.parentElement.querySelector(".carousel-next"), prev = track.parentElement.querySelector(".carousel-prev");
    const move = () => Math.max(280, cards[0].getBoundingClientRect().width + 18) * stepFactor;
    next?.addEventListener("click", () => track.scrollBy({ left: move(), behavior: "smooth" }));
    prev?.addEventListener("click", () => track.scrollBy({ left: -move(), behavior: "smooth" }));
  }
  carousel(".teacher-track", ".teacher-card");
  carousel(".testimonial-track", ".testimonial");

  // Animated counters (Bengali digits in Bengali mode)
  $$(".count").forEach(el => {
    const target = Number(el.dataset.target || 0), suffix = el.dataset.suffix || "";
    let value = 0;
    const render = () => { el.textContent = SiteLang.num(value.toLocaleString("en-US")) + suffix; };
    const duration = 1100, started = performance.now();
    function tick(now) {
      const p = Math.min((now - started) / duration, 1);
      value = Math.floor(target * (1 - Math.pow(1 - p, 3)));
      render();
      if (p < 1) requestAnimationFrame(tick);
    }
    SiteLang.onChange(render);
    requestAnimationFrame(tick);
  });

  // Event filters
  $$(".filter").forEach(btn => btn.addEventListener("click", () => {
    $$(".filter").forEach(b => b.classList.remove("active")); btn.classList.add("active");
    const value = btn.dataset.filter;
    $$("[data-category]").forEach(card => card.style.display = (value === "all" || card.dataset.category === value) ? "" : "none");
  }));

  // Gallery lightbox
  const lightbox = $(".lightbox"), lightImg = $(".lightbox img");
  $$(".gallery img").forEach(img => img.addEventListener("click", () => { if (lightbox) { lightImg.src = img.src; lightImg.alt = img.alt; lightbox.classList.add("show") } }));
  lightbox?.addEventListener("click", e => { if (e.target === lightbox || e.target.classList.contains("close")) lightbox.classList.remove("show") });

  // Demo forms
  const toast = $(".toast");
  $$("form[data-demo]").forEach(form => form.addEventListener("submit", e => {
    e.preventDefault();
    if (toast) {
      toast.textContent = SiteLang.current() === "en"
        ? "Thanks! This is a demo form, so nothing was actually sent."
        : "ধন্যবাদ! এটা ডেমো ফর্ম, তাই আসলে কিছু পাঠানো হয়নি।";
      toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 3000);
    }
    form.reset();
  }));

  // Back to top
  const top = $(".top-btn");
  if (top) {
    window.addEventListener("scroll", () => top.classList.toggle("show", window.scrollY > 450));
    top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
});
