import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "info" | "warning" | "purple" | "success" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-pink-100 text-slate-700",
  info: "bg-blue-50 text-blue-700",
  warning: "bg-amber-50 text-amber-700",
  purple: "bg-violet-50 text-violet-700",
  success: "bg-emerald-50 text-emerald-700",
  danger: "bg-red-50 text-red-700",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

const BRIEF_STATUS_TONE: Record<string, BadgeTone> = {
  DRAFT: "neutral",
  PUBLISHED: "info",
  IN_PROGRESS: "warning",
  DELIVERED: "purple",
  COMPLETED: "success",
};

const APPLICATION_STATUS_TONE: Record<string, BadgeTone> = {
  PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "danger",
  WITHDRAWN: "neutral",
};

const DELIVERABLE_STATUS_TONE: Record<string, BadgeTone> = {
  SUBMITTED: "info",
  REVISION_REQUESTED: "warning",
  APPROVED: "success",
};

const PAYMENT_STATUS_TONE: Record<string, BadgeTone> = {
  PENDING: "neutral",
  HELD: "warning",
  RELEASED: "success",
  REFUNDED: "info",
  FAILED: "danger",
};

const STATUS_MAPS = {
  brief: BRIEF_STATUS_TONE,
  application: APPLICATION_STATUS_TONE,
  deliverable: DELIVERABLE_STATUS_TONE,
  payment: PAYMENT_STATUS_TONE,
} as const;

const STATUS_LABELS: Record<keyof typeof STATUS_MAPS, Record<string, string>> = {
  brief: {
    DRAFT: "Brouillon",
    PUBLISHED: "Publié",
    IN_PROGRESS: "En cours",
    DELIVERED: "Livré",
    COMPLETED: "Terminé",
  },
  application: {
    PENDING: "En attente",
    ACCEPTED: "Acceptée",
    REJECTED: "Refusée",
    WITHDRAWN: "Retirée",
  },
  deliverable: {
    SUBMITTED: "Soumis",
    REVISION_REQUESTED: "Retouche demandée",
    APPROVED: "Approuvé",
  },
  payment: {
    PENDING: "En attente",
    HELD: "Bloqué",
    RELEASED: "Libéré",
    REFUNDED: "Remboursé",
    FAILED: "Échoué",
  },
};

function formatStatusLabel(status: string, kind: keyof typeof STATUS_MAPS) {
  return STATUS_LABELS[kind][status] ?? status.replace(/_/g, " ");
}

export function StatusBadge({
  status,
  kind,
  className,
}: {
  status: string;
  kind: keyof typeof STATUS_MAPS;
  className?: string;
}) {
  const tone = STATUS_MAPS[kind][status] ?? "neutral";
  return (
    <Badge tone={tone} className={className}>
      {formatStatusLabel(status, kind)}
    </Badge>
  );
}
