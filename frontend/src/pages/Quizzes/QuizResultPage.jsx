import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import quizService from '../../services/quizService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';

import toast from 'react-hot-toast';

import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  BookOpen,
  RotateCcw,
  History,
  TrendingUp,
} from 'lucide-react';


const QuizResultPage = () => {

  const { quizId } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [attempts, setAttempts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(true);


  /*
   * Fetch current quiz result + attempt history
   */
  useEffect(() => {

    const fetchData = async () => {

      try {

        const [
          resultsResponse,
          attemptsResponse,
        ] = await Promise.all([

          quizService.getQuizResults(quizId),

          quizService.getQuizAttempts(quizId),

        ]);


        console.log(
          'RESULTS RESPONSE:',
          resultsResponse
        );

        console.log(
          'ATTEMPTS RESPONSE:',
          attemptsResponse
        );


        /*
         * -----------------------------
         * Current quiz result
         * -----------------------------
         *
         * Response:
         *
         * {
         *   success: true,
         *   data: {
         *     quiz: {...},
         *     results: [...],
         *     attempt: {...}
         *   }
         * }
         */

        setResults(resultsResponse);


        /*
         * -----------------------------
         * Attempt history
         * -----------------------------
         *
         * Actual backend response:
         *
         * {
         *   success: true,
         *   data: {
         *     attemptCount: 5,
         *     attempts: [...],
         *     bestScore: 100,
         *     latestScore: 100,
         *     quizId: 7
         *   }
         * }
         *
         * Therefore the array is:
         *
         * attemptsResponse.data.attempts
         */

        const attemptList =
          Array.isArray(
            attemptsResponse?.data?.attempts
          )
            ? attemptsResponse.data.attempts
            : [];


        setAttempts(attemptList);


      } catch (error) {

        console.error(
          'Failed to fetch quiz results:',
          error
        );

        toast.error(
          error?.message ||
          'Failed to fetch quiz results.'
        );

      } finally {

        setLoading(false);
        setAttemptsLoading(false);

      }

    };


    if (quizId) {
      fetchData();
    }

  }, [quizId]);


  /*
   * Loading
   */
  if (loading) {

    return (

      <div className="flex items-center justify-center min-h-[60vh]">

        <Spinner />

      </div>

    );

  }


  /*
   * No results
   */
  if (
    !results ||
    !results.data ||
    !results.data.quiz
  ) {

    return (

      <div className="flex items-center justify-center min-h-[60vh]">

        <div className="text-center">

          <p className="text-slate-600 text-lg">
            Quiz results not found.
          </p>

        </div>

      </div>

    );

  }


  /*
   * Extract result data
   */
  const {
    quiz,
    results: detailedResults = [],
    attempt = null,
  } = results.data;


  /*
   * -----------------------------
   * Current attempt
   * -----------------------------
   */

  const currentScore =
    Number(
      attempt?.score ??
      quiz?.score ??
      0
    );


  const currentAttemptNumber =
    attempt?.attemptNumber ??
    attempt?.attempt_number ??
    null;


  const totalQuestions =
    Number(
      attempt?.totalQuestions ??
      attempt?.total_questions ??
      detailedResults.length
    );


  const correctAnswers =
    Number(
      attempt?.correctCount ??
      attempt?.correct_count ??
      detailedResults.filter(
        (result) => result.isCorrect
      ).length
    );


  const incorrectAnswers =
    Math.max(
      0,
      totalQuestions - correctAnswers
    );


  /*
   * -----------------------------
   * Attempt statistics
   * -----------------------------
   */

  const bestScore =
    attempts.length > 0
      ? Math.max(
          ...attempts.map(
            (item) =>
              Number(
                item?.score ?? 0
              )
          )
        )
      : currentScore;


  /*
   * Backend returns attempts newest first,
   * so attempts[0] is the latest attempt.
   */
  const latestScore =
    attempts.length > 0
      ? Number(
          attempts[0]?.score ??
          currentScore
        )
      : currentScore;


  const totalAttempts =
    attempts.length;


  /*
   * -----------------------------
   * Score helpers
   * -----------------------------
   */

  const getScoreColor = (score) => {

    if (score >= 80) {
      return 'from-emerald-500 to-teal-500';
    }

    if (score >= 60) {
      return 'from-amber-500 to-orange-500';
    }

    return 'from-rose-500 to-red-500';

  };


  const getScoreMessage = (score) => {

    if (score >= 90) {
      return 'Outstanding!';
    }

    if (score >= 80) {
      return 'Great job!';
    }

    if (score >= 70) {
      return 'Good work!';
    }

    if (score >= 60) {
      return 'Not bad!';
    }

    return 'Keep practicing!';

  };


  /*
   * -----------------------------
   * Format attempt date
   * -----------------------------
   */

  const formatAttemptDate = (attemptItem) => {

    const date =
      attemptItem?.completedAt ??
      attemptItem?.completed_at ??
      attemptItem?.createdAt ??
      attemptItem?.created_at;


    if (!date) {
      return 'Unknown date';
    }


    const parsedDate =
      new Date(date);


    if (Number.isNaN(parsedDate.getTime())) {
      return 'Unknown date';
    }


    return parsedDate.toLocaleDateString(
      'en-AU',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    );

  };


  /*
   * -----------------------------
   * Open historical attempt
   * -----------------------------
   */

  const handleAttemptClick = (attemptItem) => {

    const attemptId =
      attemptItem?.id;


    if (!attemptId) {
      return;
    }


    /*
     * Current attempt is already
     * displayed on this page.
     */
    if (
      attempt?.id &&
      Number(attempt.id) ===
        Number(attemptId)
    ) {

      return;

    }


    navigate(
      `/quizzes/${quizId}/attempts/${attemptId}`
    );

  };


  /*
   * -----------------------------
   * Render
   * -----------------------------
   */

  return (

    <div className="max-w-5xl mx-auto">


      {/* ========================= */}
      {/* Back to document */}
      {/* ========================= */}

      <div className="mb-6">

        <Link
          to={`/documents/${quiz.document.id}`}
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200"
        >

          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
            strokeWidth={2}
          />

          Back to Document

        </Link>

      </div>


      <PageHeader
        title={`${quiz.title || 'Quiz'} Results`}
      />


      {/* ========================= */}
      {/* Score Card */}
      {/* ========================= */}

      <div className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 mb-6">

        <div className="text-center space-y-6">


          <div className="inline-flex items-center justify-center w-15 h-15 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 shadow-lg shadow-emerald-500/25">

            <Trophy
              className="w-7 h-7 text-emerald-600"
              strokeWidth={2}
            />

          </div>


          <div>

            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">

              {currentAttemptNumber
                ? `Attempt ${currentAttemptNumber} Score`
                : 'Your Score'}

            </p>


            <div
              className={`inline-block text-5xl font-bold bg-linear-to-r ${getScoreColor(currentScore)} bg-clip-text text-transparent mb-2`}
            >

              {currentScore}%

            </div>


            <p className="text-lg font-medium text-slate-700">

              {getScoreMessage(currentScore)}

            </p>

          </div>


          {/* Current attempt stats */}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">


            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">

              <Target
                className="w-4 h-4 text-slate-600"
                strokeWidth={2}
              />

              <span className="text-sm font-semibold text-slate-700">

                {totalQuestions} Total

              </span>

            </div>


            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">

              <CheckCircle2
                className="w-4 h-4 text-emerald-600"
                strokeWidth={2}
              />

              <span className="text-sm font-semibold text-emerald-700">

                {correctAnswers} Correct

              </span>

            </div>


            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl">

              <XCircle
                className="w-4 h-4 text-rose-600"
                strokeWidth={2}
              />

              <span className="text-sm font-semibold text-rose-700">

                {incorrectAnswers} Incorrect

              </span>

            </div>


          </div>

        </div>

      </div>


      {/* ========================= */}
      {/* Overall Statistics */}
      {/* ========================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">


        {/* Best Score */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">

              <Trophy
                className="w-5 h-5 text-amber-500"
              />

            </div>


            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Best Score
              </p>

              <p className="text-2xl font-bold text-slate-900">
                {bestScore}%
              </p>

            </div>

          </div>

        </div>


        {/* Latest Score */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">

              <TrendingUp
                className="w-5 h-5 text-emerald-600"
              />

            </div>


            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Latest Score
              </p>

              <p className="text-2xl font-bold text-slate-900">
                {latestScore}%
              </p>

            </div>

          </div>

        </div>


        {/* Attempts */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">

              <History
                className="w-5 h-5 text-blue-600"
              />

            </div>


            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Attempts
              </p>

              <p className="text-2xl font-bold text-slate-900">
                {totalAttempts}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ========================= */}
      {/* Actions */}
      {/* ========================= */}

      <div className="flex flex-wrap gap-3 mb-8">


        <Link
          to={`/quizzes/${quizId}`}
          className="inline-flex items-center justify-center gap-2 px-6 h-11 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25"
        >

          <RotateCcw
            className="w-4 h-4"
          />

          Retake Quiz

        </Link>


        <Link
          to={`/documents/${quiz.document.id}`}
          className="inline-flex items-center justify-center gap-2 px-6 h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
        >

          <ArrowLeft
            className="w-4 h-4"
          />

          Return to Document

        </Link>


      </div>


      {/* ========================= */}
      {/* Attempt History */}
      {/* ========================= */}

      <div className="mb-10">


        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-3">

            <History
              className="w-5 h-5 text-slate-600"
            />

            <div>

              <h3 className="text-lg font-semibold text-slate-900">
                Attempt History
              </h3>

              <p className="text-sm text-slate-500">
                {totalAttempts} attempt
                {totalAttempts === 1 ? '' : 's'}
              </p>

            </div>

          </div>

        </div>


        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">


          {attemptsLoading ? (

            <div className="flex justify-center py-8">

              <Spinner />

            </div>

          ) : attempts.length === 0 ? (

            <div className="p-6 text-center text-sm text-slate-500">

              No attempts found.

            </div>

          ) : (

            <div className="divide-y divide-slate-100">


              {attempts.map(
                (attemptItem, index) => {


                  const itemScore =
                    Number(
                      attemptItem?.score ?? 0
                    );


                  const itemNumber =
                    attemptItem?.attemptNumber ??
                    attemptItem?.attempt_number ??
                    attempts.length - index;


                  const isCurrentAttempt =
                    attempt?.id &&
                    Number(attempt.id) ===
                      Number(attemptItem?.id);


                  return (

                    <button
                      key={attemptItem.id}
                      type="button"
                      onClick={() =>
                        handleAttemptClick(
                          attemptItem
                        )
                      }
                      disabled={isCurrentAttempt}
                      className={`w-full px-5 py-4 flex items-center justify-between gap-4 text-left transition-colors ${
                        isCurrentAttempt
                          ? 'bg-emerald-50/70 cursor-default'
                          : 'hover:bg-slate-50 cursor-pointer'
                      }`}
                    >


                      {/* Attempt information */}

                      <div className="flex items-center gap-4">


                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isCurrentAttempt
                              ? 'bg-emerald-100'
                              : 'bg-slate-100'
                          }`}
                        >

                          <span
                            className={`text-sm font-bold ${
                              isCurrentAttempt
                                ? 'text-emerald-700'
                                : 'text-slate-700'
                            }`}
                          >

                            {itemNumber}

                          </span>

                        </div>


                        <div>

                          <p className="text-sm font-semibold text-slate-900">

                            Attempt {itemNumber}


                            {isCurrentAttempt && (

                              <span className="ml-2 text-xs font-medium text-emerald-600">

                                Current

                              </span>

                            )}

                          </p>


                          <p className="text-xs text-slate-500 mt-0.5">

                            {formatAttemptDate(
                              attemptItem
                            )}

                          </p>

                        </div>

                      </div>


                      {/* Score */}

                      <div className="text-right">

                        <p
                          className={`text-lg font-bold ${
                            itemScore >= 80
                              ? 'text-emerald-600'
                              : itemScore >= 60
                                ? 'text-amber-600'
                                : 'text-rose-600'
                          }`}
                        >

                          {itemScore}%

                        </p>


                        <p className="text-xs text-slate-400">

                          {isCurrentAttempt
                            ? 'Current result'
                            : 'View details'}

                        </p>

                      </div>


                    </button>

                  );

                }
              )}

            </div>

          )}

        </div>

      </div>


      {/* ========================= */}
      {/* Detailed Review */}
      {/* ========================= */}

      <div className="space-y-6">


        <div className="flex items-center gap-3 mb-2">

          <BookOpen
            className="w-5 h-5 text-slate-600"
            strokeWidth={2}
          />

          <h3 className="text-lg font-semibold text-slate-900">
            Detailed Review
          </h3>

        </div>


        {detailedResults.map(
          (result, index) => {


            /*
             * Find user's selected option
             */
            const userAnswerIndex =
              Array.isArray(result.options)
                ? result.options.findIndex(
                    (option) =>
                      option ===
                      result.selectedAnswer
                  )
                : -1;


            /*
             * Find correct option.
             *
             * Backend can return:
             *
             * O2: The view layer
             *
             * or simply:
             *
             * The view layer
             */
            let correctAnswerIndex = -1;


            if (
              typeof result.correctAnswer ===
                'string' &&
              /^O\d+:/i.test(
                result.correctAnswer
              )
            ) {

              const match =
                result.correctAnswer.match(
                  /^O(\d+):/i
                );


              if (match) {

                correctAnswerIndex =
                  parseInt(
                    match[1],
                    10
                  ) - 1;

              }

            } else {

              correctAnswerIndex =
                Array.isArray(result.options)
                  ? result.options.findIndex(
                      (option) =>
                        option ===
                        result.correctAnswer
                    )
                  : -1;

            }


            const isCorrect =
              Boolean(
                result.isCorrect
              );


            return (

              <div
                key={
                  result.id ||
                  index
                }
                className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50"
              >


                {/* Question header */}

                <div className="flex items-start justify-between gap-4 mb-3">


                  <div className="flex-1">


                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg mb-3">

                      <span className="text-xs font-semibold text-slate-600">

                        Question {index + 1}

                      </span>

                    </div>


                    <h4 className="text-base font-semibold text-slate-900 leading-relaxed">

                      {result.question}

                    </h4>

                  </div>


                  {/* Correct / incorrect icon */}

                  <div
                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      isCorrect
                        ? 'bg-emerald-50 border-2 border-emerald-200'
                        : 'bg-rose-50 border-2 border-rose-200'
                    }`}
                  >

                    {isCorrect ? (

                      <CheckCircle2
                        className="w-5 h-5 text-emerald-600"
                        strokeWidth={2.5}
                      />

                    ) : (

                      <XCircle
                        className="w-5 h-5 text-rose-600"
                        strokeWidth={2.5}
                      />

                    )}

                  </div>


                </div>


                {/* Options */}

                <div className="space-y-3 mb-4">


                  {Array.isArray(
                    result.options
                  ) && result.options.map(
                    (
                      option,
                      optIndex
                    ) => {


                      const isCorrectOption =
                        optIndex ===
                        correctAnswerIndex;


                      const isUserAnswer =
                        optIndex ===
                        userAnswerIndex;


                      const isWrongAnswer =
                        isUserAnswer &&
                        !isCorrect;


                      return (

                        <div
                          key={optIndex}
                          className={`relative px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                            isCorrectOption
                              ? 'bg-emerald-50 border-emerald-300 shadow-lg shadow-emerald-500/10'
                              : isWrongAnswer
                                ? 'bg-rose-50 border-rose-300'
                                : 'bg-slate-50 border-slate-200'
                          }`}
                        >


                          <div className="flex items-center justify-between gap-3">


                            <span
                              className={`text-sm font-medium ${
                                isCorrectOption
                                  ? 'text-emerald-900'
                                  : isWrongAnswer
                                    ? 'text-rose-900'
                                    : 'text-slate-700'
                              }`}
                            >

                              {option}

                            </span>


                            <div className="flex items-center gap-2">


                              {isCorrectOption && (

                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-700">

                                  <CheckCircle2
                                    className="w-3 h-3"
                                    strokeWidth={2.5}
                                  />

                                  Correct

                                </span>

                              )}


                              {isWrongAnswer && (

                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 border border-rose-300 rounded-lg text-xs font-semibold text-rose-700">

                                  <XCircle
                                    className="w-3 h-3"
                                    strokeWidth={2.5}
                                  />

                                  Your Answer

                                </span>

                              )}


                            </div>

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>


                {/* Explanation */}

                {result.explanation && (

                  <div className="p-4 bg-linear-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl">

                    <div className="flex items-start gap-3">


                      <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center mt-0.5">

                        <BookOpen
                          className="w-4 h-4 text-slate-600"
                          strokeWidth={2}
                        />

                      </div>


                      <div className="flex-1">


                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">

                          Explanation

                        </p>


                        <p className="text-sm text-slate-700 leading-relaxed">

                          {result.explanation}

                        </p>


                      </div>

                    </div>

                  </div>

                )}


              </div>

            );

          }
        )}

      </div>


      {/* ========================= */}
      {/* Bottom action */}
      {/* ========================= */}

      <div className="mt-8 flex justify-center">


        <Link
          to={`/documents/${quiz.document.id}`}
          className="group relative px-8 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 overflow-hidden"
        >

          <span className="relative z-10 flex items-center gap-2">

            <ArrowLeft
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
              strokeWidth={2.5}
            />

            Return to Document

          </span>

        </Link>

      </div>


    </div>

  );

};


export default QuizResultPage;
