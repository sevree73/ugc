import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, LinkIcon, Images, MessageSquareText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { StarRatingDisplay } from "@/components/ui/rating";

export default async function CreatorPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const creator = await prisma.creatorProfile.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });

  if (!creator) {
    notFound();
  }

  const reviews = await prisma.review.findMany({
    where: { creatorId: id },
    include: { brief: { include: { company: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  const initial = creator.user.email.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/company/marketplace"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au marketplace
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700 text-2xl font-semibold text-white">
              {initial}
            </div>
            <div>
              <p className="font-heading text-lg font-bold text-slate-700">
                {creator.user.email}
              </p>
              <StarRatingDisplay
                value={creator.ratingAvg}
                count={creator.reviewCount}
                className="mt-1 justify-center"
              />
            </div>
            {creator.bio && <p className="text-sm text-slate-500">{creator.bio}</p>}
            <div className="flex flex-wrap justify-center gap-1.5">
              {creator.sectors.map((s) => (
                <Badge key={s} tone="neutral">
                  {s}
                </Badge>
              ))}
            </div>
            <LinkButton href="/company/briefs/new" className="mt-2 w-full">
              Envoyer un brief
            </LinkButton>
          </Card>
        </div>

        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <h2 className="font-heading text-lg font-semibold text-slate-700">Portfolio</h2>
            {creator.portfolioUrls.length === 0 ? (
              <EmptyState icon={Images} title="Aucun lien de portfolio pour le moment" />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {creator.portfolioUrls.map((url) => {
                  let host = url;
                  try {
                    host = new URL(url).hostname.replace("www.", "");
                  } catch {
                    // keep raw url as fallback label
                  }
                  return (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-pink-200 hover:bg-pink-50/40"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                        <LinkIcon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-700">{host}</p>
                        <p className="truncate text-xs text-slate-500">{url}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-heading text-lg font-semibold text-slate-700">
              Avis ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <EmptyState icon={MessageSquareText} title="Aucun avis pour le moment" />
            ) : (
              <div className="flex flex-col gap-3">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-700">
                        {review.brief.company.name}
                      </p>
                      <StarRatingDisplay value={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
