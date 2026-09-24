// The light blooms where you tap (from the D mock-ups). Motion only.
const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function bloom(el: HTMLElement) {
  if (reduced) return {};
  const down = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const b = document.createElement('span');
    b.className = 'bloom';
    b.style.left = `${e.clientX - r.left}px`;
    b.style.top = `${e.clientY - r.top}px`;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.appendChild(b);
    setTimeout(() => { b.remove(); el.style.overflow = ''; }, 950);
  };
  el.addEventListener('pointerdown', down);
  return { destroy: () => el.removeEventListener('pointerdown', down) };
}
