import Swup from "swup";
import { initNavbar } from "./navbar.js";

function applyFilter(filter) {
  var container = document.querySelector('[data-filter="container"]');
  var tabs = document.querySelectorAll('[data-filter="tabs"] .filter-tabs__btn');
  if (!container || !tabs.length) return;

  tabs.forEach(function(b) {
    b.classList.toggle('is-active', b.getAttribute('data-filter') === filter);
  });

  var cards = container.querySelectorAll('.card');
  cards.forEach(function(c) { c.classList.add('card-leave'); });

  setTimeout(function() {
    var i = 0;
    var visibleCards = [];
    cards.forEach(function(c) {
      var match = filter === 'all' || c.getAttribute('data-filter') === filter;
      c.style.display = match ? '' : 'none';
      if (match) {
        visibleCards.push(c);
        c.style.setProperty('--stagger', i * 100 + 'ms');
        c.classList.add('card-enter');
        i++;
      }
      c.classList.remove('card-leave');
    });

    setTimeout(function() {
      visibleCards.forEach(function(c) { c.classList.remove('card-enter'); });
    }, 400 + i * 100);
  }, 200);
}

function initFilters() {
  var container = document.querySelector('[data-filter="container"]');
  var tabs = document.querySelectorAll('[data-filter="tabs"] .filter-tabs__btn');
  if (!container || !tabs.length) return;

  // Read filter from URL on load
  var params = new URLSearchParams(window.location.search);
  var urlFilter = params.get('type');
  if (urlFilter) {
    applyFilter(urlFilter);
  }

  tabs.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var filter = btn.getAttribute('data-filter');
      // Update URL without navigating
      var url = new URL(window.location);
      if (filter === 'all') {
        url.searchParams.delete('type');
      } else {
        url.searchParams.set('type', filter);
      }
      history.replaceState(null, '', url);
      applyFilter(filter);
    });
  });
}

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
initFilters();
updateNavActive();

swup.hooks.on("page:view", () => {
  window.scrollTo({ top: 0, behavior: "instant" });
  initFilters();
  updateNavActive();
});
