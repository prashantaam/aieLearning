import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";

export default function PublicNavbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1F3A]">
            <BrainCircuit className="h-5 w-5 text-[#F4C95D]" strokeWidth={2} />
          </div>

          <div>
            <p className="text-base font-bold tracking-tight text-[#0B1F3A]">
              AI Learning
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
              Learn. Practise. Grow.
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#courses"
            className="text-sm font-medium text-slate-600 transition hover:text-[#0B1F3A]"
          >
            Courses
          </a>

          <a
            href="#features"
            className="text-sm font-medium text-slate-600 transition hover:text-[#0B1F3A]"
          >
            Why us
          </a>

          <a
            href="#about"
            className="text-sm font-medium text-slate-600 transition hover:text-[#0B1F3A]"
          >
            About
          </a>
        </nav>

       <div className="flex items-center gap-3">
            <Link
                to="/register"
                className="rounded-md border border-[#0B1F3A] px-5 py-2.5 text-sm font-semibold text-[#0B1F3A] transition hover:bg-slate-50"
            >
                Register
            </Link>

            <Link
                to="/login"
                className="rounded-md bg-[#0B1F3A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#102b4f]"
            >
                Login
            </Link>
        </div>
      </div>
    </header>
  );
}
