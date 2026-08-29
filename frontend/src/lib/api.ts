import type { CreateRunResponse, RunEvent, RunRecord, RunResult } from "./types";

async function read<T>(response: Response): Promise<T> {
  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    const detail =
      typeof body === "object" && body && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : text || `Request failed (${response.status})`;
    throw new Error(detail);
  }
  return body as T;
}

export async function createRun(userPrompt: string, demoEvent?: string | null) {
  return read<CreateRunResponse>(
    await fetch("/api/runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        user_prompt: userPrompt,
        mode: "autonomous",
        demo_event: demoEvent || undefined,
      }),
    }),
  );
}

export async function getRun(runId: string) {
  return read<RunRecord>(await fetch(`/api/runs/${runId}`));
}

export async function getEvents(runId: string, after = 0) {
  return read<{ run_id: string; events: RunEvent[] }>(
    await fetch(`/api/runs/${runId}/events?after=${after}`),
  );
}

export async function resetRun(runId: string) {
  return read<{ status: string }>(
    await fetch(`/api/runs/${runId}/reset`, { method: "POST" }),
  );
}

export async function triggerDemoEvent(runId: string, eventType: string) {
  return read<{ status: string; event_type: string }>(
    await fetch(`/api/runs/${runId}/demo-event`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event_type: eventType }),
    }),
  );
}

export async function runScenario(scenario: string) {
  return read<RunResult>(
    await fetch("/api/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        scenario,
        budget: 25,
        domain: "mockstore.local",
      }),
    }),
  );
}
