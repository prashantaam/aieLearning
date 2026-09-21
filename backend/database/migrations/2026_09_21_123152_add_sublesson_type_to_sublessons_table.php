<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sublessons', function (Blueprint $table) {
            $table
                ->string('sublesson_type')
                ->default('content')
                ->after('description');

            $table->index([
                'lesson_id',
                'sublesson_type',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('sublessons', function (Blueprint $table) {
            $table->dropIndex([
                'lesson_id',
                'sublesson_type',
            ]);

            $table->dropColumn(
                'sublesson_type'
            );
        });
    }
};