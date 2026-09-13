<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('teachers')->cascadeOnDelete();
            $table->longText('content');
            $table->string('source_type')->default('text');
            $table->string('original_file_name')->nullable();
            $table->string('original_file_path')->nullable();
            $table->string('status')->default('draft');
            $table->timestamps();

            $table->index(['lesson_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_contents');
    }
};
