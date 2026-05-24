import Swup from "swup";

function initFilters() {
  var container = document.querySelector('[data-filter="container"]');
  var tabs = document.querySelectorAll('[data-filter="tabs"] .filter-tabs__btn');
  if (!container || !tabs.length) return;

  tabs.forEach(function(btn) {
    btn.addEventListener('click', function() {
      tabs.forEach(function(b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');

      var filter = btn.getAttribute('data-filter');
      var cards = container.querySelectorAll('.card');

      cards.forEach(function(c) { c.classList.add('card-leave'); });

      setTimeout(function() {
        var i = 0;
        cards.forEach(function(c) {
          var match = filter === 'all' || c.getAttribute('data-filter') === filter;
          c.style.display = match ? '' : 'none';
          c.classList.remove('card-leave');
          if (match) {
            c.style.setProperty('--stagger', i * 500 + 'ms');
            c.classList.add('card-enter');
            i++;
          }
        });
      }, 250);

      setTimeout(function() {
        cards.forEach(function(c) { c.classList.remove('card-enter'); });
      }, 600 + cards.length * 50);
    });
  });
}

const swup = new Swup({
  containers: ["#swup"],
  plugins: [],
});

initFilters();

swup.hooks.on("page:view", () => {
  window.scrollTo({ top: 0, behavior: "instant" });
  initFilters();
});
