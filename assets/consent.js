/*
 * Privacy choices and consent-aware tracking, shared by every page.
 *
 * Google Analytics and the OpenAI (ChatGPT) Ads pixel load on every page
 * unless the visitor turns them off in the Privacy & Cookie Preferences
 * dialog. A Global Privacy Control signal from the browser turns advertising
 * off automatically. The choice is stored in localStorage under
 * bf_consent_v1 (the key the original privacy-page banner used, so earlier
 * choices carry over) and applies on every page.
 *
 * The dialog opens from any element with [data-privacy-choices]; the value
 * "dns" jumps to the Do Not Sell or Share section. A #do-not-sell URL hash
 * opens it too, and [data-privacy-reset] clears the saved choice.
 *
 * Pages report conversions through BF.trackLead(source) and other events
 * through BF.trackEvent(name), which only reach the services the visitor
 * allows. Never paste Google Analytics or pixel snippets into a page:
 * tools/check.py fails CI if a page loads them outside this file.
 */
(function () {
  'use strict';

  var GA_ID = 'G-RVPQPZB973';
  var OPENAI_PIXEL_ID = '2Hz8qV4vcyHVdviX5VJhAH';
  var STORAGE_KEY = 'bf_consent_v1';
  var gpc = navigator.globalPrivacyControl === true;
  var chosenThisPage = null; // used when localStorage is unavailable

  function readSaved() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved && typeof saved === 'object' ? saved : null;
    } catch (e) {
      return null;
    }
  }

  // Everything is on until the visitor opts out. Choices saved before the
  // Advertising switch existed follow the Analytics choice.
  function prefs() {
    var saved = chosenThisPage || readSaved() || {};
    var analytics = saved.analytics !== false;
    var advertising = typeof saved.advertising === 'boolean' ? saved.advertising : analytics;
    return { analytics: analytics, advertising: advertising && !gpc };
  }

  function save(choice) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        analytics: choice.analytics,
        advertising: choice.advertising,
        ts: new Date().toISOString()
      }));
      chosenThisPage = null;
    } catch (e) {
      chosenThisPage = choice; // storage blocked: the choice still applies to this page
    }
  }

  function loadScript(src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  var analyticsLoaded = false;
  function setAnalytics(on) {
    window['ga-disable-' + GA_ID] = !on;
    if (!on || analyticsLoaded) return;
    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + GA_ID);
  }

  // The SDK can't be unloaded once it runs, so opting out mid-visit stops
  // further conversions from this page; later pages don't load it at all.
  function setAdvertising(on) {
    if (!on || window.oaiq) return;
    // OpenAI Ads (ChatGPT) pixel, per OpenAI's install snippet.
    var q = function () { q.q.push(arguments); };
    q.q = [];
    window.oaiq = q;
    loadScript('https://bzrcdn.openai.com/sdk/oaiq.min.js');
    window.oaiq('init', { pixelId: OPENAI_PIXEL_ID, debug: false });
  }

  function applyPrefs() {
    var p = prefs();
    setAnalytics(p.analytics);
    setAdvertising(p.advertising);
  }
  applyPrefs();

  // A choice saved (or reset) in another tab applies to this open page too.
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY || e.key === null) applyPrefs();
  });

  window.BF = window.BF || {};

  // A completed lead form: GA4 key event plus the ChatGPT Ads conversion.
  window.BF.trackLead = function (source) {
    var p = prefs();
    if (p.analytics && window.gtag) window.gtag('event', 'generate_lead', { lead_source: source });
    if (p.advertising && window.oaiq) window.oaiq('measure', 'lead_created', { type: 'customer_action' });
  };

  window.BF.trackEvent = function (name, params) {
    if (prefs().analytics && window.gtag) window.gtag('event', name, params || {});
  };

  /* ---------- Privacy & Cookie Preferences dialog ---------- */

  var root, panel, analyticsBox, advertisingBox, lastFocus, liveRegion;

  function switchRow(key, title, desc, locked) {
    return '' +
      '<div class="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">' +
        '<div>' +
          '<h3 class="font-semibold text-blue-900">' + title + '</h3>' +
          '<p id="privacy-' + key + '-desc" class="text-gray-600 text-sm">' + desc + '</p>' +
        '</div>' +
        '<label class="relative inline-flex shrink-0 cursor-pointer">' +
          '<input type="checkbox" data-privacy-pref="' + key + '" class="peer sr-only" aria-describedby="privacy-' + key + '-desc"' + (locked ? ' checked disabled' : '') + '>' +
          '<span class="block w-11 h-6 rounded-full bg-gray-300 transition-colors peer-checked:bg-blue-600 peer-disabled:opacity-60 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" aria-hidden="true"></span>' +
          '<span class="sr-only">' + title + '</span>' +
        '</label>' +
      '</div>';
  }

  function build() {
    var gpcNote = gpc
      ? ' <span class="block mt-1 font-medium text-blue-900">Your browser is sending a Global Privacy Control signal, so this stays off.</span>'
      : '';
    root = document.createElement('div');
    root.id = 'privacyChoices';
    root.className = 'fixed inset-0 z-[110] hidden';
    root.innerHTML = '' +
      '<div class="absolute inset-0 bg-black/50" data-privacy-close></div>' +
      '<div class="relative mx-4 my-8 sm:mx-auto sm:my-16 max-w-2xl max-h-[calc(100vh-4rem)] overflow-y-auto bg-white rounded-xl shadow-2xl p-6 focus:outline-none" role="dialog" aria-modal="true" aria-labelledby="privacyChoicesTitle" aria-describedby="privacyChoicesIntro" tabindex="-1" data-privacy-panel>' +
        '<div class="flex items-start justify-between gap-4">' +
          '<h2 id="privacyChoicesTitle" class="text-2xl font-bold text-blue-900">Privacy &amp; Cookie Preferences</h2>' +
          '<button type="button" data-privacy-close aria-label="Close" class="-mr-2 -mt-1 inline-flex items-center justify-center w-10 h-10 shrink-0 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">' +
            '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
          '</button>' +
        '</div>' +
        '<p id="privacyChoicesIntro" class="text-gray-600 mt-2">Control how we use cookies and similar technologies. Essential cookies are always on because they’re required for basic site functionality.</p>' +
        '<div class="mt-6 space-y-4">' +
          switchRow('essential', 'Essential', 'Required for site operation and security. Cannot be disabled.', true) +
          switchRow('analytics', 'Analytics', 'Helps us understand site traffic using Google Analytics. Toggle off to opt out.') +
          switchRow('advertising', 'Advertising', 'Lets us measure whether our ads on ChatGPT (by OpenAI) lead to consultation requests. Toggle off to opt out.' + gpcNote) +
        '</div>' +
        '<div id="do-not-sell" tabindex="-1" class="mt-6 border-t border-gray-200 pt-4 focus:outline-none">' +
          '<h3 class="font-semibold text-blue-900">Do Not Sell or Share My Personal Information</h3>' +
          '<p class="text-gray-600 text-sm mt-1">To opt out of the sale or sharing of your personal information, turn off <em>Advertising</em> and click <strong>Save Preferences</strong>. We also treat a Global Privacy Control signal from your browser as an opt-out. Your choice applies across this site.</p>' +
        '</div>' +
        '<div class="mt-6 flex flex-wrap items-center justify-end gap-2">' +
          '<button type="button" data-privacy-decline class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Decline All</button>' +
          '<button type="button" data-privacy-save class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Save Preferences</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);

    panel = root.querySelector('[data-privacy-panel]');
    analyticsBox = root.querySelector('[data-privacy-pref="analytics"]');
    advertisingBox = root.querySelector('[data-privacy-pref="advertising"]');
    advertisingBox.disabled = gpc;

    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-privacy-close]')) close();
      else if (e.target.closest('[data-privacy-decline]')) commit({ analytics: false, advertising: false });
      else if (e.target.closest('[data-privacy-save]')) commit({ analytics: analyticsBox.checked, advertising: advertisingBox.checked && !gpc });
    });
    root.addEventListener('keydown', onKeydown);
  }

  function focusable() {
    return Array.prototype.filter.call(panel.querySelectorAll('button, input, a[href]'), function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      var items = focusable();
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function open(doNotSell) {
    if (!root) build();
    var p = prefs();
    analyticsBox.checked = p.analytics;
    // The Do Not Sell or Share link pre-selects the opt-out; saving confirms it.
    advertisingBox.checked = doNotSell ? false : p.advertising;
    lastFocus = document.activeElement;
    root.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    var target = doNotSell ? root.querySelector('#do-not-sell') : panel;
    target.focus();
    if (doNotSell) target.scrollIntoView({ block: 'nearest' });
  }

  function close() {
    root.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    if (location.hash === '#do-not-sell' && window.history.replaceState) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  function announce(message) {
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.className = 'sr-only';
      liveRegion.setAttribute('role', 'status');
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = '';
    setTimeout(function () { liveRegion.textContent = message; }, 50);
  }

  function commit(choice) {
    save(choice);
    setAnalytics(choice.analytics);
    setAdvertising(choice.advertising);
    close();
    announce('Your privacy preferences have been saved.');
  }

  function initUi() {
    document.addEventListener('click', function (e) {
      if (!e.target.closest) return;
      var opener = e.target.closest('[data-privacy-choices]');
      if (opener) {
        e.preventDefault();
        open(opener.getAttribute('data-privacy-choices') === 'dns');
      } else if (e.target.closest('[data-privacy-reset]')) {
        e.preventDefault();
        try { localStorage.removeItem(STORAGE_KEY); } catch (err) { /* nothing saved */ }
        location.reload();
      }
    });
    var fromHash = function () { if (location.hash === '#do-not-sell') open(true); };
    window.addEventListener('hashchange', fromHash);
    fromHash();
  }

  window.BF.openPrivacyChoices = function (doNotSell) { open(!!doNotSell); };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initUi);
  else initUi();
})();
