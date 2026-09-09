<?php

namespace App\Services;

use RuntimeException;
use Smalot\PdfParser\Parser;

/**
 * Port of backend/utils/pdfParser.js.
 *
 * The Node version used the `pdf-parse` npm package. The Laravel/PHP
 * equivalent is `smalot/pdfparser` (added to composer.json).
 */
class PdfParserService
{
    /**
     * @return array{text: string, numPages: int}
     */
    public function extractTextFromPdf(string $filePath): array
    {
        try {
            $parser = new Parser;
            $pdf = $parser->parseFile($filePath);

            return [
                'text' => $pdf->getText(),
                'numPages' => count($pdf->getPages()),
            ];
        } catch (\Throwable $e) {
            logger()->error('PDF parsing error', ['message' => $e->getMessage()]);
            throw new RuntimeException('Failed to extract text from PDF');
        }
    }
}
