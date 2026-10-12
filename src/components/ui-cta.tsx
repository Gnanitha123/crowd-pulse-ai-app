import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export function Cta({ className, variant = "primary", ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition disabled:opacity-50",
        variant === "primary" ? "bg-primary text-primary-foreground glow hover:brightness-110" : "border border-border bg-secondary/50 hover:bg-secondary",
        className,
      )}
    />
  );
}
