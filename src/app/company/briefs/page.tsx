import Link from "next/link";
import { PlusCircle, Briefcase } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BriefStatus } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";

const TABS: Array<{ value: string; label: string }> = [
  { value: "", label: "Tous" },
  { value: "DRAFT", label: "Brouillons" },
  { value: "PUBLISHED", label: "Publiés" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "DELIVERED", label: "Livrés" },
  { value: "COMPLETED", label: "Terminés" },
];

export default async function CompanyBriefsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const session = await auth();

  const company = session?.user
    ? await prisma.company.findUnique({ where: { userId: session.user.id } })
    : null;

  const briefs = company
    ? await prisma.brief.findMany({
        where: {
          companyId: company.id,
          ...(status ? { status: status as BriefStatus } : {}),
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Briefs"
        actions={
          <LinkButton href="/company/briefs/new">
            <PlusCircle className="h-4 w-4" />
            Publier un brief
          </LinkButton>
        }
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/company/briefs?status=${tab.value}` : "/company/briefs"}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              (status ?? "") === tab.value
                ? "bg-pink-200 text-slate-700"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {briefs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Aucun brief dans cette catégorie"
          action={
            <LinkButton href="/company/briefs/new" size="sm">
              <PlusCircle className="h-4 w-4" />
              Publier un brief
            </LinkButton>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {briefs.map((brief) => (
            <Link key={brief.id} href={`/company/briefs/${brief.id}`}>
              <Card className="flex items-center justify-between gap-4 p-4 transition-shadow hover:shadow-md">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-700">{brief.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {brief.sector} · {brief.format} ·{" "}
                    {brief.budget.toLocaleString("fr-DZ")} DA
                  </p>
                </div>
                <StatusBadge status={brief.status} kind="brief" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
