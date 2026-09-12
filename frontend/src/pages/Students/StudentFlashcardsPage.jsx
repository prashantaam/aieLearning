import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const StudentFlashcardsPage = () => {
  const { subjectId, chapterId } = useParams();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axiosInstance.get(`/api/chapters/${chapterId}`);
        setChapter(response.data?.data || null);
      } catch (err) {
        console.error("Failed to load flashcards:", err);
        setError(err.response?.data?.message || "Failed to load flashcards.");
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterId]);

  const flashcards = useMemo(() => {
    const sets = Array.isArray(chapter?.flashcards) ? chapter.flashcards : [];

    return sets.flatMap((set) =>
      Array.isArray(set.cards)
        ? set.cards.map((card) => ({ ...card, flashcardSetId: set.id }))
        : []
    );
  }, [chapter]);

  const quizzes = Array.isArray(chapter?.quizzes) ? chapter.quizzes : [];
  const currentCard = flashcards[cardIndex] || null;
  const progress = flashcards.length
    ? Math.round(((cardIndex + 1) / flashcards.length) * 100)
    : 0;

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">Loading flashcards...</div>;
  }

  if (error || !chapter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Unable to load flashcards</h2>
          <p className="mt-2 text-gray-600">{error || "Chapter not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to={`/subjects/${subjectId}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
            ← Back to Subject
          </Link>

          <div className="flex gap-2">
            <Link to={`/subjects/${subjectId}/chapters/${chapterId}/learn`} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50">
              Learn
            </Link>
            <Link to={`/subjects/${subjectId}/chapters/${chapterId}/flashcards`} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white">
              Flashcards
            </Link>
            <Link
              to={`/subjects/${subjectId}/chapters/${chapterId}/quiz`}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${quizzes.length ? "bg-white text-green-700 shadow-sm hover:bg-green-50" : "pointer-events-none bg-gray-100 text-gray-400"}`}
            >
              Quiz
            </Link>
          </div>
        </div>

        <header className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-600">Flashcard Practice</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{chapter.title}</h1>
        </header>

        {flashcards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <h2 className="text-lg font-semibold text-gray-800">No flashcards available</h2>
            <Link to={`/subjects/${subjectId}/chapters/${chapterId}/learn`} className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              Return to lesson
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex justify-between text-sm text-gray-500">
                <span>Card {cardIndex + 1} of {flashcards.length}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAnswer((value) => !value)}
              className="block min-h-[380px] w-full rounded-2xl border border-purple-200 bg-white p-8 text-left shadow-sm transition hover:shadow-md sm:p-12"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-purple-600">
                  {showAnswer ? "Answer" : "Question"}
                </span>
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium capitalize text-purple-700">
                  {currentCard?.difficulty || "medium"}
                </span>
              </div>

              <div className="flex min-h-[250px] items-center justify-center text-center">
                <p className={`leading-relaxed text-gray-900 ${showAnswer ? "text-xl" : "text-2xl font-semibold"}`}>
                  {showAnswer ? currentCard?.answer : currentCard?.question}
                </p>
              </div>

              <p className="text-center text-sm text-gray-400">
                Click the card to {showAnswer ? "show the question" : "reveal the answer"}
              </p>
            </button>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setCardIndex((index) => Math.max(0, index - 1));
                  setShowAnswer(false);
                }}
                disabled={cardIndex === 0}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              {cardIndex < flashcards.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setCardIndex((index) => index + 1);
                    setShowAnswer(false);
                  }}
                  className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  Next Card →
                </button>
              ) : quizzes.length > 0 ? (
                <button
                  type="button"
                  onClick={() => navigate(`/subjects/${subjectId}/chapters/${chapterId}/quiz`)}
                  className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                >
                  Continue to Quiz →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCardIndex(0);
                    setShowAnswer(false);
                  }}
                  className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  Practice Again
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentFlashcardsPage;
