import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-16",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 h-12 w-12 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-500">
          {icon}
        </div>
      )}

      <p className="text-sm font-medium text-neutral-300">{title}</p>

      {description && (
        <p className="text-xs text-neutral-500 mt-1 max-w-xs">{description}</p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
