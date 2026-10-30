import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getBriefAccess } from "@/lib/project-access";
import { formatBytes } from "@/lib/format";
import { StatusTracker } from "@/components/status-tracker";
import { MessagesPanel } from "@/components/messages-panel";
import { UploadDeliverableForm } from "@/components/upload-deliverable-form";
import { DeliverableActions } from "@/components/deliverable-actions";
import { ReviewButton } from "@/components/review-button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ProjectSpacePage({
  params,
}: {
  params: Promise<{ briefId: string }>;
}) {
  const { briefId } = await params;
  const session = await auth();

  if (!session?.user) {
    notFound();
  }

  const { brief, isCompanyOwner, isAssignedCreator } = await getBriefAccess(
    briefId,
    session.user.id,
    session.user.role,
  );

  if (!brief || (!isCompanyOwner && !isAssignedCreator)) {
    notFound();
  }

  const [deliverables, existingReview] = await Promise.all([
    prisma.deliverable.findMany({ where: { briefId }, orderBy: { version: "desc" } }),
    prisma.review.findUnique({ where: { briefId } }),
  ]);

  const latestDeliverableId = deliverables[0]?.id;
  const homeHref = isCompanyOwner ? "/company" : "/creator";
  const canUpload =
    isAssignedCreator &&
    (brief.status === "IN_PROGRESS" || brief.status === "DELIVERED");
  const canReview = isCompanyOwner && brief.status === "COMPLETED" && !existingReview;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={homeHref}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux projets
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
            {brief.title.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="font-heading text-lg font-bold text-slate-700">{brief.title}</h1>
            <p className="text-sm text-slate-500">
              {brief.sector} · {brief.format} · {brief.budget.toLocaleString("fr-DZ")} DA
            </p>
          </div>
        </div>
        <StatusBadge status={brief.status} kind="brief" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="h-[32rem] lg:h-[calc(100vh-14rem)]">
          <MessagesPanel briefId={brief.id} currentUserEmail={session.user.email ?? ""} />
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Livrables</p>
            </div>

            {deliverables.length === 0 ? (
              <EmptyState icon={FileText} title="Aucun livrable pour le moment" className="p-4" />
            ) : (
              <div className="flex flex-col gap-2">
                {deliverables.map((d) => (
                  <div key={d.id} className="rounded-2xl border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700">
                            {d.fileName || `Version ${d.version}`}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatBytes(d.sizeBytes)} · v{d.version} ·{" "}
                            {d.createdAt.toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`/api/files/${d.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Télécharger"
                        className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <StatusBadge status={d.status} kind="deliverable" />
                      {isCompanyOwner && d.id === latestDeliverableId && d.status === "SUBMITTED" && (
                        <DeliverableActions deliverableId={d.id} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {canUpload && (
              <div className="mt-3">
                <UploadDeliverableForm briefId={brief.id} />
              </div>
            )}

            {canReview && (
              <div className="mt-3">
                <ReviewButton briefId={brief.id} />
              </div>
            )}
          </Card>

          <Card className="p-4">
            <p className="mb-4 text-sm font-semibold text-slate-700">Suivi du projet</p>
            <StatusTracker status={brief.status} />
          </Card>
        </div>
      </div>
    </div>
  );
}
