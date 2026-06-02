var _navbarInitialized = false;

function initNavbar() {
  var navbar = document.querySelector('.navbar');
  var toggle = document.querySelector('.navbar__toggle');
  var menu = document.querySelector('.navbar__menu');

  if (!toggle || !navbar) return;

  var heroSplash = document.querySelector('.hero-splash');

  if (heroSplash) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        navbar.classList.toggle('scrolled', !entry.isIntersecting);
      });
    });
    observer.observe(heroSplash);
  } else {
    function onScroll() {
      navbar.classList.toggle('scrolled', window.scrollY > 0);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (!_navbarInitialized) {
    _navbarInitialized = true;

    var animTimeout = null;

    function closeMenu(callback) {
      if (navbar.getAttribute('data-state') !== 'active') {
        if (callback) callback();
        return;
      }
      navbar.setAttribute('data-state', 'closing');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('is-active');
      clearTimeout(animTimeout);
      animTimeout = setTimeout(function() {
        navbar.setAttribute('data-state', 'idle');
        if (callback) callback();
      }, 350);
    }

    toggle.addEventListener('click', function() {
      if (navbar.getAttribute('data-state') === 'active') {
        closeMenu();
      } else {
        clearTimeout(animTimeout);
        navbar.setAttribute('data-state', 'active');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.classList.add('is-active');
      }
    });

    if (menu) {
      menu.addEventListener('click', function(e) {
        var link = e.target.closest('.navbar__link');
        if (link && navbar.getAttribute('data-state') === 'active') {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
          var swup = window.__swup;
          if (swup) {
            swup.navigate(link.getAttribute('href'));
          } else {
            window.location.href = link.getAttribute('href');
          }
        }
      });
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navbar.getAttribute('data-state') === 'active') {
        closeMenu();
      }
    });
  }
}

export { initNavbar };
