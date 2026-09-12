import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CirclePlus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const LessonCreatePage = () => {
  const { courseId } = useParams();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const initialMode =
    searchParams.get("mode") === "ai"
      ? "ai"
      : "manual";

  const [mode, setMode] = useState(initialMode);

  const [course, setCourse] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const [generatedLessons, setGeneratedLessons] =
    useState([]);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  /*
  |--------------------------------------------------------------------------
  | Load Course
  |--------------------------------------------------------------------------
  */

  const fetchCourse = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `/api/teacher/courses/${courseId}`
      );

      setCourse(response.data?.data || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load course."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Manual Form
  |--------------------------------------------------------------------------
  */

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Create One Lesson
  |--------------------------------------------------------------------------
  */

  const handleCreateLesson = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Lesson title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await axiosInstance.post(
        `/api/teacher/courses/${courseId}`,
        {
          title: form.title.trim(),
          description:
            form.description.trim() || null,
        }
      );

      navigate(
        `/teacher/courses/${courseId}`
      );
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(
          Object.values(
            err.response.data.errors
          )
            .flat()
            .join(" ")
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to create lesson."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Generate Lessons with AI
  |--------------------------------------------------------------------------
  */

  const handleGenerateLessons = async () => {
    if (!course) {
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setSuccess("");
      setGeneratedLessons([]);

      const response = await axiosInstance.post(
        "/api/teacher/ai/generate-course-lessons",
        {
          courseId: course.id,
          title: course.title,
          description: course.description || "",
        }
      );

      const lessons =
        response.data?.data?.lessons ||
        response.data?.lessons ||
        [];

      if (
        !Array.isArray(lessons) ||
        lessons.length === 0
      ) {
        throw new Error(
          "AI did not return any lesson suggestions."
        );
      }

      setGeneratedLessons(
        lessons.map((lesson, index) => ({
          tempId: `${Date.now()}-${index}`,
          title: lesson.title || "",
          description:
            lesson.description || "",
        }))
      );

      setSuccess(
        "AI generated the lesson structure. Review it before saving."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to generate lessons."
      );
    } finally {
      setGenerating(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Edit Generated Lesson
  |--------------------------------------------------------------------------
  */

  const updateGeneratedLesson = (
    tempId,
    field,
    value
  ) => {
    setGeneratedLessons((current) =>
      current.map((lesson) =>
        lesson.tempId === tempId
          ? {
              ...lesson,
              [field]: value,
            }
          : lesson
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Remove Generated Lesson
  |--------------------------------------------------------------------------
  */

  const removeGeneratedLesson = (tempId) => {
    setGeneratedLessons((current) =>
      current.filter(
        (lesson) =>
          lesson.tempId !== tempId
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Save AI Lessons
  |--------------------------------------------------------------------------
  */

  const handleSaveGeneratedLessons = async () => {
    const validLessons =
      generatedLessons.filter((lesson) =>
        lesson.title.trim()
      );

    if (validLessons.length === 0) {
      setError(
        "Please keep at least one lesson before saving."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      for (const lesson of validLessons) {
        await axiosInstance.post(
          `/api/teacher/courses/${courseId}/lessons`,
          {
            title: lesson.title.trim(),

            description:
              lesson.description.trim() ||
              null,
          }
        );
      }

      navigate(
        `/teacher/courses/${courseId}`
      );
    } catch (err) {
      console.error("Full error:", err);
  console.error("Laravel response:", err.response?.data);

      setError(
        err.response?.data?.message ||
          "Failed to save generated lessons."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="p-6 lg:p-8">
          Loading course...
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="p-6 lg:p-8">

        <div className="mx-auto max-w-5xl">

          <Link
            to={`/teacher/courses/${courseId}`}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Lessons
          </Link>

          <div className="mb-8">

            <p className="text-sm font-medium text-blue-600">
              {course?.title}
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Add Lessons
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Create a lesson manually or generate a
              complete lesson structure using AI.
            </p>

          </div>

          {/* Tabs */}
          <div className="mb-7 inline-flex rounded-xl bg-gray-100 p-1">

            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
                mode === "manual"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Manual
            </button>

            <button
              type="button"
              onClick={() => setMode("ai")}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition ${
                mode === "ai"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-gray-500 hover:text-purple-700"
              }`}
            >
              <Sparkles size={16} />
              Generate with AI
            </button>

          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* MANUAL */}
          {mode === "manual" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="text-xl font-semibold text-gray-900">
                Create Lesson
              </h2>

              <form
                onSubmit={handleCreateLesson}
                className="mt-6 space-y-5"
              >

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Lesson Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Introduction to React"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    rows="5"
                    placeholder="What will students learn in this lesson?"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  <Save size={17} />

                  {saving
                    ? "Creating..."
                    : "Create Lesson"}
                </button>

              </form>

            </div>
          )}

          {/* AI */}
          {mode === "ai" && (
            <div>

              {generatedLessons.length === 0 && (

                <div className="rounded-2xl border border-purple-200 bg-purple-50/40 px-6 py-12 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                    <Sparkles
                      size={26}
                      className="text-purple-600"
                    />
                  </div>

                  <h2 className="mt-5 text-xl font-semibold text-gray-900">
                    Generate course lessons
                  </h2>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-600">
                    AI will analyse the course title and
                    description and suggest a structured
                    sequence of lessons.
                  </p>

                  <button
                    type="button"
                    onClick={handleGenerateLessons}
                    disabled={generating}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
                  >
                    <Sparkles size={18} />

                    {generating
                      ? "Generating Lessons..."
                      : "Generate Lessons"}
                  </button>

                </div>

              )}

              {generatedLessons.length > 0 && (

                <div>

                  <div className="mb-5 flex items-center justify-between">

                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        AI Suggested Lessons
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Review and edit the lessons before
                        saving.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateLessons}
                      disabled={generating}
                      className="inline-flex items-center gap-2 rounded-lg border border-purple-300 bg-white px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-50"
                    >
                      <Sparkles size={16} />
                      Regenerate
                    </button>

                  </div>

                  <div className="space-y-4">

                    {generatedLessons.map(
                      (lesson, index) => (

                        <div
                          key={lesson.tempId}
                          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                        >

                          <div className="flex items-start gap-4">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1 space-y-4">

                              <input
                                type="text"
                                value={
                                  lesson.title
                                }
                                onChange={(event) =>
                                  updateGeneratedLesson(
                                    lesson.tempId,
                                    "title",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                              />

                              <textarea
                                rows="3"
                                value={
                                  lesson.description
                                }
                                onChange={(event) =>
                                  updateGeneratedLesson(
                                    lesson.tempId,
                                    "description",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeGeneratedLesson(
                                    lesson.tempId
                                  )
                                }
                                className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                                Remove
                              </button>

                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                  <div className="mt-6">

                    <button
                      type="button"
                      onClick={
                        handleSaveGeneratedLessons
                      }
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
                    >
                      <CirclePlus size={18} />

                      {saving
                        ? "Saving Lessons..."
                        : `Save All ${generatedLessons.length} Lessons`}
                    </button>

                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </TeacherLayout>
  );
};

export default LessonCreatePage;