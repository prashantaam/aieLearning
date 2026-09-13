<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->json('messages')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'document_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_histories');
    }
};
