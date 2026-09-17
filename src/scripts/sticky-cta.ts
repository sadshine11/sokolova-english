/** Показывает мобильную панель записи, когда открытие уже прокручено,
    и убирает её, когда на экране сам блок с формой или подвал. */

export function initStickyCta(): void {
  const bar = document.querySelector<HTMLElement>('[data-sticky-cta]');
  const hero = document.querySelector<HTMLElement>('.hero');
  const booking = document.getElementById('booking');
  const footer = document.querySelector<HTMLElement>('footer');

  if (!bar || !hero || !('IntersectionObserver' in window)) return;

  const visible = new Set<Element>();

  const update = () => {
    const past = !visible.has(hero);
    const atTarget = (booking && visible.has(booking)) || (footer && visible.has(footer));
    bar.toggleAttribute('data-shown', past && !atTarget);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      update();
    },
    { threshold: 0 }
  );

  [hero, booking, footer].forEach((el) => el && io.observe(el));
}
