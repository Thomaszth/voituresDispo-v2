export function countUp(
  target: number,
  duration: number,
  delay: number,
  onUpdate: (value: number) => void
) {
  const startTime = performance.now() + delay;
  let rafId: number;

  function tick(now: number) {
    const elapsed = now - startTime;
    if (elapsed < 0) {
      rafId = requestAnimationFrame(tick);
      return;
    }
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    onUpdate(Math.round(eased * target));
    if (progress < 1) {
      rafId = requestAnimationFrame(tick);
    }
  }

  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}
