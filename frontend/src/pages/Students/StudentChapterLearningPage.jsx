import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axiosInstance from "../../utils/axiosInstance";

const StudentChapterLearningPage = () => {
  const { subjectId, chapterId } = useParams();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosInstance.get(`/api/chapters/${chapterId}`);
        setChapter(response.data?.data || null);
      } catch (err) {
        console.error("Failed to load chapter:", err);
        setError(err.response?.data?.message || "Failed to load chapter.");
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterId]);

  const contents = Array.isArray(chapter?.contents) ? chapter.contents : [];
  const quizzes = Array.isArray(chapter?.quizzes) ? chapter.quizzes : [];
  const flashcardSets = Array.isArray(chapter?.flashcards) ? chapter.flashcards : [];

  const allFlashcards = useMemo(
    () =>
      flashcardSets.flatMap((set) =>
        Array.isArray(set.cards) ? set.cards : []
      ),
    [flashcardSets]
  );

  const lessonPages = useMemo(
    () =>
      contents.flatMap((item) => {
        const rawContent = item?.content || "";

        return rawContent
          .split(/^\s*(?:---+|\*\*\*+|___+)\s*$/m)
          .map((section) => section.trim())
          .filter(Boolean)
          .map((section, index) => ({
            id: `${item.id}-${index}`,
            content: section,
          }));
      }),
    [contents]
  );

  const currentPage = lessonPages[pageIndex] || null;
  const progress = lessonPages.length
    ? Math.round(((pageIndex + 1) / lessonPages.length) * 100)
    : 0;

  const continueAfterContent = () => {
    if (allFlashcards.length > 0) {
      navigate(`/subjects/${subjectId}/chapters/${chapterId}/flashcards`);
      return;
    }

    if (quizzes.length > 0) {
      navigate(`/subjects/${subjectId}/chapters/${chapterId}/quiz`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading chapter...</p>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-lg rounded-xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Unable to load chapter</h2>
          <p className="mt-2 text-gray-600">{error || "Chapter not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to={`/subjects/${subjectId}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Subject
          </Link>

          <div className="flex gap-2">
            <Link
              to={`/subjects/${subjectId}/chapters/${chapterId}/learn`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Learn
            </Link>
            <Link
              to={`/subjects/${subjectId}/chapters/${chapterId}/flashcards`}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                allFlashcards.length
                  ? "bg-white text-purple-700 shadow-sm hover:bg-purple-50"
                  : "pointer-events-none bg-gray-100 text-gray-400"
              }`}
            >
              Flashcards
            </Link>
            <Link
              to={`/subjects/${subjectId}/chapters/${chapterId}/quiz`}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                quizzes.length
                  ? "bg-white text-green-700 shadow-sm hover:bg-green-50"
                  : "pointer-events-none bg-gray-100 text-gray-400"
              }`}
            >
              Quiz
            </Link>
          </div>
        </div>

        <header className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Chapter {chapter.chapter_order}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            {chapter.title}
          </h1>
          {chapter.description && (
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              {chapter.description}
            </p>
          )}
        </header>

        {lessonPages.length > 0 && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex justify-between text-sm text-gray-500">
              <span>Lesson progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {lessonPages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <h2 className="text-lg font-semibold text-gray-800">No learning content available</h2>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
              <span>Lesson</span>
              <span>
                Part {pageIndex + 1} of {lessonPages.length}
              </span>
            </div>

            <article className="min-h-[440px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
              <div className="max-w-none text-gray-700">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="mb-5 mt-2 text-3xl font-bold text-gray-900">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-4 mt-7 text-2xl font-bold text-gray-900">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-3 mt-6 text-xl font-semibold text-gray-900">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-5 text-base leading-8 text-gray-700">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-5 ml-6 list-disc space-y-2 leading-7 text-gray-700">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-5 ml-6 list-decimal space-y-2 leading-7 text-gray-700">{children}</ol>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="my-5 border-l-4 border-blue-300 bg-blue-50 px-5 py-4 text-gray-700">
                        {children}
                      </blockquote>
                    ),
                    pre: ({ children }) => (
                      <pre className="my-5 overflow-x-auto rounded-xl bg-gray-900 p-5 text-sm leading-6 text-gray-100">
                        {children}
                      </pre>
                    ),
                    code: ({ children, className }) => {
                      const isBlock = className?.startsWith("language-");
                      return isBlock ? (
                        <code className={`${className || ""} font-mono text-sm`}>{children}</code>
                      ) : (
                        <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-pink-700">
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {currentPage?.content || ""}
                </ReactMarkdown>
              </div>
            </article>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPageIndex((index) => Math.max(0, index - 1))}
                disabled={pageIndex === 0}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              {pageIndex < lessonPages.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setPageIndex((index) => index + 1)}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={continueAfterContent}
                  disabled={allFlashcards.length === 0 && quizzes.length === 0}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {allFlashcards.length > 0
                    ? "Continue to Flashcards →"
                    : quizzes.length > 0
                    ? "Continue to Quiz →"
                    : "Chapter Complete"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentChapterLearningPage;
