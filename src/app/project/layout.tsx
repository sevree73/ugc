import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar, MobileSidebarNav } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default async function ProjectLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role === "CREATOR" ? "CREATOR" : "COMPANY";

  const company =
    role === "COMPANY" && session?.user
      ? await prisma.company.findUnique({ where: { userId: session.user.id } })
      : null;

  return (
    <div className="min-h-full">
      <Sidebar role={role} />
      <div className="flex min-h-full flex-col lg:pl-60">
        <MobileSidebarNav role={role} />
        <Topbar name={company?.name ?? session?.user?.email ?? ""} role={role} />
        <main className="flex-1 bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
