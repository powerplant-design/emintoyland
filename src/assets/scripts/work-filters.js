function applyWorkFilter(filter) {
  var container = document.querySelector('[data-filter="container"]:not([data-filter-type="blog"])');
  var tabs = container ? container.parentElement.querySelectorAll('[data-filter="tabs"]:not([data-filter-type="blog"]) .filter-tabs__btn') : [];
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

function initWorkFilters() {
  var container = document.querySelector('[data-filter="container"]:not([data-filter-type="blog"])');
  var tabs = container ? container.parentElement.querySelectorAll('[data-filter="tabs"]:not([data-filter-type="blog"]) .filter-tabs__btn') : [];
  if (!container || !tabs.length) return;

  var params = new URLSearchParams(window.location.search);
  var urlFilter = params.get('type');
  if (urlFilter) {
    applyWorkFilter(urlFilter);
  }

  tabs.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var filter = btn.getAttribute('data-filter');
      var url = new URL(window.location);
      if (filter === 'all') {
        url.searchParams.delete('type');
      } else {
        url.searchParams.set('type', filter);
      }
      history.replaceState(null, '', url);
      applyWorkFilter(filter);
    });
  });
}

export { initWorkFilters };
