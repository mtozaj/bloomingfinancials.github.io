/*
 * Shared behaviour for every page: the mobile menu, the Services dropdown and
 * mobile accordion, the back-to-top button, and phone/email click tracking.
 * Page-specific scripts (forms, testimonials, blog search) stay on their pages.
 * The markup these hook into lives in _partials/ (see tools/build.py).
 */
(function () {
  'use strict';

  var OPEN_CLASSES = ['translate-y-0', 'opacity-100', 'visible', 'pointer-events-auto', 'shadow-lg'];
  var CLOSED_CLASSES = ['-translate-y-full', 'opacity-0', 'invisible', 'pointer-events-none'];

  var toggle = document.getElementById('mobileToggle');
  var menu = document.getElementById('mobileMenu');

  function setAccordion(group, open) {
    var button = group.querySelector('[data-mobile-services-toggle]');
    var panel = group.querySelector('[data-mobile-services-panel]');
    if (!button || !panel) return;
    panel.classList.toggle('hidden', !open);
    button.setAttribute('aria-expanded', String(open));
    var chevron = button.querySelector('svg, i');
    if (chevron) chevron.classList.toggle('rotate-180', open);
  }

  function setMenu(open) {
    menu.classList.remove.apply(menu.classList, open ? CLOSED_CLASSES : OPEN_CLASSES);
    menu.classList.add.apply(menu.classList, open ? OPEN_CLASSES : CLOSED_CLASSES);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.querySelectorAll('[data-menu-icon]').forEach(function (icon) {
      icon.classList.toggle('hidden', icon.getAttribute('data-menu-icon') !== (open ? 'close' : 'open'));
    });
    document.body.classList.toggle('mobile-menu-open', open);
    if (!open) {
      document.querySelectorAll('[data-mobile-services]').forEach(function (group) { setAccordion(group, false); });
    }
  }

  if (toggle && menu) {
    var isOpen = function () { return toggle.getAttribute('aria-expanded') === 'true'; };
    toggle.addEventListener('click', function () { setMenu(!isOpen()); });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        setMenu(false);
        toggle.focus();
      }
    });
    // The panel is hidden at md and up; don't leave the page scroll-locked
    // if the window is resized (or a tablet rotated) while it's open.
    var desktop = window.matchMedia('(min-width: 768px)');
    var onBreakpoint = function (e) { if (e.matches && isOpen()) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
    else if (desktop.addListener) desktop.addListener(onBreakpoint);
  }

  // Mobile Services accordion
  document.querySelectorAll('[data-mobile-services]').forEach(function (group) {
    var button = group.querySelector('[data-mobile-services-toggle]');
    var panel = group.querySelector('[data-mobile-services-panel]');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      setAccordion(group, panel.classList.contains('hidden'));
    });
  });

  // Desktop Services dropdown: opens on hover and keyboard focus
  document.querySelectorAll('[data-services-menu]').forEach(function (group) {
    var link = group.querySelector('a[aria-haspopup]');
    var panel = group.querySelector('[data-services-panel]');
    if (!link || !panel) return;
    var open = function () { panel.classList.remove('hidden'); link.setAttribute('aria-expanded', 'true'); };
    var close = function () { panel.classList.add('hidden'); link.setAttribute('aria-expanded', 'false'); };
    group.addEventListener('mouseenter', open);
    group.addEventListener('mouseleave', close);
    link.addEventListener('focus', open);
    group.addEventListener('focusout', function (e) { if (!group.contains(e.relatedTarget)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  });

  // Back to top
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    var onScroll = function () { backToTop.classList.toggle('hidden', window.pageYOffset <= 300); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    backToTop.addEventListener('click', function () {
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      // The button hides near the top, so hand keyboard focus to the page start.
      var start = document.querySelector('#main-content, #home');
      if (start) start.focus({ preventScroll: true });
    });
  }

  // Taps on phone and email links, reported to Analytics when allowed
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (link && window.BF && window.BF.trackEvent) {
      window.BF.trackEvent(link.protocol === 'tel:' ? 'click_to_call' : 'click_to_email');
    }
  });
})();
