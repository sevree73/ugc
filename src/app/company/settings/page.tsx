import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export default async function CompanySettingsPage() {
  const session = await auth();

  const company = session?.user
    ? await prisma.company.findUnique({ where: { userId: session.user.id } })
    : null;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <PageHeader title="Paramètres" description="Informations de votre compte." />

      <Card className="divide-y divide-slate-100">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm text-slate-500">Entreprise</span>
          <span className="text-sm font-medium text-slate-700">{company?.name ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm text-slate-500">Secteur</span>
          <span className="text-sm font-medium text-slate-700">{company?.sector ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm text-slate-500">Email</span>
          <span className="text-sm font-medium text-slate-700">{session?.user?.email}</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm text-slate-500">Rôle</span>
          <span className="text-sm font-medium text-slate-700">Entreprise</span>
        </div>
      </Card>
    </div>
  );
}
