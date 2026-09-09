import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

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
} from 'lucide-react';


const QuizAttemptResultPage = () => {

  const {
    quizId,
    attemptId,
  } = useParams();


  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);


  /*
   * --------------------------------
   * Fetch historical attempt
   * --------------------------------
   */
  useEffect(() => {

    const fetchAttempt = async () => {

      try {

        const response =
          await quizService.getQuizAttemptResults(
            quizId,
            attemptId
          );


        console.log(
          'ATTEMPT RESULT RESPONSE:',
          response
        );


        setData(response);


      } catch (error) {

        console.error(
          'Failed to fetch attempt results:',
          error
        );


        toast.error(
          error?.message ||
          'Failed to fetch attempt results.'
        );

      } finally {

        setLoading(false);

      }

    };


    if (quizId && attemptId) {
      fetchAttempt();
    }

  }, [quizId, attemptId]);


  /*
   * --------------------------------
   * Loading
   * --------------------------------
   */
  if (loading) {

    return (

      <div className="flex items-center justify-center min-h-[60vh]">

        <Spinner />

      </div>

    );

  }


  /*
   * --------------------------------
   * Validate response
   * --------------------------------
   */
  if (
    !data ||
    !data.data
  ) {

    return (

      <div className="flex items-center justify-center min-h-[60vh]">

        <div className="text-center">

          <p className="text-slate-600 text-lg">
            Attempt results not found.
          </p>


          <Link
            to={`/quizzes/${quizId}/results`}
            className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >

            <ArrowLeft
              className="w-4 h-4"
            />

            Back to Quiz Results

          </Link>

        </div>

      </div>

    );

  }


  /*
   * --------------------------------
   * Extract data
   * --------------------------------
   */
  const responseData =
    data.data;


  const quiz =
    responseData.quiz;


  const attempt =
    responseData.attempt;


  const detailedResults =
    Array.isArray(
      responseData.results
    )
      ? responseData.results
      : [];


  /*
   * --------------------------------
   * Attempt information
   * --------------------------------
   */

    const score = Number(
        attempt?.score ??
        quiz?.score ??
        0
    );


  const attemptNumber =
    attempt?.attemptNumber ??
    attempt?.attempt_number ??
    attemptId;

    

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
        (result) =>
          result.isCorrect
      ).length
    );


  const incorrectAnswers =
    Math.max(
      0,
      totalQuestions -
        correctAnswers
    );


  /*
   * --------------------------------
   * Score helpers
   * --------------------------------
   */

  const getScoreColor = (value) => {

    if (value >= 80) {
      return 'from-emerald-500 to-teal-500';
    }

    if (value >= 60) {
      return 'from-amber-500 to-orange-500';
    }

    return 'from-rose-500 to-red-500';

  };


  const getScoreMessage = (value) => {

    if (value >= 90) {
      return 'Outstanding!';
    }

    if (value >= 80) {
      return 'Great job!';
    }

    if (value >= 70) {
      return 'Good work!';
    }

    if (value >= 60) {
      return 'Not bad!';
    }

    return 'Keep practicing!';

  };


  /*
   * --------------------------------
   * Format date
   * --------------------------------
   */

  const formatDate = (value) => {

    if (!value) {
      return 'Unknown date';
    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return 'Unknown date';
    }


    return date.toLocaleDateString(
      'en-AU',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    );

  };


  const completedDate =
    attempt?.completedAt ??
    attempt?.completed_at ??
    attempt?.createdAt ??
    attempt?.created_at;


  /*
   * --------------------------------
   * Render
   * --------------------------------
   */

  return (

    <div className="max-w-5xl mx-auto">


      {/* ========================= */}
      {/* Back */}
      {/* ========================= */}

      <div className="mb-6">

        <Link
          to={`/quizzes/${quizId}/results`}
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200"
        >

          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
            strokeWidth={2}
          />

          Back to Quiz Results

        </Link>

      </div>


      {/* ========================= */}
      {/* Header */}
      {/* ========================= */}

      <PageHeader
        title={`${quiz?.title || 'Quiz'} - Attempt ${attemptNumber}`}
      />


      {/* ========================= */}
      {/* Attempt information */}
      {/* ========================= */}

      <div className="mb-6 flex flex-wrap items-center gap-3">

        <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">

          <History
            className="w-4 h-4 text-slate-500"
          />

          <span className="text-sm font-medium text-slate-700">

            Attempt {attemptNumber}

          </span>

        </div>


        {completedDate && (

          <div className="inline-flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">

            <span className="text-sm text-slate-600">

              {formatDate(completedDate)}

            </span>

          </div>

        )}

      </div>


      {/* ========================= */}
      {/* Score Card */}
      {/* ========================= */}

      <div className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 mb-8">

        <div className="text-center space-y-6">


          <div className="inline-flex items-center justify-center w-15 h-15 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 shadow-lg shadow-emerald-500/25">

            <Trophy
              className="w-7 h-7 text-emerald-600"
              strokeWidth={2}
            />

          </div>


          <div>

            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">

              Attempt {attemptNumber} Score

            </p>


            <div
              className={`inline-block text-5xl font-bold bg-linear-to-r ${getScoreColor(score)} bg-clip-text text-transparent mb-2`}
            >

              {score}%

            </div>


            <p className="text-lg font-medium text-slate-700">

              {getScoreMessage(score)}

            </p>

          </div>


          {/* Stats */}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">


            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">

              <Target
                className="w-4 h-4 text-slate-600"
              />

              <span className="text-sm font-semibold text-slate-700">

                {totalQuestions} Total

              </span>

            </div>


            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">

              <CheckCircle2
                className="w-4 h-4 text-emerald-600"
              />

              <span className="text-sm font-semibold text-emerald-700">

                {correctAnswers} Correct

              </span>

            </div>


            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl">

              <XCircle
                className="w-4 h-4 text-rose-600"
              />

              <span className="text-sm font-semibold text-rose-700">

                {incorrectAnswers} Incorrect

              </span>

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
          to={`/quizzes/${quizId}/results`}
          className="inline-flex items-center justify-center gap-2 px-6 h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
        >

          <History
            className="w-4 h-4"
          />

          All Attempts

        </Link>


      </div>


      {/* ========================= */}
      {/* Detailed Review */}
      {/* ========================= */}

      <div className="space-y-6">


        <div className="flex items-center gap-3 mb-2">

          <BookOpen
            className="w-5 h-5 text-slate-600"
          />

          <h3 className="text-lg font-semibold text-slate-900">

            Attempt Review

          </h3>

        </div>


        {detailedResults.map(
          (result, index) => {


            /*
             * User answer
             */

            const userAnswerIndex =
              Array.isArray(
                result.options
              )
                ? result.options.findIndex(
                    (option) =>
                      option ===
                      result.selectedAnswer
                  )
                : -1;


            /*
             * Correct answer
             */

            let correctAnswerIndex =
              -1;


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
                Array.isArray(
                  result.options
                )
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


                  {/* Result icon */}

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
          to={`/quizzes/${quizId}/results`}
          className="group inline-flex items-center justify-center gap-2 px-8 h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
        >

          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
          />

          Back to All Attempts

        </Link>

      </div>


    </div>

  );

};


export default QuizAttemptResultPage;
