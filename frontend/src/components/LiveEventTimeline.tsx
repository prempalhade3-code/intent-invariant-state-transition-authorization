import type { RunEvent } from "../lib/types";
import { labelEvent } from "../lib/copy";
import { Hash } from "./Hash";

export function LiveEventTimeline({ events }: { events: RunEvent[] }) {
  const latest = events.slice(-14).reverse();
  return (
    <section className="panel">
      <p className="panel-label">Event stream</p>
      <h2>Backend truth</h2>
      {!events.length ? (
        <p className="hint">Polling starts after POST /api/runs. Nothing is rendered until events exist.</p>
      ) : (
        <div className="timeline" style={{ marginTop: 8 }}>
          {latest.map((event) => (
            <div className="tl" key={`${event.sequence}-${event.event_type}-${event.event_hash ?? ""}`}>
              <code>{String(event.sequence).padStart(2, "0")}</code>
              <b>{labelEvent(event.event_type)}</b>
              <Hash value={event.event_hash} empty={event.source} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
