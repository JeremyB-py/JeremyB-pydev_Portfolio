/** Scroll reveal for generated project case-study pages (see generate-project-pages.mjs). */
export function initProjectScrollReveal(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sections = document.querySelectorAll<HTMLElement>('.project-content .section');

  if (reduced) {
    sections.forEach((el) => el.classList.add('is-visible'));
    // Autoplaying demo loops show their poster with controls instead.
    document.querySelectorAll<HTMLVideoElement>('.project-content video[autoplay]').forEach((video) => {
      video.removeAttribute('autoplay');
      video.pause();
      video.controls = true;
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
  );

  sections.forEach((el) => observer.observe(el));
}

initProjectScrollReveal();
