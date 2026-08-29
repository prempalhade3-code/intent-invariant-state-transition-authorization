import { motion } from "framer-motion";
import type { Payment } from "../lib/types";

export function PaymentResult({
  authorized,
  reason,
  payment,
}: {
  authorized: boolean | null;
  reason: string | null;
  payment: Payment | null;
}) {
  if (authorized == null && !payment) {
    return (
      <div className="verdict">
        <h3>Awaiting commit</h3>
        <p>No authorization or payment event has arrived.</p>
      </div>
    );
  }
  const amount = payment?.amount ?? payment?.transaction?.amount;
  const ok = authorized === true && payment?.status === "paid";
  const blocked = authorized === false;
  return (
    <motion.div
      className="verdict"
      data-ok={blocked ? "false" : ok ? "true" : undefined}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>
        {blocked ? "Stopped" : ok ? "Paid" : authorized ? "Authorized" : "Unresolved"}
      </h3>
      <p>
        {blocked
          ? reason
          : ok
            ? `${payment?.status} · ${payment?.transaction_id ?? "ledger"} · ${amount != null ? `$${amount}` : "amount from backend"}`
            : authorized
              ? "DAE granted authorization. Payment settles only after the store accepts the envelope."
              : reason}
      </p>
    </motion.div>
  );
}
