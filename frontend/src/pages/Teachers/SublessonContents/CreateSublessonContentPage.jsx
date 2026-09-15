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

const CreateSublessonContentPage = () => {
  const {
    lessonId,
    sublessonId,
    contentId,
  } = useParams();

  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Mode
  |--------------------------------------------------------------------------
  */

  const isEditMode = Boolean(contentId);

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [sublesson, setSublesson] = useState(null);
  const [contentItem, setContentItem] = useState(null);

  const [content, setContent] = useState("");
  const [aiTitle, setAiTitle] = useState("");

  const [sourceType, setSourceType] = useState("manual");
  const [status, setStatus] = useState("draft");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [viewMode, setViewMode] = useState("edit");
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Route Helpers
  |--------------------------------------------------------------------------
  */

  const contentListPath =
    `/teacher/lessons/${lessonId}/sublessons/${sublessonId}/contents`;

  /*
  |--------------------------------------------------------------------------
  | Load Page
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadPage();
  }, [sublessonId, contentId]);

  const loadPage = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * Always load the Sublesson.
       */
      const sublessonResponse =
        await axiosInstance.get(
          `/api/teacher/sublessons/${sublessonId}`
        );

      const sublessonData =
        sublessonResponse.data?.data || null;

      setSublesson(sublessonData);

      /*
       * Use Sublesson title as the default
       * editable AI topic.
       */
      if (sublessonData) {
        setAiTitle(
          sublessonData.title || ""
        );
      }

      /*
       * EDIT MODE
       *
       * Load the existing content.
       */
      if (isEditMode) {
        const contentResponse =
          await axiosInstance.get(
            `/api/teacher/sublesson-contents/${contentId}`
          );

        const existingContent =
          contentResponse.data?.data || null;

        if (!existingContent) {
          setError(
            "Sublesson content could not be found."
          );

          return;
        }

        /*
         * Extra safety check.
         *
         * Make sure the content actually belongs
         * to the Sublesson in the URL.
         */
        if (
          Number(existingContent.sublesson_id) !==
          Number(sublessonId)
        ) {
          setError(
            "This content does not belong to this sublesson."
          );

          return;
        }

        setContentItem(existingContent);

        setContent(
          existingContent.content || ""
        );

        setSourceType(
          existingContent.source_type ||
            "manual"
        );

        setStatus(
          existingContent.status ||
            "draft"
        );
      }
    } catch (err) {
      console.error(
        "Failed to load sublesson content page:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to load sublesson content."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Generate Content With AI
  |--------------------------------------------------------------------------
  */

  const handleGenerateAI = async () => {
    if (!aiTitle.trim()) {
      setError(
        "Please enter a topic for AI generation."
      );

      return;
    }

    try {
      setGenerating(true);
      setError("");

      const response =
        await axiosInstance.post(
          "/api/teacher/ai/generate-learning-content",
          {
            sublessonId:
              Number(sublessonId),

            title:
              aiTitle.trim(),

            description:
              sublesson?.description || "",
          }
        );

      console.log(
        "AI sublesson content response:",
        response.data
      );

      const generatedContent =
        response.data?.data?.content ||
        response.data?.content ||
        response.data?.learningContent ||
        "";

      if (!generatedContent) {
        setError(
          "AI generated a response, but no sublesson content was returned."
        );

        return;
      }

      /*
       * Replace editor content with
       * generated Markdown.
       */
      setContent(generatedContent);

      /*
       * Mark the source as AI.
       */
      setSourceType("ai");

      /*
       * Switch to preview after AI generation.
       */
      setViewMode("preview");
    } catch (err) {
      console.error(
        "Failed to generate sublesson content:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to generate sublesson content with AI."
      );
    } finally {
      setGenerating(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Save / Update Content
  |--------------------------------------------------------------------------
  */

  const handleSave = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      setError(
        "Please enter sublesson content."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        type:
          contentItem?.type ||
          "markdown",

        content:
          content.trim(),

        source_type:
          sourceType,

        status,
      };

      /*
       * EDIT
       */
      if (isEditMode) {
        await axiosInstance.put(
          `/api/teacher/sublesson-contents/${contentId}`,
          payload
        );
      }

      /*
       * CREATE
       */
      else {
        await axiosInstance.post(
          `/api/teacher/sublessons/${sublessonId}/contents`,
          payload
        );
      }

      /*
       * Both Create and Edit return to the
       * nested Sublesson Content list.
       */
      navigate(
        contentListPath,
        {
          replace: true,
        }
      );
    } catch (err) {
      console.error(
        isEditMode
          ? "Failed to update sublesson content:"
          : "Failed to create sublesson content:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.errors
            ?.content?.[0] ||
          (isEditMode
            ? "Failed to update sublesson content."
            : "Failed to create sublesson content.")
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Back
  |--------------------------------------------------------------------------
  */

  const handleBack = () => {
    navigate(contentListPath);
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
  | Page
  |--------------------------------------------------------------------------
  */

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
            Back to Content
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <FileText className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {isEditMode
                    ? "Edit Sublesson Content"
                    : "Create Sublesson Content"}
                </h1>

                {sublesson && (
                  <p className="mt-2 text-gray-600">
                    {isEditMode
                      ? "Update learning material for "
                      : "Create learning material for "}

                    <span className="font-semibold text-gray-900">
                      {sublesson.title}
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
                  Generate Sublesson Content with AI
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Generate short, focused learning
                  content for this sublesson.
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
                    setAiTitle(
                      event.target.value
                    )
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
                  generating ||
                  saving ||
                  !aiTitle.trim()
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
              It does not change the actual sublesson title.
            </p>

            {isEditMode && (
              <p className="mt-1 text-xs text-amber-600">
                Generating again will replace the
                current editor content. You can review
                it before saving.
              </p>
            )}

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Content Form */}
          <form
            onSubmit={handleSave}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm"
          >

            {/* Form Header */}
            <div className="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Sublesson Content
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Write manually or generate short
                  Markdown content with AI.
                </p>

                {isEditMode && contentItem && (
                  <div className="mt-2 flex flex-wrap gap-2">

                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      Type:{" "}
                      {contentItem.type ||
                        "markdown"}
                    </span>

                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                      Source: {sourceType}
                    </span>

                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                      Order:{" "}
                      {contentItem.sort_order}
                    </span>

                  </div>
                )}

              </div>

              {/* Edit / Preview */}
              <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">

                <button
                  type="button"
                  onClick={() =>
                    setViewMode("edit")
                  }
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
                    htmlFor="sublesson-content"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Markdown Content
                  </label>

                  <textarea
                    id="sublesson-content"
                    value={content}
                    onChange={(event) =>
                      setContent(
                        event.target.value
                      )
                    }
                    rows={22}
                    placeholder={`## Topic

Write short sublesson content here...

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
                                className || ""
                              );

                            /*
                             * Fenced code block.
                             */
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

                            /*
                             * Inline code.
                             */
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

            {/* Status */}
            <div className="border-t border-gray-100 px-6 py-5">

              <label
                htmlFor="status"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-xs"
              >

                <option value="draft">
                  Draft
                </option>

                <option value="published">
                  Published
                </option>

              </select>

            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">

              <button
                type="button"
                onClick={handleBack}
                disabled={
                  saving ||
                  generating
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  generating ||
                  !content.trim()
                }
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    {isEditMode
                      ? "Updating..."
                      : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />

                    {isEditMode
                      ? "Update Content"
                      : "Save Content"}
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

export default CreateSublessonContentPage;