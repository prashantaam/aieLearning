import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
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
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../utils/axiosInstance";

import LearningHeader from "../../components/layout/LearningHeader";
import CourseIndex from "../../components/students/learning/CourseIndex";
import ContentArea from "../../components/students/learning/ContentArea";
import QuizArea from "../../components/students/learning/QuizArea";
import ExerciseArea from "../../components/students/learning/ExerciseArea";

export default function CourseLearningPage() {
  const navigate = useNavigate();
  const location = useLocation();

 const {
  slug,
  sublessonId,
  exerciseId,
} = useParams();
  /*
  |--------------------------------------------------------------------------
  | Current Learning Mode
  |--------------------------------------------------------------------------
  |
  | /learn/1       = content
  | /learn/1/quiz  = quiz
  |
  */

  const currentMode =
  location.pathname.includes(
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
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    expandedLessons,
    setExpandedLessons,
  ] = useState({});

  const [
    mobileIndexOpen,
    setMobileIndexOpen,
  ] = useState(false);

  const [
    indexOpen,
    setIndexOpen,
  ] = useState(true);


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

    setMobileIndexOpen(false);

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

    setMobileIndexOpen(false);

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

  setMobileIndexOpen(false);

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
  | Content:
  |   if quiz exists -> Quiz
  |   otherwise      -> Next Sublesson
  |
  | Quiz:
  |   -> Next Sublesson
  |
  */

    const handleNext = () => {
    /*
    * Content -> Quiz
    */
    if (
        currentMode === "content" &&
        hasQuiz
    ) {
        goToQuiz(
        currentSublesson.id
        );

        return;
    }

    /*
    * Content -> Exercise
    *
    * Used when there is no quiz.
    */
    if (
        currentMode === "content" &&
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
    * Quiz -> Exercise
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
    * Otherwise -> Next Sublesson
    */
    if (nextSublesson) {
        goToSublesson(
        nextSublesson.id
        );

        return;
    }

    navigate(
        `/courses/${slug}`
    );
    };


  /*
  |--------------------------------------------------------------------------
  | Previous Learning Item
  |--------------------------------------------------------------------------
  |
  | Quiz:
  |   -> Current Sublesson Content
  |
  | Content:
  |   -> Previous Sublesson
  |
  */

  const handlePrevious = () => {
    if (
    currentMode === "exercise"
    ) {
    if (hasQuiz) {
        goToQuiz(
        currentSublesson.id
        );
    } else {
        goToSublesson(
        currentSublesson.id
        );
    }

    return;
    }
    
    if (
      currentMode === "quiz"
    ) {
      goToSublesson(
        currentSublesson.id
      );

      return;
    }

    if (previousSublesson) {
      /*
       * If previous sublesson has a quiz,
       * go to its quiz because that is the
       * learning item immediately before
       * this content.
       */

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

      goToSublesson(
        previousSublesson.id
      );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Course Index Toggle
  |--------------------------------------------------------------------------
  */

  const handleIndexToggle = () => {
    if (
      window.innerWidth >= 1024
    ) {
      setIndexOpen(
        (previous) =>
          !previous
      );

      return;
    }

    setMobileIndexOpen(true);
  };


  /*
  |--------------------------------------------------------------------------
  | Previous Button Available?
  |--------------------------------------------------------------------------
  */

const hasPreviousItem =
  currentMode === "quiz" ||
  currentMode === "exercise" ||
  previousSublesson !== null;
  /*
  |--------------------------------------------------------------------------
  | Next Button Label
  |--------------------------------------------------------------------------
  */
const nextButtonLabel = (() => {
  if (
    currentMode === "content" &&
    hasQuiz
  ) {
    return "Next: Quiz";
  }

  if (
    currentMode === "content" &&
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
  | Invalid Quiz
  |--------------------------------------------------------------------------
  */

  if (
    currentMode === "quiz" &&
    !hasQuiz
  ) {
    return (
      <div className="min-h-screen bg-slate-50">

        <LearningHeader />

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
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <LearningHeader />


      {/* Learning Toolbar */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white">

        <div className="flex h-16 items-center gap-3 px-4 lg:px-6">

          {/* Course Index Toggle */}
          <button
            type="button"
            onClick={
              handleIndexToggle
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-[#0B1F3A] transition hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>


          {/* Course Detail */}
          <button
            type="button"
            onClick={() =>
              navigate(
                `/courses/${slug}`
              )
            }
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#0B1F3A]"
          >
            <ArrowLeft
              size={17}
            />

            <span className="hidden sm:inline">
              Course Detail
            </span>
          </button>


          <div className="hidden h-6 w-px bg-slate-200 sm:block" />


          {/* Current Learning Item */}
          <div className="min-w-0 flex-1">

            <h1 className="truncate text-sm font-bold text-[#0B1F3A] sm:text-base">

              {currentSublesson.lessonIndex +
                1}

              .

              {currentSublesson.sublessonIndex +
                1}

              {" "}

              {
                currentSublesson.title
              }

              {currentMode ===
                "quiz" && (
                <span className="text-[#B8860B]">
                  {" "}— Quiz
                </span>
              )}

            </h1>

          </div>

        </div>

      </div>


      {/* Workspace */}
      <div className="flex min-w-0">

        {/* Desktop Course Index */}
        {indexOpen && (

          <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-white lg:block">

            <div className="sticky top-32 h-[calc(100vh-8rem)] overflow-y-auto">

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
                goToQuiz={
                  goToQuiz
                }

                goToExercise={
                  goToExercise
                }
              />

            </div>

          </aside>

        )}


        {/* Main Area */}
        <main className="min-w-0 flex-1">

          <div
            className={`mx-auto px-5 py-8 lg:px-10 lg:py-10 ${
              indexOpen
                ? "max-w-5xl"
                : "max-w-6xl"
            }`}
          >

            <div  className={
                currentMode === "exercise"
                ? "mx-auto max-w-6xl"
                : "mx-auto max-w-4xl"
            }>

              {/* CONTENT MODE */}
              {currentMode ===
                "content" && (

                <ContentArea
                  sublesson={
                    currentSublesson
                  }
                />

              )}


              {/* QUIZ MODE */}
              {currentMode ===
                "quiz" && (

                <QuizArea
                  sublesson={
                    currentSublesson
                  }
                />

              )}

              {/* EXERCISE MODE */}
            {currentMode === "exercise" && (
            <ExerciseArea
                exercise={
                currentExercise
                }
            />
            )}

              {/* Navigation */}
              <div className="mt-12 flex items-center justify-between gap-4 border-t border-slate-200 pt-6">

                {/* Previous */}
                <div>

                  {hasPreviousItem && (

                    <button
                      type="button"
                      onClick={
                        handlePrevious
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#0B1F3A] transition hover:bg-slate-50"
                    >
                      <ChevronLeft
                        size={18}
                      />

                      {currentMode ===
                      "quiz"
                        ? "Back to Content"
                        : "Previous"}
                    </button>

                  )}

                </div>


                {/* Next */}
                <button
                  type="button"
                  onClick={
                    handleNext
                  }
                  className={`inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition ${
                    currentMode ===
                      "content" &&
                    hasQuiz
                      ? "bg-[#F4C95D] text-[#0B1F3A] hover:bg-[#e8bc4f]"
                      : "bg-[#0B1F3A] text-white hover:bg-[#102b4f]"
                  }`}
                >
                  {
                    nextButtonLabel
                  }

                  {nextSublesson ||
                  (currentMode ===
                    "content" &&
                    hasQuiz) ? (
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


          {/* Drawer */}
          <aside className="absolute inset-y-0 left-0 w-[88%] max-w-sm overflow-y-auto bg-white shadow-xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4">

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
              goToQuiz={
                goToQuiz
              }
            />

          </aside>

        </div>

      )}

    </div>
  );
}