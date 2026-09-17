/** Табы ОГЭ / ЕГЭ. Без JS обе панели просто показаны подряд. */

export function initTabs(): void {
  document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((root) => {
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panels = tabs
      .map((tab) => document.getElementById(tab.getAttribute('aria-controls') ?? ''))
      .filter((el): el is HTMLElement => Boolean(el));

    if (tabs.length !== panels.length || !tabs.length) return;

    root.setAttribute('data-tabs-ready', '');

    const select = (index: number, focus = true) => {
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[i].toggleAttribute('hidden', !active);
      });
      if (focus) tabs[index].focus();
    };

    select(0, false);

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i, false));

      tab.addEventListener('keydown', (e) => {
        const map: Record<string, number> = {
          ArrowRight: i + 1,
          ArrowLeft: i - 1,
          Home: 0,
          End: tabs.length - 1,
        };
        const next = map[e.key];
        if (next === undefined) return;
        e.preventDefault();
        select((next + tabs.length) % tabs.length);
      });
    });
  });
}
