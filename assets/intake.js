/* Guided consultation request. Only the current branch reaches Formspree.
 * The short HTML form remains usable when JavaScript is unavailable. */
(function () {
  'use strict';
  const form = document.getElementById('consultationForm');
  if (!form) return;
  const container = document.getElementById('formContainer');
  const thanks = document.getElementById('thank-you');
  const history = form.querySelector('[data-intake-history]');
  const active = form.querySelector('[data-intake-question]');
  const contact = form.querySelector('[data-intake-contact]');
  const fallback = form.querySelector('[data-intake-fallback]');
  const progress = container.querySelector('[data-intake-progress]');
  const status = container.querySelector('[data-intake-status]');
  const error = document.getElementById('intakeError');
  const errorText = error.querySelector('[data-intake-error-text]');
  const submitButton = document.getElementById('submitBtn');
  const contactHeading = document.getElementById('intakeContactHeading');
  const thanksHeading = document.getElementById('thankYouHeading');
  const answers = {};
  const visitedPhases = new Set();
  let editing = null;
  let submitting = false;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function choice(value, label, detail) { return { value, label, detail }; }
  function question(key, title, label, options, extra) {
    return Object.assign({ key, title, label, options, phase: 2 }, extra || {});
  }
  function taxYears() {
    const now = new Date();
    const lastYear = now.getFullYear() - 1;
    const years = [choice(String(lastYear), String(lastYear))];
    // Offer next season from October, keeping the prior year first.
    if (now.getMonth() >= 9) years.push(choice(String(lastYear + 1), (lastYear + 1) + ' (upcoming filing season)'));
    years.push(choice(String(lastYear - 1), String(lastYear - 1)));
    years.push(choice('earlier', (lastYear - 2) + ' or earlier'), choice('unsure', 'Not sure'));
    return years;
  }

  // This also serves as the submission allowlist, excluding old branch answers.
  function questions() {
    const result = [question('client_type', 'Who needs assistance?', 'Client type', [
      choice('individual', 'Individual or household', 'Personal taxes, including self-employed income'),
      choice('business', 'Business', 'Business returns, bookkeeping and payroll'),
      choice('both', 'Individual and business')
    ], { phase: 1, fallback: choice('unsure', "I'm not sure which applies") })];
    if (!answers.client_type || answers.client_type === 'unsure') return result;
    const business = answers.client_type !== 'individual';
    const services = [choice('tax', 'Tax preparation')];
    if (!business) services.push(choice('amend', 'Amend a filed return'));
    if (business) services.push(choice('bookkeeping', 'Bookkeeping'), choice('payroll', 'Payroll'));
    services.push(choice('planning', 'Tax planning'), choice('notice', 'IRS or state tax notice'));
    if (business) services.push(choice('consulting', 'Business consulting'));
    result.push(question('service', 'Which service would you like to discuss?', 'Service', services, {
      phase: 1, fallback: choice('unsure', "Something else / I'm not sure")
    }));
    switch (answers.service) {
      case 'tax':
      case 'amend':
        result.push(question('tax_years', 'Which tax year(s) do you need help with?', 'Tax years', taxYears(), {
          multiple: true, helper: 'Select all that apply, then continue.'
        }));
        if (business) result.push(question('entity_type', 'How is your business set up?', 'Business structure', [
          choice('sole_prop', 'Sole proprietor'), choice('llc', 'LLC'), choice('s_corp', 'S corporation'),
          choice('c_corp', 'C corporation'), choice('partnership', 'Partnership'), choice('unsure', 'Not sure')
        ], { helper: 'Choose the closest match. We can confirm this together.' }));
        break;
      case 'bookkeeping':
        result.push(question('books_status', 'What kind of bookkeeping help do you need?', 'Bookkeeping needs', [
          choice('ongoing', 'Ongoing bookkeeping'), choice('catchup', 'Catch-up or cleanup'), choice('both', 'Both'),
          choice('setup', 'Set up my bookkeeping'), choice('unsure', 'Not sure')
        ]));
        break;
      case 'payroll':
        result.push(question('payroll_status', 'What do you need help with?', 'Payroll needs', [
          choice('setup', 'Set up payroll'), choice('switching', 'Switch payroll providers'),
          choice('fixing', 'Resolve a payroll issue'), choice('unsure', 'Not sure')
        ]));
        break;
      case 'planning':
        result.push(question('planning_topic', 'What would you like to plan for?', 'Planning topic', business ? [
          choice('estimates', 'Estimated taxes'), choice('entity', 'Business structure or S corporation election'),
          choice('year_end', 'Year-end tax planning'), choice('general', 'General tax planning')
        ] : [
          choice('estimates', 'Estimated taxes or withholding'), choice('stock', 'Stock compensation or investments'),
          choice('moved', 'Moving between states'), choice('general', 'General tax planning')
        ]));
        break;
      case 'notice': {
        const agencies = [choice('irs', 'IRS'), choice('ftb', 'California Franchise Tax Board')];
        if (business) agencies.push(choice('edd', 'California EDD'));
        agencies.push(choice('other', 'Another state agency'), choice('unsure', 'Not sure'));
        result.push(question('notice_agency', 'Who sent the notice?', 'Notice agency', agencies));
        result.push(question('notice_deadline', 'When is the response due?', 'Notice deadline', [
          choice('2_weeks', 'Within two weeks'), choice('later', 'More than two weeks away'),
          choice('passed', 'The deadline has passed'), choice('unsure', 'Not sure')
        ]));
        break;
      }
      case 'consulting':
        result.push(question('consulting_topic', 'What would you like to discuss?', 'Consulting topic', [
          choice('starting', 'Starting a business'), choice('cash_flow', 'Cash flow and profitability'),
          choice('systems', 'Business systems and processes'), choice('general', 'General business guidance')
        ]));
        break;
    }
    return result;
  }

  function optionsFor(q) { return q.options.concat(q.fallback ? [q.fallback] : []); }
  function valuesFor(q) {
    const value = answers[q.key];
    return Array.isArray(value) ? value : (value ? [value] : []);
  }
  function complete(q) {
    const values = valuesFor(q);
    const allowed = optionsFor(q).map(option => option.value);
    return values.length > 0 && values.every(value => allowed.includes(value)) &&
      (q.multiple || values.length === 1) && !(values.includes('unsure') && values.length > 1);
  }
  function answerText(q) {
    return optionsFor(q).filter(option => valuesFor(q).includes(option.value)).map(option => option.label).join(', ');
  }
  function track(method, name, params) {
    // Tracking failure must not interrupt a request or its success state.
    try { if (window.BF && typeof window.BF[method] === 'function') window.BF[method](name, params); } catch (e) { /* No form impact. */ }
  }
  function setPhase(number) {
    progress.querySelectorAll('[data-intake-phase]').forEach(node => {
      const phase = Number(node.getAttribute('data-intake-phase'));
      node.classList.toggle('is-reached', phase <= number);
      if (phase === number) node.setAttribute('aria-current', 'step');
      else node.removeAttribute('aria-current');
    });
    if (number > 1 && !visitedPhases.has(number)) {
      visitedPhases.add(number);
      track('trackEvent', 'consultation_step', { step: number });
    }
  }
  function focusAndReveal(node) {
    node.focus({ preventScroll: true });
    const rect = node.getBoundingClientRect();
    if (rect.top < 80 || rect.bottom > window.innerHeight - 32) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      node.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
    }
  }
  function hideError() { error.hidden = true; errorText.textContent = ''; }
  function showError(message) {
    errorText.textContent = message;
    error.hidden = false;
    focusAndReveal(error);
  }
  function commit(q, value) {
    if (submitting) return;
    const changed = JSON.stringify(answers[q.key]) !== JSON.stringify(value);
    answers[q.key] = value;
    if (changed && (q.key === 'client_type' || q.key === 'service')) {
      Object.keys(answers).forEach(key => {
        if (key !== 'client_type' && (q.key === 'client_type' || key !== 'service')) delete answers[key];
      });
    }
    editing = null;
    hideError();
    render(true);
  }

  function renderQuestion(q, animate) {
    const box = element('fieldset', 'intake-question' + (animate ? ' intake-enter' : ''));
    const title = element('legend', 'intake-question-title', q.title);
    title.id = 'intakeQuestionTitle';
    title.tabIndex = -1;
    box.appendChild(title);
    if (q.helper) box.appendChild(element('p', 'intake-helper', q.helper));
    const list = element('div', 'intake-choices');
    if (q.multiple) {
      const selected = new Set(valuesFor(q));
      const next = element('button', 'intake-primary', 'Continue');
      next.type = 'button';
      next.disabled = selected.size === 0;
      q.options.forEach(option => {
        const label = element('label', 'intake-checkbox-row');
        const input = element('input');
        input.type = 'checkbox';
        input.name = q.key;
        input.value = option.value;
        input.checked = selected.has(option.value);
        label.classList.toggle('is-selected', input.checked);
        input.addEventListener('change', () => {
          if (input.checked) {
            if (option.value === 'unsure') selected.clear();
            else selected.delete('unsure');
            selected.add(option.value);
          } else selected.delete(option.value);
          list.querySelectorAll('input').forEach(control => {
            control.checked = selected.has(control.value);
            control.parentElement.classList.toggle('is-selected', control.checked);
          });
          next.disabled = selected.size === 0;
        });
        label.append(input, element('span', '', option.label));
        list.appendChild(label);
      });
      next.addEventListener('click', () => { if (selected.size) commit(q, Array.from(selected)); });
      box.append(list, next);
    } else {
      q.options.forEach(option => {
        const button = element('button', 'intake-choice');
        button.type = 'button';
        button.setAttribute('aria-pressed', String(answers[q.key] === option.value));
        button.dataset.intakeValue = option.value;
        const text = element('span', '', option.label);
        if (option.detail) text.appendChild(element('small', 'intake-choice-detail', option.detail));
        const arrow = element('span', 'intake-choice-arrow', '\u203a');
        arrow.setAttribute('aria-hidden', 'true');
        button.append(text, arrow);
        button.addEventListener('click', () => commit(q, option.value));
        list.appendChild(button);
      });
      box.appendChild(list);
      if (q.fallback) {
        const skip = element('button', 'intake-text-button', q.fallback.label);
        skip.type = 'button';
        skip.dataset.intakeValue = q.fallback.value;
        skip.addEventListener('click', () => commit(q, q.fallback.value));
        box.appendChild(skip);
      }
    }
    active.appendChild(box);
    if (animate) focusAndReveal(title);
  }

  function render(moveFocus) {
    const flow = questions();
    const current = (editing && flow.find(q => q.key === editing)) || flow.find(q => !complete(q));
    const end = current ? flow.indexOf(current) : flow.length;
    history.replaceChildren();
    flow.slice(0, end).filter(complete).forEach(q => {
      const row = element('div', 'intake-summary');
      const text = element('div');
      text.append(element('span', 'intake-summary-label', q.label), element('span', 'intake-summary-value', answerText(q)));
      const change = element('button', 'intake-change', 'Change');
      change.type = 'button';
      change.setAttribute('aria-label', 'Change ' + q.label.toLowerCase());
      change.dataset.intakeEdit = q.key;
      change.addEventListener('click', () => {
        if (submitting) return;
        editing = q.key;
        hideError();
        render(true);
      });
      row.append(text, change);
      history.appendChild(row);
    });
    active.replaceChildren();
    contact.hidden = Boolean(current);
    contact.querySelectorAll('input, textarea, button').forEach(node => { node.disabled = Boolean(current); });
    if (current) {
      setPhase(current.phase);
      status.textContent = 'Stage ' + current.phase + ' of 3.';
      renderQuestion(current, moveFocus);
    } else {
      setPhase(3);
      status.textContent = 'Contact details. Final stage.';
      contact.classList.toggle('intake-enter', Boolean(moveFocus));
      if (moveFocus) focusAndReveal(contactHeading);
    }
  }

  function serviceCodes() {
    if (answers.service === 'tax' || answers.service === 'amend') {
      if (answers.client_type === 'both') return 'tax_individual,tax_business';
      return answers.client_type === 'business' ? 'tax_business' : 'tax_individual';
    }
    return answers.service || 'unsure';
  }
  function buildPayload() {
    const flow = questions();
    const data = new FormData();
    data.append('Summary', flow.map(q => q.label + ': ' + answerText(q)).join(' | '));
    ['name', 'email', 'phone'].forEach(key => data.append(key, form.elements.namedItem(key).value.trim()));
    flow.forEach(q => data.append(q.label, answerText(q)));
    const notes = form.elements.namedItem('notes').value.trim();
    if (notes) data.append('Notes', notes);
    const service = flow.find(q => q.key === 'service');
    let subject = 'New consultation: ' + (service ? answerText(service) : 'General inquiry') + ' (' + answerText(flow[0]) + ')';
    if (answers.service === 'notice' && ['2_weeks', 'passed'].includes(answers.notice_deadline)) subject = 'URGENT notice: ' + subject;
    data.append('_subject', subject);
    data.append('_gotcha', form.elements.namedItem('_gotcha').value);
    return data;
  }
  async function send() {
    if (submitting) return;
    if (editing || questions().some(q => !complete(q))) {
      editing = null;
      render(true);
      return;
    }
    ['name', 'email'].forEach(key => { form.elements.namedItem(key).value = form.elements.namedItem(key).value.trim(); });
    if (!form.reportValidity()) return;
    hideError();
    const data = buildPayload();
    const controls = Array.from(form.querySelectorAll('button, input, select, textarea')).map(node => [node, node.disabled]);
    submitting = true;
    controls.forEach(([node]) => { node.disabled = true; });
    form.setAttribute('aria-busy', 'true');
    submitButton.textContent = 'Sending your request...';
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(form.action, {
        method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: controller.signal
      });
      if (!response.ok) {
        showError(response.status === 429
          ? 'We cannot accept another request right now. Please try again shortly, or contact us directly.'
          : 'Your request could not be sent. Your answers are still here. Please try again, or contact us directly.');
        return;
      }
      const firstName = form.elements.namedItem('name').value.trim().split(/\s+/)[0];
      thanksHeading.textContent = firstName ? 'Thank you, ' + firstName + '.' : 'Thank you for your inquiry.';
      container.hidden = true;
      thanks.hidden = false;
      focusAndReveal(thanksHeading);
      track('trackLead', 'consultation_form', { client_type: answers.client_type, services: serviceCodes() });
    } catch (e) {
      showError(e.name === 'AbortError'
        ? 'We could not confirm delivery. Your answers are still here. Please try again, or contact us directly.'
        : 'The connection was interrupted. Your answers are still here. Please try again, or contact us directly.');
    } finally {
      window.clearTimeout(timeout);
      controls.forEach(([node, disabled]) => { node.disabled = disabled; });
      submitting = false;
      form.removeAttribute('aria-busy');
      submitButton.textContent = 'Request Free Consultation';
    }
  }

  form.addEventListener('submit', event => { event.preventDefault(); send(); });
  document.getElementById('intakeReset').addEventListener('click', () => {
    if (submitting) return;
    form.reset();
    Object.keys(answers).forEach(key => delete answers[key]);
    visitedPhases.clear();
    editing = null;
    contact.querySelector('details').open = false;
    hideError();
    thanks.hidden = true;
    container.hidden = false;
    render(true);
  });
  // Hide the fallback only after the enhanced interface has rendered.
  form.noValidate = true;
  render(false);
  fallback.hidden = true;
  fallback.querySelectorAll('select').forEach(node => { node.disabled = true; });
  progress.hidden = false;
})();
