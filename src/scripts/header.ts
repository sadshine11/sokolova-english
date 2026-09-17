/** Шапка: линейка при скролле, мобильное меню, подсветка текущего раздела. */

export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const burger = document.querySelector<HTMLButtonElement>('[data-burger]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!header) return;

  /* ── Линейка появляется, как только страница сдвинулась ──────────── */
  const onScroll = () => {
    header.toggleAttribute('data-scrolled', window.scrollY > 4);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Мобильное меню ─────────────────────────────────────────────── */
  if (burger && menu) {
    const setOpen = (open: boolean) => {
      burger.setAttribute('aria-expanded', String(open));
      menu.toggleAttribute('hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) menu.querySelector<HTMLAnchorElement>('a')?.focus();
    };

    const isOpen = () => burger.getAttribute('aria-expanded') === 'true';

    burger.addEventListener('click', () => setOpen(!isOpen()));

    menu.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        setOpen(false);
        burger.focus();
      }
    });

    /* На десктопе меню не нужно: снимаем блокировку прокрутки при ресайзе */
    const desktop = window.matchMedia('(min-width: 1000px)');
    desktop.addEventListener('change', (e) => {
      if (e.matches && isOpen()) setOpen(false);
    });
  }

  /* ── Текущий раздел ─────────────────────────────────────────────── */
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav]'));
  if (!links.length || !('IntersectionObserver' in window)) return;

  const sections = links
    .map((link) => {
      const id = link.dataset.nav?.replace('#', '');
      return id ? document.getElementById(id) : null;
    })
    .filter((el): el is HTMLElement => Boolean(el));

  const visible = new Set<string>();

  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      }
      /* Активным считаем самый верхний из видимых — так подсветка не скачет */
      const current = sections.find((s) => visible.has(s.id))?.id;
      links.forEach((link) => {
        const match = link.dataset.nav === `#${current}`;
        if (match) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    },
    { rootMargin: '-72px 0px -55% 0px' }
  );

  sections.forEach((s) => spy.observe(s));
}
