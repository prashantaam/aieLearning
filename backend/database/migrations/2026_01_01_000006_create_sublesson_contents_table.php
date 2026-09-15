<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sublesson_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sublesson_id')->constrained('sublessons')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('teachers')->cascadeOnDelete();

            // Bite-sized block type: text, heading, markdown, code, image, video, note, tip, etc.
            $table->string('type')->default('text');
            $table->longText('content')->nullable();

            // Type-specific options such as language, alt text, layout, caption, autoplay, etc.
            $table->json('settings')->nullable();
            $table->unsignedInteger('sort_order')->default(1);

            // How the content was created: manual, ai, upload, etc.
            $table->string('source_type')->default('manual');
            $table->string('original_file_name')->nullable();
            $table->string('original_file_path')->nullable();
            $table->string('status')->default('draft');
            $table->timestamps();

            $table->index(['sublesson_id', 'sort_order']);
            $table->index(['sublesson_id', 'status']);
            $table->index(['sublesson_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sublesson_contents');
    }
};
