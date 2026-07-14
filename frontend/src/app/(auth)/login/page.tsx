"use client";

import { useCurrentUser, useLogin } from "@/lib/hooks/useAuth";
import { useForm } from "react-hook-form";
import type { LoginPayload } from "@/types";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Flame, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin();
  const { data: user, isLoading } = useCurrentUser();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function handleDemoLogin() {
    setIsDemoLoading(true);
    login(
      { email: "demo@habitsync.app", password: "demo123456" },
      { onSettled: () => setIsDemoLoading(false) },
    );
  }

  function onSubmit(data: LoginPayload) {
    const payload = { email: data.email.trim(), password: data.password };
    login(payload);
  }

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (isLoading || user) return null;

  return (
    <div className="min-h-dvh bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-violet-600/20">
            <Flame size={22} className="text-violet-400" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-100">
              HabitSync
            </h1>
            <p className="text-sm text-neutral-500 mt-1">Track what matters</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full h-10 px-3 pr-10 rounded-lg text-sm transition-all outline-none
        bg-neutral-800 border border-neutral-700
        text-neutral-100 placeholder:text-neutral-500
        focus:border-violet-500 focus:ring-1 focus:ring-violet-500
        disabled:opacity-50 disabled:cursor-not-allowed"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
        text-neutral-500 hover:text-neutral-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isPending}
              className="w-full mt-2"
            >
              Sign in
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 h-px bg-neutral-800" />
              <span className="text-xs text-neutral-600">or</span>
              <div className="flex-1 h-px bg-neutral-800" />
            </div>

            {/* Demo button */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              loading={isDemoLoading}
              onClick={handleDemoLogin}
              className="w-full"
            >
              Try Demo Account
            </Button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-5">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-violet-400 font-medium hover:text-violet-300 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
