import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ErrorStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  icon = <AlertCircle size={20} />,
  title = "Something went wrong",
  message,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-16",
        className,
      )}
    >
      <div className="mb-4 h-12 w-12 flex items-center justify-center rounded-full bg-red-500/10 text-red-400">
        {icon}
      </div>

      <h2 className="text-sm font-medium text-neutral-300">{title}</h2>

      {message && (
        <p className="text-xs text-neutral-500 mt-1 max-w-xs">{message}</p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
