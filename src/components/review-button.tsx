"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { StarRatingInput } from "@/components/ui/rating";
import { Field, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function ReviewButton({ briefId }: { briefId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ briefId, rating, comment }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Star className="h-4 w-4" />
        Laisser un avis
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Laisser un avis"
        description="Notez la qualité du contenu livré par ce créateur."
      >
        <div className="flex flex-col gap-4">
          <StarRatingInput value={rating} onChange={setRating} />
          <Field label="Commentaire" htmlFor="comment" hint="Optionnel">
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Envoi..." : "Envoyer l'avis"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
