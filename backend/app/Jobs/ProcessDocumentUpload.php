<?php

namespace App\Jobs;

use App\Models\Document;
use App\Services\PdfParserService;
use App\Services\TextChunkerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

/**
 * Port of the `processPDF()` helper in the original documentController.js.
 * Dispatched right after upload so the request can return immediately
 * while extraction/chunking happens afterwards (queue driver `sync` by
 * default, or a real queue worker in production).
 */
class ProcessDocumentUpload implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $documentId, public string $storedPath)
    {
    }

    public function handle(PdfParserService $pdfParser, TextChunkerService $chunker): void
    {
        $document = Document::find($this->documentId);

        if (! $document) {
            return;
        }

        try {
            $absolutePath = Storage::disk('public')->path($this->storedPath);
            $result = $pdfParser->extractTextFromPdf($absolutePath);
            $chunks = $chunker->chunkText($result['text'], 500, 50);

            $document->update([
                'extracted_text' => $result['text'],
                'chunks' => $chunks,
                'status' => 'ready',
            ]);
        } catch (\Throwable $e) {
            logger()->error("Error processing document {$this->documentId}: ".$e->getMessage());
            $document->update(['status' => 'failed']);
        }
    }
}
