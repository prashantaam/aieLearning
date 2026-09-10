import { useEffect, useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../utils/axiosInstance";

const SubjectDetailPage = () => {
  const { subjectId } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  /*
   * Teacher management mode is determined by the URL.
   *
   * /teacher/subjects/1
   *      → Teacher management mode
   *
   * /subjects/1
   *      → Student-facing mode
   */
  const isTeacherMode =
    location.pathname.startsWith("/teacher/");

  console.log("SubjectDetailPage URL:", location.pathname);
  console.log("Teacher mode:", isTeacherMode);

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Chapter creation
   */
  const [showChapterForm, setShowChapterForm] =
    useState(false);

  const [creatingChapter, setCreatingChapter] =
    useState(false);

  const [chapterForm, setChapterForm] = useState({
    title: "",
    description: "",
    status: "draft",
  });

  /*
   * AI chapter generation
   */
  const [generatingChapters, setGeneratingChapters] =
    useState(false);

  const [savingGeneratedChapters, setSavingGeneratedChapters] =
    useState(false);

  const [generatedChapters, setGeneratedChapters] =
    useState([]);

  useEffect(() => {
    fetchSubject();
  }, [subjectId]);

  /*
   * Load Subject
   */
  const fetchSubject = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/api/subjects/${subjectId}`
      );

      setSubject(response.data?.data || null);
    } catch (err) {
      console.error(
        "Failed to fetch subject:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load subject."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Chapter form input
   */
  const handleChapterInputChange = (event) => {
    const { name, value } = event.target;

    setChapterForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * Create Chapter
   */
  const handleCreateChapter = async (event) => {
    event.preventDefault();

    try {
      setCreatingChapter(true);

      setError("");
      setSuccess("");

      await axiosInstance.post(
        `/api/subjects/${subjectId}/chapters`,
        {
          title: chapterForm.title,
          description: chapterForm.description,
          status: chapterForm.status,
        }
      );

      /*
       * Reset form
       */
      setChapterForm({
        title: "",
        description: "",
        status: "draft",
      });

      setShowChapterForm(false);

      setSuccess(
        "Chapter created successfully."
      );

      /*
       * Reload subject so newly-created
       * chapter appears immediately.
       */
      await fetchSubject();
    } catch (err) {
      console.error(
        "Failed to create chapter:",
        err
      );

      /*
       * Laravel validation errors
       */
      if (err.response?.data?.errors) {
        const validationErrors =
          Object.values(
            err.response.data.errors
          )
            .flat()
            .join(" ");

        setError(validationErrors);
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to create chapter."
        );
      }
    } finally {
      setCreatingChapter(false);
    }
  };

  /*
   * Generate chapter suggestions with AI
   */
  const handleGenerateChapters = async () => {
    try {
      setGeneratingChapters(true);
      setError("");
      setSuccess("");
      setShowChapterForm(false);

      const response = await axiosInstance.post(
        "/api/ai/generate-course-chapters",
        {
          title: subject.title,
          description: subject.description || "",
        }
      );

      const chapters =
        response.data?.data?.chapters || [];

      if (!Array.isArray(chapters) || chapters.length === 0) {
        throw new Error(
          "AI did not return any chapter suggestions."
        );
      }

      setGeneratedChapters(
        chapters.map((chapter, index) => ({
          id: `generated-${Date.now()}-${index}`,
          title: chapter.title || "",
          description: chapter.description || "",
          status: "draft",
        }))
      );

      setSuccess(
        "AI chapter suggestions generated. Review them before saving."
      );
    } catch (err) {
      console.error(
        "Failed to generate chapters:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to generate chapters."
      );
    } finally {
      setGeneratingChapters(false);
    }
  };

  /*
   * Edit one generated chapter before saving
   */
  const handleGeneratedChapterChange = (
    id,
    field,
    value
  ) => {
    setGeneratedChapters((current) =>
      current.map((chapter) =>
        chapter.id === id
          ? { ...chapter, [field]: value }
          : chapter
      )
    );
  };

  /*
   * Remove one generated chapter suggestion
   */
  const handleRemoveGeneratedChapter = (id) => {
    setGeneratedChapters((current) =>
      current.filter((chapter) => chapter.id !== id)
    );
  };

  /*
   * Save all reviewed AI-generated chapters
   */
  const handleSaveGeneratedChapters = async () => {
    const validChapters = generatedChapters.filter(
      (chapter) => chapter.title.trim()
    );

    if (validChapters.length === 0) {
      setError(
        "Please keep at least one chapter with a title before saving."
      );
      return;
    }

    try {
      setSavingGeneratedChapters(true);
      setError("");
      setSuccess("");

      for (const chapter of validChapters) {
        await axiosInstance.post(
          `/api/subjects/${subjectId}/chapters`,
          {
            title: chapter.title.trim(),
            description: chapter.description.trim(),
            status: chapter.status || "draft",
          }
        );
      }

      setGeneratedChapters([]);
      setSuccess(
        `${validChapters.length} AI-generated chapter${
          validChapters.length === 1 ? "" : "s"
        } saved successfully.`
      );

      await fetchSubject();
    } catch (err) {
      console.error(
        "Failed to save generated chapters:",
        err
      );

      if (err.response?.data?.errors) {
        const validationErrors = Object.values(
          err.response.data.errors
        )
          .flat()
          .join(" ");

        setError(validationErrors);
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to save generated chapters."
        );
      }
    } finally {
      setSavingGeneratedChapters(false);
    }
  };

  /*
   * Open / close create chapter form
   */
  const toggleChapterForm = () => {
    setShowChapterForm(
      (current) => !current
    );

    setError("");
    setSuccess("");
  };

  /*
   * Cancel chapter creation
   */
  const cancelChapterForm = () => {
    setShowChapterForm(false);

    setChapterForm({
      title: "",
      description: "",
      status: "draft",
    });

    setError("");
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">
          Loading subject...
        </p>
      </div>
    );
  }

  /*
   * Main loading error
   */
  if (error && !subject) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>

        <button
          onClick={() =>
            navigate(
              isTeacherMode
                ? "/teacher/subjects"
                : "/subjects"
            )
          }
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-white"
        >
          Back to Subjects
        </button>
      </div>
    );
  }

  /*
   * Subject not found
   */
  if (!subject) {
    return (
      <div className="p-6">
        <p className="text-gray-600">
          Subject not found.
        </p>
      </div>
    );
  }

  const chapters = Array.isArray(
    subject.chapters
  )
    ? subject.chapters
    : [];

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <div className="mb-6">
          <Link
            to={
              isTeacherMode
                ? "/teacher/subjects"
                : "/subjects"
            }
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Subjects
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        {/* Subject Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

            <div>
              <div className="mb-3">
                <span
                  className={
                    subject.status ===
                    "published"
                      ? "rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700"
                      : "rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700"
                  }
                >
                  {subject.status ===
                  "published"
                    ? "Published"
                    : "Draft"}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900">
                {subject.title}
              </h1>

              <p className="mt-3 max-w-3xl text-gray-600">
                {subject.description ||
                  "No description available."}
              </p>
            </div>

            {/* Teacher Management Indicator */}
            {isTeacherMode && (
              <div className="rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
                Teacher Management
              </div>
            )}

          </div>

          <div className="mt-6 border-t border-gray-100 pt-5">

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <div>
                <p className="text-sm text-gray-500">
                  Teacher
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {subject.teacher?.username ||
                    "Unknown"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Chapters
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {chapters.length}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Status
                </p>

                <p className="mt-1 font-medium capitalize text-gray-900">
                  {subject.status || "draft"}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Chapters */}
        <div className="mt-8">

          {/* Chapter Header */}
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Chapters
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {isTeacherMode
                  ? "Create and manage chapters for this subject."
                  : "Learning chapters available under this subject."}
              </p>
            </div>

            {/* Teacher Chapter Actions */}
            {isTeacherMode && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={toggleChapterForm}
                  disabled={generatingChapters}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {showChapterForm
                    ? "Cancel"
                    : "+ Create Chapter"}
                </button>

                <button
                  type="button"
                  onClick={handleGenerateChapters}
                  disabled={
                    generatingChapters ||
                    savingGeneratedChapters
                  }
                  className="rounded-lg bg-purple-600 px-5 py-3 font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generatingChapters
                    ? "Generating..."
                    : "✨ Generate Chapters with AI"}
                </button>
              </div>
            )}

          </div>

          {/* Create Chapter Form */}
          {isTeacherMode &&
            showChapterForm && (

              <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Create New Chapter
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Add a chapter to{" "}
                    <span className="font-medium">
                      {subject.title}
                    </span>
                    .
                  </p>
                </div>

                <form
                  onSubmit={
                    handleCreateChapter
                  }
                  className="space-y-5"
                >

                  {/* Chapter Title */}
                  <div>
                    <label
                      htmlFor="chapter-title"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Chapter Title
                    </label>

                    <input
                      id="chapter-title"
                      name="title"
                      type="text"
                      value={
                        chapterForm.title
                      }
                      onChange={
                        handleChapterInputChange
                      }
                      placeholder="e.g. Introduction to PHP"
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="chapter-description"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>

                    <textarea
                      id="chapter-description"
                      name="description"
                      rows="4"
                      value={
                        chapterForm.description
                      }
                      onChange={
                        handleChapterInputChange
                      }
                      placeholder="Describe what students will learn in this chapter..."
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label
                      htmlFor="chapter-status"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Status
                    </label>

                    <select
                      id="chapter-status"
                      name="status"
                      value={
                        chapterForm.status
                      }
                      onChange={
                        handleChapterInputChange
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="draft">
                        Draft
                      </option>

                      <option value="published">
                        Published
                      </option>
                    </select>

                    <p className="mt-2 text-sm text-gray-500">
                      Draft chapters are only
                      available to the teacher.
                      Students can see published
                      chapters when the subject
                      itself is also published.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">

                    <button
                      type="submit"
                      disabled={
                        creatingChapter
                      }
                      className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {creatingChapter
                        ? "Creating..."
                        : "Create Chapter"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        cancelChapterForm
                      }
                      className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                  </div>

                </form>

              </div>
            )}

          {/* AI Generated Chapter Suggestions */}
          {isTeacherMode &&
            generatedChapters.length > 0 && (
              <div className="mb-6 rounded-xl border border-purple-200 bg-purple-50/40 p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      AI Suggested Chapters
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      Review, edit or remove chapters before saving them to the course.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setGeneratedChapters([])
                    }
                    disabled={savingGeneratedChapters}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Clear suggestions
                  </button>
                </div>

                <div className="space-y-4">
                  {generatedChapters.map(
                    (chapter, index) => (
                      <div
                        key={chapter.id}
                        className="rounded-xl border border-gray-200 bg-white p-5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1 space-y-4">
                            <div>
                              <label
                                htmlFor={`generated-title-${chapter.id}`}
                                className="mb-2 block text-sm font-medium text-gray-700"
                              >
                                Chapter Title
                              </label>

                              <input
                                id={`generated-title-${chapter.id}`}
                                type="text"
                                value={chapter.title}
                                onChange={(event) =>
                                  handleGeneratedChapterChange(
                                    chapter.id,
                                    "title",
                                    event.target.value
                                  )
                                }
                                disabled={savingGeneratedChapters}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`generated-description-${chapter.id}`}
                                className="mb-2 block text-sm font-medium text-gray-700"
                              >
                                Description
                              </label>

                              <textarea
                                id={`generated-description-${chapter.id}`}
                                rows="3"
                                value={chapter.description}
                                onChange={(event) =>
                                  handleGeneratedChapterChange(
                                    chapter.id,
                                    "description",
                                    event.target.value
                                  )
                                }
                                disabled={savingGeneratedChapters}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50"
                              />
                            </div>

                            <div className="flex flex-wrap items-end justify-between gap-3">
                              <div>
                                <label
                                  htmlFor={`generated-status-${chapter.id}`}
                                  className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                  Status
                                </label>

                                <select
                                  id={`generated-status-${chapter.id}`}
                                  value={chapter.status}
                                  onChange={(event) =>
                                    handleGeneratedChapterChange(
                                      chapter.id,
                                      "status",
                                      event.target.value
                                    )
                                  }
                                  disabled={savingGeneratedChapters}
                                  className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50"
                                >
                                  <option value="draft">
                                    Draft
                                  </option>
                                  <option value="published">
                                    Published
                                  </option>
                                </select>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveGeneratedChapter(
                                    chapter.id
                                  )
                                }
                                disabled={savingGeneratedChapters}
                                className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSaveGeneratedChapters}
                    disabled={
                      savingGeneratedChapters ||
                      generatedChapters.length === 0
                    }
                    className="rounded-lg bg-purple-600 px-5 py-3 font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingGeneratedChapters
                      ? "Saving Chapters..."
                      : `Save All ${generatedChapters.length} Chapters`}
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateChapters}
                    disabled={
                      generatingChapters ||
                      savingGeneratedChapters
                    }
                    className="rounded-lg border border-purple-300 bg-white px-5 py-3 font-medium text-purple-700 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {generatingChapters
                      ? "Generating..."
                      : "Regenerate"}
                  </button>
                </div>
              </div>
            )}

          {/* No Chapters */}
          {chapters.length === 0 ? (

            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">

              <h3 className="text-lg font-semibold text-gray-800">
                No chapters yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {isTeacherMode
                  ? "Create the first chapter for this subject."
                  : "Chapters will appear here when they are published."}
              </p>

              {/* Create First Chapter */}
              {isTeacherMode &&
                !showChapterForm && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowChapterForm(
                        true
                      )
                    }
                    className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    + Create First Chapter
                  </button>
                )}

            </div>

          ) : (

            /* Chapter List */
            <div className="space-y-4">

              {chapters.map(
                (chapter, index) => (

                  <div
                    key={chapter.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >

                    <div className="flex items-start gap-4">

                      {/* Chapter Number */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-700">
                        {chapter.chapter_order ??
                          index + 1}
                      </div>

                      <div className="flex-1">

                        <div className="flex items-start justify-between gap-4">

                          <h3 className="text-lg font-semibold text-gray-900">
                            {chapter.title}
                          </h3>

                          <Link
                            to={
                              isTeacherMode
                                ? `/teacher/subjects/${subjectId}/chapters/${chapter.id}`
                                : `/chapters/${chapter.id}`
                            }
                            className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            {isTeacherMode
                              ? "Manage Chapter →"
                              : "View Chapter →"}
                          </Link>

                        </div>

                        <p className="mt-2 text-sm text-gray-600">
                          {chapter.description ||
                            "No chapter description available."}
                        </p>

                        <div className="mt-3">

                          <span
                            className={
                              chapter.status ===
                              "published"
                                ? "rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                                : "rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700"
                            }
                          >
                            {chapter.status ===
                            "published"
                              ? "Published"
                              : "Draft"}
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>
    </div>
  );
};

export default SubjectDetailPage;