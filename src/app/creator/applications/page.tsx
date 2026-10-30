import Link from "next/link";
import { Users } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";

export default async function MyApplicationsPage() {
  const session = await auth();

  const profile = session?.user
    ? await prisma.creatorProfile.findUnique({ where: { userId: session.user.id } })
    : null;

  const applications = profile
    ? await prisma.application.findMany({
        where: { creatorId: profile.id },
        include: { brief: { include: { company: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Mes candidatures" description={`${applications.length} candidature${applications.length > 1 ? "s" : ""}`} />

      {applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Vous n'avez postulé à aucun brief"
          description="Parcourez les briefs disponibles pour trouver votre prochain projet."
          action={
            <LinkButton href="/creator/briefs" size="sm">
              Voir les briefs disponibles
            </LinkButton>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((application) => (
            <Card key={application.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">
                  {application.brief.company.name}
                </p>
                <Link
                  href={`/creator/briefs/${application.brief.id}`}
                  className="truncate font-medium text-slate-700 hover:underline"
                >
                  {application.brief.title}
                </Link>
                <p className="mt-0.5 text-sm text-slate-500">
                  {application.brief.sector} · {application.brief.format} ·{" "}
                  {application.brief.budget.toLocaleString("fr-DZ")} DA
                </p>
              </div>
              <Badge tone="neutral">{application.status}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
