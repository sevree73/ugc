"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UploadDeliverableForm({ briefId }: { briefId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("briefId", briefId);
    formData.append("file", file);

    const res = await fetch("/api/deliverables", { method: "POST", body: formData });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    setFile(null);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/40 p-4"
    >
      <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
        <UploadCloud className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="truncate">
          {file ? file.name : "Choisir un fichier à soumettre comme nouvelle version"}
        </span>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="sr-only"
        />
      </label>
      <div className="flex items-center justify-between gap-3">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button type="submit" size="sm" disabled={loading || !file} className="ml-auto">
          {loading ? "Envoi..." : "Envoyer le livrable"}
        </Button>
      </div>
    </form>
  );
}
