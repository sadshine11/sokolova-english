/* Проверка интерактива и доступности: node scripts/check.mjs [baseUrl] */

import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:4321/sokolova-english/';
const results = [];
const ok = (name) => results.push({ ok: true, name });
const fail = (name, detail) => results.push({ ok: false, name, detail });

const browser = await chromium.launch();

/* ── Десктоп ─────────────────────────────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(BASE, { waitUntil: 'networkidle' });

  /* Табы ОГЭ / ЕГЭ */
  const panelEge = page.locator('#panel-ege');
  if (await panelEge.isHidden()) ok('табы: вторая панель скрыта при загрузке');
  else fail('табы: вторая панель скрыта при загрузке', 'панель видна');

  await page.locator('#tab-ege').click();
  if (await panelEge.isVisible()) ok('табы: переключение по клику');
  else fail('табы: переключение по клику', 'панель не показалась');

  await page.locator('#tab-ege').press('ArrowLeft');
  const focused = await page.evaluate(() => document.activeElement?.id);
  if (focused === 'tab-oge') ok('табы: стрелки переводят фокус');
  else fail('табы: стрелки переводят фокус', `фокус на ${focused}`);

  /* Аккордеон */
  const firstQ = page.locator('.qa__item').first();
  await firstQ.locator('summary').click();
  if (await firstQ.evaluate((el) => el.hasAttribute('open'))) ok('вопросы: раскрываются');
  else fail('вопросы: раскрываются', 'details не открылся');

  /* Лайтбокс */
  await page.locator('[data-gal-open="0"]').click();
  const dialog = page.locator('[data-lightbox]');
  if (await dialog.evaluate((el) => el.open)) ok('галерея: просмотр открывается');
  else fail('галерея: просмотр открывается', 'dialog закрыт');

  const src0 = await page.locator('[data-lb-img]').getAttribute('src');
  await page.keyboard.press('ArrowRight');
  const src1 = await page.locator('[data-lb-img]').getAttribute('src');
  if (src0 !== src1) ok('галерея: стрелка листает');
  else fail('галерея: стрелка листает', 'снимок не сменился');

  await page.keyboard.press('Escape');
  if (!(await dialog.evaluate((el) => el.open))) ok('галерея: Esc закрывает');
  else fail('галерея: Esc закрывает', 'dialog остался открыт');

  const returned = await page.evaluate(
    () => document.activeElement?.getAttribute('data-gal-open')
  );
  if (returned === '0') ok('галерея: фокус возвращается на снимок');
  else fail('галерея: фокус возвращается на снимок', `фокус: ${returned}`);

  /* Форма: пустая отправка */
  await page.locator('[data-submit]').click();
  await page.waitForTimeout(150);
  const nameErr = await page.locator('[data-error-for="name"]').textContent();
  if (nameErr?.trim()) ok('форма: пустые поля подсвечиваются');
  else fail('форма: пустые поля подсвечиваются', 'нет текста ошибки');

  const invalid = await page.locator('#f-name').getAttribute('aria-invalid');
  if (invalid === 'true') ok('форма: aria-invalid проставляется');
  else fail('форма: aria-invalid проставляется', `aria-invalid=${invalid}`);

  const focusAfter = await page.evaluate(() => document.activeElement?.id);
  if (focusAfter === 'f-name') ok('форма: фокус уходит в первое неверное поле');
  else fail('форма: фокус уходит в первое неверное поле', `фокус: ${focusAfter}`);

  /* Форма: неверный контакт */
  await page.fill('#f-name', 'Елена');
  await page.fill('#f-contact', 'ab');
  await page.selectOption('#f-grade', '9 класс');
  await page.check('#f-consent');
  await page.locator('[data-submit]').click();
  await page.waitForTimeout(150);
  const contactErr = await page.locator('[data-error-for="contact"]').textContent();
  if (contactErr?.trim()) ok('форма: короткий контакт отклоняется');
  else fail('форма: короткий контакт отклоняется', 'ошибки нет');

  /* Форма: успешная отправка (демо-режим) */
  await page.fill('#f-contact', '+7 902 870-14-06');
  await page.locator('[data-submit]').click();
  await page.waitForTimeout(900);
  const status = await page.locator('[data-status]').textContent();
  const tone = await page.locator('[data-status]').getAttribute('data-tone');
  if (tone === 'ok' && status?.includes('демонстрационная')) ok('форма: отправка в демо-режиме');
  else fail('форма: отправка в демо-режиме', `tone=${tone} status=${status?.slice(0, 60)}`);

  /* Подсветка текущего раздела */
  await page.evaluate(() => document.getElementById('pricing')?.scrollIntoView());
  await page.waitForTimeout(400);
  const current = await page.locator('[data-nav][aria-current="true"]').getAttribute('data-nav');
  if (current === '#pricing') ok('навигация: подсвечивается текущий раздел');
  else fail('навигация: подсвечивается текущий раздел', `aria-current на ${current}`);

  /* Порядок обхода с самого начала страницы */
  await page.evaluate(() => {
    document.activeElement && document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await page.keyboard.press('Tab');
  const skip = await page.evaluate(() => document.activeElement?.className);
  if (String(skip).includes('skip-link')) ok('доступность: первым по Tab идёт «к содержанию»');
  else fail('доступность: первым по Tab идёт «к содержанию»', `фокус: ${skip}`);

  /* Изображения с alt */
  const noAlt = await page.$$eval('img', (els) =>
    els.filter((e) => !e.getAttribute('alt')?.trim()).map((e) => e.getAttribute('src'))
  );
  if (!noAlt.length) ok('доступность: у всех картинок есть alt');
  else fail('доступность: у всех картинок есть alt', noAlt.join(', '));

  /* Единственный h1 и порядок заголовков */
  const heads = await page.$$eval('h1,h2,h3', (els) =>
    els.map((e) => Number(e.tagName[1]))
  );
  const h1count = heads.filter((l) => l === 1).length;
  if (h1count === 1) ok('структура: ровно один h1');
  else fail('структура: ровно один h1', `найдено ${h1count}`);

  let jump = null;
  for (let i = 1; i < heads.length; i++) {
    if (heads[i] - heads[i - 1] > 1) jump = `${heads[i - 1]} → ${heads[i]}`;
  }
  if (!jump) ok('структура: уровни заголовков без пропусков');
  else fail('структура: уровни заголовков без пропусков', jump);

  if (!errors.length) ok('консоль: без ошибок');
  else fail('консоль: без ошибок', errors.join(' | '));

  await page.close();
}

/* ── Мобильный ───────────────────────────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE, { waitUntil: 'networkidle' });

  await page.locator('[data-burger]').click();
  const menu = page.locator('[data-menu]');
  if (await menu.isVisible()) ok('меню: открывается');
  else fail('меню: открывается', 'скрыто');

  const overflow = await page.evaluate(() => document.body.style.overflow);
  if (overflow === 'hidden') ok('меню: прокрутка страницы блокируется');
  else fail('меню: прокрутка страницы блокируется', `overflow=${overflow}`);

  await page.keyboard.press('Escape');
  if (await menu.isHidden()) ok('меню: Esc закрывает');
  else fail('меню: Esc закрывает', 'осталось открытым');

  const burgerFocused = await page.evaluate(() =>
    document.activeElement?.hasAttribute('data-burger')
  );
  if (burgerFocused) ok('меню: фокус возвращается на кнопку');
  else fail('меню: фокус возвращается на кнопку', 'фокус не вернулся');

  /* Плавающая кнопка записи */
  await page.evaluate(() => document.getElementById('pricing')?.scrollIntoView());
  await page.waitForTimeout(400);
  const shown = await page.locator('[data-sticky-cta]').evaluate((el) =>
    el.hasAttribute('data-shown')
  );
  if (shown) ok('плавающая кнопка: появляется после открытия');
  else fail('плавающая кнопка: появляется после открытия', 'скрыта');

  await page.evaluate(() => document.getElementById('booking')?.scrollIntoView());
  await page.waitForTimeout(400);
  const hidden = await page.locator('[data-sticky-cta]').evaluate((el) =>
    !el.hasAttribute('data-shown')
  );
  if (hidden) ok('плавающая кнопка: прячется у формы');
  else fail('плавающая кнопка: прячется у формы', 'осталась видимой');

  /* Размер зоны нажатия */
  const small = await page.$$eval('a[href], button', (els) =>
    els
      .filter((e) => {
        const r = e.getBoundingClientRect();
        const cs = getComputedStyle(e);
        if (!r.width || cs.visibility === 'hidden') return false;
        if (e.closest('p, figcaption, li.terms__item, .honesty')) return false;
        return r.height < 40;
      })
      .map((e) => `${e.tagName}.${String(e.className).slice(0, 28)} h=${Math.round(e.getBoundingClientRect().height)}`)
  );
  if (!small.length) ok('мобильный: зоны нажатия не меньше 40px');
  else fail('мобильный: зоны нажатия не меньше 40px', small.slice(0, 6).join('; '));

  await page.close();
}

await browser.close();

const bad = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? ' ok ' : 'НЕТ '} ${r.name}${r.detail ? ' → ' + r.detail : ''}`);
console.log(`\n${results.length - bad.length}/${results.length} проверок пройдено`);
process.exit(bad.length ? 1 : 0);
