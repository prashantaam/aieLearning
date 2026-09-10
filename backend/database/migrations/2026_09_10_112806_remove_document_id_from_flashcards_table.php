<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * Create an index for the new chapter-based relationship first.
         */
        Schema::table('flashcards', function (Blueprint $table) {
            $table->index(
                ['user_id', 'chapter_id'],
                'flashcards_user_id_chapter_id_index'
            );
        });

        /*
         * Remove document foreign key.
         */
        Schema::table('flashcards', function (Blueprint $table) {
            $table->dropForeign(['document_id']);
        });

        /*
         * Remove document_id.
         *
         * We don't need to manually drop
         * flashcards_document_id_foreign as an index.
         */
        Schema::table('flashcards', function (Blueprint $table) {
            $table->dropColumn('document_id');
        });
    }

    public function down(): void
    {
        Schema::table('flashcards', function (Blueprint $table) {
            $table->foreignId('document_id')
                ->nullable()
                ->after('user_id')
                ->constrained('documents')
                ->cascadeOnDelete();
        });

        Schema::table('flashcards', function (Blueprint $table) {
            $table->dropIndex(
                'flashcards_user_id_chapter_id_index'
            );
        });
    }
};