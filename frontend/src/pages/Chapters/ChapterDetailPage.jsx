import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../utils/axiosInstance";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChapterDetailPage = () => {
  const { subjectId, chapterId } = useParams();
  const location = useLocation();

  const isTeacherMode =
    location.pathname.startsWith("/teacher/");

  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Tabs
   */
  const [activeTab, setActiveTab] =
    useState("content");

  /*
   * Content creation
   */
  const [showContentForm, setShowContentForm] =
    useState(false);

  const [creatingContent, setCreatingContent] =
    useState(false);

  const [generatingContent, setGeneratingContent] =
    useState(false);

  const [success, setSuccess] = useState("");

  const [contentForm, setContentForm] = useState({
    title: "",
    content: "",
    status: "draft",
  });

  /*
   * Fetch Chapter
   */
  const fetchChapter = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/api/chapters/${chapterId}`
      );

      setChapter(
        response.data?.data || null
      );
    } catch (err) {
      console.error(
        "Failed to fetch chapter:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load chapter."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapter();
  }, [chapterId]);

  /*
   * Content form
   */
  const handleContentChange = (event) => {
    const { name, value } = event.target;

    setContentForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * Generate learning content with AI
   */
  const handleGenerateContent = async () => {
    if (!contentForm.title.trim()) {
      setError(
        "Please enter a Content Title before generating content."
      );
      return;
    }

    try {
      setGeneratingContent(true);
      setError("");
      setSuccess("");

      const response = await axiosInstance.post(
        "/api/ai/generate-learning-content",
        {
          title: contentForm.title.trim(),
        }
      );

      const generatedContent =
        response.data?.data?.content || "";

      if (!generatedContent) {
        throw new Error(
          "AI returned an empty response."
        );
      }

      setContentForm((previous) => ({
        ...previous,
        content: generatedContent,
      }));

      setSuccess(
        "AI content generated successfully. Review or edit it before saving."
      );
    } catch (err) {
      console.error(
        "Failed to generate learning content:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to generate learning content."
      );
    } finally {
      setGeneratingContent(false);
    }
  };

  /*
   * Create text content
   *
   * This endpoint will be added in our
   * ContentController next.
   */
  const handleCreateContent = async (
    event
  ) => {
    event.preventDefault();

    try {
      setCreatingContent(true);

      setError("");
      setSuccess("");

      await axiosInstance.post(
        `/api/chapters/${chapterId}/contents`,
        {
          title: contentForm.title,
          content: contentForm.content,
          status: contentForm.status,
        }
      );

      setContentForm({
        title: "",
        content: "",
        status: "draft",
      });

      setShowContentForm(false);

      setSuccess(
        "Content created successfully."
      );

      await fetchChapter();
    } catch (err) {
      console.error(
        "Failed to create content:",
        err
      );

      if (err.response?.data?.errors) {
        const messages = Object.values(
          err.response.data.errors
        )
          .flat()
          .join(" ");

        setError(messages);
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to create content."
        );
      }
    } finally {
      setCreatingContent(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">
          Loading chapter...
        </p>
      </div>
    );
  }

  if (error && !chapter) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="p-6">
        Chapter not found.
      </div>
    );
  }

  /*
   * Arrays returned from Laravel.
   *
   * Content already belongs to Chapter.
   * Quizzes and Flashcards will later be
   * migrated from document_id to chapter_id.
   */
  const contents = Array.isArray(
    chapter.contents
  )
    ? chapter.contents
    : [];

  const quizzes = Array.isArray(
    chapter.quizzes
  )
    ? chapter.quizzes
    : [];

  const flashcards = Array.isArray(
    chapter.flashcards
  )
    ? chapter.flashcards
    : [];

  const tabs = [
    {
      id: "content",
      label: "Content",
      count: contents.length,
    },
    {
      id: "quizzes",
      label: "Quizzes",
      count: quizzes.length,
    },
    {
      id: "flashcards",
      label: "Flashcards",
      count: flashcards.length,
    },
  ];

  return (
    <div className="p-6">

      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <div className="mb-6">

          <Link
            to={
              isTeacherMode
                ? `/teacher/subjects/${subjectId}`
                : `/subjects/${chapter.subject_id}`
            }
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Subject
          </Link>

        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        {/* Chapter Header */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  Chapter{" "}
                  {chapter.chapter_order}
                </span>

                <span
                  className={
                    chapter.status ===
                    "published"
                      ? "rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700"
                      : "rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700"
                  }
                >
                  {chapter.status ===
                  "published"
                    ? "Published"
                    : "Draft"}
                </span>

              </div>

              <h1 className="text-3xl font-bold text-gray-900">
                {chapter.title}
              </h1>

              <p className="mt-3 max-w-3xl text-gray-600">
                {chapter.description ||
                  "No chapter description available."}
              </p>

            </div>

            {isTeacherMode && (
              <div className="rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
                Teacher Management
              </div>
            )}

          </div>

        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-200">

          <div className="flex gap-8">

            {tabs.map((tab) => (

              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`border-b-2 px-1 pb-4 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}

                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {tab.count}
                </span>

              </button>

            ))}

          </div>

        </div>

        {/* ===================== */}
        {/* CONTENT TAB */}
        {/* ===================== */}

        {activeTab === "content" && (

          <div className="mt-6">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Chapter Content
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create learning material for
                  this chapter.
                </p>
              </div>

              {isTeacherMode && (
                <button
                  type="button"
                  onClick={() =>
                    setShowContentForm(
                      (current) => !current
                    )
                  }
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                >
                  {showContentForm
                    ? "Cancel"
                    : "+ Add Content"}
                </button>
              )}

            </div>

            {/* Create Content */}
            {isTeacherMode &&
              showContentForm && (

                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                  <h3 className="text-lg font-semibold text-gray-900">
                    Add Chapter Content
                  </h3>

                  <form
                    onSubmit={
                      handleCreateContent
                    }
                    className="mt-5 space-y-5"
                  >

                    <div>

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Content Title
                      </label>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          name="title"
                          value={
                            contentForm.title
                          }
                          onChange={
                            handleContentChange
                          }
                          required
                          placeholder="e.g. PHP Variables"
                          className="w-full flex-1 rounded-lg border border-gray-300 px-4 py-3"
                        />

                        <button
                          type="button"
                          onClick={handleGenerateContent}
                          disabled={
                            generatingContent ||
                            !contentForm.title.trim()
                          }
                          className="shrink-0 rounded-lg bg-purple-600 px-5 py-3 font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {generatingContent
                            ? "Generating..."
                            : "✨ Generate with AI"}
                        </button>
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        Enter a topic such as "PHP Variables", then generate a Markdown lesson with AI.
                      </p>

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Learning Content
                      </label>

                      <textarea
                        name="content"
                        value={
                          contentForm.content
                        }
                        onChange={
                          handleContentChange
                        }
                        required
                        rows="16"
                        disabled={generatingContent}
                        placeholder={
                          generatingContent
                            ? "Generating learning content with AI..."
                            : "Write, paste, or generate Markdown learning content here..."
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Status
                      </label>

                      <select
                        name="status"
                        value={
                          contentForm.status
                        }
                        onChange={
                          handleContentChange
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3"
                      >
                        <option value="draft">
                          Draft
                        </option>

                        <option value="published">
                          Published
                        </option>

                      </select>

                    </div>

                    <div className="flex gap-3">

                      <button
                        type="submit"
                        disabled={
                          creatingContent ||
                          generatingContent
                        }
                        className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        {creatingContent
                          ? "Creating..."
                          : "Save Content"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowContentForm(
                            false
                          )
                        }
                        className="rounded-lg border border-gray-300 px-5 py-3"
                      >
                        Cancel
                      </button>

                    </div>

                  </form>

                </div>

              )}

            {/* Content List */}
            {contents.length === 0 ? (

              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">

                <h3 className="font-semibold text-gray-800">
                  No content yet
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Add the first learning
                  material for this chapter.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {contents.map(
                  (item, index) => (

                    <div
                      key={item.id}
                      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Content{" "}
                            {index + 1}
                          </p>

                          <h3 className="mt-1 text-lg font-semibold text-gray-900">
                            {item.title}
                          </h3>

                          <div className="mt-5 max-w-none text-gray-700">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="mb-4 mt-6 text-3xl font-bold text-gray-900">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="mb-3 mt-6 text-2xl font-bold text-gray-900">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="mb-2 mt-5 text-xl font-semibold text-gray-900">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="mb-4 leading-7 text-gray-700">
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="mb-4 ml-6 list-decimal space-y-2 text-gray-700">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="leading-7">
                                    {children}
                                  </li>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="my-4 border-l-4 border-gray-300 bg-gray-50 px-4 py-3 italic text-gray-700">
                                    {children}
                                  </blockquote>
                                ),
                                a: ({ href, children }) => (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-blue-600 underline hover:text-blue-800"
                                  >
                                    {children}
                                  </a>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-gray-900">
                                    {children}
                                  </strong>
                                ),
                                pre: ({ children }) => (
                                  <pre className="my-5 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm leading-6 text-gray-100">
                                    {children}
                                  </pre>
                                ),
                                code: ({ children, className }) => {
                                  const isBlockCode =
                                    className?.startsWith("language-");

                                  if (isBlockCode) {
                                    return (
                                      <code className={`${className || ""} font-mono text-sm`}>
                                        {children}
                                      </code>
                                    );
                                  }

                                  return (
                                    <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-pink-700">
                                      {children}
                                    </code>
                                  );
                                },
                              }}
                            >
                              {item.content}
                            </ReactMarkdown>
                          </div>

                        </div>

                        <span
                          className={
                            item.status ===
                            "published"
                              ? "rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                              : "rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700"
                          }
                        >
                          {item.status ||
                            "draft"}
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        )}

        {/* ===================== */}
        {/* QUIZZES TAB */}
        {/* ===================== */}

        {activeTab === "quizzes" && (

          <div className="mt-6">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Chapter Quizzes
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Assess student understanding
                  of this chapter.
                </p>
              </div>

              {isTeacherMode && (
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                >
                  + Create Quiz
                </button>
              )}

            </div>

            {quizzes.length === 0 ? (

              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">

                <h3 className="font-semibold text-gray-800">
                  No quizzes yet
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Chapter-level quiz generation
                  will appear here.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {quizzes.map((quiz) => (

                  <div
                    key={quiz.id}
                    className="rounded-xl border bg-white p-5"
                  >
                    {quiz.title}
                  </div>

                ))}

              </div>

            )}

          </div>

        )}

        {/* ===================== */}
        {/* FLASHCARDS TAB */}
        {/* ===================== */}

        {activeTab === "flashcards" && (

          <div className="mt-6">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Chapter Flashcards
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create revision flashcards
                  from this chapter.
                </p>
              </div>

              {isTeacherMode && (
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                >
                  + Generate Flashcards
                </button>
              )}

            </div>

            {flashcards.length === 0 ? (

              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">

                <h3 className="font-semibold text-gray-800">
                  No flashcards yet
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Chapter-level flashcards will
                  appear here.
                </p>

              </div>

            ) : (

              <div className="grid gap-4 md:grid-cols-2">

                {flashcards.map(
                  (card) => (

                    <div
                      key={card.id}
                      className="rounded-xl border bg-white p-5"
                    >
                      {card.question}
                    </div>

                  )
                )}

              </div>

            )}

          </div>

        )}

      </div>

    </div>
  );
};

export default ChapterDetailPage;