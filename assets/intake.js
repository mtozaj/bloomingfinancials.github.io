/*
 * Consultation intake on the homepage (#consultation): three short steps
 * whose follow-up questions depend on earlier answers.
 *
 * The questions live in index.html. Each step is a [data-intake-step]
 * container and each question a [data-field] group with:
 *   data-label     the label used in the Formspree email
 *   data-required  must be answered before moving on
 *   data-show-if   shown (and submitted) only when an earlier answer matches,
 *                  e.g. "services:bookkeeping" or
 *                  "client_type:business,both|services:tax_business" (| = or)
 * Hidden questions are disabled, so they are neither validated nor sent.
 *
 * Without JavaScript every question shows on one page and the form posts to
 * Formspree as a normal form.
 */
(function () {
  'use strict';

  var form = document.getElementById('consultationForm');
  var container = document.getElementById('formContainer');
  var thanks = document.getElementById('thank-you');
  if (!form || !container || !thanks) return;

  var steps = toArray(form.querySelectorAll('[data-intake-step]'));
  var stepLabel = container.querySelector('[data-intake-step-label]');
  var bar = container.querySelector('[data-intake-bar]');
  var status = container.querySelector('[data-intake-status]');
  var submitBtn = document.getElementById('submitBtn');
  var industry = document.getElementById('business');
  var industryOther = document.getElementById('otherBusiness');
  var current = 1;
  var furthest = 1; // furthest step reached, so going Back and Next again isn't counted twice

  var SERVICE_NAMES = {
    tax_individual: 'Individual tax return', tax_business: 'Business tax return', planning: 'Tax planning',
    bookkeeping: 'Bookkeeping', payroll: 'Payroll', notice: 'IRS or FTB letter', consulting: 'Business advice',
    unsure: 'Not sure yet'
  };
  var SERVICE_SHORT = {
    tax_individual: 'Individual tax', tax_business: 'Business tax', planning: 'Tax planning',
    bookkeeping: 'Bookkeeping', payroll: 'Payroll', notice: 'IRS/FTB letter', consulting: 'Business advice',
    unsure: 'Not sure yet'
  };
  var CLIENT_NAMES = { individual: 'Individual', business: 'Business', both: 'Individual + business' };
  var TIMELINE_SHORT = { asap: 'ASAP', month: 'within a month', planning: 'planning ahead' };
  var DEADLINE_TEXT = {
    '2_weeks': 'due within 2 weeks', '30_days': 'due within 30 days', later: 'due later',
    passed: 'deadline passed', unsure: 'due date unknown'
  };

  function toArray(list) { return Array.prototype.slice.call(list); }

  /* ---------- Reading answers ---------- */

  function checked(name) {
    return toArray(form.querySelectorAll('input[name="' + name + '"]')).filter(function (el) {
      return el.checked && !el.disabled;
    });
  }

  function values(name) { return checked(name).map(function (el) { return el.value; }); }

  function chipText(input) {
    var chip = input.parentNode.querySelector('.intake-chip');
    return (chip ? chip.textContent : input.value).trim();
  }

  function isHidden(el) { return !!el.closest('[data-show-if].hidden'); }

  // The answer to one question, in the wording the visitor saw.
  function answerText(group) {
    var parts = [];
    toArray(group.querySelectorAll('input, select, textarea')).forEach(function (el) {
      if (el.disabled) return;
      if (el.type === 'checkbox' || el.type === 'radio') {
        if (el.checked) parts.push(chipText(el));
      } else if (el === industry) {
        if (el.value === 'other') {
          var other = industryOther.value.trim();
          parts.push(other ? 'Other: ' + other : 'Other');
        } else if (el.value) {
          parts.push(el.options[el.selectedIndex].text);
        }
      } else if (el !== industryOther && el.value.trim()) {
        parts.push(el.value.trim());
      }
    });
    return parts.join(', ');
  }

  /* ---------- Which questions apply ---------- */

  function matches(rule) {
    return rule.split('|').some(function (clause) {
      var parts = clause.split(':');
      var wanted = parts[1].split(',');
      return values(parts[0]).some(function (v) { return wanted.indexOf(v) !== -1; });
    });
  }

  function updateVisibility() {
    toArray(form.querySelectorAll('[data-show-if]')).forEach(function (el) {
      el.classList.toggle('hidden', !matches(el.getAttribute('data-show-if')));
    });
    industryOther.classList.toggle('hidden', industry.value !== 'other');
    toArray(form.querySelectorAll('input, select, textarea')).forEach(function (el) {
      if (el.type === 'hidden' || el.name === '_gotcha') return;
      el.disabled = isHidden(el) || (el === industryOther && industry.value !== 'other');
    });
  }

  // Tax years offered: this year from October (extensions and next season's
  // return), otherwise last year, plus the two before it.
  function setTaxYears() {
    var now = new Date();
    var newest = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1;
    toArray(form.querySelectorAll('[data-year-offset]')).forEach(function (input) {
      var year = String(newest - Number(input.getAttribute('data-year-offset')));
      input.value = year;
      var text = input.parentNode.querySelector('.intake-chip > span');
      if (text) text.textContent = year;
    });
  }

  /* ---------- Steps and validation ---------- */

  function announce(message) {
    status.textContent = '';
    setTimeout(function () { status.textContent = message; }, 50);
  }

  function setError(group, on) {
    var message = group.querySelector('[data-error]');
    if (message) message.classList.toggle('hidden', !on);
  }

  function validate(step) {
    var box = steps[step - 1];
    var missing = toArray(box.querySelectorAll('[data-required]')).filter(function (group) {
      if (isHidden(group)) return false;
      var answered = toArray(group.querySelectorAll('input')).some(function (el) { return el.checked; });
      setError(group, !answered);
      return !answered;
    });
    if (missing.length) {
      var legend = missing[0].querySelector('legend');
      announce('Please answer: ' + (legend ? legend.firstChild.textContent.trim() : 'the highlighted question'));
      missing[0].querySelector('input').focus();
      return false;
    }
    var fields = toArray(box.querySelectorAll('input[required], textarea[required]'));
    for (var i = 0; i < fields.length; i++) {
      if (!fields[i].disabled && !fields[i].checkValidity()) {
        fields[i].reportValidity();
        return false;
      }
    }
    return true;
  }

  function showStep(n, moveFocus) {
    current = n;
    steps.forEach(function (box) {
      box.classList.toggle('hidden', Number(box.getAttribute('data-intake-step')) !== n);
    });
    stepLabel.textContent = 'Step ' + n + ' of ' + steps.length;
    bar.style.width = Math.round((n / steps.length) * 100) + '%';
    if (!moveFocus) return;
    // Keep the top of the form in view below the sticky nav.
    var top = container.getBoundingClientRect().top;
    if (top < 64) {
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: window.pageYOffset + top - 80, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    var title = steps[n - 1].querySelector('[data-intake-title]');
    if (title) title.focus({ preventScroll: true });
  }

  function track(name, params) {
    if (window.BF && window.BF.trackEvent) window.BF.trackEvent(name, params);
  }

  function goNext() {
    if (!validate(current)) return;
    showStep(current + 1, true);
    if (current > furthest) {
      furthest = current;
      track('consultation_step', { step: current });
    }
  }

  /* ---------- What the firm receives ---------- */

  function buildPayload() {
    var client = values('client_type')[0] || '';
    var services = values('services');
    var timeline = values('timeline')[0] || '';
    var answers = [];
    var byLabel = {};
    toArray(form.querySelectorAll('[data-label]')).forEach(function (group) {
      if (isHidden(group)) return;
      var text = answerText(group);
      if (!text) return;
      answers.push([group.getAttribute('data-label'), text]);
      byLabel[group.getAttribute('data-label')] = text;
    });
    var deadline = values('notice_deadline')[0];
    var urgent = checked('notice_deadline').some(function (el) { return el.hasAttribute('data-urgent'); });

    // One-line summary, e.g. "Business (S corp) · Payroll: 6-20 people · Timeline: As soon as possible"
    var segments = [];
    var who = CLIENT_NAMES[client] || '';
    var business = [byLabel['Business structure'], byLabel.Industry].filter(Boolean);
    if (who) segments.push(business.length && client !== 'individual' ? who + ' (' + business.join(', ') + ')' : who);
    services.forEach(function (service) {
      var details = [];
      if (service === 'tax_individual' || service === 'tax_business') {
        details = [byLabel['Tax years'], byLabel['Filing status']];
        if (service === 'tax_individual') details.push(byLabel['Return details']);
      } else if (service === 'planning') {
        details = [byLabel['Planning topics']];
      } else if (service === 'bookkeeping') {
        details = [byLabel.Books, byLabel['Monthly transactions'] && byLabel['Monthly transactions'] + ' transactions/mo'];
      } else if (service === 'payroll') {
        var people = byLabel['People on payroll'];
        details = [people && /\d/.test(people) ? people + ' people' : people, byLabel['Payroll status']];
      } else if (service === 'notice') {
        details = [byLabel['Letter from'], deadline && DEADLINE_TEXT[deadline]];
      } else if (service === 'consulting') {
        details = [byLabel['Advice topics']];
      }
      details = details.filter(Boolean);
      segments.push(SERVICE_NAMES[service] + (details.length ? ': ' + details.join('; ') : ''));
    });
    if (byLabel.Timeline) segments.push('Timeline: ' + byLabel.Timeline);
    if (byLabel['Best time to reach']) segments.push('Best time: ' + byLabel['Best time to reach']);
    if (byLabel['Heard about us']) segments.push('Heard via: ' + byLabel['Heard about us']);

    var subject = 'New consultation: ' + services.map(function (s) { return SERVICE_SHORT[s]; }).join(' + ') +
      (client ? ' (' + CLIENT_NAMES[client].toLowerCase() + ')' : '') +
      (TIMELINE_SHORT[timeline] ? ', ' + TIMELINE_SHORT[timeline] : '');
    if (urgent) subject = 'URGENT notice: ' + subject;

    var data = new FormData();
    data.append('Summary', segments.join(' · '));
    ['name', 'email', 'phone'].forEach(function (key) {
      data.append(key, form.elements.namedItem(key).value.trim());
    });
    answers.forEach(function (pair) { data.append(pair[0], pair[1]); });
    data.append('_subject', subject);
    data.append('_gotcha', form.elements.namedItem('_gotcha').value);

    return {
      data: data,
      firstName: form.elements.namedItem('name').value.trim().split(/\s+/)[0],
      analytics: { client_type: client, services: services.join(','), timeline: timeline }
    };
  }

  /* ---------- Submit, thank-you, reset ---------- */

  function setSubmitting(on) {
    submitBtn.disabled = on;
    submitBtn.textContent = on ? 'Submitting...' : 'Request Free Consultation';
  }

  function showThanks(firstName) {
    var heading = document.getElementById('thankYouHeading');
    heading.textContent = firstName ? 'Thank you, ' + firstName + '!' : 'Thank You!';
    container.classList.add('hidden');
    thanks.classList.remove('hidden');
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }

  function send() {
    var payload = buildPayload();
    setSubmitting(true);
    fetch(form.action, { method: 'POST', body: payload.data, headers: { Accept: 'application/json' } })
      .then(function (response) {
        setSubmitting(false);
        if (!response.ok) {
          console.error('Formspree error response', response);
          alert('There was an error submitting your request. Please try again or contact us directly.');
          return;
        }
        showThanks(payload.firstName);
        // Lead conversion (GA4 generate_lead + ChatGPT Ads), per the visitor's privacy choices
        if (window.BF && window.BF.trackLead) window.BF.trackLead('consultation_form', payload.analytics);
      })
      .catch(function (err) {
        setSubmitting(false);
        console.error('Form submission failed', err);
        alert('There was a network error. Please check your connection and try again.');
      });
  }

  form.addEventListener('click', function (e) {
    if (e.target.closest('[data-intake-next]')) goNext();
    else if (e.target.closest('[data-intake-back]')) showStep(current - 1, true);
  });

  form.addEventListener('change', function (e) {
    updateVisibility();
    var group = e.target.closest('[data-field]');
    if (group) setError(group, false);
  });

  // Enter in a text box on steps 1-2 moves on instead of submitting early.
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (current < steps.length) goNext();
    else if (validate(current)) send();
  });

  document.getElementById('intakeReset').addEventListener('click', function () {
    form.reset();
    toArray(form.querySelectorAll('[data-error]')).forEach(function (el) { el.classList.add('hidden'); });
    updateVisibility();
    thanks.classList.add('hidden');
    container.classList.remove('hidden');
    furthest = 1;
    showStep(1, true);
  });

  // Switch from the no-JavaScript single page to steps.
  form.noValidate = true;
  container.querySelector('[data-intake-progress]').classList.remove('hidden');
  toArray(form.querySelectorAll('[data-intake-nav], [data-intake-back]')).forEach(function (el) {
    el.classList.remove('hidden');
  });
  setTaxYears();
  updateVisibility();
  showStep(1, false);
})();
