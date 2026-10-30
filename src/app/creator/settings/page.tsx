import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export default async function CreatorSettingsPage() {
  const session = await auth();

  const profile = session?.user
    ? await prisma.creatorProfile.findUnique({ where: { userId: session.user.id } })
    : null;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <PageHeader title="Paramètres" description="Informations de votre compte." />

      <Card className="divide-y divide-slate-100">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm text-slate-500">Email</span>
          <span className="text-sm font-medium text-slate-700">{session?.user?.email}</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm text-slate-500">Rôle</span>
          <span className="text-sm font-medium text-slate-700">Créateur</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm text-slate-500">Secteurs</span>
          <span className="text-sm font-medium text-slate-700">
            {profile && profile.sectors.length > 0 ? profile.sectors.join(", ") : "Aucun"}
          </span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm text-slate-500">Note moyenne</span>
          <span className="text-sm font-medium text-slate-700">
            {profile ? `${profile.ratingAvg.toFixed(1)} (${profile.reviewCount} avis)` : "—"}
          </span>
        </div>
      </Card>
    </div>
  );
}
