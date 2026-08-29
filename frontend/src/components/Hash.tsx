export function Hash({ value, empty = "—" }: { value?: string | null; empty?: string }) {
  if (!value) return <span className="hash">{empty}</span>;
  return (
    <span className="hash" title={value}>
      {value.slice(0, 10)}…{value.slice(-8)}
    </span>
  );
}

export function pretty(value: unknown) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
