import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer id="about" className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0B1F3A]">
              <BrainCircuit className="h-4 w-4 text-[#F4C95D]" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#0B1F3A]">AI Learning</p>
              <p className="text-xs text-slate-500">
                Practical learning for modern skills.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500">
            <a href="#courses" className="transition hover:text-[#0B1F3A]">
              Courses
            </a>
            <a href="#features" className="transition hover:text-[#0B1F3A]">
              Features
            </a>
            <Link to="/login" className="transition hover:text-[#0B1F3A]">
              Login
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} AI Learning. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
