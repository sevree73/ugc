"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Note">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          className="p-0.5"
        >
          <Star
            className={cn(
              "h-7 w-7 transition-colors",
              n <= value ? "fill-amber-500 text-amber-500" : "text-slate-300",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function StarRatingDisplay({
  value,
  count,
  className,
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-1 text-sm font-medium text-amber-600", className)}>
      <Star className="h-4 w-4 fill-current" />
      {value.toFixed(1)}
      {count !== undefined && <span className="font-normal text-slate-400">({count})</span>}
    </span>
  );
}
