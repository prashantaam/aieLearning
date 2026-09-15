import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  LoaderCircle,
  PlayCircle,
  RefreshCw,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../utils/axiosInstance";

export default function CourseDetailPage() {
  const navigate = useNavigate();

  const { slug } = useParams();

  const [course, setCourse] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    expandedLessons,
    setExpandedLessons,
  ] = useState({});


  /*
  |--------------------------------------------------------------------------
  | Load Course
  |--------------------------------------------------------------------------
  */

  const loadCourse = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await axiosInstance.get(
          `/api/student/courses/${slug}`
        );

      setCourse(
        response.data?.data || null
      );
    } catch (err) {
      console.error(
        "Failed to load course:",
        err
      );

      if (
        err?.response?.status === 404
      ) {
        setError(
          "This course could not be found or is not currently published."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            "Unable to load this course. Please try again."
        );
      }
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
    if (slug) {
      loadCourse();
    }
  }, [slug]);


  /*
  |--------------------------------------------------------------------------
  | Toggle Lesson
  |--------------------------------------------------------------------------
  */

  const toggleLesson = (lessonId) => {
    setExpandedLessons(
      (previous) => ({
        ...previous,
        [lessonId]:
          !previous[lessonId],
      })
    );
  };


  /*
  |--------------------------------------------------------------------------
  | Open Sublesson
  |--------------------------------------------------------------------------
  */

  const openSublesson = (
    sublessonId
  ) => {
    navigate(
      `/courses/${course.slug}/learn/${sublessonId}`
    );
  };


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-6">

        <div className="text-center">

          <LoaderCircle
            size={36}
            className="mx-auto animate-spin text-[#0B1F3A]"
          />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading course...
          </p>

        </div>

      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <div className="p-6 lg:p-8">

        <button
          type="button"
          onClick={() =>
            navigate("/courses")
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0B1F3A]"
        >
          <ArrowLeft size={17} />
          Back to Courses
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-8">

          <h1 className="text-xl font-bold text-red-800">
            Course unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={loadCourse}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#102b4f]"
          >
            <RefreshCw size={16} />
            Try Again
          </button>

        </div>

      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Course Data
  |--------------------------------------------------------------------------
  */

  if (!course) {
    return null;
  }

  const lessons =
    Array.isArray(course.lessons)
      ? course.lessons
      : [];

  const lessonCount =
    course.lessons_count ??
    lessons.length;

  const firstSublesson =
    lessons
      .flatMap((lesson) =>
        Array.isArray(
          lesson.sublessons
        )
          ? lesson.sublessons
          : []
      )
      .find(Boolean);


  /*
  |--------------------------------------------------------------------------
  | Start Learning
  |--------------------------------------------------------------------------
  */

  const startLearning = () => {
    if (!firstSublesson) {
      return;
    }

    openSublesson(
      firstSublesson.id
    );
  };


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-8 p-6 lg:p-8">

      {/* Back */}
      <button
        type="button"
        onClick={() =>
          navigate("/courses")
        }
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0B1F3A]"
      >
        <ArrowLeft size={17} />
        Back to Courses
      </button>


      {/* Course Hero */}
      <section className="overflow-hidden rounded-2xl bg-[#0B1F3A]">

        <div className="h-2 bg-[#F4C95D]" />

        <div className="grid gap-8 p-7 md:p-9 lg:grid-cols-[1fr_auto] lg:items-center">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <span className="rounded-md bg-[#F4C95D] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0B1F3A]">
                Course
              </span>

              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <GraduationCap
                  size={17}
                />

                {lessonCount}{" "}
                {lessonCount === 1
                  ? "Lesson"
                  : "Lessons"}
              </span>

            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-white md:text-4xl">
              {course.title}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              {course.description ||
                "Work through structured lessons and build your knowledge step by step."}
            </p>


            {/* Start Learning */}
            <div className="mt-7">

              {firstSublesson ? (

                <button
                  type="button"
                  onClick={
                    startLearning
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-[#F4C95D] px-5 py-3 text-sm font-bold text-[#0B1F3A] transition hover:bg-[#e8bc4f]"
                >
                  Start Learning

                  <ArrowRight
                    size={17}
                  />
                </button>

              ) : (

                <span className="inline-flex rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-slate-300">
                  Content coming soon
                </span>

              )}

            </div>

          </div>


          {/* Hero Icon */}
          <div className="hidden lg:flex">

            <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white/10">

              <BookOpen
                size={48}
                className="text-[#F4C95D]"
                strokeWidth={1.7}
              />

            </div>

          </div>

        </div>

      </section>


      {/* Main Content */}
      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_300px]">

        {/* Course Index */}
        <section>

          <div className="mb-5">

            <h2 className="text-2xl font-bold text-[#0B1F3A]">
              Course Index
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Expand a lesson to view its
              sublessons, then select a
              sublesson to start learning.
            </p>

          </div>


          {lessons.length > 0 ? (

            <div className="space-y-3">

              {lessons.map(
                (lesson, lessonIndex) => {
                  const isExpanded =
                    !!expandedLessons[
                      lesson.id
                    ];

                  const sublessons =
                    Array.isArray(
                      lesson.sublessons
                    )
                      ? lesson.sublessons
                      : [];

                  return (
                    <article
                      key={lesson.id}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                    >

                      {/* Lesson Header */}
                      <button
                        type="button"
                        onClick={() =>
                          toggleLesson(
                            lesson.id
                          )
                        }
                        className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-slate-50"
                      >

                        {/* Lesson Number */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F4C95D] text-sm font-bold text-[#0B1F3A]">
                          {lessonIndex + 1}
                        </div>


                        {/* Lesson Title */}
                        <div className="min-w-0 flex-1">

                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Lesson{" "}
                            {lessonIndex + 1}
                          </p>

                          <h3 className="mt-1 text-base font-bold text-[#0B1F3A]">
                            {lesson.title}
                          </h3>

                        </div>


                        {/* Sublesson Count */}
                        <span className="hidden text-xs font-semibold text-slate-400 sm:block">
                          {sublessons.length}{" "}
                          {sublessons.length === 1
                            ? "sublesson"
                            : "sublessons"}
                        </span>


                        {/* Arrow */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#0B1F3A]">

                          {isExpanded ? (
                            <ChevronUp
                              size={19}
                            />
                          ) : (
                            <ChevronDown
                              size={19}
                            />
                          )}

                        </div>

                      </button>


                      {/* Expanded Sublesson Index */}
                      {isExpanded && (

                        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">

                          {sublessons.length >
                          0 ? (

                            <div className="space-y-1">

                              {sublessons.map(
                                (
                                  sublesson,
                                  subIndex
                                ) => (

                                  <button
                                    key={
                                      sublesson.id
                                    }
                                    type="button"
                                    onClick={() =>
                                      openSublesson(
                                        sublesson.id
                                      )
                                    }
                                    className="group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition hover:bg-white hover:shadow-sm"
                                  >

                                    {/* Index */}
                                    <span className="w-12 shrink-0 text-sm font-bold text-slate-400 transition group-hover:text-[#0B1F3A]">
                                      {lessonIndex +
                                        1}
                                      .
                                      {subIndex +
                                        1}
                                    </span>


                                    {/* Clickable Title */}
                                    <span className="min-w-0 flex-1 text-sm font-semibold text-[#0B1F3A] transition group-hover:text-[#102b4f]">
                                      {
                                        sublesson.title
                                      }
                                    </span>


                                    {/* Learn Icon */}
                                    <PlayCircle
                                      size={18}
                                      className="shrink-0 text-slate-300 transition group-hover:text-[#F4C95D]"
                                    />

                                  </button>

                                )
                              )}

                            </div>

                          ) : (

                            <p className="px-4 py-2 text-sm text-slate-500">
                              No published
                              sublessons
                              available.
                            </p>

                          )}

                        </div>

                      )}

                    </article>
                  );
                }
              )}

            </div>

          ) : (

            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">

              <BookOpen
                size={35}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-bold text-[#0B1F3A]">
                No lessons available yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Published lessons will appear
                here when they become
                available.
              </p>

            </div>

          )}

        </section>


        {/* Course Summary */}
        <aside>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-bold text-[#0B1F3A]">
              Course Overview
            </h2>

            <div className="mt-5 space-y-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[#0B1F3A]">
                  <BookOpen
                    size={17}
                  />
                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Lessons
                  </p>

                  <p className="text-sm font-bold text-[#0B1F3A]">
                    {lessonCount}
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700">
                  <CheckCircle2
                    size={17}
                  />
                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Status
                  </p>

                  <p className="text-sm font-bold text-green-700">
                    Published
                  </p>

                </div>

              </div>

            </div>


            <div className="mt-6 border-t border-slate-100 pt-5">

              <p className="text-sm leading-6 text-slate-500">
                Learn at your own pace and
                progress through each lesson
                and sublesson.
              </p>

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}