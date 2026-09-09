import React from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, BookOpen, RotateCcw, BarChart3, Trash2 } from "lucide-react";

const QuizCard = ({ quiz, onDelete }) => {
  const navigate = useNavigate();

  const quizId = quiz?.id;

  const attemptCount = Number(quiz?.attemptCount ?? 0);
  const bestScore = Number(quiz?.bestScore ?? 0);

  const totalQuestions =
    quiz?.totalQuestions ??
    quiz?.total_questions ??
    quiz?.questions?.length ??
    0;

  const hasAttempts = attemptCount > 0;

  const createdDate = quiz?.createdAt
    ? new Date(quiz.createdAt).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : quiz?.created_at
      ? new Date(quiz.created_at).toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

  const handleStartQuiz = () => {
    navigate(`/quizzes/${quizId}`);
  };

  const handleViewResults = () => {
    navigate(`/quizzes/${quizId}/results`);
  };

  return (
    <div className="group flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

      {/* Best Score */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
            <Trophy size={18} className="text-amber-500" />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Best Score
            </p>

            <p className="text-xl font-bold text-neutral-900">
              {hasAttempts ? `${bestScore}%` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Quiz information */}
      <div className="mb-5">
        <h3 className="line-clamp-2 text-lg font-semibold text-neutral-900">
          {quiz?.title || "Untitled Quiz"}
        </h3>

        {createdDate && (
          <p className="mt-1 text-sm text-neutral-500">
            Created {createdDate}
          </p>
        )}
      </div>

      {/* Quiz statistics */}
      <div className="mb-5 space-y-2">

        <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-neutral-500" />

            <span className="text-sm text-neutral-600">
              Questions
            </span>
          </div>

          <span className="text-sm font-semibold text-neutral-900">
            {totalQuestions}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <RotateCcw size={15} className="text-neutral-500" />

            <span className="text-sm text-neutral-600">
              Attempts
            </span>
          </div>

          <span className="text-sm font-semibold text-neutral-900">
            {attemptCount}
          </span>
        </div>

      </div>

      {/* Push buttons to bottom */}
      <div className="mt-auto">

        {/* Main action */}
        <button
          type="button"
          onClick={handleStartQuiz}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
        >
          <RotateCcw size={16} />

          {hasAttempts ? "Retake Quiz" : "Start Quiz"}
        </button>

        {/* Results */}
        {hasAttempts && (
          <button
            type="button"
            onClick={handleViewResults}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2"
          >
            <BarChart3 size={16} />

            View Results
          </button>
        )}

        {/* Delete */}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(quiz)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-red-600"
          >
            <Trash2 size={14} />

            Delete Quiz
          </button>
        )}

      </div>
    </div>
  );
};

export default QuizCard;

