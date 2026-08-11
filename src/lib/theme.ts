export type Theme = "dark" | "light";

type Listener = () => void;
let listeners: Listener[] = [];

export function subscribeTheme(listener: Listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function getThemeServerSnapshot(): Theme {
  return "dark";
}

export function setTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("cykoai-theme", next);
  } catch {
    // Storage unavailable (private browsing, etc.) — theme just won't persist.
  }
  listeners.forEach((l) => l());
}
