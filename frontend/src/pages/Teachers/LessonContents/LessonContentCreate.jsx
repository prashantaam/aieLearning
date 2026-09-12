import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Loader2,
  Save,
  Sparkles,
  Eye,
  Edit3,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const LessonContentCreate = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [content, setContent] = useState("");
  const [aiTitle, setAiTitle] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [viewMode, setViewMode] = useState("edit");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/api/teacher/lessons/${lessonId}`
      );

      const lessonData = response.data?.data || null;

      setLesson(lessonData);

      // Put current lesson title into editable AI topic field
      if (lessonData) {
        setAiTitle(lessonData.title || "");
      }
    } catch (err) {
      console.error("Failed to load lesson:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load lesson."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiTitle.trim()) {
      setError("Please enter a title for AI generation.");
      return;
    }

    try {
      setGenerating(true);
      setError("");

      const response = await axiosInstance.post(
        "/api/teacher/ai/generate-learning-content",
        {
          lessonId: Number(lessonId),

          // Send the editable title instead of original lesson title
          title: aiTitle.trim(),

          description: lesson?.description || "",
        }
      );

      console.log(
        "AI learning content response:",
        response.data
      );

      const generatedContent =
        response.data?.data?.content ||
        response.data?.content ||
        response.data?.learningContent ||
        "";

      if (!generatedContent) {
        setError(
          "AI generated a response, but no lesson content was returned."
        );

        return;
      }

      setContent(generatedContent);

      // Automatically show Markdown preview
      setViewMode("preview");
    } catch (err) {
      console.error(
        "Failed to generate lesson content:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to generate lesson content with AI."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      setError("Please enter lesson content.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await axiosInstance.post(
        `/api/teacher/lessons/${lessonId}/contents`,
        {
          content: content.trim(),
          source_type: "manual",
          status: "draft",
        }
      );

      navigate(`/teacher/lessons/${lessonId}`);
    } catch (err) {
      console.error(
        "Failed to create lesson content:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to create lesson content."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(`/teacher/lessons/${lessonId}`);
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

  return (
    <TeacherLayout>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">

          {/* Back */}
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lesson
          </button>

          {/* Header */}
          <div className="mb-8">

            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <FileText className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Create Lesson Content
                </h1>

                {lesson && (
                  <p className="mt-2 text-gray-600">
                    Create learning material for{" "}
                    <span className="font-semibold text-gray-900">
                      {lesson.title}
                    </span>
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* AI Content Generator */}
          <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6">

            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  Generate Lesson Content with AI
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Change the topic below if you want AI to focus
                  on a specific part of this lesson.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">

              <div className="flex-1">
                <label
                  htmlFor="ai-title"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  AI Content Topic
                </label>

                <input
                  id="ai-title"
                  type="text"
                  value={aiTitle}
                  onChange={(event) =>
                    setAiTitle(event.target.value)
                  }
                  placeholder="Enter a topic for AI generation"
                  className="
                    w-full
                    rounded-lg
                    border border-gray-300
                    bg-white
                    px-4 py-3
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-100
                  "
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={
                  generating || !aiTitle.trim()
                }
                className="
                  inline-flex
                  min-w-[180px]
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-indigo-600
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-indigo-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </button>

            </div>

            <p className="mt-3 text-xs text-gray-500">
              This only changes the topic sent to AI.
              It does not change the actual lesson title.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSave}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm"
          >

            {/* Form Header */}
            <div className="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Lesson Content
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Write manually or generate Markdown content
                  with AI.
                </p>
              </div>

              {/* Edit / Preview */}
              <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">

                <button
                  type="button"
                  onClick={() => setViewMode("edit")}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                    viewMode === "edit"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setViewMode("preview")
                  }
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                    viewMode === "preview"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>

              </div>
            </div>

            {/* Editor / Markdown Preview */}
            <div className="p-6">

              {viewMode === "edit" ? (
                <>
                  <label
                    htmlFor="lesson-content"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Markdown Content
                  </label>

                  <textarea
                    id="lesson-content"
                    value={content}
                    onChange={(event) =>
                      setContent(event.target.value)
                    }
                    rows={22}
                    placeholder={`# Lesson Title

## Introduction

Write lesson content here...

### Example

\`\`\`javascript
const message = "Hello World";
console.log(message);
\`\`\`
`}
                    className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 font-mono text-sm leading-7 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                    <span>
                      Markdown formatting is supported.
                    </span>

                    <span>
                      {content.length} characters
                    </span>
                  </div>
                </>
              ) : (
                <div>
                  {content ? (
                    <div className="prose prose-slate max-w-none rounded-xl border border-gray-200 bg-white p-6">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ className, children, ...props }) {
                                const match = /language-([\w-]+)/.exec(
                                    className || ""
                                );

                                // Fenced code block with a language
                                if (match) {
                                    return (
                                    <SyntaxHighlighter
                                        style={vscDarkPlus}
                                        language={match[1]}
                                        PreTag="div"
                                        customStyle={{
                                        margin: "1.25rem 0",
                                        borderRadius: "0.75rem",
                                        fontSize: "0.875rem",
                                        }}
                                    >
                                        {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                    );
                                }

                                // Normal inline code
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
                            {content}
                        </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                      <FileText className="mx-auto h-8 w-8 text-gray-400" />

                      <p className="mt-3 text-sm text-gray-500">
                        No content to preview yet.
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">

              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || generating}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Content
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

export default LessonContentCreate;