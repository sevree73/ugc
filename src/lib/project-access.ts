import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

// Shared access check for the project space: a brief is only visible to the
// company that owns it and, once one is assigned, the creator whose
// application was accepted for it.
export async function getBriefAccess(briefId: string, userId: string, role: string) {
  const brief = await prisma.brief.findUnique({
    where: { id: briefId },
    include: {
      company: true,
      applications: {
        where: { status: ApplicationStatus.ACCEPTED },
        include: { creator: true },
      },
    },
  });

  if (!brief) {
    return {
      brief: null,
      isCompanyOwner: false,
      isAssignedCreator: false,
      assignedApplication: null,
    };
  }

  const isCompanyOwner = brief.company.userId === userId;
  const assignedApplication = brief.applications[0] ?? null;
  const isAssignedCreator =
    role === "CREATOR" && assignedApplication?.creator.userId === userId;

  return { brief, isCompanyOwner, isAssignedCreator, assignedApplication };
}
