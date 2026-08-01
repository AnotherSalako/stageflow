const STYLES: Record<string, string> = {
  PENDING: "bg-gold/15 text-gold",
  CONFIRMED: "bg-cappuccino/15 text-cappuccino",
  COMPLETED: "bg-confirmed/15 text-confirmed",
  CANCELED: "bg-white/10 text-stone-400",
};

const LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Done",
  CANCELED: "Cancelled",
};

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${STYLES[status] || "bg-white/10 text-stone-300"}`}>{LABELS[status] || status}</span>;
}
