import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  LoaderCircle,
  Menu,
  RefreshCw,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../utils/axiosInstance";
import LearningHeader from "../../components/layout/LearningHeader";


export default function CourseLearningPage() {
  const navigate = useNavigate();

  const {
    slug,
    sublessonId,
  } = useParams();

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

  const [
    mobileIndexOpen,
    setMobileIndexOpen,
  ] = useState(false);


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
  | Lessons
  |--------------------------------------------------------------------------
  */

  const lessons = useMemo(() => {
    if (
      !Array.isArray(
        course?.lessons
      )
    ) {
      return [];
    }

    return course.lessons;
  }, [course]);


  /*
  |--------------------------------------------------------------------------
  | Flatten All Sublessons
  |--------------------------------------------------------------------------
  |
  | This gives us one ordered list of all sublessons so Previous / Next
  | navigation can move across lessons automatically.
  |
  */

  const allSublessons =
    useMemo(() => {
      const items = [];

      lessons.forEach(
        (
          lesson,
          lessonIndex
        ) => {
          const sublessons =
            Array.isArray(
              lesson.sublessons
            )
              ? lesson.sublessons
              : [];

          sublessons.forEach(
            (
              sublesson,
              sublessonIndex
            ) => {
              items.push({
                ...sublesson,

                lessonId:
                  lesson.id,

                lessonTitle:
                  lesson.title,

                lessonIndex,

                sublessonIndex,
              });
            }
          );
        }
      );

      return items;
    }, [lessons]);


  /*
  |--------------------------------------------------------------------------
  | Current Sublesson
  |--------------------------------------------------------------------------
  */

  const currentIndex =
    allSublessons.findIndex(
      (sublesson) =>
        String(
          sublesson.id
        ) ===
        String(
          sublessonId
        )
    );

  const currentSublesson =
    currentIndex >= 0
      ? allSublessons[
          currentIndex
        ]
      : null;


  /*
  |--------------------------------------------------------------------------
  | Previous / Next
  |--------------------------------------------------------------------------
  */

  const previousSublesson =
    currentIndex > 0
      ? allSublessons[
          currentIndex - 1
        ]
      : null;

  const nextSublesson =
    currentIndex >= 0 &&
    currentIndex <
      allSublessons.length - 1
      ? allSublessons[
          currentIndex + 1
        ]
      : null;


  /*
  |--------------------------------------------------------------------------
  | Current Sublesson Content
  |--------------------------------------------------------------------------
  */

  const contents =
    Array.isArray(
      currentSublesson?.contents
    )
      ? currentSublesson.contents
      : [];


  /*
  |--------------------------------------------------------------------------
  | Automatically Expand Current Lesson
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!currentSublesson) {
      return;
    }

    setExpandedLessons(
      (previous) => ({
        ...previous,

        [currentSublesson.lessonId]:
          true,
      })
    );
  }, [
    currentSublesson?.lessonId,
  ]);


  /*
  |--------------------------------------------------------------------------
  | Toggle Lesson
  |--------------------------------------------------------------------------
  */

  const toggleLesson = (
    lessonId
  ) => {
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
  | Navigate to Sublesson
  |--------------------------------------------------------------------------
  */

  const goToSublesson = (
    id
  ) => {
    navigate(
      `/courses/${slug}/learn/${id}`
    );

    setMobileIndexOpen(false);
  };


  /*
  |--------------------------------------------------------------------------
  | Render Content Block
  |--------------------------------------------------------------------------
  */

  const renderContent = (
    content
  ) => {
    const type =
      content?.type ||
      "text";

    const value =
      content?.content ||
      "";

    switch (type) {
      /*
      |--------------------------------------------------------------------------
      | Heading
      |--------------------------------------------------------------------------
      */

      case "heading":
        return (
          <h2 className="mt-10 text-2xl font-bold tracking-tight text-[#0B1F3A] first:mt-0">
            {value}
          </h2>
        );


      /*
      |--------------------------------------------------------------------------
      | Code
      |--------------------------------------------------------------------------
      */

      case "code":
        return (
          <div className="my-6 overflow-hidden rounded-xl bg-[#0B1F3A]">

            <div className="border-b border-white/10 px-5 py-3">

              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Code
              </span>

            </div>

            <pre className="overflow-x-auto p-5 text-sm leading-7 text-slate-100">
              <code>
                {value}
              </code>
            </pre>

          </div>
        );


      /*
      |--------------------------------------------------------------------------
      | Image
      |--------------------------------------------------------------------------
      */

      case "image":
        return (
          <div className="my-7">

            <img
              src={value}
              alt=""
              className="max-w-full rounded-xl"
            />

          </div>
        );


      /*
      |--------------------------------------------------------------------------
      | Video
      |--------------------------------------------------------------------------
      */

      case "video":
        return (
          <div className="my-7 overflow-hidden rounded-xl bg-black">

            <video
              controls
              className="w-full"
            >
              <source
                src={value}
              />

              Your browser does not
              support video playback.
            </video>

          </div>
        );


      /*
      |--------------------------------------------------------------------------
      | Markdown
      |--------------------------------------------------------------------------
      */

      case "markdown":
        return (
          <div className="whitespace-pre-wrap text-base leading-8 text-slate-700">
            {value}
          </div>
        );


      /*
      |--------------------------------------------------------------------------
      | Text
      |--------------------------------------------------------------------------
      */

      case "text":
      default:
        return (
          <div className="whitespace-pre-wrap text-base leading-8 text-slate-700">
            {value}
          </div>
        );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">

        <LearningHeader />

        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">

          <div className="text-center">

            <LoaderCircle
              size={36}
              className="mx-auto animate-spin text-[#0B1F3A]"
            />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading lesson...
            </p>

          </div>

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
      <div className="min-h-screen bg-slate-50">

        <LearningHeader />

        <div className="p-6 lg:p-8">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/courses/${slug}`
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0B1F3A]"
          >
            <ArrowLeft
              size={17}
            />

            Back to Course
          </button>

          <div className="rounded-xl border border-red-200 bg-red-50 p-8">

            <h1 className="text-xl font-bold text-red-800">
              Unable to load lesson
            </h1>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={
                loadCourse
              }
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <RefreshCw
                size={16}
              />

              Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Invalid Sublesson
  |--------------------------------------------------------------------------
  */

  if (
    !course ||
    !currentSublesson
  ) {
    return (
      <div className="min-h-screen bg-slate-50">

        <LearningHeader />

        <div className="p-6 lg:p-8">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/courses/${slug}`
              )
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
          >
            <ArrowLeft
              size={17}
            />

            Back to Course
          </button>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-8">

            <h1 className="text-xl font-bold text-[#0B1F3A]">
              Sublesson not found
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              This sublesson is not
              available in the published
              course.
            </p>

          </div>

        </div>

      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Course Index
  |--------------------------------------------------------------------------
  */

  const CourseIndex = () => (
    <div>

      {/* Course Title */}
      <div className="border-b border-slate-200 p-5">

        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Course
        </p>

        <h2 className="mt-1 text-base font-bold text-[#0B1F3A]">
          {course.title}
        </h2>

      </div>


      {/* Lessons */}
      <div className="p-3">

        {lessons.map(
          (
            lesson,
            lessonIndex
          ) => {
            const sublessons =
              Array.isArray(
                lesson.sublessons
              )
                ? lesson.sublessons
                : [];

            const isExpanded =
              !!expandedLessons[
                lesson.id
              ];

            return (
              <div
                key={lesson.id}
                className="mb-2"
              >

                {/* Lesson */}
                <button
                  type="button"
                  onClick={() =>
                    toggleLesson(
                      lesson.id
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-slate-100"
                >

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F4C95D] text-xs font-bold text-[#0B1F3A]">
                    {lessonIndex + 1}
                  </div>

                  <span className="min-w-0 flex-1 text-sm font-bold text-[#0B1F3A]">
                    {lesson.title}
                  </span>

                  {isExpanded ? (
                    <ChevronUp
                      size={17}
                      className="text-slate-400"
                    />
                  ) : (
                    <ChevronDown
                      size={17}
                      className="text-slate-400"
                    />
                  )}

                </button>


                {/* Sublessons */}
                {isExpanded && (

                  <div className="ml-4 mt-1 border-l border-slate-200 pl-4">

                    {sublessons.map(
                      (
                        sublesson,
                        subIndex
                      ) => {
                        const isActive =
                          String(
                            sublesson.id
                          ) ===
                          String(
                            sublessonId
                          );

                        return (
                          <button
                            key={
                              sublesson.id
                            }
                            type="button"
                            onClick={() =>
                              goToSublesson(
                                sublesson.id
                              )
                            }
                            className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                              isActive
                                ? "bg-[#0B1F3A] font-semibold text-white"
                                : "text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]"
                            }`}
                          >

                            <span
                              className={`shrink-0 text-xs font-bold ${
                                isActive
                                  ? "text-[#F4C95D]"
                                  : "text-slate-400"
                              }`}
                            >
                              {lessonIndex +
                                1}
                              .
                              {subIndex +
                                1}
                            </span>

                            <span className="min-w-0 flex-1">
                              {
                                sublesson.title
                              }
                            </span>

                          </button>
                        );
                      }
                    )}

                  </div>

                )}

              </div>
            );
          }
        )}

      </div>

    </div>
  );


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Minimal Learning Navbar */}
      <LearningHeader />


      {/* Current Sublesson Header */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white">

        <div className="flex h-16 items-center gap-4 px-4 lg:px-6">

          {/* Mobile Course Index */}
          <button
            type="button"
            onClick={() =>
              setMobileIndexOpen(
                true
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-[#0B1F3A] lg:hidden"
          >
            <Menu size={20} />
          </button>


          {/* Back to Course */}
          <button
            type="button"
            onClick={() =>
              navigate(
                `/courses/${slug}`
              )
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#0B1F3A]"
          >
            <ArrowLeft
              size={17}
            />

            <span className="hidden sm:inline">
              Course Index
            </span>
          </button>


          <div className="h-6 w-px bg-slate-200" />


          {/* Current Sublesson */}
          <div className="min-w-0 flex-1">

            <p className="text-xs font-semibold text-slate-400">
              Sublesson{" "}
              {currentSublesson.lessonIndex +
                1}
              .
              {currentSublesson.sublessonIndex +
                1}
            </p>

            <h1 className="truncate text-sm font-bold text-[#0B1F3A] sm:text-base">
              {
                currentSublesson.title
              }
            </h1>

          </div>

        </div>

      </div>


      {/* Learning Workspace */}
      <div className="flex">

        {/* Desktop Course Index */}
        <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-white lg:block">

          <div className="sticky top-32 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <CourseIndex />
          </div>

        </aside>


        {/* Main Learning Area */}
        <main className="min-w-0 flex-1">

          <div className="mx-auto max-w-5xl px-5 py-8 lg:px-10 lg:py-10">

            {/* Sublesson */}
            <article className="mx-auto max-w-4xl">

              {/* Sublesson Number */}
              <p className="text-sm font-bold text-[#D9A900]">
                {currentSublesson.lessonIndex +
                  1}
                .
                {currentSublesson.sublessonIndex +
                  1}
              </p>


              {/* Sublesson Title */}
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A] md:text-4xl">
                {
                  currentSublesson.title
                }
              </h1>


              {/* Description */}
              {currentSublesson.description && (

                <p className="mt-4 text-lg leading-8 text-slate-500">
                  {
                    currentSublesson.description
                  }
                </p>

              )}


              {/* Divider */}
              <div className="my-8 border-t border-slate-200" />


              {/* Actual Sublesson Content */}
              {contents.length > 0 ? (

                <div className="space-y-6">

                  {contents.map(
                    (content) => (

                      <div
                        key={
                          content.id
                        }
                      >
                        {renderContent(
                          content
                        )}
                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="py-10">

                  <BookOpen
                    size={30}
                    className="text-slate-300"
                  />

                  <p className="mt-3 text-sm text-slate-500">
                    No learning content has
                    been published for this
                    sublesson yet.
                  </p>

                </div>

              )}

            </article>


            {/* Previous / Next */}
            <div className="mx-auto mt-12 flex max-w-4xl items-center justify-between gap-4 border-t border-slate-200 pt-6">

              {/* Previous */}
              <div>

                {previousSublesson && (

                  <button
                    type="button"
                    onClick={() =>
                      goToSublesson(
                        previousSublesson.id
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#0B1F3A] transition hover:bg-slate-50"
                  >
                    <ChevronLeft
                      size={18}
                    />

                    <span>
                      Previous
                    </span>
                  </button>

                )}

              </div>


              {/* Next */}
              <div>

                {nextSublesson ? (

                  <button
                    type="button"
                    onClick={() =>
                      goToSublesson(
                        nextSublesson.id
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-[#F4C95D] px-5 py-3 text-sm font-bold text-[#0B1F3A] transition hover:bg-[#e8bc4f]"
                  >
                    Next

                    <ChevronRight
                      size={18}
                    />
                  </button>

                ) : (

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/courses/${slug}`
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#102b4f]"
                  >
                    Course Index

                    <ArrowRight
                      size={17}
                    />
                  </button>

                )}

              </div>

            </div>

          </div>

        </main>

      </div>


      {/* Mobile Course Index */}
      {mobileIndexOpen && (

        <div className="fixed inset-0 z-50 lg:hidden">

          {/* Overlay */}
          <button
            type="button"
            aria-label="Close course index"
            onClick={() =>
              setMobileIndexOpen(
                false
              )
            }
            className="absolute inset-0 bg-slate-950/40"
          />


          {/* Mobile Sidebar */}
          <aside className="absolute inset-y-0 left-0 w-[88%] max-w-sm overflow-y-auto bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-slate-200 p-4">

              <span className="font-bold text-[#0B1F3A]">
                Course Index
              </span>

              <button
                type="button"
                onClick={() =>
                  setMobileIndexOpen(
                    false
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[#0B1F3A]"
              >
                <X size={18} />
              </button>

            </div>

            <CourseIndex />

          </aside>

        </div>

      )}

    </div>
  );
}