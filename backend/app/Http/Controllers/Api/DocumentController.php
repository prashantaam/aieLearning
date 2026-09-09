<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessDocumentUpload;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    /**
     * POST /api/documents/upload
     */
    public function upload(Request $request)
    {
        if (! $request->hasFile('file')) {
            return response()->json([
                'success' => false,
                'error' => 'Please upload a PDF file',
                'statusCode' => 400,
            ], 400);
        }

        $file = $request->file('file');

        if (! $file->isValid() || $file->getClientMimeType() !== 'application/pdf') {
            return response()->json([
                'success' => false,
                'error' => 'Only PDF files are allowed!',
                'statusCode' => 400,
            ], 400);
        }

        $maxSize = (int) env('MAX_FILE_SIZE', 10485760);
        if ($file->getSize() > $maxSize) {
            return response()->json([
                'success' => false,
                'error' => 'File size exceeds the maximum limit of 10MB',
                'statusCode' => 400,
            ], 400);
        }

        $title = $request->input('title');

        if (! $title) {
            return response()->json([
                'success' => false,
                'error' => 'Please provide a document title',
                'statusCode' => 400,
            ], 400);
        }

        $originalName = $file->getClientOriginalName();
        $storedFilename = time().'-'.random_int(0, 999999999).'-'.$originalName;
        $storedPath = $file->storeAs('documents', $storedFilename, 'public');

        $fileUrl = '/storage/'.$storedPath;

        $document = Document::create([
            'user_id' => $request->user()->id,
            'title' => $title,
            'file_name' => $originalName,
            'file_path' => $fileUrl,
            'file_size' => $file->getSize(),
            'status' => 'processing',
            'upload_date' => now(),
            'last_accessed' => now(),
        ]);

        // Process PDF in the background, same as the original setTimeout-style
        // fire-and-forget call in Node (queue driver defaults to `sync`).
        ProcessDocumentUpload::dispatch($document->id, $storedPath);

        return response()->json([
            'success' => true,
            'data' => $document->toListArray(),
            'message' => 'Document uploaded successfully. Processing in progress...',
        ], 201);
    }

    /**
     * GET /api/documents
     */
    public function index(Request $request)
    {
        $documents = Document::withCount(['flashcards', 'quizzes'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('upload_date')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $documents->count(),
            'data' => $documents->map->toListArray()->values(),
        ]);
    }

    /**
     * GET /api/documents/{id}
     */
    public function show(Request $request, int $id)
    {
        $document = Document::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $document) {
            return response()->json([
                'success' => false,
                'error' => 'Document not found',
                'statusCode' => 404,
            ], 404);
        }

        $document->flashcards_count = $document->flashcards()->count();
        $document->quizzes_count = $document->quizzes()->count();

        $document->last_accessed = now();
        $document->save();

        return response()->json([
            'success' => true,
            'data' => $document->toDetailArray(),
        ]);
    }

    /**
     * DELETE /api/documents/{id}
     */
    public function destroy(Request $request, int $id)
    {
        $document = Document::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $document) {
            return response()->json([
                'success' => false,
                'error' => 'Document not found',
                'statusCode' => 404,
            ], 404);
        }

        $relativePath = Str::after($document->file_path, '/storage/');
        Storage::disk('public')->delete($relativePath);

        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully',
        ]);
    }
}
