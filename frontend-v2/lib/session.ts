const SESSION_ID_KEY = "sworn_session_id";
const SESSION_RUNS_KEY = "sworn_session_runs";
const SESSION_DAY_KEY = "sworn_session_day";
const SESSION_COOKIE = "sworn_session";
const SESSION_DAY_COOKIE = "sworn_session_day";
const IST = "Asia/Kolkata";

/** Calendar day in IST — must match backend order filtering. */
function todayKey(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST }).format(new Date());
}

function readRuns(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(SESSION_RUNS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function syncCookie(id: string, day: string): void {
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(id)}; path=/; SameSite=Lax`;
  document.cookie = `${SESSION_DAY_COOKIE}=${encodeURIComponent(day)}; path=/; SameSite=Lax`;
}

function clearSessionCookies(): void {
  document.cookie = `${SESSION_COOKIE}=; path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${SESSION_DAY_COOKIE}=; path=/; Max-Age=0; SameSite=Lax`;
}

/** Browser-tab session id. Resets when the tab closes or the calendar day changes. */
export function getBrowserSessionId(): string {
  if (typeof window === "undefined") return "";
  const today = todayKey();
  const storedDay = sessionStorage.getItem(SESSION_DAY_KEY);
  if (storedDay !== today) {
    sessionStorage.setItem(SESSION_DAY_KEY, today);
    sessionStorage.removeItem(SESSION_ID_KEY);
    sessionStorage.removeItem(SESSION_RUNS_KEY);
    clearSessionCookies();
  }

  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, id);
    sessionStorage.setItem(SESSION_RUNS_KEY, "[]");
  }
  syncCookie(id, today);
  return id;
}

export function rememberRun(runId: string): void {
  if (typeof window === "undefined" || !runId) return;
  getBrowserSessionId();
  const runs = readRuns();
  if (!runs.includes(runId)) {
    runs.push(runId);
    sessionStorage.setItem(SESSION_RUNS_KEY, JSON.stringify(runs));
  }
}

export function getSessionRunIds(): string[] {
  return readRuns();
}

export function storeOrdersHref(): string {
  const id = getBrowserSessionId();
  return `/store/orders?session=${encodeURIComponent(id)}`;
}
