const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'assets/intake.js'), 'utf8');
const settle = () => new Promise(resolve => setImmediate(resolve));

function setup(t, options = {}) {
  // No external resources or real requests are loaded by this harness.
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://www.bloomingfinancials.com/' });
  t.after(() => dom.window.close());
  const w = dom.window;
  const d = w.document;
  const requests = [];
  const events = [];
  const scrolls = [];
  const NativeDate = w.Date;
  w.Date = class extends NativeDate {
    constructor(...args) { super(...(args.length ? args : [options.date || '2026-10-08T12:00:00Z'])); }
  };
  w.matchMedia = () => ({ matches: Boolean(options.reduced) });
  w.HTMLElement.prototype.scrollIntoView = function (value) { scrolls.push(value); };
  w.BF = {
    trackEvent: (name, params) => events.push({ type: 'event', name, params }),
    trackLead: (name, params) => {
      if (options.trackingThrows) throw new Error('Tracking unavailable');
      events.push({ type: 'lead', name, params });
    }
  };
  w.fetch = (url, init) => {
    requests.push({ url, init, fields: Object.fromEntries(init.body.entries()) });
    return options.fetch ? options.fetch(url, init) : Promise.resolve({ ok: true, status: 200 });
  };
  const form = d.getElementById('consultationForm');
  const active = () => form.querySelector('[data-intake-question]');
  const choose = value => {
    const button = active().querySelector('[data-intake-value="' + value + '"]');
    assert.ok(button, 'Choice is available: ' + value);
    button.click();
  };
  const check = value => {
    const input = active().querySelector('input[value="' + value + '"]');
    assert.ok(input, 'Checkbox is available: ' + value);
    input.click();
  };
  const years = () => { check('2025'); active().querySelector('button').click(); };
  const change = key => {
    const button = form.querySelector('[data-intake-edit="' + key + '"]');
    assert.ok(button, 'Completed answer can be changed: ' + key);
    button.click();
  };
  const fill = (key, value) => { form.elements.namedItem(key).value = value; };
  const validContact = () => { fill('name', 'Example Visitor'); fill('email', 'example@example.com'); };
  const submit = () => form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  if (options.enhance !== false) w.eval(script);
  return { w, d, form, active, choose, check, years, change, fill, validContact, submit, requests, events, scrolls };
}

test('initial view has one question, hides contact, and focuses each revealed heading', t => {
  const f = setup(t);
  assert.equal(f.active().querySelectorAll('fieldset').length, 1);
  assert.equal(f.form.querySelector('[data-intake-contact]').hidden, true);
  assert.equal(f.form.querySelector('[data-intake-fallback]').hidden, true);
  f.choose('individual');
  assert.equal(f.d.activeElement.id, 'intakeQuestionTitle');
  assert.doesNotMatch(f.active().textContent, /Bookkeeping|Payroll|Business consulting|Business tax return/);
});

const paths = [
  ['individual', 'tax', ['years']],
  ['individual', 'amend', ['years']],
  ['individual', 'planning', ['stock']],
  ['individual', 'notice', ['irs', '2_weeks']],
  ['individual', 'unsure', []],
  ['business', 'tax', ['years', 'llc']],
  ['business', 'bookkeeping', ['catchup']],
  ['business', 'payroll', ['switching']],
  ['business', 'planning', ['entity']],
  ['business', 'notice', ['edd', 'passed']],
  ['business', 'consulting', ['cash_flow']],
  ['business', 'unsure', []],
  ['both', 'tax', ['years', 's_corp']],
  ['both', 'bookkeeping', ['both']]
];
for (const [client, service, details] of paths) {
  test(client + ' / ' + service + ' reaches contact with only relevant follow-ups', async t => {
    const f = setup(t);
    f.choose(client);
    f.choose(service);
    for (const detail of details) detail === 'years' ? f.years() : f.choose(detail);
    assert.equal(f.form.querySelector('[data-intake-contact]').hidden, false);
    assert.equal(f.active().children.length, 0);
    assert.equal(f.d.activeElement.id, 'intakeContactHeading');
    f.validContact();
    f.submit();
    await settle();
    assert.equal(f.requests.length, 1);
    assert.equal(f.requests[0].url, 'https://formspree.io/f/xjkwzerg');
    assert.equal(f.requests[0].init.method, 'POST');
    assert.equal(f.requests[0].init.headers.Accept, 'application/json');
    assert.equal(f.d.getElementById('thank-you').hidden, false);
    if (service !== 'tax' && service !== 'amend') assert.equal(f.requests[0].fields['Tax years'], undefined);
    if (client === 'individual') assert.equal(f.requests[0].fields['Business structure'], undefined);
    if (service === 'notice') assert.match(f.requests[0].fields._subject, /^URGENT notice:/);
  });
}

test('not-sure client can request help without knowing a service', async t => {
  const f = setup(t);
  f.choose('unsure');
  f.validContact();
  f.submit();
  await settle();
  assert.equal(f.requests[0].fields.Service, undefined);
  assert.match(f.requests[0].fields._subject, /General inquiry/);
});

test('changing paths clears stale answers but preserves contact and notes', async t => {
  const f = setup(t);
  f.choose('business'); f.choose('tax'); f.years(); f.choose('s_corp');
  f.validContact(); f.fill('phone', '555-0100'); f.fill('notes', 'Please also discuss payroll.');
  f.change('client_type'); f.choose('individual'); f.choose('planning'); f.choose('moved');
  assert.equal(f.form.elements.name.value, 'Example Visitor');
  f.submit(); await settle();
  const sent = f.requests[0].fields;
  assert.equal(sent['Tax years'], undefined);
  assert.equal(sent['Business structure'], undefined);
  assert.equal(sent['Planning topic'], 'Moving between states');
  assert.equal(sent.Notes, 'Please also discuss payroll.');
  assert.equal(sent.phone, '555-0100');
  assert.doesNotMatch(sent.Summary, /S corporation|2025/);
});

test('changing only the service also removes its previous detail answers', async t => {
  const f = setup(t);
  f.choose('business'); f.choose('notice'); f.choose('edd'); f.choose('passed');
  f.change('service'); f.choose('payroll'); f.choose('setup'); f.validContact(); f.submit();
  await settle();
  const sent = f.requests[0].fields;
  assert.equal(sent['Notice agency'], undefined);
  assert.equal(sent['Notice deadline'], undefined);
  assert.doesNotMatch(sent._subject, /URGENT/);
  assert.equal(sent['Payroll needs'], 'Set up payroll');
});

test('tax years allow multiple selections, require Continue, and exclude Not sure', t => {
  const f = setup(t);
  f.choose('individual'); f.choose('tax');
  assert.equal(f.active().querySelector('button').disabled, true);
  f.check('2025'); f.check('2024');
  assert.equal(f.form.querySelector('[data-intake-contact]').hidden, true);
  f.check('unsure');
  assert.deepEqual(Array.from(f.active().querySelectorAll('input:checked'), x => x.value), ['unsure']);
  f.check('2025'); f.check('2024');
  assert.equal(f.active().querySelector('input[value="unsure"]').checked, false);
  f.active().querySelector('button').click();
  f.change('tax_years');
  assert.deepEqual(Array.from(f.active().querySelectorAll('input:checked'), x => x.value), ['2025', '2024']);
});

test('year choices roll forward without mislabeling the current filing season', t => {
  const f = setup(t, { date: '2027-01-15T12:00:00Z' });
  f.choose('individual'); f.choose('tax');
  assert.equal(f.active().querySelector('input').value, '2026');
  assert.equal(f.active().querySelector('input[value="2027"]'), null);
  assert.match(f.active().textContent, /2024 or earlier/);
});

test('required contact validation blocks incomplete requests; phone is optional', async t => {
  const f = setup(t);
  f.choose('unsure'); f.submit();
  assert.equal(f.requests.length, 0);
  f.fill('name', '   '); f.fill('email', 'valid@example.com'); f.submit();
  assert.equal(f.requests.length, 0);
  f.fill('name', 'Example Visitor'); f.fill('email', 'invalid'); f.submit();
  assert.equal(f.requests.length, 0);
  f.fill('email', ' example@example.com '); f.submit(); await settle();
  assert.equal(f.requests[0].fields.email, 'example@example.com');
  assert.equal(f.requests[0].fields.phone, '');
});

test('early Enter cannot bypass unanswered questions or submit a partial inquiry', t => {
  const f = setup(t);
  f.submit(); f.choose('individual'); f.submit(); f.choose('tax'); f.submit();
  assert.equal(f.requests.length, 0);
  assert.equal(f.form.querySelector('[data-intake-contact]').hidden, true);
});

for (const mode of ['http', 'rate-limit', 'network', 'timeout']) {
  test(mode + ' failure preserves the request, shows an inline error, and permits retry', async t => {
    let fail = true;
    const f = setup(t, { fetch: () => {
      if (!fail) return Promise.resolve({ ok: true, status: 200 });
      if (mode === 'network') return Promise.reject(new Error('Offline'));
      if (mode === 'timeout') return Promise.reject(Object.assign(new Error('Timed out'), { name: 'AbortError' }));
      return Promise.resolve({ ok: false, status: mode === 'rate-limit' ? 429 : 422 });
    } });
    f.choose('business'); f.choose('bookkeeping'); f.choose('ongoing'); f.validContact();
    f.fill('notes', 'Keep this note.'); f.submit(); await settle();
    assert.equal(f.d.getElementById('intakeError').hidden, false);
    assert.equal(f.d.activeElement.id, 'intakeError');
    assert.equal(f.form.elements.name.value, 'Example Visitor');
    assert.equal(f.form.elements.notes.value, 'Keep this note.');
    assert.equal(f.d.getElementById('submitBtn').disabled, false);
    assert.equal(f.events.filter(e => e.type === 'lead').length, 0);
    fail = false; f.submit(); await settle();
    assert.equal(f.requests.length, 2);
    assert.deepEqual(f.requests[0].fields, f.requests[1].fields);
    assert.equal(f.events.filter(e => e.type === 'lead').length, 1);
  });
}

test('pending request blocks duplicates and edits until the response arrives', async t => {
  let finish;
  const f = setup(t, { fetch: () => new Promise(resolve => { finish = resolve; }) });
  f.choose('unsure'); f.validContact(); f.submit(); f.submit();
  assert.equal(f.requests.length, 1);
  assert.equal(f.form.getAttribute('aria-busy'), 'true');
  assert.equal(f.form.querySelector('[data-intake-edit]').disabled, true);
  assert.equal(f.form.elements.email.disabled, true);
  finish({ ok: true, status: 200 }); await settle();
  assert.equal(f.form.hasAttribute('aria-busy'), false);
});

test('successful payload includes honeypot and notes, while analytics excludes personal data', async t => {
  const f = setup(t);
  f.choose('both'); f.choose('tax'); f.years(); f.choose('llc');
  f.validContact(); f.fill('notes', '<script>private detail</script>'); f.fill('_gotcha', 'trap');
  f.change('tax_years'); f.active().querySelector('button').click(); f.submit(); await settle();
  assert.equal(f.requests[0].fields._gotcha, 'trap');
  assert.equal(f.requests[0].fields.Notes, '<script>private detail</script>');
  assert.equal(f.events.filter(e => e.type === 'event' && e.params.step === 2).length, 1);
  assert.equal(f.events.filter(e => e.type === 'event' && e.params.step === 3).length, 1);
  const lead = f.events.find(e => e.type === 'lead');
  assert.equal(lead.params.services, 'tax_individual,tax_business');
  assert.doesNotMatch(JSON.stringify(f.events), /example@example.com|Example Visitor|private detail|trap/);
  f.d.getElementById('intakeReset').click();
  assert.equal(f.form.elements.name.value, '');
  assert.match(f.active().textContent, /Who needs assistance/);
  assert.equal(f.form.querySelector('[data-intake-history]').children.length, 0);
});

test('tracking errors cannot turn a successful request into a form error', async t => {
  const f = setup(t, { trackingThrows: true });
  f.choose('unsure'); f.validContact(); f.submit(); await settle();
  assert.equal(f.d.getElementById('thank-you').hidden, false);
  assert.equal(f.d.getElementById('intakeError').hidden, true);
});

test('reduced-motion preference is honored when revealing questions', t => {
  const f = setup(t, { reduced: true });
  f.choose('individual');
  assert.ok(f.scrolls.length);
  assert.ok(f.scrolls.every(scroll => scroll.behavior === 'auto'));
});

test('native fallback remains a usable short POST form without JavaScript', t => {
  const f = setup(t, { enhance: false });
  assert.equal(f.form.querySelector('[data-intake-fallback]').hidden, false);
  assert.equal(f.form.querySelector('[data-intake-contact]').hidden, false);
  assert.equal(f.form.method, 'post');
  assert.equal(f.form.noValidate, false);
  assert.equal(f.form.elements.name.required, true);
  assert.equal(f.form.elements.email.required, true);
  assert.equal(f.form.elements.phone.required, false);
  assert.equal(f.form.querySelectorAll('select').length, 2);
});
