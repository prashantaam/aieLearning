<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Port of backend/utils/geminiService.js.
 *
 * The original Node code used the official @google/genai SDK. Laravel has
 * no first-party SDK for Gemini, so we call the public REST endpoint
 * directly with the Laravel HTTP client, which is equivalent.
 */
class GeminiService
{
    private string $apiKey;
    private string $model;

    public function __construct()
    {
        $this->apiKey = (string) config('services.gemini.key');
        $this->model = (string) config('services.gemini.model', 'gemini-2.5-flash-lite');

        if (empty($this->apiKey)) {
            throw new RuntimeException('GEMINI_API_KEY is not set in the environment variables.');
        }
    }

    /**
     * @return array<int, array{question: string, answer: string, difficulty: string}>
     */
    public function generateFlashcards(string $text, int $count = 10): array
    {
        $prompt = <<<PROMPT
        Generate exactly {$count} educational flashcards from the following text.
        Format each flashcard as:
        Q: [Clear, specific question]
        A: [Concise, accurate answer]
        D: [Difficulty level: easy, medium, or hard]

        Separate each flashcard with "---"

        Text:
        {$this->truncate($text, 15000)}
        PROMPT;

        $generatedText = $this->generateContent($prompt, 'Failed to generate flashcards');

        $flashcards = [];
        $cards = array_filter(array_map('trim', explode('---', $generatedText)));

        foreach ($cards as $card) {
            $question = '';
            $answer = '';
            $difficulty = 'medium';

            foreach (preg_split('/\r?\n/', trim($card)) as $line) {
                if (str_starts_with($line, 'Q:')) {
                    $question = trim(substr($line, 2));
                } elseif (str_starts_with($line, 'A:')) {
                    $answer = trim(substr($line, 2));
                } elseif (str_starts_with($line, 'D:')) {
                    $diff = strtolower(trim(substr($line, 2)));
                    if (in_array($diff, ['easy', 'medium', 'hard'], true)) {
                        $difficulty = $diff;
                    }
                }
            }

            if ($question !== '' && $answer !== '') {
                $flashcards[] = compact('question', 'answer', 'difficulty');
            }
        }

        return array_slice($flashcards, 0, $count);
    }

    /**
     * @return array<int, array{question: string, options: array, correctAnswer: string, explanation: string, difficulty: string}>
     */
    public function generateQuiz(string $text, int $numQuestions = 5): array
    {
        $prompt = <<<PROMPT
        Generate exactly {$numQuestions} multiple choice questions from the following text.
        Format each question as:
        Q: [Question]
        O1: [Option 1]
        O2: [Option 2]
        O3: [Option 3]
        O4: [Option 4]
        C: [Correct option - exactly as written above]
        E: [Brief explanation]
        D: [Difficulty: easy, medium, or hard]

        Separate questions with "---"

        Text:
        {$this->truncate($text, 15000)}
        PROMPT;

        $generatedText = $this->generateContent($prompt, 'Failed to generate quiz');

        $questions = [];
        $blocks = array_filter(array_map('trim', explode('---', $generatedText)));

        foreach ($blocks as $block) {
            $question = '';
            $options = [];
            $correctAnswer = '';
            $explanation = '';
            $difficulty = 'medium';

            foreach (preg_split('/\r?\n/', trim($block)) as $line) {
                $trimmed = trim($line);

                if (str_starts_with($trimmed, 'Q:')) {
                    $question = trim(substr($trimmed, 2));
                } elseif (preg_match('/^O\d:/', $trimmed)) {
                    $options[] = trim(substr($trimmed, 3));
                } elseif (str_starts_with($trimmed, 'C:')) {
                    $correctAnswer = trim(substr($trimmed, 2));
                } elseif (str_starts_with($trimmed, 'E:')) {
                    $explanation = trim(substr($trimmed, 2));
                } elseif (str_starts_with($trimmed, 'D:')) {
                    $diff = strtolower(trim(substr($trimmed, 2)));
                    if (in_array($diff, ['easy', 'medium', 'hard'], true)) {
                        $difficulty = $diff;
                    }
                }
            }

            if ($question !== '' && count($options) === 4 && $correctAnswer !== '') {
                $questions[] = compact('question', 'options', 'correctAnswer', 'explanation', 'difficulty');
            }
        }

        return array_slice($questions, 0, $numQuestions);
    }

    public function generateSummary(string $text): string
    {
        $prompt = <<<PROMPT
        Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important points.
        Keep the summary clear and structured.

        Text:
        {$this->truncate($text, 20000)}
        PROMPT;

        return $this->generateContent($prompt, 'Failed to generate summary');
    }

    /**
     * @param  array<int, array{content: string, chunkIndex?: int}>  $chunks
     */
    public function chatWithContext(string $question, array $chunks): string
    {
        $context = collect($chunks)
            ->values()
            ->map(fn ($chunk, $i) => '[Chunk '.($i + 1).']'."\n".$chunk['content'])
            ->implode("\n\n");

        $prompt = <<<PROMPT
        Based on the following context from a document, Analyse the context and answer the user's question accurately and concisely according to the context.
        If the answer is not in the context, say so.

        Context:
        {$context}

        Question: {$question}

        Answer:
        PROMPT;

        return $this->generateContent($prompt, 'Failed to process chat request');
    }

    public function explainConcept(string $concept, string $context): string
    {
        $prompt = <<<PROMPT
        Explain the concept of "{$concept}" based on the following context.
        Provide a clear, educational explanation that's easy to understand.
        Include examples if relevant.

        Context:
        {$this->truncate($context, 10000)}
        PROMPT;

        return $this->generateContent($prompt, 'Failed to explain concept');
    }

    public function generateLearningContent(string $title): string
    {
        $prompt = <<<PROMPT
        You are an expert educator and instructional content creator for an online learning platform.

        Create a clear, accurate, engaging, and well-structured lesson about the following topic:

        Topic: "{$title}"

        Target audience:
        Beginner to intermediate learners.

        Adapt the lesson to the subject automatically. The topic may come from areas such as programming, mathematics, statistics, finance, science, business, languages, technology, or other academic and professional subjects.

        Requirements:
        - Explain the topic clearly and accurately.
        - Start with a short introduction explaining what the topic is and why it is important.
        - Organise the lesson using meaningful headings and subheadings.
        - Introduce foundational concepts before more advanced concepts.
        - Explain important concepts step by step.
        - Define important terminology when it first appears.
        - Include practical examples where appropriate.
        - Include worked examples for mathematics, statistics, finance, or other calculation-based topics.
        - Show formulas and explain each variable or component when relevant.
        - Show calculations step by step when solving numerical problems.
        - Include code examples only when relevant to the topic.
        - Explain code examples clearly when code is included.
        - Include real-world examples or applications when appropriate.
        - Include important rules, principles, assumptions, key points, or best practices where relevant.
        - Highlight common mistakes or misunderstandings when useful.
        - Do not force programming examples into non-programming subjects.
        - Do not force formulas or calculations into topics where they are not relevant.
        - Finish with a concise summary of the key learning points.
        - Avoid unnecessary conversational text.

        Formatting requirements:
        - Return the entire response in Markdown.
        - Use # for the main lesson heading.
        - Use ## for major sections.
        - Use ### for subsections when needed.
        - Use bullet lists or numbered lists where appropriate.
        - Use **bold text** for important terms and concepts.
        - Use inline code only for programming-related terms, commands, variables, functions, or syntax.
        - Use fenced code blocks with the appropriate programming language only when code examples are relevant.
        - Write mathematical and statistical formulas clearly using standard mathematical notation.
        - Keep worked calculations easy to follow.
        - Do not wrap the entire response inside one code block.
        - Do not include introductory phrases such as "Here is your lesson".
        - Return only the educational lesson content.
        PROMPT;

        return $this->generateContent(
            $prompt,
            'Failed to generate learning content'
        );
    }

    private function truncate(string $text, int $maxChars): string
    {
        return Str::limit($text, $maxChars, '');
    }

    private function generateContent(string $prompt, string $errorMessage): string
    {
        try {
            $response = Http::timeout(60)
                ->withHeaders(['x-goog-api-key' => $this->apiKey])
                ->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent",
                    [
                        'contents' => [
                            ['parts' => [['text' => $prompt]]],
                        ],
                    ]
                );

            if ($response->failed()) {
                logger()->error('Gemini API error', ['body' => $response->body()]);
                throw new RuntimeException($errorMessage);
            }

            $candidates = $response->json('candidates', []);
            $text = collect($candidates[0]['content']['parts'] ?? [])
                ->pluck('text')
                ->implode('');

            return trim($text);
        } catch (\Throwable $e) {
            logger()->error('Gemini API error', ['message' => $e->getMessage()]);
            throw new RuntimeException($errorMessage);
        }
    }

    public function generateCourseChapters(string $subjectTitle, ?string $subjectDescription = null): array 
    {
            $description = $subjectDescription ?: 'No additional description provided.';

            $prompt = <<<PROMPT
        You are an expert course designer for an online learning platform.

        Create a well-structured course curriculum for the following subject.

        Subject:
        {$subjectTitle}

        Course description:
        {$description}

        Target audience:
        Beginner to intermediate learners.

        Requirements:
        - Create between 8 and 12 chapters.
        - Arrange chapters in a logical learning order.
        - Start with foundational concepts.
        - Gradually move toward more practical and advanced topics.
        - Each chapter should have a clear title.
        - Each chapter should include a short description.
        - Do not include quizzes, flashcards or exercises as separate chapters.
        - Avoid duplicate or overly similar chapters.

        Return each chapter exactly in this format:

        TITLE: Chapter title
        DESCRIPTION: Short chapter description

        Separate each chapter using:

        ---

        Return only the chapter list.

        PROMPT;

            $response = $this->generateContent(
                $prompt,
                'Failed to generate course chapters'
            );

            $chapters = [];

            $blocks = preg_split('/\s*---\s*/', trim($response));

            foreach ($blocks as $block) {
                preg_match('/TITLE:\s*(.+)/i', $block, $titleMatch);
                preg_match('/DESCRIPTION:\s*(.+)/is', $block, $descriptionMatch);

                if (!empty($titleMatch[1])) {
                    $chapters[] = [
                        'title' => trim($titleMatch[1]),
                        'description' => isset($descriptionMatch[1])
                            ? trim($descriptionMatch[1])
                            : null,
                    ];
                }
            }

            return $chapters;
    }
}
