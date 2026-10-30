import { Wallet } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default async function CompanyPaymentsPage() {
  const session = await auth();

  const company = session?.user
    ? await prisma.company.findUnique({ where: { userId: session.user.id } })
    : null;

  const payments = company
    ? await prisma.payment.findMany({
        where: { brief: { companyId: company.id } },
        include: {
          brief: {
            include: {
              applications: {
                where: { status: "ACCEPTED" },
                include: { creator: { include: { user: { select: { email: true } } } } },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const totalReleased = payments
    .filter((p) => p.status === "RELEASED")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalCommission = payments
    .filter((p) => p.status === "RELEASED")
    .reduce((sum, p) => sum + p.commission, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Paiements" description="Historique des paiements de vos briefs." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-2xl font-bold text-slate-700">{payments.length}</p>
          <p className="text-xs text-slate-500">Paiements</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-slate-700">
            {totalReleased.toLocaleString("fr-DZ")} DA
          </p>
          <p className="text-xs text-slate-500">Total versé aux créateurs</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-slate-700">
            {totalCommission.toLocaleString("fr-DZ")} DA
          </p>
          <p className="text-xs text-slate-500">Commission plateforme</p>
        </Card>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Aucun paiement pour le moment"
          description="Les paiements apparaissent ici une fois qu'un livrable est validé."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {payments.map((payment) => (
            <Card key={payment.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-700">{payment.brief.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {payment.brief.applications[0]?.creator.user.email ?? "—"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="text-right">
                  <p className="font-heading text-sm font-bold text-slate-700">
                    {payment.amount.toLocaleString("fr-DZ")} DA
                  </p>
                  <p className="text-xs text-slate-400">
                    Commission {payment.commission.toLocaleString("fr-DZ")} DA
                  </p>
                </div>
                <StatusBadge status={payment.status} kind="payment" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
