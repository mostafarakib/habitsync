"use client";

import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LandingPage } from "@/components/landing/LandingPage";
import { Spinner } from "@/components/ui/Spinner";

export default function RootPage() {
  const { data: user, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-neutral-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) return null; // redirecting
  return <LandingPage />;
}
