"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SECTORS } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Field, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Profile = {
  bio: string | null;
  sectors: string[];
  portfolioUrls: string[];
};

export default function CreatorProfilePage() {
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [portfolioUrls, setPortfolioUrls] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/creator-profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Profile | null) => {
        if (data) {
          setBio(data.bio ?? "");
          setSectors(data.sectors);
          setPortfolioUrls(data.portfolioUrls.join("\n"));
        }
        setLoading(false);
      });
  }, []);

  function toggleSector(sector: string) {
    setSectors((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const urls = portfolioUrls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    const res = await fetch("/api/creator-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, sectors, portfolioUrls: urls }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    router.push("/creator");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <PageHeader
        title="Mon portfolio"
        description="Les secteurs déterminent les briefs affichés sur votre tableau de bord."
      />

      <Card className="p-6 sm:p-8">
        {loading ? (
          <p className="text-sm text-slate-500">Chargement...</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field label="Bio" htmlFor="bio">
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </Field>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium text-slate-700">Secteurs</legend>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map((sector) => (
                  <button
                    type="button"
                    key={sector}
                    onClick={() => toggleSector(sector)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      sectors.includes(sector)
                        ? "border-pink-400 bg-pink-100 text-slate-700"
                        : "border-slate-300 text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </fieldset>

            <Field
              label="Liens de portfolio"
              htmlFor="portfolio"
              hint="Une URL par ligne"
            >
              <Textarea
                id="portfolio"
                value={portfolioUrls}
                onChange={(e) => setPortfolioUrls(e.target.value)}
                rows={4}
                placeholder={"https://instagram.com/vous\nhttps://tiktok.com/@vous"}
              />
            </Field>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer le profil"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
