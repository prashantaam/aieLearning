import { Link } from "react-router-dom";
import { BrainCircuit, Quote } from "lucide-react";

export default function AuthSplitLayout({
  children,
  eyebrow = "AI Learning",
  quote,
  quoteAuthor,
}) {
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#0B1F3A] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0">
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#F4C95D]/10 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-sky-300/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative z-10 flex items-center justify-between px-12 py-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#F4C95D]">
              <BrainCircuit className="h-6 w-6 text-[#0B1F3A]" />
            </div>

            <div>
              <p className="text-base font-bold text-white">AI Learning</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                Learn. Practise. Grow.
              </p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 px-12 pb-20">
          <div className="max-w-xl">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <Quote className="h-6 w-6 text-[#F4C95D]" />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F4C95D]">
              {eyebrow}
            </p>

            <blockquote className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl">
              “{quote}”
            </blockquote>

            {quoteAuthor && (
              <p className="mt-6 text-sm font-medium text-slate-300">
                — {quoteAuthor}
              </p>
            )}

            <div className="mt-10 flex items-center gap-3">
              <span className="h-1 w-16 rounded-full bg-[#F4C95D]" />
              <span className="h-1 w-8 rounded-full bg-white/20" />
              <span className="h-1 w-8 rounded-full bg-white/20" />
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1F3A]">
              <BrainCircuit className="h-5 w-5 text-[#F4C95D]" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#0B1F3A]">AI Learning</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                Learn. Practise. Grow.
              </p>
            </div>
          </Link>

          {children}
        </div>
      </section>
    </div>
  );
}
