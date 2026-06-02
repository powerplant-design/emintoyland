import Swup from "swup";
import { initNavbar } from "./navbar.js";
import { initWorkFilters } from "./work-filters.js";
import { initBlogFilters } from "./blog-filters.js";
import { initLenis, destroyLenis } from "./lenis.js";

function updateNavActive() {
  var path = window.location.pathname;
  document.querySelectorAll('.navbar__link').forEach(function(link) {
    var href = link.getAttribute('href');
    var match = href === path || href === '/work/' && path.startsWith('/work/');
    link.toggleAttribute('aria-current', match);
  });
}

const swup = new Swup({
  containers: ["#swup"],
  plugins: [],
});

window.__swup = swup;

initNavbar();
initLenis();
initWorkFilters();
initBlogFilters();
updateNavActive();

swup.hooks.on("content:replace", () => {
  destroyLenis();
});

function initKitEmbed() {
  var old = document.querySelector('script[data-uid="a95fa68963"]');
  if (old) {
    var fresh = document.createElement('script');
    fresh.async = true;
    fresh.src = old.src;
    fresh.setAttribute('data-uid', 'a95fa68963');
    old.parentNode.replaceChild(fresh, old);
  }
}

swup.hooks.on("page:view", () => {
  window.scrollTo({ top: 0, behavior: "instant" });
  initNavbar();
  initLenis();
  initWorkFilters();
  initBlogFilters();
  updateNavActive();
  initKitEmbed();
});
