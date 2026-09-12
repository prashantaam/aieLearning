import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  Clock3,
  Layers3,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import StudentLayout from "../../components/students/StudentLayout";

const API_BASE_URL = "http://localhost:8000";

function normaliseCourses(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.subjects)) return payload.subjects;
  return [];
}

function getCourseTitle(course) {
  return course?.title || course?.name || "Untitled course";
}

function getCourseDescription(course) {
  return (
    course?.description ||
    course?.summary ||
    "Build your knowledge through structured chapters, learning content, flashcards and quizzes."
  );
}

function getCourseLevel(course) {
  return course?.level || course?.difficulty || "Beginner";
}

function getCourseCategory(course) {
  return course?.category || course?.topic || "General";
}

function getChapterCount(course) {
  if (Array.isArray(course?.chapters)) return course.chapters.length;
  return course?.chapters_count ?? course?.chapter_count ?? 0;
}

function isPublished(course) {
  const status = String(course?.status || "").toLowerCase();

  return (
    status === "published" ||
    course?.is_published === true ||
    course?.published === true
  );
}

export default function CoursesPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/subjects`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Unable to load courses (${response.status}).`);
      }

      const payload = await response.json();
      const allCourses = normaliseCourses(payload);

      setCourses(allCourses.filter(isPublished));
    } catch (err) {
      console.error("Failed to load published courses:", err);
      setError(err?.message || "Unable to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const levels = useMemo(() => {
    const values = courses.map(getCourseLevel).filter(Boolean);
    return ["All", ...new Set(values)];
  }, [courses]);

  const categories = useMemo(() => {
    const values = courses.map(getCourseCategory).filter(Boolean);
    return ["All", ...new Set(values)];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return courses.filter((course) => {
      const title = getCourseTitle(course).toLowerCase();
      const description = getCourseDescription(course).toLowerCase();
      const courseLevel = getCourseLevel(course);
      const courseCategory = getCourseCategory(course);

      const matchesSearch =
        !query ||
        title.includes(query) ||
        description.includes(query) ||
        courseCategory.toLowerCase().includes(query);

      const matchesLevel = level === "All" || courseLevel === level;
      const matchesCategory = category === "All" || courseCategory === category;

      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [courses, search, level, category]);

  const clearFilters = () => {
    setSearch("");
    setLevel("All");
    setCategory("All");
  };

  return (
    <StudentLayout>
      <div className="space-y-7">
        <section className="border-b border-slate-200 pb-7">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              Learning catalogue
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A]">
              Browse Courses
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Explore published courses, build practical skills and work through
              each chapter at your own pace.
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                strokeWidth={2}
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search courses..."
                className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#0B1F3A]/10"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <SlidersHorizontal
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2}
                />

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-11 min-w-44 appearance-none rounded-md border border-slate-300 bg-white pl-10 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-[#0B1F3A]"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item === "All" ? "All topics" : item}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="h-11 min-w-40 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#0B1F3A]"
              >
                {levels.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All levels" : item}
                  </option>
                ))}
              </select>

              {(search || level !== "All" || category !== "All") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-11 rounded-md px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[#0B1F3A]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#0B1F3A]">
              {loading ? "Courses" : `${filteredCourses.length} Courses`}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Only published courses are shown.
            </p>
          </div>

          {!loading && (
            <button
              type="button"
              onClick={loadCourses}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-[#0B1F3A]"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          )}
        </div>

        {loading && (
          <div className="grid gap-5 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-lg border border-slate-200 bg-white"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-800">
              We couldn't load the courses.
            </p>

            <p className="mt-1 text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={loadCourses}
              className="mt-4 rounded-md bg-[#0B1F3A] px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredCourses.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-400" />

            <h3 className="mt-4 text-lg font-bold text-[#0B1F3A]">
              No courses found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try changing the search or filters. Only courses with published
              status are available to students.
            </p>
          </div>
        )}

        {!loading && !error && filteredCourses.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredCourses.map((course) => {
              const chapterCount = getChapterCount(course);
              const courseId = course.id;
              const courseTitle = getCourseTitle(course);
              const courseDescription = getCourseDescription(course);
              const courseLevel = getCourseLevel(course);
              const courseCategory = getCourseCategory(course);

              return (
                <article
                  key={courseId}
                  className="group flex min-h-64 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60"
                >
                  <div className="h-1.5 bg-[#F4C95D]" />

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                          Course
                        </span>

                        <h3 className="mt-4 text-xl font-bold leading-7 text-[#0B1F3A] transition group-hover:text-blue-800">
                          {courseTitle}
                        </h3>
                      </div>

                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#0B1F3A] text-[#F4C95D]">
                        <BookOpen className="h-5 w-5" strokeWidth={2} />
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {courseDescription}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Layers3 className="h-4 w-4" />
                        {chapterCount} {chapterCount === 1 ? "chapter" : "chapters"}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-4 w-4" />
                        Self-paced
                      </span>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-4 border-t border-slate-100 pt-5">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {courseCategory}
                        </span>

                        <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          {courseLevel}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/courses/${courseId}/learn`)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#102b4f]"
                      >
                        Start course
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
