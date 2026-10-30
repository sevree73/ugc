"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Video,
  Film,
  Image as ImageIcon,
  CircleDashed,
  Package,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { SECTORS, FORMATS } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const FORMAT_ICONS: Record<string, React.ElementType> = {
  "UGC Video": Video,
  "Reel / TikTok": Film,
  Photo: ImageIcon,
  Story: CircleDashed,
  Unboxing: Package,
  Testimonial: MessageCircle,
};

export default function NewBriefPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [sector, setSector] = useState<string>(SECTORS[0]);
  const [format, setFormat] = useState<string>(FORMATS[0]);
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [creatorsNeeded, setCreatorsNeeded] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"draft" | "publish" | null>(null);

  async function submitBrief(isDraft: boolean) {
    setLoading(isDraft ? "draft" : "publish");
    setError(null);

    const res = await fetch("/api/briefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        sector,
        format,
        budget,
        deadline: deadline || undefined,
        creatorsNeeded: creatorsNeeded || undefined,
        description,
        isDraft,
      }),
    });

    setLoading(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    router.push("/company");
    router.refresh();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submitBrief(false);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        href="/company"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au dashboard
      </Link>

      <PageHeader title="Créer un nouveau brief" />

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Titre du brief" htmlFor="title" required>
            <Input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Vidéo UGC pour notre nouvelle crème visage"
            />
          </Field>

          <Field label="Secteur / Catégorie" htmlFor="sector" required>
            <Select id="sector" value={sector} onChange={(e) => setSector(e.target.value)}>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              Format souhaité<span className="ml-0.5 text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {FORMATS.map((f) => {
                const Icon = FORMAT_ICONS[f] ?? Video;
                const active = format === f;
                return (
                  <button
                    type="button"
                    key={f}
                    onClick={() => setFormat(f)}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center text-xs font-medium transition-colors",
                      active
                        ? "border-pink-400 bg-pink-50 text-slate-700"
                        : "border-slate-300 text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {active && (
                      <CheckCircle2 className="absolute right-1.5 top-1.5 h-4 w-4 text-pink-500" />
                    )}
                    <Icon className="h-5 w-5" />
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Budget proposé (DA)" htmlFor="budget" required>
              <Input
                id="budget"
                type="number"
                required
                min={1}
                step={1}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Ex: 4000"
              />
            </Field>
            <Field label="Nombre de créateurs" htmlFor="creatorsNeeded" hint="Optionnel">
              <Input
                id="creatorsNeeded"
                type="number"
                min={1}
                step={1}
                value={creatorsNeeded}
                onChange={(e) => setCreatorsNeeded(e.target.value)}
                placeholder="Ex: 1"
              />
            </Field>
          </div>

          <Field label="Deadline" htmlFor="deadline" hint="Optionnel">
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </Field>

          <Field label="Description & inspirations" htmlFor="description" hint="Optionnel, mais aide les créateurs à comprendre le brief">
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Décrivez votre projet, vos attentes, le ton, la cible..."
            />
          </Field>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={loading !== null}
              onClick={() => submitBrief(true)}
            >
              {loading === "draft" ? "Enregistrement..." : "Enregistrer en brouillon"}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading !== null}>
              {loading === "publish" ? "Publication..." : "Publier le brief"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
