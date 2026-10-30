"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function DeliverableActions({ deliverableId }: { deliverableId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"revise" | "approve" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function act(action: "revise" | "approve") {
    setLoading(action);
    setError(null);

    const res = await fetch(`/api/deliverables/${deliverableId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    setLoading(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    setConfirmOpen(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => act("revise")}
          disabled={loading !== null}
        >
          <RotateCcw className="h-4 w-4" />
          {loading === "revise" ? "Envoi..." : "Demander une retouche"}
        </Button>
        <Button size="sm" onClick={() => setConfirmOpen(true)} disabled={loading !== null}>
          <CheckCircle2 className="h-4 w-4" />
          Valider & payer
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Valider le contenu ?"
        description="Vous êtes sur le point d'approuver ce livrable et de libérer le paiement."
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={loading !== null}>
            Annuler
          </Button>
          <Button onClick={() => act("approve")} disabled={loading !== null}>
            {loading === "approve" ? "Traitement..." : "Valider & payer"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
