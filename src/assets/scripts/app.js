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

swup.hooks.on("page:view", () => {
  window.scrollTo({ top: 0, behavior: "instant" });
  initNavbar();
  initLenis();
  initWorkFilters();
  initBlogFilters();
  updateNavActive();
});
