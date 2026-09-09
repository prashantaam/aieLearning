<?php

namespace App\Services;

/**
 * Port of backend/utils/textChunker.js
 */
class TextChunkerService
{
    /**
     * Split text into chunks for better AI processing.
     *
     * @return array<int, array{content: string, chunkIndex: int, pageNumber: int}>
     */
    public function chunkText(string $text, int $chunkSize = 500, int $overlap = 50): array
    {
        if (trim($text) === '') {
            return [];
        }

        $cleanedText = trim(preg_replace(
            ['/\r\n/', '/\s+/', '/\n /', '/ \n/'],
            ["\n", ' ', "\n", "\n"],
            $text
        ));

        $paragraphs = array_values(array_filter(
            preg_split('/\n+/', $cleanedText),
            fn ($p) => trim($p) !== ''
        ));

        $chunks = [];
        $currentChunk = [];
        $currentWordCount = 0;
        $chunkIndex = 0;

        $wordsOf = fn (string $s) => preg_split('/\s+/', trim($s));

        foreach ($paragraphs as $paragraph) {
            $paragraphWords = $wordsOf($paragraph);
            $paragraphWordCount = count($paragraphWords);

            if ($paragraphWordCount > $chunkSize) {
                if (count($currentChunk) > 0) {
                    $chunks[] = [
                        'content' => implode("\n\n", $currentChunk),
                        'chunkIndex' => $chunkIndex++,
                        'pageNumber' => 0,
                    ];
                    $currentChunk = [];
                    $currentWordCount = 0;
                }

                for ($i = 0; $i < count($paragraphWords); $i += ($chunkSize - $overlap)) {
                    $chunkWords = array_slice($paragraphWords, $i, $chunkSize);
                    $chunks[] = [
                        'content' => implode(' ', $chunkWords),
                        'chunkIndex' => $chunkIndex++,
                        'pageNumber' => 0,
                    ];

                    if ($i + $chunkSize >= count($paragraphWords)) {
                        break;
                    }
                }
                continue;
            }

            if ($currentWordCount + $paragraphWordCount > $chunkSize && count($currentChunk) > 0) {
                $chunks[] = [
                    'content' => implode("\n\n", $currentChunk),
                    'chunkIndex' => $chunkIndex++,
                    'pageNumber' => 0,
                ];

                $prevChunkText = implode(' ', $currentChunk);
                $prevWords = $wordsOf($prevChunkText);
                $overlapText = implode(' ', array_slice($prevWords, -min($overlap, count($prevWords))));

                $currentChunk = [$overlapText, trim($paragraph)];
                $currentWordCount = count($wordsOf($overlapText)) + $paragraphWordCount;
            } else {
                $currentChunk[] = trim($paragraph);
                $currentWordCount += $paragraphWordCount;
            }
        }

        if (count($currentChunk) > 0) {
            $chunks[] = [
                'content' => implode("\n\n", $currentChunk),
                'chunkIndex' => $chunkIndex,
                'pageNumber' => 0,
            ];
        }

        if (count($chunks) === 0 && $cleanedText !== '') {
            $allWords = $wordsOf($cleanedText);
            for ($i = 0; $i < count($allWords); $i += ($chunkSize - $overlap)) {
                $chunkWords = array_slice($allWords, $i, $chunkSize);
                $chunks[] = [
                    'content' => implode(' ', $chunkWords),
                    'chunkIndex' => $chunkIndex++,
                    'pageNumber' => 0,
                ];

                if ($i + $chunkSize >= count($allWords)) {
                    break;
                }
            }
        }

        return $chunks;
    }

    /**
     * Find relevant chunks based on keyword matching (simple TF-style scoring,
     * identical logic to the original findRelevantChunks()).
     *
     * @param  array<int, array{content: string, chunkIndex: int, pageNumber?: int}>  $chunks
     * @return array<int, array{content: string, chunkIndex: int, pageNumber?: int}>
     */
    public function findRelevantChunks(array $chunks, string $query, int $maxChunks = 3): array
    {
        if (empty($chunks) || trim($query) === '') {
            return [];
        }

        $stopWords = [
            'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
            'in', 'with', 'to', 'for', 'of', 'as', 'by', 'this', 'that', 'it',
        ];

        $queryWords = array_values(array_filter(
            preg_split('/\s+/', strtolower(trim($query))),
            fn ($w) => strlen($w) > 2 && ! in_array($w, $stopWords, true)
        ));

        if (empty($queryWords)) {
            return array_map(fn ($chunk) => [
                'content' => $chunk['content'],
                'chunkIndex' => $chunk['chunkIndex'],
                'pageNumber' => $chunk['pageNumber'] ?? 0,
            ], array_slice($chunks, 0, $maxChunks));
        }

        $total = count($chunks);
        $scored = [];

        foreach ($chunks as $index => $chunk) {
            $content = strtolower($chunk['content']);
            $contentWordCount = max(1, count(preg_split('/\s+/', trim($content))));
            $score = 0;

            foreach ($queryWords as $word) {
                $quoted = preg_quote($word, '/');
                $exactMatches = preg_match_all('/\b'.$quoted.'\b/', $content);
                $score += $exactMatches * 3;

                $partialMatches = preg_match_all('/'.$quoted.'/', $content);
                $score += max(0, $partialMatches - $exactMatches) * 1.5;
            }

            $uniqueWordsFound = count(array_filter($queryWords, fn ($word) => str_contains($content, $word)));
            if ($uniqueWordsFound > 1) {
                $score += $uniqueWordsFound * 2;
            }

            $normalizedScore = $score / sqrt($contentWordCount);
            $positionBonus = 1 - ($index / $total) * 0.1;

            $scored[] = [
                'content' => $chunk['content'],
                'chunkIndex' => $chunk['chunkIndex'],
                'pageNumber' => $chunk['pageNumber'] ?? 0,
                'score' => $normalizedScore * $positionBonus,
                'matchedWords' => $uniqueWordsFound,
            ];
        }

        $scored = array_values(array_filter($scored, fn ($c) => $c['score'] > 0));

        usort($scored, function ($a, $b) {
            if ($b['score'] !== $a['score']) {
                return $b['score'] <=> $a['score'];
            }
            if ($b['matchedWords'] !== $a['matchedWords']) {
                return $b['matchedWords'] <=> $a['matchedWords'];
            }

            return $a['chunkIndex'] <=> $b['chunkIndex'];
        });

        return array_slice($scored, 0, $maxChunks);
    }
}
