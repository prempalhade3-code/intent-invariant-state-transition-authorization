import type { ViewModel } from "../lib/reduce";

export function VerificationRail({ view, phase }: { view: ViewModel; phase: string }) {
  const watching = phase === "live" || phase === "submitting";
  const facts: { title: string; detail: string; state: "wait" | "ok" | "bad" }[] = [];

  if (view.nodes.length) {
    const tip = view.nodes[view.nodes.length - 1];
    facts.push({
      title: "Path in evidence",
      detail: `${view.nodes.length} attested nodes. Tip ${String(tip.node_hash || tip.hash || "").slice(0, 12)}`,
      state: "ok",
    });
  } else {
    facts.push({
      title: "Path in evidence",
      detail: watching ? "Waiting for execution_node_recorded" : "No graph nodes in this run yet",
      state: "wait",
    });
  }

  if (view.ssi) {
    facts.push({
      title: "SSI compiled",
      detail: `budget ${String(view.ssi.budget ?? "—")} · ${String(view.ssi.domain ?? "")}`,
      state: "ok",
    });
  }

  if (view.verification) {
    const failed = Boolean(view.verification.detail) || view.authorized === false;
    facts.push({
      title: "Commit-time verification",
      detail: failed
        ? String(view.verification.detail ?? view.blockReason ?? "blocked")
        : "verification_result received from DAE",
      state: failed ? "bad" : "ok",
    });
  } else {
    facts.push({
      title: "Commit-time verification",
      detail: watching ? "DAE has not spoken" : "No verification_result event",
      state: "wait",
    });
  }

  if (view.authorized === true) {
    facts.push({ title: "Signing authority", detail: "authorization_granted", state: "ok" });
  } else if (view.authorized === false) {
    facts.push({
      title: "Signing authority",
      detail: view.blockReason ?? "authorization_blocked",
      state: "bad",
    });
  } else {
    facts.push({
      title: "Signing authority",
      detail: "Master secret never leaves the DAE process",
      state: "wait",
    });
  }

  return (
    <section className="panel" style={view.authorized === false ? { borderColor: "rgba(217,137,122,0.45)" } : undefined}>
      <p className="panel-label">IISTA enclave</p>
      <h2>Independent authorization</h2>
      <p className="hint" style={{ marginBottom: 8 }}>
        Checks appear only from backend verification and authorization events.
      </p>
      {facts.map((fact) => (
        <div className="check" key={fact.title}>
          <i className={`dot ${fact.state}`} />
          <div>
            <b>{fact.title}</b>
            <span>{fact.detail}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
