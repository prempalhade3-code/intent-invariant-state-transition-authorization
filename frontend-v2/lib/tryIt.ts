export const TRY_IT_EVENT = "sworn:try-it";

export function triggerTryIt() {
  if (window.location.pathname === "/") {
    window.dispatchEvent(new CustomEvent(TRY_IT_EVENT));
    return;
  }
  window.location.href = "/?try=1";
}
