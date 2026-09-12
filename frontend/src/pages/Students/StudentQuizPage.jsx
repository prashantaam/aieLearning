import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const StudentQuizPage = () => {
  const { subjectId, chapterId } = useParams();

  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axiosInstance.get(`/api/chapters/${chapterId}`);
        setChapter(response.data?.data || null);
      } catch (err) {
        console.error("Failed to load quiz:", err);
        setError(err.response?.data?.message || "Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterId]);

  const quizzes = Array.isArray(chapter?.quizzes) ? chapter.quizzes : [];
  const activeQuiz = quizzes[0] || null;
  const questions = Array.isArray(activeQuiz?.questions) ? activeQuiz.questions : [];
  const currentQuestion = questions[questionIndex] || null;

  const flashcardCount = useMemo(() => {
    const sets = Array.isArray(chapter?.flashcards) ? chapter.flashcards : [];
    return sets.reduce((count, set) => count + (Array.isArray(set.cards) ? set.cards.length : 0), 0);
  }, [chapter]);

  const score = questions.reduce(
    (total, question) =>
      answers[question.id] === question.correctAnswer ? total + 1 : total,
    0
  );

  const percentage = questions.length
    ? Math.round((score / questions.length) * 100)
    : 0;

  const restartQuiz = () => {
    setQuestionIndex(0);
    setAnswers({});
    setFinished(false);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">Loading quiz...</div>;
  }

  if (error || !chapter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Unable to load quiz</h2>
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
            <Link
              to={`/subjects/${subjectId}/chapters/${chapterId}/flashcards`}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${flashcardCount ? "bg-white text-purple-700 shadow-sm hover:bg-purple-50" : "pointer-events-none bg-gray-100 text-gray-400"}`}
            >
              Flashcards
            </Link>
            <Link to={`/subjects/${subjectId}/chapters/${chapterId}/quiz`} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white">
              Quiz
            </Link>
          </div>
        </div>

        <header className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-600">Quiz Practice</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{chapter.title}</h1>
        </header>

        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <h2 className="text-lg font-semibold text-gray-800">No quiz available</h2>
            <Link to={`/subjects/${subjectId}/chapters/${chapterId}/learn`} className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              Return to lesson
            </Link>
          </div>
        ) : finished ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl text-green-700">✓</div>
            <h2 className="mt-5 text-2xl font-bold text-gray-900">Quiz completed</h2>
            <p className="mt-3 text-gray-600">
              You scored {score} out of {questions.length}.
            </p>
            <div className="mx-auto mt-6 max-w-sm rounded-xl bg-gray-50 p-5">
              <div className="text-4xl font-bold text-gray-900">{percentage}%</div>
            </div>
            <button
              type="button"
              onClick={restartQuiz}
              className="mt-7 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              Practice Again
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex justify-between text-sm text-gray-500">
                <span>{activeQuiz?.title || "Chapter Quiz"}</span>
                <span>Question {questionIndex + 1} of {questions.length}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-green-600 transition-all"
                  style={{ width: `${Math.round(((questionIndex + 1) / questions.length) * 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
              <div className="mb-7 flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold leading-8 text-gray-900 sm:text-2xl">
                  {currentQuestion?.question}
                </h2>
                <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-medium capitalize text-green-700">
                  {currentQuestion?.difficulty || "medium"}
                </span>
              </div>

              <div className="space-y-3">
                {(currentQuestion?.options || []).map((option, optionIndex) => {
                  const selected = answers[currentQuestion.id] === option;

                  return (
                    <button
                      key={`${currentQuestion.id}-${optionIndex}`}
                      type="button"
                      onClick={() =>
                        setAnswers((current) => ({
                          ...current,
                          [currentQuestion.id]: option,
                        }))
                      }
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-green-500 bg-green-50 text-green-900"
                          : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50/40"
                      }`}
                    >
                      <span className="mr-3 font-semibold text-gray-400">
                        {String.fromCharCode(65 + optionIndex)}.
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}
                disabled={questionIndex === 0}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              {questionIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setQuestionIndex((index) => index + 1)}
                  disabled={!answers[currentQuestion?.id]}
                  className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next Question →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setFinished(true)}
                  disabled={!answers[currentQuestion?.id]}
                  className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Finish Quiz
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentQuizPage;
