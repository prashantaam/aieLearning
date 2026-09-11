<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | 1. Remove foreign keys that currently point to chapters
        |--------------------------------------------------------------------------
        */

        Schema::table('contents', function (Blueprint $table) {
            $table->dropForeign(['chapter_id']);
        });

        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropForeign(['chapter_id']);
        });

        Schema::table('flashcards', function (Blueprint $table) {
            $table->dropForeign(['chapter_id']);
        });

        /*
        |--------------------------------------------------------------------------
        | 2. Rename chapters table to lessons
        |--------------------------------------------------------------------------
        */

        Schema::rename('chapters', 'lessons');

        /*
        |--------------------------------------------------------------------------
        | 3. Rename chapter_id columns to lesson_id
        |--------------------------------------------------------------------------
        */

        Schema::table('contents', function (Blueprint $table) {
            $table->renameColumn('chapter_id', 'lesson_id');
        });

        Schema::table('quizzes', function (Blueprint $table) {
            $table->renameColumn('chapter_id', 'lesson_id');
        });

        Schema::table('flashcards', function (Blueprint $table) {
            $table->renameColumn('chapter_id', 'lesson_id');
        });

        /*
        |--------------------------------------------------------------------------
        | 4. Re-create foreign keys pointing to lessons
        |--------------------------------------------------------------------------
        */

        Schema::table('contents', function (Blueprint $table) {
            $table->foreign('lesson_id')
                ->references('id')
                ->on('lessons')
                ->cascadeOnDelete();
        });

        Schema::table('quizzes', function (Blueprint $table) {
            $table->foreign('lesson_id')
                ->references('id')
                ->on('lessons')
                ->cascadeOnDelete();
        });

        Schema::table('flashcards', function (Blueprint $table) {
            $table->foreign('lesson_id')
                ->references('id')
                ->on('lessons')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('contents', function (Blueprint $table) {
            $table->dropForeign(['lesson_id']);
        });

        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropForeign(['lesson_id']);
        });

        Schema::table('flashcards', function (Blueprint $table) {
            $table->dropForeign(['lesson_id']);
        });

        Schema::table('contents', function (Blueprint $table) {
            $table->renameColumn('lesson_id', 'chapter_id');
        });

        Schema::table('quizzes', function (Blueprint $table) {
            $table->renameColumn('lesson_id', 'chapter_id');
        });

        Schema::table('flashcards', function (Blueprint $table) {
            $table->renameColumn('lesson_id', 'chapter_id');
        });

        Schema::rename('lessons', 'chapters');

        Schema::table('contents', function (Blueprint $table) {
            $table->foreign('chapter_id')
                ->references('id')
                ->on('chapters')
                ->cascadeOnDelete();
        });

        Schema::table('quizzes', function (Blueprint $table) {
            $table->foreign('chapter_id')
                ->references('id')
                ->on('chapters')
                ->cascadeOnDelete();
        });

        Schema::table('flashcards', function (Blueprint $table) {
            $table->foreign('chapter_id')
                ->references('id')
                ->on('chapters')
                ->cascadeOnDelete();
        });
    }
};