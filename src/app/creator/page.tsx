import Link from "next/link";
import { ClipboardList, FolderKanban } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus, BriefStatus } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default async function CreatorHomePage() {
  const session = await auth();

  const profile = session?.user
    ? await prisma.creatorProfile.findUnique({
        where: { userId: session.user.id },
      })
    : null;

  const [activeProjects, applicationCount, availableCount] = await Promise.all([
    profile
      ? prisma.brief.findMany({
          where: {
            applications: {
              some: { creatorId: profile.id, status: ApplicationStatus.ACCEPTED },
            },
          },
          include: { company: { select: { name: true } } },
          orderBy: { updatedAt: "desc" },
          take: 3,
        })
      : Promise.resolve([]),
    profile ? prisma.application.count({ where: { creatorId: profile.id } }) : 0,
    profile && profile.sectors.length > 0
      ? prisma.brief.count({
          where: { status: BriefStatus.PUBLISHED, sector: { in: profile.sectors } },
        })
      : 0,
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Bienvenue, ${session?.user?.email ?? ""}`}
        actions={
          <LinkButton href="/creator/briefs" variant="primary">
            <ClipboardList className="h-4 w-4" />
            Voir les briefs disponibles
          </LinkButton>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-2xl font-bold text-slate-700">{availableCount}</p>
          <p className="text-xs text-slate-500">Briefs disponibles</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-slate-700">{applicationCount}</p>
          <p className="text-xs text-slate-500">Candidatures envoyées</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-slate-700">{activeProjects.length}</p>
          <p className="text-xs text-slate-500">Projets actifs</p>
        </Card>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-slate-700">
            Vos projets actifs
          </h2>
          <Link href="/creator/projects" className="text-sm font-medium text-pink-600 hover:underline">
            Voir tout
          </Link>
        </div>

        {activeProjects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Aucun projet actif pour le moment"
            description="Postulez à un brief pour démarrer votre premier projet."
            action={
              <LinkButton href="/creator/briefs" size="sm">
                Parcourir les briefs
              </LinkButton>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {activeProjects.map((brief) => (
              <Card key={brief.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-700">{brief.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{brief.company.name}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={brief.status} kind="brief" />
                  <LinkButton href={`/project/${brief.id}`} size="sm">
                    Ouvrir
                  </LinkButton>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
