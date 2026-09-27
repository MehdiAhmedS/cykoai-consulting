/**
 * Resolves once the browser is idle, or after `timeout` ms at the latest, so
 * decorative work never competes with fonts, hydration or the hero sequence.
 */
export function whenIdle(timeout = 1600): Promise<void> {
  return new Promise((resolve) => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => resolve(), { timeout });
    } else {
      setTimeout(resolve, 350);
    }
  });
}
