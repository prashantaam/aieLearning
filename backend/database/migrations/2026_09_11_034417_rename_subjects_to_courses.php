<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Remove FK before renaming
        Schema::table('chapters', function (Blueprint $table) {
            $table->dropForeign(['subject_id']);
        });

        // subjects -> courses
        Schema::rename('subjects', 'courses');

        // chapters.subject_id -> chapters.course_id
        Schema::table('chapters', function (Blueprint $table) {
            $table->renameColumn('subject_id', 'course_id');
        });

        // Re-create FK
        Schema::table('chapters', function (Blueprint $table) {
            $table->foreign('course_id')
                ->references('id')
                ->on('courses')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
        });

        Schema::table('chapters', function (Blueprint $table) {
            $table->renameColumn('course_id', 'subject_id');
        });

        Schema::rename('courses', 'subjects');

        Schema::table('chapters', function (Blueprint $table) {
            $table->foreign('subject_id')
                ->references('id')
                ->on('subjects')
                ->cascadeOnDelete();
        });
    }
};