/** Форма записи: проверка на клиенте, состояния отправки, честный запасной путь. */

type Rule = (value: string, field: HTMLElement) => string | null;

const required = (message: string): Rule => (value) => (value.trim() ? null : message);

const rules: Record<string, Rule[]> = {
  name: [
    required('Напишите, как к вам обращаться.'),
    (v) => (v.trim().length >= 2 ? null : 'Имя слишком короткое.'),
  ],
  contact: [
    required('Без контакта я не смогу ответить.'),
    (v) => {
      const value = v.trim();
      const digits = value.replace(/\D/g, '');
      const isPhone = digits.length >= 10;
      const isNick = /^@?[a-z0-9._-]{4,}$/i.test(value);
      const isMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      return isPhone || isNick || isMail
        ? null
        : 'Похоже на опечатку. Телефон, @никнейм в Telegram или почта.';
    },
  ],
  grade: [required('Выберите класс.')],
  consent: [required('Без согласия я не имею права хранить ваши данные.')],
};

function fieldValue(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
  if (el instanceof HTMLInputElement && el.type === 'checkbox') return el.checked ? 'on' : '';
  return el.value;
}

export function initForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-form]');
  if (!form) return;

  const status = form.querySelector<HTMLElement>('[data-status]');
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]');
  const label = form.querySelector<HTMLElement>('[data-submit-label]');
  const endpoint = form.dataset.endpoint ?? '';
  const telegram = form.dataset.telegram ?? '';

  const setStatus = (text: string, tone: 'ok' | 'bad' | '' = '') => {
    if (!status) return;
    status.textContent = text;
    if (tone) status.setAttribute('data-tone', tone);
    else status.removeAttribute('data-tone');
  };

  const errorFor = (name: string) =>
    form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);

  const validateField = (name: string): boolean => {
    const control = form.elements.namedItem(name) as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
      | null;
    if (!control) return true;

    const message = (rules[name] ?? [])
      .map((rule) => rule(fieldValue(control), control))
      .find((m): m is string => Boolean(m));

    const slot = errorFor(name);
    if (slot) slot.textContent = message ?? '';
    control.setAttribute('aria-invalid', message ? 'true' : 'false');
    return !message;
  };

  /* Ошибку показываем после первой попытки отправки, дальше — по мере правок */
  let submitted = false;
  Object.keys(rules).forEach((name) => {
    const control = form.elements.namedItem(name) as HTMLElement | null;
    if (!control) return;
    const revalidate = () => {
      if (submitted) validateField(name);
    };
    control.addEventListener('input', revalidate);
    control.addEventListener('change', revalidate);
    control.addEventListener('blur', revalidate);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitted = true;
    setStatus('');

    const names = Object.keys(rules);
    const results = names.map((name) => ({ name, ok: validateField(name) }));
    const firstBad = results.find((r) => !r.ok);

    if (firstBad) {
      const control = form.elements.namedItem(firstBad.name) as HTMLElement | null;
      control?.focus();
      setStatus('Проверьте выделенные поля.', 'bad');
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    submit?.setAttribute('data-busy', '');
    if (label) label.textContent = 'Отправляю…';

    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(String(response.status));
        form.reset();
        setStatus('Заявка отправлена. Отвечу сегодня, обычно в течение пары часов.', 'ok');
      } else {
        /* Демонстрационная версия: бэкенда нет, и об этом честнее сказать прямо */
        await new Promise((resolve) => setTimeout(resolve, 500));
        setStatus(
          `Форма заполнена верно. Это демонстрационная версия сайта, поэтому заявка никуда не ушла — ` +
            `на рабочем сайте она придёт мне на почту и в Telegram${telegram ? ' (' + telegram.replace('https://t.me/', '@') + ')' : ''}.`,
          'ok'
        );
      }
    } catch {
      setStatus(
        'Не получилось отправить — похоже, пропала связь. Напишите в Telegram, отвечу так же быстро.',
        'bad'
      );
    } finally {
      submit?.removeAttribute('data-busy');
      if (label) label.textContent = 'Отправить заявку';
    }
  });
}
