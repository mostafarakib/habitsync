import { cn } from "@/lib/utils/cn";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            "duration-200",
          )}
        />

        {/* Bottom sheet */}
        <Dialog.Content
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg",
            "max-h-[90vh] overflow-y-auto",
            "rounded-t-2xl border border-b-0 border-neutral-800 bg-neutral-900 p-6",
            "focus:outline-none",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom",
            "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
            "duration-200",
            className,
          )}
        >
          {/* Drag handle */}
          <div className="mb-5 mx-auto h-1 w-10 rounded-full bg-neutral-700" />

          {/* Close button */}
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className={cn(
                "absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg",
                "text-neutral-400 transition-colors",
                "hover:bg-neutral-800 hover:text-neutral-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
              )}
            >
              <X size={16} />
            </button>
          </Dialog.Close>

          {/* Header */}
          {(title || description) && (
            <header className="mb-5 pr-10">
              {title && (
                <Dialog.Title className="text-base font-semibold text-neutral-100">
                  {title}
                </Dialog.Title>
              )}

              {description && (
                <Dialog.Description className="mt-1 text-sm text-neutral-400">
                  {description}
                </Dialog.Description>
              )}
            </header>
          )}

          {/* Content */}
          <div>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
