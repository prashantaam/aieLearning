import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  CreditCard,
  Edit3,
  FilePlus2,
  HelpCircle,
  Loader2,
  Save,
  Trash2,
  X,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Prism as SyntaxHighlighter,
} from "react-syntax-highlighter";

import {
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const LessonDetailPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [editContent, setEditContent] =
    useState("");

  const [savingEdit, setSavingEdit] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          `/api/teacher/lessons/${lessonId}`
        );

      setLesson(
        response.data?.data || null
      );
    } catch (err) {
      console.error(
        "Failed to load lesson:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load lesson."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = () => {
    navigate(
      `/teacher/lessons/${lessonId}/contents/create`
    );
  };

  const handleQuizManagement = () => {
  navigate(
    `/teacher/lessons/${lessonId}/quizzes`
  );
};

  const handleCreateFlashcards = () => {
    navigate(
      `/teacher/lessons/${lessonId}/flashcards/create`
    );
  };

  const handleEdit = (content) => {
    setEditingId(content.id);
    setEditContent(content.content || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (
    lessonContentId
  ) => {
    if (!editContent.trim()) {
      setError(
        "Lesson content cannot be empty."
      );
      return;
    }

    try {
      setSavingEdit(true);
      setError("");

      await axiosInstance.put(
        `/api/teacher/lesson-contents/${lessonContentId}`,
        {
          content: editContent.trim(),
        }
      );

      setEditingId(null);
      setEditContent("");

      await fetchLesson();
    } catch (err) {
      console.error(
        "Failed to update content:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update lesson content."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (
    lessonContentId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lesson content?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(lessonContentId);
      setError("");

      await axiosInstance.delete(
        `/api/teacher/lesson-contents/${lessonContentId}`
      );

      await fetchLesson();
    } catch (err) {
      console.error(
        "Failed to delete content:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete lesson content."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </TeacherLayout>
    );
  }

  if (!lesson) {
    return (
      <TeacherLayout>
        <div className="p-8">
          <p className="text-red-600">
            Lesson not found.
          </p>
        </div>
      </TeacherLayout>
    );
  }

  const lessonContents =
    Array.isArray(
      lesson.lesson_contents
    )
      ? lesson.lesson_contents
      : [];

  return (
    <TeacherLayout>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">

          {/* Back */}
          <button
            type="button"
            onClick={() =>
              navigate(
                `/teacher/courses/${lesson.course_id}`
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </button>

          {/* Header */}
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <BookOpen className="h-6 w-6" />
              </div>

              <div>
                <div className="mb-2 flex items-center gap-3">

                  <h1 className="text-3xl font-bold text-gray-900">
                    {lesson.title}
                  </h1>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-600">
                    {lesson.status}
                  </span>

                </div>

                {lesson.description && (
                  <p className="max-w-3xl text-gray-600">
                    {lesson.description}
                  </p>
                )}

                <p className="mt-3 text-xs text-gray-400">
                  Lesson ID: {lesson.id}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">

            <button
              type="button"
              onClick={handleCreateContent}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
            >
              <FilePlus2 className="h-5 w-5 text-blue-600" />

              <div>
                <p className="font-semibold text-gray-900">
                  Create Lesson Content
                </p>

                <p className="text-xs text-gray-500">
                  Add learning material
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleQuizManagement}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-purple-300 hover:bg-purple-50"
            >
              <HelpCircle className="h-5 w-5 text-purple-600" />

              <div>
                <p className="font-semibold text-gray-900">
                  Manage Quiz
                </p>

                <p className="text-xs text-gray-500">
                  Add lesson questions
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleCreateFlashcards}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-green-300 hover:bg-green-50"
            >
              <CreditCard className="h-5 w-5 text-green-600" />

              <div>
                <p className="font-semibold text-gray-900">
                  Create Flashcards
                </p>

                <p className="text-xs text-gray-500">
                  Create revision cards
                </p>
              </div>
            </button>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Lesson Content */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Lesson Content
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {lessonContents.length} content item
                {lessonContents.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            {lessonContents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

                <FilePlus2 className="mx-auto h-8 w-8 text-gray-400" />

                <p className="mt-3 font-medium text-gray-700">
                  No lesson content yet.
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Create your first lesson content.
                </p>
              </div>
            ) : (
              <div className="space-y-6">

                {lessonContents.map(
                  (contentItem, index) => (
                    <div
                      key={contentItem.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >

                      {/* Content header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-6 py-4">

                        <div>
                          <p className="font-semibold text-gray-900">
                            Content {index + 1}
                          </p>

                          <div className="mt-1 flex gap-3 text-xs text-gray-500">

                            {contentItem.source_type && (
                              <span>
                                Source:{" "}
                                {contentItem.source_type}
                              </span>
                            )}

                            {contentItem.status && (
                              <span className="capitalize">
                                Status:{" "}
                                {contentItem.status}
                              </span>
                            )}

                          </div>
                        </div>

                        {/* Edit / Delete */}
                        <div className="flex items-center gap-2">

                          {editingId !==
                          contentItem.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    contentItem
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                              >
                                <Edit3 className="h-4 w-4" />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    contentItem.id
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  contentItem.id
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              >
                                {deletingId ===
                                contentItem.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}

                                Delete
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={
                                  handleCancelEdit
                                }
                                disabled={
                                  savingEdit
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleSaveEdit(
                                    contentItem.id
                                  )
                                }
                                disabled={
                                  savingEdit
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                              >
                                {savingEdit ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}

                                Save
                              </button>
                            </>
                          )}

                        </div>
                      </div>

                      {/* Edit mode */}
                      {editingId ===
                      contentItem.id ? (
                        <div className="p-6">

                          <textarea
                            value={editContent}
                            onChange={(event) =>
                              setEditContent(
                                event.target.value
                              )
                            }
                            rows={20}
                            className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 font-mono text-sm leading-7 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />

                          <p className="mt-2 text-xs text-gray-400">
                            Markdown formatting is supported.
                          </p>

                        </div>
                      ) : (
                        /* Markdown rendered view */
                        <div className="p-6">

                          <div className="prose prose-slate max-w-none">

                            <ReactMarkdown
                              remarkPlugins={[
                                remarkGfm,
                              ]}
                              components={{
                                code({
                                  className,
                                  children,
                                  ...props
                                }) {
                                  const match =
                                    /language-([\w-]+)/.exec(
                                      className ||
                                        ""
                                    );

                                  if (match) {
                                    return (
                                      <SyntaxHighlighter
                                        style={
                                          vscDarkPlus
                                        }
                                        language={
                                          match[1]
                                        }
                                        PreTag="div"
                                        customStyle={{
                                          margin:
                                            "1.25rem 0",
                                          borderRadius:
                                            "0.75rem",
                                          fontSize:
                                            "0.875rem",
                                        }}
                                      >
                                        {String(
                                          children
                                        ).replace(
                                          /\n$/,
                                          ""
                                        )}
                                      </SyntaxHighlighter>
                                    );
                                  }

                                  return (
                                    <code
                                      className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-medium text-pink-600"
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  );
                                },
                              }}
                            >
                              {
                                contentItem.content
                              }
                            </ReactMarkdown>

                          </div>

                        </div>
                      )}

                    </div>
                  )
                )}

              </div>
            )}
          </div>

        </div>
      </div>
    </TeacherLayout>
  );
};

export default LessonDetailPage;