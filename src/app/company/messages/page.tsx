import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function CompanyMessagesPage() {
  const session = await auth();

  const company = session?.user
    ? await prisma.company.findUnique({ where: { userId: session.user.id } })
    : null;

  const briefs = company
    ? await prisma.brief.findMany({
        where: {
          companyId: company.id,
          applications: { some: { status: "ACCEPTED" } },
        },
        include: {
          applications: {
            where: { status: "ACCEPTED" },
            include: { creator: { include: { user: { select: { email: true } } } } },
          },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Messages" description="Vos conversations par projet." />

      {briefs.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Aucune conversation pour le moment"
          description="Une conversation démarre dès qu'un créateur est assigné à l'un de vos briefs."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {briefs.map((brief) => {
            const creatorEmail = brief.applications[0]?.creator.user.email ?? "—";
            const lastMessage = brief.messages[0];
            return (
              <Link key={brief.id} href={`/project/${brief.id}`}>
                <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
                    {creatorEmail.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-slate-700">
                        {creatorEmail}
                      </p>
                      {lastMessage && (
                        <span className="shrink-0 text-xs text-slate-400">
                          {formatRelativeTime(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-slate-500">{brief.title}</p>
                    {lastMessage && (
                      <p className="mt-0.5 truncate text-sm text-slate-600">
                        {lastMessage.body}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
