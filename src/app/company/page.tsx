import Link from "next/link";
import { PlusCircle, Search, Briefcase, ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const KPI_STATUSES = [
  { status: "PUBLISHED" as const, label: "Publiés" },
  { status: "IN_PROGRESS" as const, label: "En cours" },
  { status: "DELIVERED" as const, label: "Livrés" },
  { status: "COMPLETED" as const, label: "Terminés" },
];

export default async function CompanyHomePage() {
  const session = await auth();

  const company = session?.user
    ? await prisma.company.findUnique({
        where: { userId: session.user.id },
        include: {
          briefs: { orderBy: { createdAt: "desc" }, take: 5 },
        },
      })
    : null;

  const counts = company
    ? await prisma.brief.groupBy({
        by: ["status"],
        where: { companyId: company.id },
        _count: true,
      })
    : [];
  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Bienvenue, ${company?.name ?? ""}`}
        actions={
          <>
            <LinkButton href="/company/marketplace" variant="outline">
              <Search className="h-4 w-4" />
              Parcourir les créateurs
            </LinkButton>
            <LinkButton href="/company/briefs/new" variant="primary">
              <PlusCircle className="h-4 w-4" />
              Publier un brief
            </LinkButton>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {KPI_STATUSES.map(({ status, label }) => (
          <Card key={status} className="p-4">
            <p className="text-2xl font-bold text-slate-700">{countByStatus[status] ?? 0}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </Card>
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-slate-700">Briefs récents</h2>
          <Link href="/company/briefs" className="text-sm font-medium text-pink-600 hover:underline">
            Voir tout
          </Link>
        </div>

        {!company || company.briefs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Aucun brief pour le moment"
            description="Publiez votre premier brief pour commencer à recevoir des candidatures."
            action={
              <LinkButton href="/company/briefs/new" size="sm">
                <PlusCircle className="h-4 w-4" />
                Publier un brief
              </LinkButton>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {company.briefs.map((brief) => (
              <Link key={brief.id} href={`/company/briefs/${brief.id}`}>
                <Card className="flex items-center justify-between gap-4 p-4 transition-shadow hover:shadow-md">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-700">{brief.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {brief.sector} · {brief.format} ·{" "}
                      {brief.budget.toLocaleString("fr-DZ")} DA
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={brief.status} kind="brief" />
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
