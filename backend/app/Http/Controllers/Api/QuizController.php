<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    /**
     * GET /api/quizzes/{documentId}
     */

public function indexForDocument(Request $request, int $documentId)
{
    $quizzes = Quiz::with('document')
        ->where('user_id', $request->user()->id)
        ->where('document_id', $documentId)
        ->withCount('attempts')
        ->with([
            'attempts' => function ($query) use ($request) {
                $query
                    ->where('user_id', $request->user()->id)
                    ->orderByDesc('attempt_number');
            },
        ])
        ->orderByDesc('created_at')
        ->get();

    return response()->json([
        'success' => true,
        'count' => $quizzes->count(),

        'data' => $quizzes->map(function ($quiz) {

            $attempts = $quiz->attempts;

            $bestScore = $attempts->max('score') ?? 0;

            $latestAttempt = $attempts->first();

            $data = $quiz->toResponseArray();

            $data['attemptCount'] = $attempts->count();
            $data['bestScore'] = $bestScore;
            $data['latestScore'] = $latestAttempt?->score;
            $data['latestAttemptNumber'] =
                $latestAttempt?->attempt_number;

            return $data;

        })->values(),
    ]);
}


    /**
     * GET /api/quizzes/quiz/{id}
     */
    public function show(Request $request, int $id)
    {
        $quiz = Quiz::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $quiz) {
            return $this->notFound();
        }

        /*
         * Get user's attempt information.
         */
        $attempts = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $request->user()->id);

        $attemptCount = $attempts->count();
        $bestScore = (clone $attempts)->max('score');

        $latestAttempt = (clone $attempts)
            ->orderByDesc('attempt_number')
            ->first();

        $data = $quiz->toResponseArray();

        $data['attemptCount'] = $attemptCount;
        $data['bestScore'] = $bestScore ?? 0;
        $data['latestScore'] = $latestAttempt?->score;
        $data['latestAttemptNumber'] = $latestAttempt?->attempt_number;

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * POST /api/quizzes/{id}/submit
     *
     * Creates a NEW attempt every time the quiz is submitted.
     */
    public function submit(Request $request, int $id)
    {
        $answers = $request->input('answers');

        if (! is_array($answers)) {
            return response()->json([
                'success' => false,
                'error' => 'Please provide answers array',
                'statusCode' => 400,
            ], 400);
        }

        $quiz = Quiz::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $quiz) {
            return $this->notFound();
        }

        $questions = $quiz->questions ?? [];

        if (count($questions) === 0) {
            return response()->json([
                'success' => false,
                'error' => 'Quiz has no questions',
                'statusCode' => 400,
            ], 400);
        }

        /*
         * Make sure the user answered every question.
         */
        if (count($answers) !== count($questions)) {
            return response()->json([
                'success' => false,
                'error' => 'Please answer all questions before submitting.',
                'statusCode' => 400,
            ], 400);
        }

        $correctCount = 0;
        $userAnswers = [];

        foreach ($answers as $answer) {

            $questionIndex = $answer['questionIndex'] ?? null;
            $selectedAnswer = $answer['selectedAnswer'] ?? null;

            if (
                $questionIndex === null ||
                ! is_numeric($questionIndex) ||
                (int) $questionIndex < 0 ||
                (int) $questionIndex >= count($questions)
            ) {
                continue;
            }

            $questionIndex = (int) $questionIndex;
            $question = $questions[$questionIndex];

            /*
             * ---------------------------------------------------------
             * Determine the correct answer.
             * ---------------------------------------------------------
             *
             * Your AI-generated questions are stored like:
             *
             * "correctAnswer": "O2: The view layer of an application"
             *
             * Therefore we extract O2 and use options[1].
             */

            $correctAnswer = $question['correctAnswer'] ?? null;

            $correctAnswerText = $correctAnswer;

            if (is_string($correctAnswer)) {

                $correctAnswer = trim($correctAnswer);

                /*
                 * Match:
                 *
                 * O1: Answer
                 * O2: Answer
                 * O3: Answer
                 * O4: Answer
                 */
                if (
                    preg_match(
                        '/^O(\d+)\s*:\s*(.*)$/i',
                        $correctAnswer,
                        $matches
                    )
                ) {

                    $correctOptionIndex = (int) $matches[1] - 1;

                    /*
                     * Prefer the actual option stored in the options array.
                     */
                    if (
                        isset($question['options']) &&
                        isset($question['options'][$correctOptionIndex])
                    ) {
                        $correctAnswerText =
                            $question['options'][$correctOptionIndex];
                    } else {
                        /*
                         * Fallback to the text after O2:
                         */
                        $correctAnswerText = trim($matches[2]);
                    }
                }
            }

            /*
             * ---------------------------------------------------------
             * Compare selected answer with correct answer.
             * ---------------------------------------------------------
             */
            $isCorrect =
                is_string($selectedAnswer) &&
                is_string($correctAnswerText) &&
                trim($selectedAnswer) === trim($correctAnswerText);

            if ($isCorrect) {
                $correctCount++;
            }

            $userAnswers[] = [
                'questionIndex' => $questionIndex,
                'selectedAnswer' => $selectedAnswer,
                'isCorrect' => $isCorrect,
                'answeredAt' => now()->toIso8601String(),
            ];
        }

        /*
         * ---------------------------------------------------------
         * Calculate score.
         * ---------------------------------------------------------
         *
         * Example:
         *
         * 5 / 5 = 100%
         * 4 / 5 = 80%
         * 3 / 5 = 60%
         * 2 / 5 = 40%
         */

        $totalQuestions = count($questions);

        $score = $totalQuestions > 0
            ? (int) round(
                ($correctCount / $totalQuestions) * 100
            )
            : 0;

        /*
         * ---------------------------------------------------------
         * Determine attempt number.
         * ---------------------------------------------------------
         */

        $lastAttemptNumber = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $request->user()->id)
            ->max('attempt_number');

        $attemptNumber = ((int) $lastAttemptNumber) + 1;

        /*
         * ---------------------------------------------------------
         * Create a NEW quiz attempt.
         * ---------------------------------------------------------
         *
         * Every submission gets its own database record.
         */

        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => $request->user()->id,
            'attempt_number' => $attemptNumber,
            'correct_count' => $correctCount,
            'total_questions' => $totalQuestions,
            'score' => $score,
            'user_answers' => $userAnswers,
            'completed_at' => now(),
        ]);

        /*
         * ---------------------------------------------------------
         * Keep the Quiz record updated with the LATEST attempt.
         * ---------------------------------------------------------
         *
         * These fields are retained for compatibility with your
         * existing application.
         */

        $quiz->update([
            'user_answers' => $userAnswers,
            'score' => $score,
            'completed_at' => now(),
        ]);

        /*
         * ---------------------------------------------------------
         * Calculate best score.
         * ---------------------------------------------------------
         */

        $bestScore = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $request->user()->id)
            ->max('score');

        /*
         * ---------------------------------------------------------
         * Return submission result.
         * ---------------------------------------------------------
         */

        return response()->json([
            'success' => true,
            'data' => [
                'attemptId' => $attempt->id,
                'attemptNumber' => $attemptNumber,
                'quizId' => $quiz->id,
                'score' => $score,
                'correctCount' => $correctCount,
                'totalQuestions' => $totalQuestions,
                'percentage' => $score,
                'bestScore' => $bestScore ?? 0,
                'userAnswers' => $userAnswers,
            ],
            'message' => 'Quiz submitted successfully',
        ]);
    }

    /**
     * GET /api/quizzes/{id}/results
     *
     * Returns the LATEST attempt results.
     */
    public function results(Request $request, int $id)
    {
        $quiz = Quiz::with('document')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $quiz) {
            return $this->notFound();
        }

        /*
         * Get the latest attempt.
         */
        $attempt = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $request->user()->id)
            ->orderByDesc('attempt_number')
            ->first();

        if (! $attempt) {
            return response()->json([
                'success' => false,
                'error' => 'Quiz has not been completed yet',
                'statusCode' => 400,
            ], 400);
        }

        $detailedResults = $this->buildDetailedResults(
            $quiz,
            $attempt
        );

        /*
         * Get best score.
         */
        $bestScore = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $request->user()->id)
            ->max('score');

        /*
         * Get total attempt count.
         */
        $attemptCount = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $request->user()->id)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'quiz' => [
                    'id' => $quiz->id,
                    'title' => $quiz->title,

                    'document' => $quiz->document
                        ? [
                            'id' => $quiz->document->id,
                            'title' => $quiz->document->title,
                        ]
                        : null,

                    /*
                     * Latest attempt information.
                     */
                    'score' => $attempt->score,
                    'totalQuestions' => $attempt->total_questions,
                    'correctCount' => $attempt->correct_count,
                    'completedAt' => $attempt->completed_at?->toIso8601String(),

                    /*
                     * Attempt information.
                     */
                    'attemptId' => $attempt->id,
                    'attemptNumber' => $attempt->attempt_number,
                    'attemptCount' => $attemptCount,
                    'bestScore' => $bestScore ?? 0,
                ],

                'results' => $detailedResults,
            ],
        ]);
    }

    /**
     * GET /api/quizzes/{id}/attempts
     *
     * Returns all attempts for a quiz.
     */
    public function attempts(Request $request, int $id)
    {
        $quiz = Quiz::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $quiz) {
            return $this->notFound();
        }

        $attempts = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $request->user()->id)
            ->orderByDesc('attempt_number')
            ->get();

        $bestScore = $attempts->max('score') ?? 0;

        return response()->json([
            'success' => true,
            'data' => [
                'quizId' => $quiz->id,
                'attemptCount' => $attempts->count(),
                'bestScore' => $bestScore,

                'latestScore' => $attempts->first()?->score,

                'attempts' => $attempts->map(function ($attempt) {
                    return [
                        'id' => $attempt->id,
                        'attemptNumber' => $attempt->attempt_number,
                        'correctCount' => $attempt->correct_count,
                        'totalQuestions' => $attempt->total_questions,
                        'score' => $attempt->score,
                        'completedAt' => $attempt->completed_at
                            ?->toIso8601String(),
                        'userAnswers' => $attempt->user_answers,
                    ];
                })->values(),
            ],
        ]);
    }

    /**
     * GET /api/quizzes/{id}/attempts/{attemptId}
     *
     * Returns results for a specific attempt.
     */
    public function attemptResults(
        Request $request,
        int $id,
        int $attemptId
    ) {
        $quiz = Quiz::with('document')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $quiz) {
            return $this->notFound();
        }

        $attempt = QuizAttempt::where('id', $attemptId)
            ->where('quiz_id', $quiz->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $attempt) {
            return response()->json([
                'success' => false,
                'error' => 'Quiz attempt not found',
                'statusCode' => 404,
            ], 404);
        }

        $detailedResults = $this->buildDetailedResults(
            $quiz,
            $attempt
        );

        $bestScore = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $request->user()->id)
            ->max('score');

        $attemptCount = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $request->user()->id)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'quiz' => [
                    'id' => $quiz->id,
                    'title' => $quiz->title,

                    'document' => $quiz->document
                        ? [
                            'id' => $quiz->document->id,
                            'title' => $quiz->document->title,
                        ]
                        : null,

                    'score' => $attempt->score,
                    'totalQuestions' => $attempt->total_questions,
                    'correctCount' => $attempt->correct_count,
                    'completedAt' => $attempt->completed_at
                        ?->toIso8601String(),

                    'attemptId' => $attempt->id,
                    'attemptNumber' => $attempt->attempt_number,
                    'attemptCount' => $attemptCount,
                    'bestScore' => $bestScore ?? 0,
                ],

                'results' => $detailedResults,
            ],
        ]);
    }

    /**
     * DELETE /api/quizzes/{id}
     */
    public function destroy(Request $request, int $id)
    {
        $quiz = Quiz::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $quiz) {
            return $this->notFound();
        }

        /*
         * quiz_attempts will automatically be deleted because
         * the foreign key uses cascadeOnDelete().
         */
        $quiz->delete();

        return response()->json([
            'success' => true,
            'message' => 'Quiz deleted successfully',
        ]);
    }

    /**
     * Build detailed results for an attempt.
     */
    private function buildDetailedResults(
        Quiz $quiz,
        QuizAttempt $attempt
    ) {
        $userAnswers = collect($attempt->user_answers ?? []);

        return collect($quiz->questions ?? [])
            ->values()
            ->map(function ($question, $index) use ($userAnswers) {

                $userAnswer = $userAnswers->firstWhere(
                    'questionIndex',
                    $index
                );

                return [
                    'questionIndex' => $index,
                    'question' => $question['question'] ?? '',
                    'options' => $question['options'] ?? [],
                    'correctAnswer' => $question['correctAnswer'] ?? null,
                    'selectedAnswer' => $userAnswer['selectedAnswer'] ?? null,
                    'isCorrect' => $userAnswer['isCorrect'] ?? false,
                    'explanation' => $question['explanation'] ?? '',
                ];
            })
            ->values();
    }

    /**
     * Return a standard 404 response.
     */
    private function notFound()
    {
        return response()->json([
            'success' => false,
            'error' => 'Quiz not found',
            'statusCode' => 404,
        ], 404);
    }
}

