import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_-12px_rgba(51,65,85,0.12)]",
        className,
      )}
      {...props}
    />
  );
}
