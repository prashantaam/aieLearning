import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

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

import {
  Prism as SyntaxHighlighter,
} from "react-syntax-highlighter";

import {
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";

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
  |
  | CREATE:
  |
  | /teacher/lessons/:lessonId/content/create
  |
  | No Sublesson exists yet.
  |
  | EDIT:
  |
  | Existing Sublesson + Content already exist.
  |
  */

  const isEditMode = Boolean(contentId);

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [sublesson, setSublesson] =
    useState(null);

  const [contentItem, setContentItem] =
    useState(null);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [content, setContent] =
    useState("");

  const [aiTitle, setAiTitle] =
    useState("");

  const [sourceType, setSourceType] =
    useState("manual");

  const [status, setStatus] =
    useState("draft");

  const [loading, setLoading] =
    useState(isEditMode);

  const [saving, setSaving] =
    useState(false);

  const [generating, setGenerating] =
    useState(false);

  const [viewMode, setViewMode] =
    useState("edit");

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Route Helpers
  |--------------------------------------------------------------------------
  */

  const lessonPath =
    `/teacher/lessons/${lessonId}`;

  /*
  |--------------------------------------------------------------------------
  | Load Existing Content
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!isEditMode) {
      setLoading(false);
      return;
    }

    loadExistingContent();
  }, [
    isEditMode,
    sublessonId,
    contentId,
  ]);

  const loadExistingContent = async () => {
    try {
      setLoading(true);
      setError("");

      /*
      |--------------------------------------------------------------------------
      | Load Sublesson
      |--------------------------------------------------------------------------
      */

      const sublessonResponse =
        await axiosInstance.get(
          `/api/teacher/sublessons/${sublessonId}`
        );

      const sublessonData =
        sublessonResponse.data?.data || null;

      if (!sublessonData) {
        setError(
          "Sublesson could not be found."
        );

        return;
      }

      setSublesson(sublessonData);

      setTitle(
        sublessonData.title || ""
      );

      setDescription(
        sublessonData.description || ""
      );

      setAiTitle(
        sublessonData.title || ""
      );

      /*
      |--------------------------------------------------------------------------
      | Load Content
      |--------------------------------------------------------------------------
      */

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
       * Safety check.
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
    } catch (err) {
      console.error(
        "Failed to load content:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to load content."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Title Change
  |--------------------------------------------------------------------------
  |
  | In CREATE mode, keep AI Topic aligned with
  | the Content title.
  |
  */

  const handleTitleChange = (event) => {
    const value = event.target.value;

    setTitle(value);

    if (!isEditMode) {
      setAiTitle(value);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Generate Content With AI
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | AI generation works in BOTH:
  |
  | CREATE mode
  | EDIT mode
  |
  | No Sublesson ID is required.
  |
  | The Laravel endpoint only needs:
  |
  | {
  |   title: "React State"
  | }
  |
  */

  const handleGenerateAI = async () => {
    /*
     * Prefer the AI Topic.
     *
     * If it is empty, fall back to the
     * main Content title.
     */
    const topic =
      aiTitle.trim() ||
      title.trim();

    if (!topic) {
      setError(
        "Please enter a Content title or AI topic before generating."
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
            title: topic,
          }
        );

      console.log(
        "AI content response:",
        response.data
      );

      const generatedContent =
        response.data?.data?.content ||
        response.data?.content ||
        response.data?.learningContent ||
        "";

      if (!generatedContent) {
        setError(
          "AI generated a response, but no content was returned."
        );

        return;
      }

      /*
       * Put generated Markdown directly
       * into the editor.
       */
      setContent(generatedContent);

      setSourceType("ai");

      /*
       * Show the teacher the generated result.
       */
      setViewMode("preview");
    } catch (err) {
      console.error(
        "Failed to generate content:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to generate content with AI."
      );
    } finally {
      setGenerating(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Save / Update
  |--------------------------------------------------------------------------
  */

  const handleSave = async (event) => {
    event.preventDefault();

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!title.trim()) {
      setError(
        "Please enter a title."
      );

      return;
    }

    if (!content.trim()) {
      setError(
        "Please enter learning content."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      /*
      |--------------------------------------------------------------------------
      | EDIT EXISTING CONTENT
      |--------------------------------------------------------------------------
      */

      if (isEditMode) {
        /*
         * Update the Sublesson title
         * and description.
         */
        await axiosInstance.put(
          `/api/teacher/sublessons/${sublessonId}`,
          {
            title:
              title.trim(),

            description:
              description.trim() || null,

            sublesson_type:
              "content",

            sort_order:
              sublesson?.sort_order || 1,

            status:
              sublesson?.status || "draft",
          }
        );

        /*
         * Update the Content record.
         */
        await axiosInstance.put(
          `/api/teacher/sublesson-contents/${contentId}`,
          {
            type:
              contentItem?.type ||
              "markdown",

            content:
              content.trim(),

            source_type:
              sourceType,

            status,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE NEW CONTENT SUBLESSON
      |--------------------------------------------------------------------------
      |
      | This single request creates:
      |
      | 1. sublessons
      | 2. sublesson_contents
      |
      */

      else {
        await axiosInstance.post(
          `/api/teacher/lessons/${lessonId}/content`,
          {
            title:
              title.trim(),

            description:
              description.trim() || null,

            content:
              content.trim(),

            type:
              "markdown",

            source_type:
              sourceType,

            settings: {
              editor:
                "markdown",

              version:
                1,
            },
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Return To Lesson
      |--------------------------------------------------------------------------
      */

      navigate(
        lessonPath,
        {
          replace: true,
        }
      );
    } catch (err) {
      console.error(
        isEditMode
          ? "Failed to update content:"
          : "Failed to create content:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      const validationErrors =
        err.response?.data?.errors;

      setError(
        validationErrors?.title?.[0] ||
          validationErrors?.content?.[0] ||
          validationErrors?.description?.[0] ||
          err.response?.data?.message ||
          (isEditMode
            ? "Failed to update content."
            : "Failed to create content.")
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
    navigate(lessonPath);
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
                  {isEditMode
                    ? "Edit Content"
                    : "Create Content"}
                </h1>

                <p className="mt-2 text-gray-600">
                  {isEditMode
                    ? "Update this learning activity."
                    : "Create a Content learning activity for this lesson."}
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

          <form
            onSubmit={handleSave}
            className="space-y-6"
          >

            {/*
            |--------------------------------------------------------------------------
            | Content Details
            |--------------------------------------------------------------------------
            */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="mb-6">

                <h2 className="text-lg font-semibold text-gray-900">
                  Content Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  The title will also become the
                  Sublesson title.
                </p>

              </div>

              <div className="space-y-5">

                {/* Title */}
                <div>

                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Title

                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={
                      handleTitleChange
                    }
                    placeholder="e.g. What is React State?"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    This is the title students will
                    see in the lesson index.
                  </p>

                </div>

                {/* Description */}
                <div>

                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Description

                    <span className="ml-1 font-normal text-gray-400">
                      Optional
                    </span>
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    rows={3}
                    placeholder="Briefly describe what the student will learn."
                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

            </div>

            {/*
            |--------------------------------------------------------------------------
            | Generate Content With AI
            |--------------------------------------------------------------------------
            */}

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6">

              <div className="mb-4 flex items-center gap-3">

                <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-900">
                    Generate Content with AI
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Generate focused Markdown
                    learning content.
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                </div>

                {/*
                 * IMPORTANT:
                 *
                 * This button is NOT disabled because
                 * the Content has not been saved.
                 *
                 * It is disabled only while another
                 * operation is running.
                 */}
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={
                    generating ||
                    saving
                  }
                  className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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

            </div>

            {/*
            |--------------------------------------------------------------------------
            | Content Editor
            |--------------------------------------------------------------------------
            */}

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

              {/* Header */}
              <div className="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-lg font-semibold text-gray-900">
                    Learning Content
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Write the learning material using
                    Markdown.
                  </p>

                  {isEditMode &&
                    contentItem && (
                      <div className="mt-2 flex flex-wrap gap-2">

                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                          Type:{" "}
                          {contentItem.type ||
                            "markdown"}
                        </span>

                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                          Source:{" "}
                          {sourceType}
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
                      setViewMode(
                        "preview"
                      )
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

              {/* Editor / Preview */}
              <div className="p-6">

                {viewMode === "edit" ? (
                  <>

                    <label
                      htmlFor="content"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Markdown Content
                    </label>

                    <textarea
                      id="content"
                      value={content}
                      onChange={(event) => {
                        setContent(
                          event.target.value
                        );

                        /*
                         * Once a teacher manually edits
                         * AI-generated content, mark it
                         * as manual.
                         */
                        if (
                          sourceType === "ai"
                        ) {
                          setSourceType(
                            "manual"
                          );
                        }
                      }}
                      rows={22}
                      placeholder={`## What is React State?

State allows a React component to remember information.

### Example

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`
`}
                      className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 font-mono text-sm leading-7 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <div className="mt-2 flex items-center justify-between text-xs text-gray-400">

                      <span>
                        Markdown formatting is
                        supported.
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

              {/* Existing Content Status */}
              {isEditMode && (
                <div className="border-t border-gray-100 px-6 py-5">

                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Content Status
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
              )}

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
                    !title.trim() ||
                    !content.trim()
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      {isEditMode
                        ? "Updating..."
                        : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />

                      {isEditMode
                        ? "Update Content"
                        : "Create Content"}
                    </>
                  )}

                </button>

              </div>

            </div>

          </form>

        </div>
      </div>
    </TeacherLayout>
  );
};

export default CreateSublessonContentPage;