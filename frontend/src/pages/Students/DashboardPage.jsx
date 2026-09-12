import StudentLayout from "../../components/students/StudentLayout";
import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  
const firstName =
  user?.username ||
  user?.name ||
  user?.full_name ||
  "Student";
const displayName = firstName.trim().split(/\s+/)[0];

  return (
    <StudentLayout>
      <div className="space-y-8">

        {/* Page heading */}
        <div>
        

          <h1 className="mt-2 text-3xl font-bold text-[#0B1F3A]">
            Welcome back, {displayName}
          </h1>

          <p className="mt-2 text-slate-600">
            Continue learning and track your progress.
          </p>
        </div>

        {/* Hero */}
        <section className="rounded-lg bg-[#F4C95D] p-8">
          <h2 className="text-2xl font-bold text-[#0B1F3A]">
            Keep building your skills
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#0B1F3A]/80">
            Continue from where you left off or explore a new course to
            develop your knowledge and practical skills.
          </p>

          <button
            type="button"
            className="mt-6 rounded-md bg-[#0B1F3A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#102b4f]"
          >
            Browse Courses
          </button>
        </section>

        {/* Statistics */}
        <section className="grid gap-5 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">
              Courses
            </p>

            <p className="mt-2 text-3xl font-bold text-[#0B1F3A]">
              0
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Courses you are currently learning
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-[#0B1F3A]">
              0
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Courses completed
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">
              Learning Progress
            </p>

            <p className="mt-2 text-3xl font-bold text-[#0B1F3A]">
              0%
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Overall course progress
            </p>
          </div>
        </section>

        {/* Continue Learning */}
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#0B1F3A]">
                Continue Learning
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Pick up from where you left off.
              </p>
            </div>

            <button
              type="button"
              className="text-sm font-semibold text-[#0B1F3A] hover:underline"
            >
              View all courses
            </button>
          </div>

          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
              <span className="text-xl">📚</span>
            </div>

            <p className="mt-4 font-semibold text-slate-700">
              No learning activity yet
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Start a course and your learning progress will appear here.
            </p>
          </div>
        </section>

        {/* My Courses */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#0B1F3A]">
              My Courses
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Courses you are currently learning.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-5 h-2 w-12 rounded-full bg-[#F4C95D]" />

              <h3 className="font-bold text-[#0B1F3A]">
                Your courses will appear here
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Browse available courses and start learning.
              </p>
            </div>

          </div>
        </section>

      </div>
    </StudentLayout>
  );
}