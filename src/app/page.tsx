import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { LinkButton } from "@/components/ui/link-button";

const roleHome: Record<string, string> = {
  COMPANY: "/company",
  CREATOR: "/creator",
  ADMIN: "/admin",
};

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect(roleHome[session.user.role] ?? "/login");
  }

  return (
    <main className="grid flex-1 grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center bg-white px-4 py-16">
        <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-400 text-white shadow-lg shadow-pink-400/20">
            <Sparkles className="h-7 w-7" />
          </span>
          <div className="flex flex-col gap-3">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-700 sm:text-5xl">
              UGCLink
            </h1>
            <p className="max-w-md text-balance text-base text-slate-500">
              Connecte les entreprises avec des créateurs. Publiez un brief,
              trouvez le bon talent, et recevez du contenu authentique.
            </p>
          </div>
          <div className="flex gap-3">
            <LinkButton href="/login" variant="primary">
              Se connecter
            </LinkButton>
            <LinkButton href="/register" variant="outline">
              Créer un compte
            </LinkButton>
          </div>
        </div>
        <p className="mt-16 text-xs text-slate-400">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-pink-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>

      <div className="relative hidden overflow-hidden bg-slate-50 lg:block">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-pink-200 to-pink-100 opacity-80 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-gradient-to-br from-pink-300 to-white opacity-70 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-gradient-to-tr from-white to-pink-200 opacity-90 blur-3xl" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 400 400"
            className="h-2/3 w-2/3 opacity-90"
            aria-hidden="true"
          >
            <path
              d="M40,200 C40,100 140,40 220,60 C300,80 360,150 340,220 C320,290 240,340 160,320 C80,300 40,280 40,200 Z"
              fill="url(#waveGradient)"
            />
            <defs>
              <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FBCFE8" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </main>
  );
}
