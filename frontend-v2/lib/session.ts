const SESSION_ID_KEY = "sworn_session_id";
const SESSION_RUNS_KEY = "sworn_session_runs";
const SESSION_DAY_KEY = "sworn_session_day";
const SESSION_COOKIE = "sworn_session";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
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

function syncCookie(id: string): void {
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(id)}; path=/; SameSite=Lax`;
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
  }

  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, id);
    sessionStorage.setItem(SESSION_RUNS_KEY, "[]");
  }
  syncCookie(id);
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
