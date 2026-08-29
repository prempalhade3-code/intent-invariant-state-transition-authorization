import { ATTACKS } from "../lib/copy";

export function AdversarialLab({
  disabled,
  activeId,
  onAutonomous,
  onScenario,
}: {
  disabled: boolean;
  activeId: string | null;
  onAutonomous: (prompt: string, demoEvent: string, id: string) => void;
  onScenario: (scenario: string, id: string) => void;
}) {
  return (
    <section className="lab">
      <p className="panel-label">Incident lab</p>
      <p className="hint" style={{ maxWidth: 640 }}>
        These are live backend attacks, not UI presets. Each one runs the real agent and DAE. The
        marketplace is the test environment; IISTA is the product under pressure.
      </p>
      <div className="lab-grid">
        {ATTACKS.map((attack) => (
          <button
            key={attack.id}
            className="attack"
            disabled={disabled}
            data-on={activeId === attack.id ? "true" : "false"}
            onClick={() => {
              if (attack.kind === "autonomous") {
                onAutonomous(attack.prompt ?? "", attack.demoEvent ?? "", attack.id);
              } else if (attack.scenario) {
                onScenario(attack.scenario, attack.id);
              }
            }}
          >
            <strong>{attack.title}</strong>
            <p>{attack.whatBreaks}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
