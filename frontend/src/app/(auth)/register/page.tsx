import { useRegister, useCurrentUser } from "@/lib/hooks/useAuth";
import { useForm, useWatch } from "react-hook-form";
import type { RegisterPayload } from "@/types";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const { mutate: register_, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { data: user } = useCurrentUser();
  const router = useRouter();

  const password = useWatch({
    control,
    name: "password",
  });

  function onSubmit(data: RegisterFormData) {
    const payload: RegisterPayload = {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      password: data.password,
    };
    register_(payload);
  }

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [router, user]);

  if (user) return null;

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
              Create account
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Start building better habits
            </p>
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
              label="Full name"
              placeholder="Your name"
              autoComplete="name"
              error={errors.fullName?.message}
              {...register("fullName", {
                required: "Full name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Name is too long",
                },
              })}
            />

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

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />

            <Input
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isPending}
              className="w-full mt-2"
            >
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-5">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-violet-400 font-medium hover:text-violet-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
