/**
 * Click-to-load game frame for project pages (markup lives in the project Markdown,
 * e.g. projects/office_supply_stealth_game.md). Nothing is downloaded until Play:
 * the poster is swapped for an iframe of the full-page player with ?embed=1.
 * Touch-first devices go to the full-page player instead, which handles fullscreen,
 * rotation and the on-screen controls better than a frame inside a scrolling page.
 */

const coarsePointer = window.matchMedia('(pointer: coarse)');

function embedUrl(src: string): string {
  const url = new URL(src, window.location.href);
  url.searchParams.set('embed', '1');
  return url.href;
}

function initGamePlayer(root: HTMLElement): void {
  const editions = Array.from(root.querySelectorAll<HTMLButtonElement>('.game-player__edition'));
  const screen = root.querySelector<HTMLElement>('.game-player__screen');
  const poster = root.querySelector<HTMLElement>('.game-player__poster');
  const posterImg = poster?.querySelector('img');
  const play = root.querySelector<HTMLAnchorElement>('.game-player__play');
  const note = root.querySelector<HTMLElement>('.game-player__note');
  const caption = root.querySelector<HTMLElement>('.game-player__caption');
  const open = root.querySelector<HTMLAnchorElement>('.game-player__open');
  const fullscreen = root.querySelector<HTMLButtonElement>('.game-player__fullscreen');
  if (!editions.length || !screen || !poster || !posterImg || !play) return;

  let current = editions.find((b) => b.getAttribute('aria-pressed') === 'true') ?? editions[0];
  let frame: HTMLIFrameElement | null = null;

  function unload(): void {
    if (!frame) return;
    // Blank the frame first so the WebGL context and its memory are released promptly.
    frame.src = 'about:blank';
    frame.remove();
    frame = null;
    poster!.hidden = false;
    root.classList.remove('is-playing');
    if (fullscreen) fullscreen.hidden = true;
  }

  function render(): void {
    const d = current.dataset;
    editions.forEach((b) => b.setAttribute('aria-pressed', b === current ? 'true' : 'false'));
    root.dataset.edition = d.edition ?? '';
    posterImg!.src = d.poster ?? posterImg!.src;
    posterImg!.alt = d.posterAlt ?? '';
    play!.href = d.src ?? play!.href;
    play!.setAttribute('aria-label', `Play ${current.textContent?.trim() ?? ''}`);
    if (note) note.textContent = (coarsePointer.matches ? d.touchNote : d.note) ?? '';
    if (caption) caption.textContent = d.caption ?? '';
    if (open && d.src) open.href = d.src;
  }

  function load(): void {
    const src = current.dataset.src;
    if (!src) return;
    unload();
    frame = document.createElement('iframe');
    frame.className = 'game-player__frame';
    frame.src = embedUrl(src);
    frame.title = `${current.textContent?.trim() ?? 'Game'}: Office Supply Stealth Game`;
    frame.allow = 'fullscreen; autoplay';
    frame.allowFullscreen = true;
    screen!.appendChild(frame);
    poster!.hidden = true;
    root.classList.add('is-playing');
    if (fullscreen) {
      fullscreen.hidden = !(document.fullscreenEnabled || (document as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled);
    }
    // The game's own Play button takes the first click inside the frame.
    frame.focus();
  }

  editions.forEach((btn) =>
    btn.addEventListener('click', () => {
      if (btn === current) return;
      unload();
      current = btn;
      render();
    })
  );

  play.addEventListener('click', (e) => {
    // Touch-first devices follow the link to the full-page player.
    if (coarsePointer.matches) return;
    e.preventDefault();
    load();
  });

  fullscreen?.addEventListener('click', () => {
    if (!frame) return;
    const el = frame as HTMLIFrameElement & { webkitRequestFullscreen?: () => void };
    if (el.requestFullscreen) void el.requestFullscreen();
    else el.webkitRequestFullscreen?.();
  });

  coarsePointer.addEventListener('change', render);
  render();
}

export function initGamePlayers(): void {
  document.querySelectorAll<HTMLElement>('[data-game-player]').forEach(initGamePlayer);
}
