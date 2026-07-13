import Lenis from "lenis";

let lenis;
let toyLeft, toyRight;
let heroToyLeft, heroToyRight;
let revealObserver;

function updateToys({ scroll, limit }) {
  if (!toyLeft || !toyRight) return;
  if (window.innerWidth <= 768) return;

  const vh = window.innerHeight;
  const revealStart = limit - vh;
  const progress = Math.max(0, Math.min(1, (scroll - revealStart) / vh));

  toyLeft.style.transform = `translateX(${-50 + 50 * progress}%)`;
  toyLeft.style.bottom = "0";
  toyLeft.style.left = "0";
  toyLeft.style.top = "";
  toyLeft.style.right = "";
  toyLeft.style.transformOrigin = "bottom left";
  toyLeft.style.transition = "none";

  toyRight.style.transform = `translateX(${50 - 50 * progress}%)`;
  toyRight.style.bottom = "0";
  toyRight.style.right = "0";
  toyRight.style.top = "";
  toyRight.style.left = "";
  toyRight.style.transformOrigin = "bottom right";
  toyRight.style.transition = "none";
}

function updateHeroToys({ scroll }) {
  if (!heroToyLeft || !heroToyRight) return;
  if (window.innerWidth <= 768) return;

  const vh = window.innerHeight;
  const progress = Math.max(0, Math.min(1, scroll / vh));

  heroToyLeft.style.transform = `translateX(${-50 * progress}%)`;
  heroToyLeft.style.top = "0";
  heroToyLeft.style.left = "0";
  heroToyLeft.style.right = "";
  heroToyLeft.style.bottom = "";
  heroToyLeft.style.transformOrigin = "top left";
  heroToyLeft.style.transition = "none";

  heroToyRight.style.transform = `translateX(${50 * progress}%)`;
  heroToyRight.style.top = "0";
  heroToyRight.style.right = "0";
  heroToyRight.style.left = "";
  heroToyRight.style.bottom = "";
  heroToyRight.style.transformOrigin = "top right";
  heroToyRight.style.transition = "none";
}

function initScrollReveal() {
  var els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, {
    rootMargin: '0px 0px -20% 0px',
    threshold: 0
  });

  els.forEach(function(el) { revealObserver.observe(el); });
}

function initLenis() {
  lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
  });

  toyLeft = document.querySelector('[data-lenis-toy="left"]');
  toyRight = document.querySelector('[data-lenis-toy="right"]');
  heroToyLeft = document.querySelector('[data-lenis-hero-toy="left"]');
  heroToyRight = document.querySelector('[data-lenis-hero-toy="right"]');

  // Force native scrollbar visible (macOS hides overlay scrollbars by default)
  document.documentElement.style.overflowY = "scroll";
  // Re-apply after Lenis fully settles
  setTimeout(function() {
    document.documentElement.style.overflowY = "scroll";
  }, 50);

  lenis.on("scroll", updateToys);
  lenis.on("scroll", updateHeroToys);
  initScrollReveal();

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

function destroyLenis() {
  revealObserver?.disconnect();
  revealObserver = null;
  lenis?.destroy();
  lenis = null;
  toyLeft = null;
  toyRight = null;
  heroToyLeft = null;
  heroToyRight = null;
}

export { initLenis, destroyLenis };
