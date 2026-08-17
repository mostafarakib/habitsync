"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Flame,
  Calendar,
  TrendingUp,
  ListTodo,
  MessageSquare,
  History,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLogin } from "@/lib/hooks/useAuth";
import { useInView, useCountUp } from "@/lib/hooks/useInView";
import { cn } from "@/lib/utils/cn";
import { LandingNavbar } from "./LandingNavbar";
import {
  BrowserFrame,
  PhoneFrame,
  DashboardMockup,
  HabitFormMockup,
  CalendarMockup,
  TaskMockup,
  NotesMockup,
} from "./mockups";
import { SiGithub } from "react-icons/si";

const GITHUB_URL = "https://github.com/mostafarakib/habitsync";

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-neutral-950 overflow-x-hidden">
      <LandingNavbar />
      <Hero />
      <ProductShowcase />
      <Features />
      <HowItWorks />
      <StreakSection />
      <TasksSection />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  const { mutate: login } = useLogin();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  function handleDemoLogin() {
    setIsDemoLoading(true);
    login(
      { email: "demo@habitsync.app", password: "demo123456" },
      { onSettled: () => setIsDemoLoading(false) },
    );
  }

  return (
    <section className="relative pt-40 pb-24 px-4">
      {/* Subtle background glow */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 bg-violet-600/10 blur-[120px] rounded-full pointer-events-none"
      />

      <div className="relative max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
        {/* Badge */}
        <div className="fade-up flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/80 text-xs text-neutral-400">
          <Flame size={12} className="text-violet-500" />
          Your daily consistency, organized
        </div>

        {/* Headline */}
        <h1 className="fade-up fade-up-delay-1 text-4xl sm:text-6xl font-bold tracking-tight text-neutral-100 leading-[1.1]">
          Build better habits.
          <br />
          <span className="bg-linear-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
            Stay consistent.
          </span>
        </h1>

        {/* Subtext */}
        <p className="fade-up fade-up-delay-2 text-neutral-400 text-base sm:text-lg max-w-xl leading-relaxed">
          HabitSync helps you build consistent habits, track your progress, and
          stay on top of the things that matter every day.
        </p>

        {/* CTAs */}
        <div className="fade-up fade-up-delay-3 flex flex-col sm:flex-row gap-3 mt-2">
          <Link href="/register">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto cursor-pointer"
            >
              <span className="flex items-center gap-3">
                Get Started
                <ArrowRight size={15} />
              </span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            loading={isDemoLoading}
            onClick={handleDemoLogin}
            className="w-full sm:w-auto cursor-pointer"
          >
            Try the demo
          </Button>
        </div>

        <p className="fade-up fade-up-delay-3 text-xs text-neutral-600">
          No signup needed for the demo account
        </p>
      </div>

      {/* Floating product showcase */}
      <div className="fade-up-scale relative max-w-4xl mx-auto mt-16">
        <BrowserFrame className="hero-float">
          <div className="grid grid-cols-1">
            <DashboardMockup />
          </div>
        </BrowserFrame>

        {/* Decorative floating card, streak badge */}
        <div className="hidden sm:flex hero-float-secondary absolute -right-6 -bottom-8 items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 shadow-2xl shadow-black/50">
          <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Flame size={15} className="text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-100 leading-none">
              12 day streak
            </p>
            <p className="text-[10px] text-neutral-500 mt-1">Keep it going</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Product showcase (alternating layout) ────────────────────────────────────────

function ProductShowcase() {
  return (
    <section id="features" className="py-24 px-4">
      <RevealHeading
        eyebrow="Product"
        title="Everything you need to stay consistent."
        description="A clean, focused interface built around one job: helping you actually keep doing the things you said you would."
      />

      <div className="max-w-5xl mx-auto mt-16 flex flex-col gap-24">
        <ShowcaseRow
          reverse={false}
          title="Configure habits your way"
          description="Daily, specific weekdays, or flexible for whenever you get to it. Boolean or measurable, with targets that actually match how you think about the habit."
          mockup={<HabitFormMockup />}
        />
        <ShowcaseRow
          reverse
          title="One-off tasks, kept separate"
          description="Not everything repeats. Due dates, priority, and automatic overdue flags for things that just need to get done once."
          mockup={<TaskMockup />}
        />
        <ShowcaseRow
          reverse={false}
          title="Notes on every entry"
          description="Jot down context on any log, how you felt, what you did differently, why you missed it. Small details that make patterns easier to spot later."
          mockup={<NotesMockup />}
        />
      </div>
    </section>
  );
}

function ShowcaseRow({
  title,
  description,
  mockup,
  reverse,
}: {
  title: string;
  description: string;
  mockup: React.ReactNode;
  reverse: boolean;
}) {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center",
        reverse && "md:[direction:rtl]",
      )}
    >
      <div
        className={cn(
          "md:[direction:ltr] transition-all duration-700",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        )}
      >
        <h3 className="text-2xl font-semibold text-neutral-100 mb-3">
          {title}
        </h3>
        <p className="text-neutral-400 leading-relaxed">{description}</p>
      </div>

      <div
        className={cn(
          "md:[direction:ltr] transition-all duration-700 delay-150",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        )}
      >
        <BrowserFrame>{mockup}</BrowserFrame>
      </div>
    </div>
  );
}

// ── Feature grid ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Calendar size={18} />,
    title: "Flexible scheduling",
    description:
      "Daily, specific weekdays, monthly, or flexible for anytime this week.",
  },
  {
    icon: <TrendingUp size={18} />,
    title: "Streaks that make sense",
    description:
      "Only scheduled days count, so a Mon/Wed/Fri habit won't punish you for Tuesday.",
  },
  {
    icon: <History size={18} />,
    title: "90-day history",
    description:
      "A GitHub-style contribution calendar for every habit, going back three months.",
  },
  {
    icon: <ListTodo size={18} />,
    title: "Tasks, separately",
    description: "One-off to-dos with due dates, living in their own tab.",
  },
  {
    icon: <MessageSquare size={18} />,
    title: "Notes on any log",
    description:
      "Add context to a day's entry whenever it's worth remembering.",
  },
  {
    icon: <CheckCircle2 size={18} />,
    title: "Built for daily use",
    description:
      "Instant optimistic updates, a 30-day edit window, nothing gets in your way.",
  },
];

function Features() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((feature, i) => (
          <FeatureCard key={i} {...feature} index={i} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}) {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${(index % 3) * 100}ms` }}
      className={cn(
        "rounded-xl border border-neutral-800 bg-neutral-900 p-5 flex flex-col gap-3 transition-all duration-500",
        "hover:border-neutral-700 hover:bg-neutral-900/80",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
    >
      <div className="h-9 w-9 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-neutral-100 mb-1">{title}</p>
        <p className="text-xs text-neutral-500 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    title: "Create your habits",
    description:
      "Set up what you want to track, boolean or measurable, on whatever schedule fits.",
  },
  {
    number: "02",
    title: "Stay consistent",
    description:
      "Check in daily. Toggle, log a number, add a note if it's worth remembering.",
  },
  {
    number: "03",
    title: "See your progress",
    description:
      "Watch your streak grow and your calendar fill in, day by day.",
  },
];

function HowItWorks() {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <section
      id="how-it-works"
      className="py-24 px-4 border-t border-neutral-900"
    >
      <RevealHeading eyebrow="How it works" title="Three steps. That's it." />

      <div
        ref={ref}
        className="max-w-4xl mx-auto mt-16 relative grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6"
      >
        {/* Connecting line, desktop only */}
        <div
          className={cn(
            "hidden sm:block absolute top-5 left-[16%] right-[16%] h-px bg-neutral-800 origin-left transition-transform duration-1000",
            isInView ? "scale-x-100" : "scale-x-0",
          )}
        />

        {STEPS.map((step, i) => (
          <div
            key={i}
            style={{ transitionDelay: `${i * 200}ms` }}
            className={cn(
              "relative flex flex-col items-center text-center gap-3 transition-all duration-700",
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6",
            )}
          >
            <div className="h-10 w-10 rounded-full bg-neutral-900 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 relative z-10">
              {step.number}
            </div>
            <p className="text-sm font-semibold text-neutral-100">
              {step.title}
            </p>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-55">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Streak / progress section ─────────────────────────────────────────────────

function StreakSection() {
  const { ref, isInView } = useInView<HTMLDivElement>();
  const streak = useCountUp(12, isInView);
  const completed = useCountUp(24, isInView);
  const consistency = useCountUp(87, isInView);

  return (
    <section className="py-24 px-4 border-t border-neutral-900">
      <RevealHeading
        eyebrow="Progress"
        title="Consistency you can actually see."
        description="Every completed day fills in the calendar. No guessing how you're doing, just look."
      />

      <div ref={ref} className="max-w-4xl mx-auto mt-14">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <StatCard value={streak} suffix=" days" label="Current streak" />
          <StatCard value={completed} suffix="" label="Habits completed" />
          <StatCard value={consistency} suffix="%" label="Consistency" />
        </div>

        {/* Calendar */}
        <div
          className={cn(
            "transition-all duration-700",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
          )}
        >
          <BrowserFrame>
            <div className="overflow-x-auto">
              <CalendarMockup animate={isInView} />
            </div>
          </BrowserFrame>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-5 text-center">
      <p className="text-2xl sm:text-3xl font-bold text-neutral-100 tabular-nums">
        {value}
        {suffix}
      </p>
      <p className="text-xs text-neutral-500 mt-1">{label}</p>
    </div>
  );
}

// ── Tasks section ─────────────────────────────────────────────────────────────

function TasksSection() {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <section className="py-24 px-4 border-t border-neutral-900">
      <div
        ref={ref}
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center"
      >
        <div
          className={cn(
            "order-2 md:order-1 transition-all duration-700",
            isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6",
          )}
        >
          <PhoneFrame>
            <TaskMockup />
          </PhoneFrame>
        </div>

        <div
          className={cn(
            "order-1 md:order-2 transition-all duration-700 delay-150",
            isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6",
          )}
        >
          <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">
            Tasks
          </span>
          <h3 className="text-2xl sm:text-3xl font-semibold text-neutral-100 mt-2 mb-4">
            Not everything is a habit.
          </h3>
          <p className="text-neutral-400 leading-relaxed mb-6">
            Some things just need to happen once. HabitSync keeps one-time tasks
            in their own space, right alongside your habits but never mixed in
            with them. Set a due date if it matters, and overdue tasks flag
            themselves automatically.
          </p>
          <ul className="flex flex-col gap-2.5">
            {[
              "Optional due dates",
              "Priority levels",
              "Automatic overdue detection",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-sm text-neutral-300"
              >
                <CheckCircle2 size={15} className="text-violet-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCta() {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <section className="py-28 px-4 border-t border-neutral-900 relative">
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-75 bg-violet-600/10 blur-[120px] rounded-full pointer-events-none"
      />

      <div
        ref={ref}
        className={cn(
          "relative max-w-2xl mx-auto text-center flex flex-col items-center gap-6 transition-all duration-700",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        )}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-100 tracking-tight">
          Build better habits, one day at a time.
        </h2>
        <p className="text-neutral-400 max-w-md">
          Free to try, no credit card, no fuss. See if it fits how you actually
          want to keep track of things.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link href="/register">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              <span className="flex items-center gap-3">
                Get Started
                <ArrowRight size={15} />
              </span>
            </Button>
          </Link>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <span className="flex items-center gap-2">
                <SiGithub className="w-5 h-5" />
                View GitHub
              </span>
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function LandingFooter() {
  return (
    <footer className="border-t border-neutral-900 py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Flame size={14} className="text-violet-500" />
          <span className="text-xs text-neutral-500">
            HabitSync &middot; built by Mostafa Rakib
          </span>
        </div>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <span className="flex items-center gap-2">
            <SiGithub className="w-5 h-5" />
            View on GitHub
          </span>
        </a>
      </div>
    </footer>
  );
}

// ── Shared reveal heading ─────────────────────────────────────────────────────

function RevealHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(
        "max-w-2xl mx-auto text-center flex flex-col items-center gap-3 transition-all duration-700",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
      )}
    >
      <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">
        {eyebrow}
      </span>
      <h2 className="text-2xl sm:text-3xl font-bold text-neutral-100 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-neutral-400 leading-relaxed">{description}</p>
      )}
    </div>
  );
}
