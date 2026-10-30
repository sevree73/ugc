import { auth } from "@/auth";
import { Sidebar, MobileSidebarNav } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-full">
      <Sidebar role="ADMIN" />
      <div className="flex min-h-full flex-col lg:pl-60">
        <MobileSidebarNav role="ADMIN" />
        <Topbar name={session?.user?.email ?? ""} role="ADMIN" />
        <main className="flex-1 bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
