import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, ArrowUpRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AcceptApplicationButton } from "@/components/accept-application-button";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { EmptyState } from "@/components/ui/empty-state";
import { StarRatingDisplay } from "@/components/ui/rating";

export default async function CompanyBriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const brief = await prisma.brief.findUnique({
    where: { id },
    include: {
      company: true,
      applications: {
        include: { creator: { include: { user: { select: { email: true } } } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!brief || !session?.user || brief.company.userId !== session.user.id) {
    notFound();
  }

  const assigned = brief.applications.find((a) => a.status === "ACCEPTED");
  const isAssignable = brief.status === "PUBLISHED";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        href="/company/briefs"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux briefs
      </Link>

      <PageHeader
        title={brief.title}
        description={`${brief.sector} · ${brief.format} · ${brief.budget.toLocaleString("fr-DZ")} DA`}
        actions={<StatusBadge status={brief.status} kind="brief" />}
      />

      {brief.description && (
        <Card className="p-5">
          <p className="text-sm leading-relaxed text-slate-700">{brief.description}</p>
        </Card>
      )}

      {assigned && (
        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Créateur assigné
            </p>
            <p className="mt-0.5 font-medium text-slate-700">
              {assigned.creator.user.email}
            </p>
          </div>
          <LinkButton href={`/project/${brief.id}`} size="sm">
            Accéder à l&apos;espace projet
            <ArrowUpRight className="h-4 w-4" />
          </LinkButton>
        </Card>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold text-slate-700">
          Candidatures ({brief.applications.length})
        </h2>

        {brief.applications.length === 0 ? (
          <EmptyState icon={Users} title="Aucune candidature pour le moment" />
        ) : (
          <div className="flex flex-col gap-3">
            {brief.applications.map((application) => (
              <Card key={application.id} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-medium text-slate-700">
                    {application.creator.user.email}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <span>{application.creator.sectors.join(", ") || "Aucun secteur"}</span>
                    <StarRatingDisplay
                      value={application.creator.ratingAvg}
                      count={application.creator.reviewCount}
                    />
                  </div>
                  {application.message && (
                    <p className="mt-2 text-sm text-slate-600">{application.message}</p>
                  )}
                </div>
                {application.status === "PENDING" && isAssignable ? (
                  <AcceptApplicationButton applicationId={application.id} />
                ) : (
                  <Badge tone={application.status === "ACCEPTED" ? "success" : "neutral"}>
                    {application.status}
                  </Badge>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
