/** Просмотр фотографий. Нативный <dialog> даёт ловушку фокуса и Esc бесплатно. */

export function initLightbox(): void {
  const gallery = document.querySelector<HTMLElement>('[data-gallery]');
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  if (!gallery || !dialog || typeof dialog.showModal !== 'function') return;

  const img = dialog.querySelector<HTMLImageElement>('[data-lb-img]');
  const cap = dialog.querySelector<HTMLElement>('[data-lb-cap]');
  const triggers = Array.from(gallery.querySelectorAll<HTMLButtonElement>('[data-gal-open]'));
  if (!img || !cap || !triggers.length) return;

  const shots = triggers.map((btn) => {
    const figure = btn.closest('figure');
    const source = figure?.querySelector('img');
    return {
      src: source?.getAttribute('src') ?? '',
      alt: source?.getAttribute('alt') ?? '',
      caption: figure?.querySelector('figcaption')?.textContent?.trim() ?? '',
    };
  });

  let index = 0;
  let opener: HTMLElement | null = null;

  const show = (next: number) => {
    index = (next + shots.length) % shots.length;
    const shot = shots[index];
    img.src = shot.src;
    img.alt = shot.alt;
    cap.textContent = shot.caption;
  };

  triggers.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      opener = btn;
      show(i);
      dialog.showModal();
    });
  });

  dialog.querySelector('[data-lb-prev]')?.addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-lb-next]')?.addEventListener('click', () => show(index + 1));
  dialog.querySelector('[data-lb-close]')?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      show(index + 1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      show(index - 1);
    }
  });

  /* Клик по подложке: цель события — сам dialog, а не его содержимое */
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    opener?.focus();
    opener = null;
  });
}
