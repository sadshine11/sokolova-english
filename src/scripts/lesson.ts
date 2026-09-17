/** Связывает отрезок шкалы занятия с описанием этапа — в обе стороны. */

export function initLesson(): void {
  const root = document.querySelector<HTMLElement>('[data-lesson]');
  if (!root) return;

  const section = root.closest('section');
  if (!section) return;

  const segments = Array.from(root.querySelectorAll<HTMLElement>('[data-seg]'));
  const rows = Array.from(section.querySelectorAll<HTMLElement>('[data-step]'));
  if (!segments.length || !rows.length) return;

  const setActive = (index: number | null) => {
    segments.forEach((seg, i) => seg.toggleAttribute('data-active', i === index));
    rows.forEach((row, i) => row.toggleAttribute('data-active', i === index));
  };

  const bind = (el: HTMLElement, index: number, scrollOnClick: boolean) => {
    el.addEventListener('pointerenter', () => setActive(index));
    el.addEventListener('pointerleave', () => setActive(null));
    el.addEventListener('focusin', () => setActive(index));
    el.addEventListener('focusout', () => setActive(null));
    if (scrollOnClick) {
      el.addEventListener('click', () => {
        rows[index]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    }
  };

  segments.forEach((seg, i) => bind(seg, i, true));
  rows.forEach((row, i) => bind(row, i, false));
}
