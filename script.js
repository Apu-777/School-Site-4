
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s, p = document) => p.querySelector(s), $$ = (s, p = document) => [...p.querySelectorAll(s)];

  // Mobile navigation
  const menu = $(".menu-btn"), nav = $(".nav-links");
  if (menu) menu.addEventListener("click", () => nav.classList.toggle("open"));
  $$(".nav-links a").forEach(a => a.addEventListener("click", () => nav?.classList.remove("open")));

  // English / Bangla switcher
  const lang = $(".lang-btn");
  function setLanguage(code) {
    document.documentElement.classList.toggle("bn", code === "bn");
    localStorage.setItem("eduvision-language", code);
    if (lang) lang.textContent = code === "bn" ? "English" : "বাংলা";
    document.documentElement.lang = code === "bn" ? "bn" : "en";
  }
  setLanguage(localStorage.getItem("eduvision-language") || "en");
  lang?.addEventListener("click", () => setLanguage(document.documentElement.classList.contains("bn") ? "en" : "bn"));

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

  // Animated counters
  $$(".count").forEach(el => {
    const target = Number(el.dataset.target || 0), suffix = el.dataset.suffix || "";
    let start = 0; const duration = 1100, started = performance.now();
    function tick(now) {
      const p = Math.min((now - started) / duration, 1), value = Math.floor(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = value.toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
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
  $$(".gallery img").forEach(img => img.addEventListener("click", () => { if (lightbox) { lightImg.src = img.src; lightbox.classList.add("show") } }));
  lightbox?.addEventListener("click", e => { if (e.target === lightbox || e.target.classList.contains("close")) lightbox.classList.remove("show") });

  // Demo forms
  const toast = $(".toast");
  $$("form[data-demo]").forEach(form => form.addEventListener("submit", e => {
    e.preventDefault();
    if (toast) {
      toast.textContent = document.documentElement.classList.contains("bn") ? "আপনার বার্তা সফলভাবে পাঠানো হয়েছে।" : "Your message has been submitted successfully.";
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
