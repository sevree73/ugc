import { cn } from "@/lib/cn";

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string | null;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

const controlClasses =
  "h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30";

// Bottom-border-only style, used on the auth pages (login/register).
const underlineClasses =
  "h-10 w-full border-0 border-b-2 border-slate-200 bg-transparent px-1 text-sm text-slate-700 placeholder:text-slate-400 focus:border-pink-400 focus:outline-none";

export function Input({
  variant = "box",
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { variant?: "box" | "underline" }) {
  return (
    <input
      className={cn(variant === "underline" ? underlineClasses : controlClasses, className)}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlClasses, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        controlClasses,
        "h-auto min-h-24 resize-y py-2.5 leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}
