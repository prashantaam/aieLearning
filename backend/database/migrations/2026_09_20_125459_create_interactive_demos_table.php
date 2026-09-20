<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interactive_demos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('sublesson_id')
                ->constrained('sublessons')
                ->cascadeOnDelete();

            $table->foreignId('created_by')
                ->constrained('teachers')
                ->cascadeOnDelete();

            $table->string('title');

            // Optional teacher description/internal notes
            $table->text('description')
                ->nullable();

            /*
             * Browser demo source.
             *
             * These are intentionally independent from the
             * programming language being taught.
             */
            $table->longText('html')
                ->nullable();

            $table->longText('css')
                ->nullable();

            $table->longText('javascript')
                ->nullable();

            // Future browser-demo configuration
            $table->json('settings')
                ->nullable();

            $table->unsignedInteger('sort_order')
                ->default(1);

            // manual / ai
            $table->string('source_type')
                ->default('manual');

            // draft / published
            $table->string('status')
                ->default('draft');

            $table->timestamps();

            $table->index([
                'sublesson_id',
                'sort_order',
            ]);

            $table->index([
                'sublesson_id',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interactive_demos');
    }
};