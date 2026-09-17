/** Появление блоков при скролле и отрисовка штрихов зелёной ручкой. */

const REDUCED = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initReveal(): void {
  /* Длину каждого штриха меряем по факту: иначе анимация «дорисовки»
     стартует не с той точки и половину времени ничего не происходит. */
  document.querySelectorAll<SVGPathElement>('.pen path').forEach((path) => {
    const len = path.getTotalLength?.();
    if (len) path.style.setProperty('--pen-len', String(Math.ceil(len)));
  });

  /* Штрихи вне зон появления (например, в шапке) рисуем сразу. */
  document.querySelectorAll<SVGElement>('.pen').forEach((pen) => {
    if (!pen.closest('[data-reveal]')) pen.setAttribute('data-drawn', '');
  });

  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');

  if (REDUCED() || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.06 }
  );

  targets.forEach((el) => io.observe(el));
}
