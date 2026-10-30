import Link from "next/link";
import { ClipboardList, Search } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BriefStatus, type Prisma } from "@prisma/client";
import { SECTORS, FORMATS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AvailableBriefsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    sector?: string;
    format?: string;
    minBudget?: string;
    sort?: string;
  }>;
}) {
  const session = await auth();
  const { q, sector, format, minBudget, sort } = await searchParams;

  const profile = session?.user
    ? await prisma.creatorProfile.findUnique({ where: { userId: session.user.id } })
    : null;

  const where: Prisma.BriefWhereInput = { status: BriefStatus.PUBLISHED };
  if (sector) where.sector = sector;
  if (format) where.format = format;
  if (minBudget) where.budget = { gte: Number(minBudget) };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.BriefOrderByWithRelationInput =
    sort === "budget" ? { budget: "desc" } : { createdAt: "desc" };

  const briefs = await prisma.brief.findMany({
    where,
    include: {
      company: { select: { name: true } },
      applications: profile
        ? { where: { creatorId: profile.id }, select: { status: true } }
        : false,
    },
    orderBy,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Briefs disponibles"
        description={`${briefs.length} brief${briefs.length > 1 ? "s" : ""} publié${briefs.length > 1 ? "s" : ""}`}
      />

      <Card className="p-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              name="q"
              placeholder="Rechercher un brief..."
              defaultValue={q ?? ""}
              className="pl-9"
            />
          </div>
          <Select name="sector" defaultValue={sector ?? ""} className="w-auto">
            <option value="">Tous secteurs</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select name="format" defaultValue={format ?? ""} className="w-auto">
            <option value="">Tous formats</option>
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
          <Select name="minBudget" defaultValue={minBudget ?? ""} className="w-auto">
            <option value="">Tous budgets</option>
            <option value="5000">≥ 5 000 DA</option>
            <option value="10000">≥ 10 000 DA</option>
            <option value="20000">≥ 20 000 DA</option>
          </Select>
          <Select name="sort" defaultValue={sort ?? "recent"} className="w-auto">
            <option value="recent">Trier par : Plus récents</option>
            <option value="budget">Trier par : Budget</option>
          </Select>
          <Button type="submit" size="sm">
            Filtrer
          </Button>
        </form>
      </Card>

      {!profile || profile.sectors.length === 0 ? (
        <p className="text-sm text-slate-500">
          Astuce : renseignez vos secteurs sur{" "}
          <Link href="/creator/profile" className="font-medium text-pink-600 hover:underline">
            votre portfolio
          </Link>{" "}
          pour repérer plus facilement les briefs qui vous correspondent.
        </p>
      ) : null}

      {briefs.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Aucun brief ne correspond à votre recherche"
          description="Essayez d'autres filtres ou revenez plus tard."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {briefs.map((brief) => {
            const application = profile && Array.isArray(brief.applications)
              ? brief.applications[0]
              : undefined;
            return (
              <Card key={brief.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
                    {brief.company.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">{brief.company.name}</p>
                    <p className="truncate font-medium text-slate-700">{brief.title}</p>
                    {brief.description && (
                      <p className="line-clamp-1 text-sm text-slate-500">{brief.description}</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge tone="neutral">{brief.sector}</Badge>
                      <Badge tone="neutral">{brief.format}</Badge>
                      {brief.creatorsNeeded && (
                        <Badge tone="neutral">
                          {brief.creatorsNeeded} créateur{brief.creatorsNeeded > 1 ? "s" : ""}
                        </Badge>
                      )}
                      <span className="text-xs text-slate-400">
                        {formatRelativeTime(brief.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                  <p className="font-heading text-sm font-bold text-slate-700">
                    {brief.budget.toLocaleString("fr-DZ")} DA
                  </p>
                  {application ? (
                    <Badge tone="neutral">Candidature envoyée</Badge>
                  ) : (
                    <LinkButton href={`/creator/briefs/${brief.id}`} size="sm">
                      Postuler
                    </LinkButton>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
