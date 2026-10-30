import { FolderKanban } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BriefStatus } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";

export default async function CompanyProjectsPage() {
  const session = await auth();

  const company = session?.user
    ? await prisma.company.findUnique({ where: { userId: session.user.id } })
    : null;

  const projects = company
    ? await prisma.brief.findMany({
        where: {
          companyId: company.id,
          status: { in: [BriefStatus.IN_PROGRESS, BriefStatus.DELIVERED, BriefStatus.COMPLETED] },
        },
        include: {
          applications: {
            where: { status: "ACCEPTED" },
            include: { creator: { include: { user: { select: { email: true } } } } },
          },
        },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Projets" description="Vos briefs assignés et en cours de production." />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Aucun projet en cours"
          description="Un projet apparaît ici dès qu'un créateur est assigné à l'un de vos briefs."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => {
            const creator = project.applications[0]?.creator.user.email;
            return (
              <Card key={project.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-700">{project.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {creator ?? "Créateur non assigné"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={project.status} kind="brief" />
                  <LinkButton href={`/project/${project.id}`} size="sm">
                    Ouvrir
                  </LinkButton>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
