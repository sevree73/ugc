import { Check } from "lucide-react";
import type { BriefStatus } from "@prisma/client";
import { cn } from "@/lib/cn";

const STAGES = [
  "Brief validé",
  "Créateur assigné",
  "Contenu en production",
  "Livraison",
  "Paiement",
];

function stageIndexForStatus(status: BriefStatus): number {
  switch (status) {
    case "DRAFT":
      return -1;
    case "PUBLISHED":
      return 0;
    case "IN_PROGRESS":
      return 2;
    case "DELIVERED":
      return 3;
    case "COMPLETED":
      return 4;
    default:
      return -1;
  }
}

export function StatusTracker({ status }: { status: BriefStatus }) {
  const currentIndex = stageIndexForStatus(status);

  return (
    <ol className="flex flex-col">
      {STAGES.map((stage, i) => {
        const done = i <= currentIndex;
        const active = i === currentIndex + 1;
        const isLast = i === STAGES.length - 1;

        return (
          <li key={stage} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  done && "bg-pink-400 text-white",
                  active && "border-2 border-pink-400 bg-white text-pink-500",
                  !done && !active && "border border-slate-300 bg-white text-slate-400",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              {!isLast && (
                <span
                  className={cn(
                    "my-1 w-px flex-1",
                    i < currentIndex ? "bg-pink-400" : "bg-slate-200",
                  )}
                />
              )}
            </div>
            <div className={cn("pb-6", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  done || active ? "text-slate-700" : "text-slate-400",
                )}
              >
                {stage}
              </p>
              <p className="text-xs text-slate-400">
                {done ? "Terminé" : active ? "En cours" : "En attente"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
