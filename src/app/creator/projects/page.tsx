import { FolderKanban } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";

export default async function CreatorProjectsPage() {
  const session = await auth();

  const profile = session?.user
    ? await prisma.creatorProfile.findUnique({ where: { userId: session.user.id } })
    : null;

  const projects = profile
    ? await prisma.brief.findMany({
        where: {
          applications: { some: { creatorId: profile.id, status: ApplicationStatus.ACCEPTED } },
        },
        include: { company: { select: { name: true } } },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Mes projets" description="Vos briefs assignés, en cours ou terminés." />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Aucun projet actif"
          description="Postulez à un brief pour démarrer votre premier projet."
          action={
            <LinkButton href="/creator/briefs" size="sm">
              Parcourir les briefs
            </LinkButton>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-700">{project.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{project.company.name}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatusBadge status={project.status} kind="brief" />
                <LinkButton href={`/project/${project.id}`} size="sm">
                  Ouvrir
                </LinkButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
