import { useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  Brain,
  Code2,
  Layers3,
  Loader2,
  MonitorPlay,
  Save,
} from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const SUBLESSON_TYPES = [
  {
    value: "content",
    label: "Content",
    description:
      "Teaching content, explanations, examples and notes.",
    icon: BookOpen,
  },
  {
    value: "interactive_demo",
    label: "Interactive Demo",
    description:
      "An interactive visual demonstration students can explore.",
    icon: MonitorPlay,
  },
  {
    value: "exercise",
    label: "Exercise",
    description:
      "A coding, SQL, terminal or project-based exercise.",
    icon: Code2,
  },
  {
    value: "quiz",
    label: "Quiz",
    description:
      "Questions that test the student's understanding.",
    icon: Brain,
  },
  {
    value: "flashcard",
    label: "Flashcard",
    description:
      "Flashcards for revision and remembering key concepts.",
    icon: Layers3,
  },
];

const CreateSublessonPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [
    sublessonType,
    setSublessonType,
  ] = useState("content");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

const handleSubmit = async (event) => {
  event.preventDefault();

  if (!title.trim()) {
    setError("Sublesson title is required.");
    return;
  }

  try {
    setSaving(true);
    setError("");

    const response = await axiosInstance.post(
      `/api/teacher/lessons/${lessonId}/sublessons`,
      {
        title: title.trim(),
        description: description.trim() || null,
        sublesson_type: sublessonType,
      }
    );

    const newSublesson =
      response.data?.data;

    if (!newSublesson?.id) {
      throw new Error(
        "Created sublesson ID was not returned."
      );
    }

    const newSublessonId =
      newSublesson.id;

    switch (sublessonType) {
      case "content":
        navigate(
          `/teacher/lessons/${lessonId}/sublessons/${newSublessonId}`,
          { replace: true }
        );
        break;

      case "interactive_demo":
        navigate(
          `/teacher/lessons/${lessonId}/sublessons/${newSublessonId}/demos/create`,
          { replace: true }
        );
        break;

      case "exercise":
        navigate(
          `/teacher/lessons/${lessonId}/sublessons/${newSublessonId}/exercises/create`,
          { replace: true }
        );
        break;

      case "quiz":
        navigate(
          `/teacher/lessons/${lessonId}/sublessons/${newSublessonId}/quizzes/create`,
          { replace: true }
        );
        break;

      case "flashcard":
        navigate(
          `/teacher/lessons/${lessonId}/sublessons/${newSublessonId}/flashcards/create`,
          { replace: true }
        );
        break;

      default:
        navigate(
          `/teacher/lessons/${lessonId}/sublessons/${newSublessonId}`,
          { replace: true }
        );
    }
  } catch (err) {
    console.error(
      "Failed to create sublesson:",
      err
    );

    const validationErrors =
      err.response?.data?.errors;

    const firstValidationError =
      validationErrors
        ? Object.values(
            validationErrors
          )?.[0]?.[0]
        : null;

    setError(
      firstValidationError ||
        err.response?.data?.message ||
        err.message ||
        "Failed to create sublesson."
    );
  } finally {
    setSaving(false);
  }
};

  return (
    <TeacherLayout>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          {/* Back */}

          <button
            type="button"
            onClick={() =>
              navigate(
                `/teacher/lessons/${lessonId}`
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Lesson
          </button>

          {/* Header */}

          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <BookOpen className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Create Sublesson
                </h1>

                <p className="mt-1 text-gray-500">
                  Add a new learning
                  activity to this lesson.
                </p>
              </div>
            </div>
          </div>

          {/* Error */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            {/* Title */}

            <div className="mb-6">
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Sublesson Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="e.g. Understanding State with a Counter"
                disabled={saving}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>

            {/* Sublesson Type */}

            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Sublesson Type
              </label>

              <p className="mb-4 text-sm text-gray-500">
                Choose the type of
                learning activity students
                will complete.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {SUBLESSON_TYPES.map(
                  (type) => {
                    const Icon =
                      type.icon;

                    const selected =
                      sublessonType ===
                      type.value;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          setSublessonType(
                            type.value
                          )
                        }
                        className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <div
                          className={`rounded-lg p-2 ${
                            selected
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <div
                            className={`font-semibold ${
                              selected
                                ? "text-blue-700"
                                : "text-gray-900"
                            }`}
                          >
                            {type.label}
                          </div>

                          <p className="mt-1 text-xs leading-5 text-gray-500">
                            {
                              type.description
                            }
                          </p>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Description */}

            <div className="mb-8">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Briefly describe what students will learn in this sublesson..."
                rows={6}
                disabled={saving}
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />

              <p className="mt-2 text-xs text-gray-400">
                Description is optional.
              </p>
            </div>

            {/* Actions */}

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/teacher/lessons/${lessonId}`
                  )
                }
                disabled={saving}
                className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Create Sublesson
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default CreateSublessonPage;