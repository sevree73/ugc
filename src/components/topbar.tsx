import { SignOutButton } from "@/components/sign-out-button";

const ROLE_LABEL: Record<string, string> = {
  COMPANY: "Entreprise",
  CREATOR: "Créateur",
  ADMIN: "Admin",
};

export function Topbar({
  name,
  role,
  search,
}: {
  name: string;
  role: string;
  search?: React.ReactNode;
}) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="min-w-0 flex-1">{search}</div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">
            {initial}
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="max-w-36 truncate text-sm font-medium text-slate-700">{name}</p>
            <p className="text-xs text-slate-500">{ROLE_LABEL[role] ?? role}</p>
          </div>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
