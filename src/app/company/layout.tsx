import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar, MobileSidebarNav } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const company = session?.user
    ? await prisma.company.findUnique({ where: { userId: session.user.id } })
    : null;

  return (
    <div className="min-h-full">
      <Sidebar role="COMPANY" />
      <div className="flex min-h-full flex-col lg:pl-60">
        <MobileSidebarNav role="COMPANY" />
        <Topbar name={company?.name ?? session?.user?.email ?? ""} role="COMPANY" />
        <main className="flex-1 bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
