import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  Brain,
  Code2,
  Edit3,
  Layers3,
  Loader2,
  MonitorPlay,
  Plus,
} from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

/*
|--------------------------------------------------------------------------
| Sublesson Type Configuration
|--------------------------------------------------------------------------
*/

const SUBLESSON_TYPE_CONFIG = {
  content: {
    label: "Content",
    icon: BookOpen,
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
  },

  interactive_demo: {
    label: "Interactive Demo",
    icon: MonitorPlay,
    className:
      "border-purple-200 bg-purple-50 text-purple-700",
  },

  exercise: {
    label: "Exercise",
    icon: Code2,
    className:
      "border-cyan-200 bg-cyan-50 text-cyan-700",
  },

  quiz: {
    label: "Quiz",
    icon: Brain,
    className:
      "border-orange-200 bg-orange-50 text-orange-700",
  },

  flashcard: {
    label: "Flashcard",
    icon: Layers3,
    className:
      "border-pink-200 bg-pink-50 text-pink-700",
  },
};

const LessonDetailPage = () => {
  const { lessonId } = useParams();

  const navigate = useNavigate();

  const [lesson, setLesson] =
    useState(null);

  const [sublessons, setSublessons] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [editingId, setEditingId] =
    useState(null);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Lesson + Sublessons
  |--------------------------------------------------------------------------
  */

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        lessonResponse,
        sublessonResponse,
      ] = await Promise.all([
        axiosInstance.get(
          `/api/teacher/lessons/${lessonId}`
        ),

        axiosInstance.get(
          `/api/teacher/lessons/${lessonId}/sublessons`
        ),
      ]);

      setLesson(
        lessonResponse.data?.data ||
          null
      );

      setSublessons(
        Array.isArray(
          sublessonResponse.data?.data
        )
          ? sublessonResponse.data.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load lesson:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to load lesson."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, [lessonId]);

  /*
  |--------------------------------------------------------------------------
  | Sublesson Type
  |--------------------------------------------------------------------------
  */

  const getTypeConfig = (
    sublessonType
  ) => {
    return (
      SUBLESSON_TYPE_CONFIG[
        sublessonType
      ] ||
      SUBLESSON_TYPE_CONFIG.content
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Create Activity
  |--------------------------------------------------------------------------
  |
  | Each learning activity now starts directly
  | from the Lesson Detail page.
  |
  | The destination create page will be responsible
  | for creating:
  |
  | 1. The parent Sublesson
  | 2. The activity-specific child record
  |
  */

  const handleCreateActivity = (
    activityType
  ) => {
    setError("");

    switch (activityType) {
      /*
      |--------------------------------------------------------------------------
      | Content
      |--------------------------------------------------------------------------
      */

      case "content":
        navigate(
          `/teacher/lessons/${lessonId}/content/create`
        );
        break;

      /*
      |--------------------------------------------------------------------------
      | Interactive Demo
      |--------------------------------------------------------------------------
      */

      case "interactive_demo":
        navigate(
          `/teacher/lessons/${lessonId}/interactive-demo/create`
        );
        break;

      /*
      |--------------------------------------------------------------------------
      | Exercise
      |--------------------------------------------------------------------------
      */

      case "exercise":
        navigate(
          `/teacher/lessons/${lessonId}/exercise/create`
        );
        break;

      /*
      |--------------------------------------------------------------------------
      | Quiz
      |--------------------------------------------------------------------------
      */

      case "quiz":
        navigate(
          `/teacher/lessons/${lessonId}/quiz/create`
        );
        break;

      /*
      |--------------------------------------------------------------------------
      | Flashcard
      |--------------------------------------------------------------------------
      */

      case "flashcard":
        navigate(
          `/teacher/lessons/${lessonId}/flashcard/create`
        );
        break;

      default:
        setError(
          "Unknown learning activity type."
        );
        break;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Edit Existing Activity
  |--------------------------------------------------------------------------
  */

  const handleEditSublesson = async (
    sublesson
  ) => {
    const sublessonId =
      sublesson.id;

    try {
      setEditingId(sublessonId);
      setError("");

      switch (
        sublesson.sublesson_type
      ) {
        /*
        |--------------------------------------------------------------------------
        | Content
        |--------------------------------------------------------------------------
        |
        | A Content Sublesson contains its actual
        | learning material in sublesson_contents.
        |
        | Load the child Content record first so
        | CreateSublessonContentPage can open directly
        | in edit mode.
        |
        */

        case "content": {
          const response =
            await axiosInstance.get(
              `/api/teacher/sublessons/${sublessonId}/contents`
            );

          const contents =
            Array.isArray(
              response.data?.data
            )
              ? response.data.data
              : [];

          if (contents.length === 0) {
            setError(
              `No content was found for "${sublesson.title}".`
            );

            return;
          }

          const content =
            contents[0];

          navigate(
            `/teacher/lessons/${lessonId}/sublessons/${sublessonId}/contents/${content.id}/edit`
          );

          break;
        }

        /*
        |--------------------------------------------------------------------------
        | Interactive Demo
        |--------------------------------------------------------------------------
        */

        case "interactive_demo":
          navigate(
            `/teacher/lessons/${lessonId}/sublessons/${sublessonId}/demos`
          );
          break;

        /*
        |--------------------------------------------------------------------------
        | Exercise
        |--------------------------------------------------------------------------
        */

        case "exercise":
          navigate(
            `/teacher/lessons/${lessonId}/sublessons/${sublessonId}/exercises`
          );
          break;

        /*
        |--------------------------------------------------------------------------
        | Quiz
        |--------------------------------------------------------------------------
        */

        case "quiz":
          navigate(
            `/teacher/lessons/${lessonId}/sublessons/${sublessonId}/quizzes`
          );
          break;

        /*
        |--------------------------------------------------------------------------
        | Flashcard
        |--------------------------------------------------------------------------
        */

        case "flashcard":
          navigate(
            `/teacher/lessons/${lessonId}/sublessons/${sublessonId}/flashcards`
          );
          break;

        default:
          setError(
            "Unknown learning activity type."
          );
          break;
      }
    } catch (err) {
      console.error(
        "Failed to open learning activity:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to open learning activity."
      );
    } finally {
      setEditingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Back
  |--------------------------------------------------------------------------
  */

  const handleBack = () => {
    navigate(
      `/teacher/courses/${lesson.course_id}`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </TeacherLayout>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Lesson Not Found
  |--------------------------------------------------------------------------
  */

  if (!lesson) {
    return (
      <TeacherLayout>
        <div className="p-8">

          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Lesson not found.
          </div>

        </div>
      </TeacherLayout>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <TeacherLayout>
      <div className="p-6 lg:p-8">

        <div className="mx-auto max-w-6xl">

          {/* Back */}
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Course
          </button>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/*
          |--------------------------------------------------------------------------
          | Lesson Header
          |--------------------------------------------------------------------------
          */}

          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex items-start gap-4">

              <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-blue-600">
                <BookOpen className="h-6 w-6" />
              </div>

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-3xl font-bold text-gray-900">
                    {lesson.title}
                  </h1>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      lesson.status ===
                      "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {lesson.status}
                  </span>

                </div>

                {lesson.description && (
                  <p className="mt-3 max-w-3xl leading-6 text-gray-600">
                    {lesson.description}
                  </p>
                )}

                <p className="mt-3 text-xs text-gray-400">
                  Lesson ID: {lesson.id}
                </p>

              </div>

            </div>

          </div>

          {/*
          |--------------------------------------------------------------------------
          | Add Learning Activity
          |--------------------------------------------------------------------------
          */}

          <div className="mb-8">

            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Add Learning Activity
            </h2>

            <div className="flex flex-wrap gap-3">

              {/* Content */}
              <button
                type="button"
                onClick={() =>
                  handleCreateActivity(
                    "content"
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />

                Content
              </button>

              {/* Interactive Demo */}
              <button
                type="button"
                onClick={() =>
                  handleCreateActivity(
                    "interactive_demo"
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
              >
                <Plus className="h-4 w-4" />

                Interactive Demo
              </button>

              {/* Exercise */}
              <button
                type="button"
                onClick={() =>
                  handleCreateActivity(
                    "exercise"
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
              >
                <Plus className="h-4 w-4" />

                Exercise
              </button>

              {/* Quiz */}
              <button
                type="button"
                onClick={() =>
                  handleCreateActivity(
                    "quiz"
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
              >
                <Plus className="h-4 w-4" />

                Quiz
              </button>

              {/* Flashcard */}
              <button
                type="button"
                onClick={() =>
                  handleCreateActivity(
                    "flashcard"
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-pink-200 bg-pink-50 px-4 py-2.5 text-sm font-semibold text-pink-700 transition hover:bg-pink-100"
              >
                <Plus className="h-4 w-4" />

                Flashcard
              </button>

            </div>

          </div>

          {/*
          |--------------------------------------------------------------------------
          | Learning Activities Header
          |--------------------------------------------------------------------------
          */}

          <div className="mb-5">

            <h2 className="text-2xl font-bold text-gray-900">
              Learning Activities
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {sublessons.length}{" "}
              {sublessons.length === 1
                ? "activity"
                : "activities"}{" "}
              in this lesson
            </p>

          </div>

          {/*
          |--------------------------------------------------------------------------
          | Empty State
          |--------------------------------------------------------------------------
          */}

          {sublessons.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

              <BookOpen className="mx-auto h-8 w-8 text-gray-400" />

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No learning activities yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Use one of the buttons above to
                create the first activity.
              </p>

            </div>

          ) : (

            /*
            |--------------------------------------------------------------------------
            | Activity List
            |--------------------------------------------------------------------------
            */

            <div className="space-y-4">

              {sublessons.map(
                (
                  sublesson,
                  index
                ) => {
                  const typeConfig =
                    getTypeConfig(
                      sublesson.sublesson_type
                    );

                  const TypeIcon =
                    typeConfig.icon;

                  const isPublished =
                    sublesson.status ===
                    "published";

                  const isOpening =
                    editingId ===
                    sublesson.id;

                  return (
                    <div
                      key={sublesson.id}
                      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                    >

                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        {/* Activity Information */}
                        <div className="flex min-w-0 items-start gap-4">

                          {/* Number */}
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 font-bold text-gray-600">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </div>

                          <div className="min-w-0">

                            {/* Title */}
                            <h3 className="text-lg font-semibold text-gray-900">
                              {sublesson.title}
                            </h3>

                            {/* Badges */}
                            <div className="mt-2 flex flex-wrap items-center gap-2">

                              {/* Type */}
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${typeConfig.className}`}
                              >
                                <TypeIcon className="h-3.5 w-3.5" />

                                {typeConfig.label}
                              </span>

                              {/* Status */}
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  isPublished
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {isPublished
                                  ? "Published"
                                  : "Draft"}
                              </span>

                            </div>

                            {/* Description */}
                            {sublesson.description && (
                              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
                                {sublesson.description}
                              </p>
                            )}

                            <p className="mt-2 text-xs text-gray-400">
                              Order:{" "}
                              {sublesson.sort_order}
                            </p>

                          </div>

                        </div>

                        {/* Edit */}
                        <button
                          type="button"
                          disabled={isOpening}
                          onClick={() =>
                            handleEditSublesson(
                              sublesson
                            )
                          }
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                          {isOpening ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />

                              Opening...
                            </>
                          ) : (
                            <>
                              <Edit3 className="h-4 w-4" />

                              Edit
                            </>
                          )}

                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

      </div>
    </TeacherLayout>
  );
};

export default LessonDetailPage;