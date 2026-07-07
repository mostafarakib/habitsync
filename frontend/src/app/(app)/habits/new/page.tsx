"use client";

import { useRouter } from "next/navigation";
import { HabitForm } from "@/components/habits/HabitForm";
import { Header } from "@/components/layout/Header";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NewHabitPage() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-dvh bg-neutral-950">
      <Header />

      <main className="max-w-lg mx-auto w-full px-4 py-6">
        {/*  header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </Button>

          <div>
            <h1 className="text-lg font-semibold text-neutral-100">
              New Habit
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Build a new habit starting today
            </p>
          </div>
        </div>

        {/* Form */}
        <HabitForm onSuccess={() => router.push("/dashboard")} />
      </main>
    </div>
  );
}
