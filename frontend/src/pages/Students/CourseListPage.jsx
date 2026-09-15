import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axiosInstance from "../../utils/axiosInstance";

/*
|--------------------------------------------------------------------------
| Course List Page
|--------------------------------------------------------------------------
|
| Displays published courses available to authenticated students.
|
*/

export default function CourseListPage() {
  const navigate = useNavigate();

  const [courses, setCourses] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | Load Published Courses
  |--------------------------------------------------------------------------
  */

  const loadCourses = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await axiosInstance.get(
          "/api/student/courses"
        );

      const courseData =
        Array.isArray(response.data?.data)
          ? response.data.data
          : [];

      setCourses(courseData);
    } catch (err) {
      console.error(
        "Failed to load courses:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load courses. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadCourses();
  }, []);


  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const filteredCourses =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return courses;
      }

      return courses.filter(
        (course) => {
          const title =
            course?.title
              ?.toLowerCase() || "";

          const description =
            course?.description
              ?.toLowerCase() || "";

          return (
            title.includes(query) ||
            description.includes(query)
          );
        }
      );
    }, [courses, search]);


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-7 p-6 lg:p-8">

      {/* Page Header */}
      <section>

        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
          Learning catalogue
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A]">
          Explore Courses
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Choose a course and start
          building your skills through
          lessons, exercises, flashcards
          and quizzes.
        </p>

      </section>


      {/* Search */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 sm:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search courses..."
              className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#0B1F3A]/10"
            />

          </div>


          {/* Refresh */}
          <button
            type="button"
            onClick={loadCourses}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-[#0B1F3A] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

      </section>


      {/* Course Count */}
      <section className="flex items-center justify-between">

        <div>

          <h2 className="text-lg font-bold text-[#0B1F3A]">
            Available Courses
          </h2>

          {!loading && !error && (
            <p className="mt-1 text-sm text-slate-500">
              {filteredCourses.length}{" "}
              {filteredCourses.length === 1
                ? "course"
                : "courses"}{" "}
              available
            </p>
          )}

        </div>

      </section>


      {/* Loading State */}
      {loading && (

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {[1, 2, 3, 4, 5, 6].map(
            (item) => (

              <div
                key={item}
                className="min-h-[290px] animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white"
              >

                <div className="h-1.5 bg-slate-200" />

                <div className="space-y-5 p-6">

                  <div className="h-5 w-24 rounded bg-slate-200" />

                  <div className="h-7 w-3/4 rounded bg-slate-200" />

                  <div className="space-y-2">
                    <div className="h-4 rounded bg-slate-200" />
                    <div className="h-4 rounded bg-slate-200" />
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                  </div>

                  <div className="h-10 rounded bg-slate-200" />

                </div>

              </div>

            )
          )}

        </section>

      )}


      {/* Error State */}
      {!loading && error && (

        <section className="rounded-xl border border-red-200 bg-red-50 p-6">

          <h3 className="font-bold text-red-800">
            We couldn't load the courses
          </h3>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={loadCourses}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#102b4f]"
          >
            <RefreshCw size={16} />

            Try Again
          </button>

        </section>

      )}


      {/* Empty State */}
      {!loading &&
        !error &&
        filteredCourses.length === 0 && (

          <section className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#0B1F3A] text-[#F4C95D]">

              <BookOpen size={25} />

            </div>

            <h3 className="mt-4 text-lg font-bold text-[#0B1F3A]">
              {search
                ? "No matching courses"
                : "No courses available"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">

              {search
                ? "Try searching with a different course name or keyword."
                : "There are currently no published courses available. Please check again later."}

            </p>

            {search && (

              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="mt-5 rounded-lg bg-[#F4C95D] px-5 py-2.5 text-sm font-bold text-[#0B1F3A] transition hover:bg-[#e8bc4f]"
              >
                Clear Search
              </button>

            )}

          </section>

        )}


      {/* Course Cards */}
      {!loading &&
        !error &&
        filteredCourses.length > 0 && (

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredCourses.map(
              (course) => {

                const lessonCount =
                  course.lessons_count ?? 0;

                return (

                  <article
                    key={course.id}
                    className="group flex min-h-[300px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                  >

                    {/* Yellow Accent */}
                    <div className="h-1.5 bg-[#F4C95D]" />


                    <div className="flex flex-1 flex-col p-6">

                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                            Course
                          </span>

                          <h3 className="mt-4 text-xl font-bold leading-7 text-[#0B1F3A]">
                            {course.title}
                          </h3>

                        </div>


                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0B1F3A] text-[#F4C95D]">

                          <BookOpen
                            size={21}
                          />

                        </div>

                      </div>


                      {/* Description */}
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">

                        {course.description ||
                          "Start learning with structured lessons, practical exercises, flashcards and quizzes."}

                      </p>


                      {/* Lesson Count */}
                      <div className="mt-5">

                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">

                          <GraduationCap
                            size={17}
                          />

                          {lessonCount}{" "}
                          {lessonCount === 1
                            ? "Lesson"
                            : "Lessons"}

                        </span>

                      </div>


                      {/* Footer */}
                      <div className="mt-auto flex items-center justify-between gap-4 border-t border-slate-100 pt-5">

                        <span className="rounded-md bg-[#F4C95D]/20 px-2.5 py-1 text-xs font-bold text-[#0B1F3A]">
                          Published
                        </span>


                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/courses/${course.slug}`
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#102b4f]"
                        >
                          View Course

                          <ArrowRight
                            size={16}
                          />
                        </button>

                      </div>

                    </div>

                  </article>

                );
              }
            )}

          </section>

        )}

    </div>
  );
}