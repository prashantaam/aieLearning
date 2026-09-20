import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  RefreshCw,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../utils/axiosInstance";

import CourseIndex from "../../components/students/learning/CourseIndex";
import ContentArea from "../../components/students/learning/ContentArea";
import InteractiveDemoArea from "../../components/students/learning/InteractiveDemoArea";
import QuizArea from "../../components/students/learning/QuizArea";
import ExerciseArea from "../../components/students/learning/ExerciseArea";

export default function CourseLearningPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    learningIndexOpen,
    setLearningIndexOpen,
  } = useOutletContext();

  const {
    slug,
    sublessonId,
    demoId,
    exerciseId,
  } = useParams();

  /*
  |--------------------------------------------------------------------------
  | Current Learning Mode
  |--------------------------------------------------------------------------
  |
  | /learn/1                     = content
  | /learn/1/demo/2              = demo
  | /learn/1/quiz                = quiz
  | /learn/1/exercise/3          = exercise
  |
  */

  const currentMode =
    location.pathname.includes("/demo/")
      ? "demo"
      : location.pathname.includes(
            "/exercise/"
          )
        ? "exercise"
        : location.pathname.endsWith(
              "/quiz"
            )
          ? "quiz"
          : "content";

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [
    course,
    setCourse,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

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
  | Flatten Sublessons
  |--------------------------------------------------------------------------
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
  | Previous / Next Sublesson
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
  | Interactive Demo Availability
  |--------------------------------------------------------------------------
  */

  const demos =
    Array.isArray(
      currentSublesson?.interactive_demos
    )
      ? currentSublesson.interactive_demos
      : [];

  const hasDemo =
    demos.length > 0;

  const currentDemo =
    demos.find(
      (demo) =>
        String(demo.id) ===
        String(demoId)
    ) || null;

   console.log("URL sublessonId:", sublessonId);
console.log("URL demoId:", demoId);
console.log("Course:", course);
console.log("Lessons:", lessons);
console.log("All Sublessons:", allSublessons);
console.log("Current Index:", currentIndex);
console.log("Current Sublesson:", currentSublesson);
console.log("Interactive Demos:", demos);
console.log("Current Demo:", currentDemo);
  /*
  |--------------------------------------------------------------------------
  | Quiz Availability
  |--------------------------------------------------------------------------
  */

  const hasQuiz =
    Array.isArray(
      currentSublesson?.quizzes
    ) &&
    currentSublesson.quizzes.length >
      0;

  /*
  |--------------------------------------------------------------------------
  | Exercise Availability
  |--------------------------------------------------------------------------
  */

  const exercises =
    Array.isArray(
      currentSublesson?.exercises
    )
      ? currentSublesson.exercises
      : [];

  const hasExercise =
    exercises.length > 0;

  const currentExercise =
    exercises.find(
      (exercise) =>
        String(exercise.id) ===
        String(exerciseId)
    ) || null;

  /*
  |--------------------------------------------------------------------------
  | Expand Current Lesson
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
  | Go To Sublesson Content
  |--------------------------------------------------------------------------
  */

  const goToSublesson = (
    id
  ) => {
    navigate(
      `/courses/${slug}/learn/${id}`
    );

    setLearningIndexOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Go To Interactive Demo
  |--------------------------------------------------------------------------
  */

  const goToDemo = (
    sublessonId,
    demoId
  ) => {
    navigate(
      `/courses/${slug}/learn/${sublessonId}/demo/${demoId}`
    );

    setLearningIndexOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Go To Quiz
  |--------------------------------------------------------------------------
  */

  const goToQuiz = (
    id
  ) => {
    navigate(
      `/courses/${slug}/learn/${id}/quiz`
    );

    setLearningIndexOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Go To Exercise
  |--------------------------------------------------------------------------
  */

  const goToExercise = (
    sublessonId,
    exerciseId
  ) => {
    navigate(
      `/courses/${slug}/learn/${sublessonId}/exercise/${exerciseId}`
    );

    setLearningIndexOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Next Learning Item
  |--------------------------------------------------------------------------
  |
  | Learning sequence:
  |
  | Content
  |   -> Demo
  |   -> Quiz
  |   -> Exercise
  |   -> Next Sublesson
  |
  */

  const handleNext = () => {
    /*
    |--------------------------------------------------------------------------
    | Content -> Demo
    |--------------------------------------------------------------------------
    */

    if (
      currentMode === "content" &&
      hasDemo
    ) {
      goToDemo(
        currentSublesson.id,
        demos[0].id
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Content -> Quiz
    |--------------------------------------------------------------------------
    |
    | Used when there is no demo.
    |
    */

    if (
      currentMode === "content" &&
      !hasDemo &&
      hasQuiz
    ) {
      goToQuiz(
        currentSublesson.id
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Content -> Exercise
    |--------------------------------------------------------------------------
    |
    | Used when there is no demo or quiz.
    |
    */

    if (
      currentMode === "content" &&
      !hasDemo &&
      !hasQuiz &&
      hasExercise
    ) {
      goToExercise(
        currentSublesson.id,
        exercises[0].id
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Demo -> Quiz
    |--------------------------------------------------------------------------
    */

    if (
      currentMode === "demo" &&
      hasQuiz
    ) {
      goToQuiz(
        currentSublesson.id
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Demo -> Exercise
    |--------------------------------------------------------------------------
    |
    | Used when there is no quiz.
    |
    */

    if (
      currentMode === "demo" &&
      !hasQuiz &&
      hasExercise
    ) {
      goToExercise(
        currentSublesson.id,
        exercises[0].id
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Quiz -> Exercise
    |--------------------------------------------------------------------------
    */

    if (
      currentMode === "quiz" &&
      hasExercise
    ) {
      goToExercise(
        currentSublesson.id,
        exercises[0].id
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Otherwise -> Next Sublesson
    |--------------------------------------------------------------------------
    */

    if (nextSublesson) {
      goToSublesson(
        nextSublesson.id
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Course Finished -> Course Detail
    |--------------------------------------------------------------------------
    */

    navigate(
      `/courses/${slug}`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Previous Learning Item
  |--------------------------------------------------------------------------
  |
  | Reverse sequence:
  |
  | Exercise
  |   -> Quiz
  |   -> Demo
  |   -> Content
  |
  | Quiz
  |   -> Demo
  |   -> Content
  |
  | Demo
  |   -> Content
  |
  */

  const handlePrevious = () => {
    /*
    |--------------------------------------------------------------------------
    | Exercise -> Quiz / Demo / Content
    |--------------------------------------------------------------------------
    */

    if (
      currentMode === "exercise"
    ) {
      if (hasQuiz) {
        goToQuiz(
          currentSublesson.id
        );

        return;
      }

      if (hasDemo) {
        goToDemo(
          currentSublesson.id,
          demos[0].id
        );

        return;
      }

      goToSublesson(
        currentSublesson.id
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Quiz -> Demo / Content
    |--------------------------------------------------------------------------
    */

    if (
      currentMode === "quiz"
    ) {
      if (hasDemo) {
        goToDemo(
          currentSublesson.id,
          demos[0].id
        );

        return;
      }

      goToSublesson(
        currentSublesson.id
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Demo -> Content
    |--------------------------------------------------------------------------
    */

    if (
      currentMode === "demo"
    ) {
      goToSublesson(
        currentSublesson.id
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Content -> Previous Sublesson
    |--------------------------------------------------------------------------
    */

    if (previousSublesson) {
      /*
      |--------------------------------------------------------------------------
      | Previous Sublesson Activities
      |--------------------------------------------------------------------------
      |
      | We want to go to the LAST learning
      | item of the previous sublesson.
      |
      | Priority:
      | Exercise -> Quiz -> Demo -> Content
      |
      */

      const previousExercises =
        Array.isArray(
          previousSublesson.exercises
        )
          ? previousSublesson.exercises
          : [];

      const previousHasExercise =
        previousExercises.length > 0;

      if (previousHasExercise) {
        const lastExercise =
          previousExercises[
            previousExercises.length - 1
          ];

        goToExercise(
          previousSublesson.id,
          lastExercise.id
        );

        return;
      }

      const previousHasQuiz =
        Array.isArray(
          previousSublesson.quizzes
        ) &&
        previousSublesson.quizzes
          .length > 0;

      if (previousHasQuiz) {
        goToQuiz(
          previousSublesson.id
        );

        return;
      }

      const previousDemos =
        Array.isArray(
          previousSublesson.interactive_demos
        )
          ? previousSublesson.interactive_demos
          : [];

      if (
        previousDemos.length > 0
      ) {
        const lastDemo =
          previousDemos[
            previousDemos.length - 1
          ];

        goToDemo(
          previousSublesson.id,
          lastDemo.id
        );

        return;
      }

      goToSublesson(
        previousSublesson.id
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Previous Button Available?
  |--------------------------------------------------------------------------
  */

  const hasPreviousItem =
    currentMode === "demo" ||
    currentMode === "quiz" ||
    currentMode === "exercise" ||
    previousSublesson !== null;

  /*
  |--------------------------------------------------------------------------
  | Previous Button Label
  |--------------------------------------------------------------------------
  */

  const previousButtonLabel = (() => {
    if (
      currentMode === "demo"
    ) {
      return "Back to Content";
    }

    if (
      currentMode === "quiz"
    ) {
      return hasDemo
        ? "Back to Demo"
        : "Back to Content";
    }

    if (
      currentMode === "exercise"
    ) {
      if (hasQuiz) {
        return "Back to Quiz";
      }

      if (hasDemo) {
        return "Back to Demo";
      }

      return "Back to Content";
    }

    return "Previous";
  })();

  /*
  |--------------------------------------------------------------------------
  | Next Button Label
  |--------------------------------------------------------------------------
  */

  const nextButtonLabel = (() => {
    if (
      currentMode === "content" &&
      hasDemo
    ) {
      return "Next: Demo";
    }

    if (
      currentMode === "content" &&
      !hasDemo &&
      hasQuiz
    ) {
      return "Next: Quiz";
    }

    if (
      currentMode === "content" &&
      !hasDemo &&
      !hasQuiz &&
      hasExercise
    ) {
      return "Next: Exercise";
    }

    if (
      currentMode === "demo" &&
      hasQuiz
    ) {
      return "Next: Quiz";
    }

    if (
      currentMode === "demo" &&
      !hasQuiz &&
      hasExercise
    ) {
      return "Next: Exercise";
    }

    if (
      currentMode === "quiz" &&
      hasExercise
    ) {
      return "Next: Exercise";
    }

    if (nextSublesson) {
      return "Next Sublesson";
    }

    return "Course Detail";
  })();

  /*
  |--------------------------------------------------------------------------
  | Is Next Activity?
  |--------------------------------------------------------------------------
  */

  const hasNextActivity =
    (currentMode === "content" &&
      (
        hasDemo ||
        hasQuiz ||
        hasExercise
      )) ||
    (currentMode === "demo" &&
      (
        hasQuiz ||
        hasExercise
      )) ||
    (currentMode === "quiz" &&
      hasExercise);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
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
  | Invalid Demo
  |--------------------------------------------------------------------------
  */

  if (
    currentMode === "demo" &&
    !currentDemo
  ) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl p-6 lg:p-10">
          <button
            type="button"
            onClick={() =>
              goToSublesson(
                currentSublesson.id
              )
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0B1F3A]"
          >
            <ArrowLeft
              size={17}
            />

            Back to Sublesson
          </button>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-8">
            <h1 className="text-xl font-bold text-[#0B1F3A]">
              Interactive demo not available
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              This interactive demo could not
              be found or is not currently
              published.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Invalid Quiz
  |--------------------------------------------------------------------------
  */

  if (
    currentMode === "quiz" &&
    !hasQuiz
  ) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl p-6 lg:p-10">
          <button
            type="button"
            onClick={() =>
              goToSublesson(
                currentSublesson.id
              )
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0B1F3A]"
          >
            <ArrowLeft
              size={17}
            />

            Back to Sublesson
          </button>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-8">
            <h1 className="text-xl font-bold text-[#0B1F3A]">
              Quiz not available
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              There is no published quiz
              for this sublesson.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Invalid Exercise
  |--------------------------------------------------------------------------
  */

  if (
    currentMode === "exercise" &&
    !currentExercise
  ) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl p-6 lg:p-10">
          <button
            type="button"
            onClick={() =>
              goToSublesson(
                currentSublesson.id
              )
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0B1F3A]"
          >
            <ArrowLeft
              size={17}
            />

            Back to Sublesson
          </button>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-8">
            <h1 className="text-xl font-bold text-[#0B1F3A]">
              Exercise not available
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              This exercise could not be
              found or is not currently
              published.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      <main className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-slate-50">

        {/* Main Learning Area */}

        <div
          className={`min-h-0 flex-1 ${
            currentMode === "exercise" ||
            currentMode === "demo"
              ? "overflow-hidden"
              : "overflow-y-auto"
          }`}
        >
          {/* Content */}

          {currentMode === "content" && (
            <div className="mx-auto max-w-4xl px-5 py-8 lg:px-10 lg:py-10">
              <ContentArea
                sublesson={
                  currentSublesson
                }
              />
            </div>
          )}

          {/* Interactive Demo */}

          {currentMode === "demo" && (
            <div className="h-full min-h-0">
              <InteractiveDemoArea
                demo={currentDemo}
              />
            </div>
          )}

          {/* Quiz */}

          {currentMode === "quiz" && (
            <div className="mx-auto max-w-4xl px-5 py-8 lg:px-10 lg:py-10">
              <QuizArea
                sublesson={
                  currentSublesson
                }
              />
            </div>
          )}

          {/* Exercise */}

          {currentMode === "exercise" && (
            <div className="h-full min-h-0">
              <ExerciseArea
                exercise={
                  currentExercise
                }
              />
            </div>
          )}
        </div>

        {/* Fixed Previous / Next footer */}

        <div className="z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 shadow-[0_-4px_12px_rgba(15,23,42,0.04)] lg:px-6">
          <div>
            {hasPreviousItem && (
              <button
                type="button"
                onClick={
                  handlePrevious
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1F3A] transition hover:bg-slate-50"
              >
                <ChevronLeft
                  size={18}
                />

                <span className="hidden sm:inline">
                  {
                    previousButtonLabel
                  }
                </span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition ${
              hasNextActivity
                ? "bg-[#F4C95D] text-[#0B1F3A] hover:bg-[#e8bc4f]"
                : "bg-[#0B1F3A] text-white hover:bg-[#102b4f]"
            }`}
          >
            <span className="hidden sm:inline">
              {nextButtonLabel}
            </span>

            {nextSublesson ||
            hasNextActivity ? (
              <ChevronRight
                size={18}
              />
            ) : (
              <ArrowRight
                size={17}
              />
            )}
          </button>
        </div>
      </main>

      {/* Course Index overlay - hidden by default */}

      {learningIndexOpen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40">
          <button
            type="button"
            aria-label="Close course index"
            onClick={() =>
              setLearningIndexOpen(
                false
              )
            }
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]"
          />

          <aside className="absolute inset-y-0 left-0 flex w-[88%] max-w-[340px] flex-col border-r border-slate-200 bg-white shadow-2xl sm:w-[340px]">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4">
              <p className="text-sm font-bold text-[#0B1F3A]">
                Course Index
              </p>

              <button
                type="button"
                onClick={() =>
                  setLearningIndexOpen(
                    false
                  )
                }
                aria-label="Close course index"
                title="Close course index"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0B1F3A]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="shrink-0 border-b border-slate-200 px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  setLearningIndexOpen(
                    false
                  );

                  navigate(
                    `/courses/${slug}`
                  );
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0B1F3A]"
              >
                <ArrowLeft
                  size={17}
                />

                Course Detail
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <CourseIndex
                course={course}
                lessons={lessons}
                currentSublessonId={
                  sublessonId
                }
                currentMode={
                  currentMode
                }
                expandedLessons={
                  expandedLessons
                }
                toggleLesson={
                  toggleLesson
                }
                goToSublesson={
                  goToSublesson
                }
                goToDemo={
                  goToDemo
                }
                goToQuiz={
                  goToQuiz
                }
                goToExercise={
                  goToExercise
                }
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}