import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ChartNoAxesCombined,
  CheckCircle2,
  Layers3,
  PlayCircle,
} from "lucide-react";
import PublicNavbar from "../../components/public/PublicNavbar";
import PublicFooter from "../../components/public/PublicFooter";

const features = [
  {
    title: "Structured learning",
    description:
      "Follow clear course content organised into focused chapters and learning steps.",
    icon: BookOpen,
  },
  {
    title: "AI-powered practice",
    description:
      "Use flashcards and quizzes created from your learning content to strengthen understanding.",
    icon: BrainCircuit,
  },
  {
    title: "Track your progress",
    description:
      "Continue from where you left off and build consistent learning habits over time.",
    icon: ChartNoAxesCombined,
  },
];

const coursePreview = [
  {
    title: "Modern React Development",
    category: "Web Development",
    description:
      "Build strong React fundamentals through practical, structured lessons.",
    lessons: "12 chapters",
  },
  {
    title: "Python Foundations",
    category: "Programming",
    description:
      "Learn Python from core syntax through real-world problem solving.",
    lessons: "10 chapters",
  },
  {
    title: "Professional English",
    category: "Communication",
    description:
      "Improve practical English for workplace communication and everyday confidence.",
    lessons: "14 chapters",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <main>
        {/* Hero */}
        <section className="overflow-hidden border-b border-slate-200 bg-[#FAFBFC]">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-[#F4C95D]/70 bg-[#FFF8DA] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#725800]">
                <span className="h-2 w-2 rounded-full bg-[#F4C95D]" />
                Practical learning, powered by AI
              </div>

              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-[#0B1F3A] sm:text-5xl lg:text-6xl">
                Learn skills that move you forward.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Build practical skills through structured courses, guided learning,
                intelligent practice and clear progress tracking.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0B1F3A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#102b4f]"
                >
                  Start Learning
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#courses"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-[#0B1F3A] transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Explore Courses
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Learn at your own pace
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  AI-supported practice
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Progress focused
                </div>
              </div>
            </div>

            {/* Dashboard visual */}
            <div className="relative">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#F4C95D]/20 blur-3xl" />
              <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-sky-200/30 blur-3xl" />

              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
                <div className="flex h-11 items-center gap-2 border-b border-slate-200 bg-slate-50 px-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                </div>

                <div className="grid min-h-[410px] grid-cols-[120px_1fr] sm:grid-cols-[155px_1fr]">
                  <div className="bg-[#0B1F3A] p-4">
                    <div className="mb-8 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-[#F4C95D]" />
                      <div className="h-2 w-14 rounded bg-white/70" />
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-md bg-[#F4C95D] p-3">
                        <div className="h-2 w-16 rounded bg-[#0B1F3A]/70" />
                      </div>

                      {[1, 2, 3].map((item) => (
                        <div key={item} className="rounded-md p-3">
                          <div className="h-2 w-14 rounded bg-white/35" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 sm:p-7">
                    <div className="mb-6 rounded-lg bg-[#F4C95D] p-5">
                      <div className="mb-3 h-2 w-24 rounded bg-[#0B1F3A]/40" />
                      <div className="h-5 w-44 rounded bg-[#0B1F3A]/80" />
                      <div className="mt-3 h-2 w-52 max-w-full rounded bg-[#0B1F3A]/30" />
                    </div>

                    <div className="mb-5 grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="rounded-lg border border-slate-200 bg-white p-4">
                          <div className="mb-4 h-7 w-7 rounded-md bg-slate-100" />
                          <div className="h-4 w-10 rounded bg-[#0B1F3A]/80" />
                          <div className="mt-2 h-2 w-14 rounded bg-slate-200" />
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-5">
                      <div className="mb-4 h-3 w-28 rounded bg-[#0B1F3A]/70" />
                      <div className="space-y-3">
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-3 rounded-md bg-slate-50 p-3"
                          >
                            <div className="h-9 w-9 rounded-md bg-slate-200" />
                            <div className="flex-1">
                              <div className="h-2 w-24 rounded bg-slate-300" />
                              <div className="mt-2 h-2 w-16 rounded bg-slate-200" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#997500]">
                Better learning flow
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0B1F3A]">
                Everything you need to learn with focus.
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                A simple learning experience designed around content, practice and
                measurable progress.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-lg border border-slate-200 bg-white p-6"
                  >
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-[#FFF6CC]">
                      <Icon className="h-5 w-5 text-[#0B1F3A]" strokeWidth={2} />
                    </div>

                    <h3 className="text-lg font-bold text-[#0B1F3A]">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Courses */}
        <section id="courses" className="border-y border-slate-200 bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#997500]">
                  Explore courses
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0B1F3A]">
                  Build practical skills, one course at a time.
                </h2>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A]"
              >
                View all courses
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {coursePreview.map((course, index) => (
                <article
                  key={course.title}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-white"
                >
                  <div className="flex h-36 items-center justify-center bg-[#0B1F3A]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/10">
                      {index === 0 ? (
                        <Layers3 className="h-8 w-8 text-[#F4C95D]" />
                      ) : index === 1 ? (
                        <BrainCircuit className="h-8 w-8 text-[#F4C95D]" />
                      ) : (
                        <BookOpen className="h-8 w-8 text-[#F4C95D]" />
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#997500]">
                      {course.category}
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-[#0B1F3A]">
                      {course.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {course.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-xs font-medium text-slate-500">
                        {course.lessons}
                      </span>

                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1F3A]"
                      >
                        Learn
                        <PlayCircle className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="rounded-xl bg-[#0B1F3A] px-6 py-12 text-center sm:px-10">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#F4C95D]">
                Start learning today
              </p>

              <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white">
                Build knowledge through focused learning and intelligent practice.
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300">
                Sign in to access your dashboard, courses, learning content,
                flashcards and quizzes.
              </p>

              <Link
                to="/login"
                className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#F4C95D] px-6 py-3 text-sm font-bold text-[#0B1F3A] transition hover:bg-[#f7d46f]"
              >
                Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
