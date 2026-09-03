const SESSION_ID_KEY = "sworn_session_id";
const SESSION_RUNS_KEY = "sworn_session_runs";
const SESSION_COOKIE = "sworn_session";

function readRuns(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(SESSION_RUNS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Browser-tab session id. Clears when the tab/window is closed. */
export function getBrowserSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, id);
    sessionStorage.setItem(SESSION_RUNS_KEY, "[]");
  }
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(id)}; path=/; SameSite=Lax`;
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
