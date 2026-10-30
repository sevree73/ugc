import { Search, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SECTORS } from "@/lib/constants";
import type { Prisma } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { StarRatingDisplay } from "@/components/ui/rating";

const SORT_OPTIONS = [
  { value: "rating", label: "Pertinence" },
  { value: "reviews", label: "Nombre d'avis" },
  { value: "recent", label: "Plus récent" },
] as const;

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sector?: string; minRating?: string; sort?: string }>;
}) {
  const { q, sector, minRating, sort } = await searchParams;

  const where: Prisma.CreatorProfileWhereInput = {};
  if (sector) {
    where.sectors = { has: sector };
  }
  if (minRating) {
    where.ratingAvg = { gte: Number(minRating) };
  }
  if (q) {
    where.OR = [
      { bio: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  const orderBy: Prisma.CreatorProfileOrderByWithRelationInput =
    sort === "reviews"
      ? { reviewCount: "desc" }
      : sort === "recent"
        ? { createdAt: "desc" }
        : { ratingAvg: "desc" };

  const creators = await prisma.creatorProfile.findMany({
    where,
    include: { user: { select: { email: true } } },
    orderBy,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Créateurs"
        description={`${creators.length} créateur${creators.length > 1 ? "s" : ""} trouvé${creators.length > 1 ? "s" : ""}`}
      />

      <Card className="p-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              name="q"
              placeholder="Rechercher un créateur, une niche..."
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
          <Select name="minRating" defaultValue={minRating ?? ""} className="w-auto">
            <option value="">Note minimum</option>
            <option value="4.5">4.5 et plus</option>
            <option value="4">4 et plus</option>
            <option value="3">3 et plus</option>
          </Select>
          <Select name="sort" defaultValue={sort ?? "rating"} className="w-auto">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Trier par : {o.label}
              </option>
            ))}
          </Select>
          <Button type="submit" size="sm">
            Filtrer
          </Button>
        </form>
      </Card>

      {creators.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun créateur ne correspond à votre recherche"
          description="Essayez un autre secteur ou terme de recherche."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {creators.map((creator) => {
            const initial = creator.user.email.charAt(0).toUpperCase();
            return (
              <Card key={creator.id} className="flex flex-col overflow-hidden">
                <div className="relative h-24 bg-gradient-to-br from-pink-200 to-pink-100">
                  <div className="absolute -bottom-6 left-4 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-slate-700 text-sm font-semibold text-white">
                    {initial}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4 pt-8">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-700">
                      {creator.user.email}
                    </p>
                    <StarRatingDisplay
                      value={creator.ratingAvg}
                      count={creator.reviewCount}
                      className="shrink-0"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {creator.sectors[0] ?? "Secteur non renseigné"}
                  </p>
                  {creator.bio && (
                    <p className="line-clamp-2 text-xs text-slate-500">{creator.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {creator.sectors.map((s) => (
                      <Badge key={s} tone="neutral">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <LinkButton
                    href={`/company/creators/${creator.id}`}
                    variant="outline"
                    size="sm"
                    className="mt-auto w-full"
                  >
                    Voir le profil
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
