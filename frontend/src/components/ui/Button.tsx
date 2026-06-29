import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "./Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const base = [
      "inline-flex items-center justify-center font-medium transition-all duration-150",
      "select-none rounded-lg",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
    ].join(" ");

    const variants = {
      primary:
        "bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.97] focus-visible:ring-violet-500",
      ghost:
        "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 focus-visible:ring-neutral-500",
      danger:
        "bg-red-500/10 text-red-400 hover:bg-red-500/20 focus-visible:ring-red-500",
      outline:
        "border border-neutral-700 text-neutral-100 hover:bg-neutral-800 focus-visible:ring-neutral-500",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-11 px-6 text-base gap-2",
      icon: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        <>
          {loading && <Spinner size="sm" />}
          <span className={loading ? "opacity-70" : ""}>{children}</span>
        </>
      </button>
    );
  },
);

Button.displayName = "Button";
