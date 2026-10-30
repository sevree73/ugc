import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminHomePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Back-office admin"
        description="Supervision et modération de la plateforme."
      />

      <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-[0_8px_30px_-12px_rgba(51,65,85,0.12)]">
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-pink-200 to-pink-100 opacity-70 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-gradient-to-tr from-slate-100 to-pink-100 opacity-70 blur-3xl" />

        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-pink-400 shadow-sm ring-1 ring-slate-200">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <p className="relative font-medium text-slate-700">Rien à modérer pour le moment</p>
        <p className="relative max-w-sm text-sm text-slate-500">
          Les outils de signalement, résolution de litiges et supervision globale
          arriveront ici.
        </p>
      </div>
    </div>
  );
}
