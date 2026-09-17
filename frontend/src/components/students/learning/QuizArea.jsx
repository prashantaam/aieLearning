import {
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";


export default function QuizArea({
  sublesson,
}) {
  /*
  |--------------------------------------------------------------------------
  | Quiz
  |--------------------------------------------------------------------------
  */

  const quiz = useMemo(() => {
    if (
      !Array.isArray(
        sublesson?.quizzes
      ) ||
      sublesson.quizzes.length === 0
    ) {
      return null;
    }

    return sublesson.quizzes[0];
  }, [sublesson]);


  /*
  |--------------------------------------------------------------------------
  | Questions
  |--------------------------------------------------------------------------
  */

  const questions = useMemo(() => {
    if (
      !Array.isArray(
        quiz?.questions
      )
    ) {
      return [];
    }

    return quiz.questions;
  }, [quiz]);


  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [
    currentQuestionIndex,
    setCurrentQuestionIndex,
  ] = useState(0);

  const [
    selectedAnswer,
    setSelectedAnswer,
  ] = useState("");

  const [
    answerChecked,
    setAnswerChecked,
  ] = useState(false);

  const [
    score,
    setScore,
  ] = useState(0);

  const [
    quizCompleted,
    setQuizCompleted,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | Reset When Sublesson / Quiz Changes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setAnswerChecked(false);
    setScore(0);
    setQuizCompleted(false);
  }, [
    sublesson?.id,
    quiz?.id,
  ]);


  /*
  |--------------------------------------------------------------------------
  | No Quiz
  |--------------------------------------------------------------------------
  */

  if (
    !quiz ||
    questions.length === 0
  ) {
    return null;
  }


  /*
  |--------------------------------------------------------------------------
  | Current Question
  |--------------------------------------------------------------------------
  */

  const currentQuestion =
    questions[
      currentQuestionIndex
    ];

  const options =
    Array.isArray(
      currentQuestion?.options
    )
      ? currentQuestion.options
      : [];

  const isCorrect =
    selectedAnswer ===
    currentQuestion?.correctAnswer;

  const isLastQuestion =
    currentQuestionIndex ===
    questions.length - 1;


  /*
  |--------------------------------------------------------------------------
  | Select Answer
  |--------------------------------------------------------------------------
  */

  const handleSelectAnswer = (
    option
  ) => {
    if (answerChecked) {
      return;
    }

    setSelectedAnswer(option);
  };


  /*
  |--------------------------------------------------------------------------
  | Check Answer
  |--------------------------------------------------------------------------
  */

  const handleCheckAnswer = () => {
    if (
      !selectedAnswer ||
      answerChecked
    ) {
      return;
    }

    setAnswerChecked(true);

    if (
      selectedAnswer ===
      currentQuestion.correctAnswer
    ) {
      setScore(
        (previous) =>
          previous + 1
      );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Next Question
  |--------------------------------------------------------------------------
  */

  const handleNextQuestion = () => {
    if (!answerChecked) {
      return;
    }

    if (isLastQuestion) {
      setQuizCompleted(true);
      return;
    }

    setCurrentQuestionIndex(
      (previous) =>
        previous + 1
    );

    setSelectedAnswer("");
    setAnswerChecked(false);
  };


  /*
  |--------------------------------------------------------------------------
  | Restart Quiz
  |--------------------------------------------------------------------------
  */

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setAnswerChecked(false);
    setScore(0);
    setQuizCompleted(false);
  };


  /*
  |--------------------------------------------------------------------------
  | Completed
  |--------------------------------------------------------------------------
  */

  if (quizCompleted) {
    const percentage =
      Math.round(
        (
          score /
          questions.length
        ) * 100
      );

    return (
      <section className="mt-12 border-t border-slate-200 pt-10">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2
              size={26}
            />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Quiz Complete
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#0B1F3A]">
            {quiz.title ||
              "Sublesson Quiz"}
          </h2>

          <p className="mt-3 text-slate-600">
            You answered{" "}
            <span className="font-bold text-[#0B1F3A]">
              {score}
            </span>{" "}
            out of{" "}
            <span className="font-bold text-[#0B1F3A]">
              {questions.length}
            </span>{" "}
            questions correctly.
          </p>


          {/* Score */}
          <div className="mt-6 rounded-xl bg-slate-50 p-5">

            <div className="flex items-end justify-between gap-4">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Your score
                </p>

                <p className="mt-1 text-3xl font-bold text-[#0B1F3A]">
                  {percentage}%
                </p>
              </div>

              <p className="text-sm font-bold text-slate-500">
                {score} /{" "}
                {questions.length}
              </p>

            </div>


            {/* Progress */}
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-[#F4C95D] transition-all"
                style={{
                  width:
                    `${percentage}%`,
                }}
              />

            </div>

          </div>


          <button
            type="button"
            onClick={
              handleRestartQuiz
            }
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A] transition hover:bg-slate-50"
          >
            <RotateCcw
              size={17}
            />

            Try Again
          </button>

        </div>

      </section>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Question
  |--------------------------------------------------------------------------
  */

  return (
    <section>

      {/* Quiz Header */}
      <div className="mb-6">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>

            <h2 className="mt-2 text-xl font-bold text-[#0B1F3A]">
              {quiz.title ||
                "Check your understanding"}
            </h2>

          </div>


          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
            Question{" "}
            {currentQuestionIndex + 1}
            {" "}of{" "}
            {questions.length}
          </div>

        </div>


        {/* Progress */}
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-200">

          <div
            className="h-full rounded-full bg-[#F4C95D] transition-all duration-300"
            style={{
              width:
                `${
                  (
                    (
                      currentQuestionIndex +
                      1
                    ) /
                    questions.length
                  ) *
                  100
                }%`,
            }}
          />

        </div>

      </div>


      {/* Question Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">

        <h3 className="text-lg font-bold leading-8 text-[#0B1F3A] md:text-xl">
          {currentQuestion.question}
        </h3>


        {/* Options */}
        <div className="mt-6 space-y-3">

          {options.map(
            (
              option,
              optionIndex
            ) => {
              const selected =
                selectedAnswer ===
                option;

              const correctOption =
                answerChecked &&
                option ===
                  currentQuestion.correctAnswer;

              const incorrectSelected =
                answerChecked &&
                selected &&
                option !==
                  currentQuestion.correctAnswer;

              let optionClass =
                "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50";

              if (
                selected &&
                !answerChecked
              ) {
                optionClass =
                  "border-[#0B1F3A] bg-slate-50 ring-1 ring-[#0B1F3A]";
              }

              if (correctOption) {
                optionClass =
                  "border-emerald-400 bg-emerald-50";
              }

              if (
                incorrectSelected
              ) {
                optionClass =
                  "border-red-300 bg-red-50";
              }

              return (
                <button
                  key={
                    `${currentQuestion.id}-${optionIndex}`
                  }
                  type="button"
                  disabled={
                    answerChecked
                  }
                  onClick={() =>
                    handleSelectAnswer(
                      option
                    )
                  }
                  className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition ${optionClass}`}
                >

                  {/* Radio */}
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      selected
                        ? "border-[#0B1F3A]"
                        : "border-slate-300"
                    }`}
                  >
                    {selected && (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#0B1F3A]" />
                    )}
                  </span>


                  <span className="min-w-0 flex-1 text-sm font-medium leading-6 text-slate-700 md:text-base">
                    {option}
                  </span>


                  {correctOption && (
                    <CheckCircle2
                      size={20}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                  )}

                  {incorrectSelected && (
                    <XCircle
                      size={20}
                      className="mt-0.5 shrink-0 text-red-500"
                    />
                  )}

                </button>
              );
            }
          )}

        </div>


        {/* Feedback */}
        {answerChecked && (

          <div
            className={`mt-6 rounded-xl border p-5 ${
              isCorrect
                ? "border-emerald-200 bg-emerald-50"
                : "border-red-200 bg-red-50"
            }`}
          >

            <div className="flex items-start gap-3">

              {isCorrect ? (
                <CheckCircle2
                  size={22}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />
              ) : (
                <XCircle
                  size={22}
                  className="mt-0.5 shrink-0 text-red-500"
                />
              )}


              <div>

                <p
                  className={`font-bold ${
                    isCorrect
                      ? "text-emerald-800"
                      : "text-red-800"
                  }`}
                >
                  {isCorrect
                    ? "Correct!"
                    : "Not quite."}
                </p>


                {!isCorrect && (
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Correct answer:{" "}
                    <span className="font-bold">
                      {
                        currentQuestion.correctAnswer
                      }
                    </span>
                  </p>
                )}


                {currentQuestion.explanation && (

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {
                      currentQuestion.explanation
                    }
                  </p>

                )}

              </div>

            </div>

          </div>

        )}


        {/* Actions */}
        <div className="mt-7 flex justify-end">

          {!answerChecked ? (

            <button
              type="button"
              disabled={
                !selectedAnswer
              }
              onClick={
                handleCheckAnswer
              }
              className="rounded-lg bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#102b4f] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Check Answer
            </button>

          ) : (

            <button
              type="button"
              onClick={
                handleNextQuestion
              }
              className="inline-flex items-center gap-2 rounded-lg bg-[#F4C95D] px-5 py-3 text-sm font-bold text-[#0B1F3A] transition hover:bg-[#e8bc4f]"
            >
              {isLastQuestion
                ? "Finish Quiz"
                : "Next Question"}

              <ChevronRight
                size={18}
              />
            </button>

          )}

        </div>

      </div>

    </section>
  );
}