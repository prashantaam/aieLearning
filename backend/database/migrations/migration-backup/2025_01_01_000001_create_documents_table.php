<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('file_name');
            $table->string('file_path');
            $table->unsignedBigInteger('file_size');
            $table->longText('extracted_text')->nullable();
            $table->json('chunks')->nullable();
            $table->timestamp('upload_date')->useCurrent();
            $table->timestamp('last_accessed')->useCurrent();
            $table->enum('status', ['processing', 'ready', 'failed'])->default('processing');
            $table->timestamps();

            $table->index(['user_id', 'upload_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
