"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Building2, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type RoleChoice = "COMPANY" | "CREATOR";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleChoice>("COMPANY");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role, name, sector }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    router.push("/login");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-16">
      <div className="mb-8 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-400 text-white">
          <Sparkles className="h-4.5 w-4.5" />
        </span>
        <span className="font-heading text-lg font-bold text-slate-700">UGCLink</span>
      </div>

      <Card className="w-full max-w-sm p-6 sm:p-8">
        <h1 className="font-heading text-xl font-bold text-slate-700">Créer un compte</h1>
        <p className="mt-1 text-sm text-slate-500">Rejoignez en tant qu&apos;entreprise ou créateur</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("COMPANY")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-sm font-medium transition-colors",
                role === "COMPANY"
                  ? "border-pink-400 bg-pink-50 text-slate-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50",
              )}
            >
              <Building2 className="h-5 w-5" />
              Entreprise
            </button>
            <button
              type="button"
              onClick={() => setRole("CREATOR")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-sm font-medium transition-colors",
                role === "CREATOR"
                  ? "border-pink-400 bg-pink-50 text-slate-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50",
              )}
            >
              <UserRound className="h-5 w-5" />
              Créateur
            </button>
          </div>

          <Field label="Email" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              variant="underline"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Mot de passe" htmlFor="password" required hint="Au moins 8 caractères">
            <Input
              id="password"
              type="password"
              variant="underline"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          {role === "COMPANY" ? (
            <>
              <Field label="Nom de l'entreprise" htmlFor="name" required>
                <Input
                  id="name"
                  type="text"
                  variant="underline"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="Secteur" htmlFor="sector" required>
                <Input
                  id="sector"
                  type="text"
                  variant="underline"
                  required
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                />
              </Field>
            </>
          ) : null}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? "Création..." : "Créer mon compte"}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-sm text-slate-500">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-pink-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </main>
  );
}
