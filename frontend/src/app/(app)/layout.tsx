"use client";

import { Spinner } from "@/components/ui/Spinner";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // Show spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-neutral-950">
        <Spinner size="lg" />
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!user) return null;

  return <>{children}</>;
}
