<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('interactive_demos', function (Blueprint $table) {

            $table->longText('instruction')
                ->nullable()
                ->after('title');

            $table->longText('code')
                ->nullable()
                ->after('instruction');

            $table->dropColumn([
                'description',
                'html',
                'css',
                'javascript',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('interactive_demos', function (Blueprint $table) {

            $table->text('description')
                ->nullable()
                ->after('title');

            $table->longText('html')
                ->nullable();

            $table->longText('css')
                ->nullable();

            $table->longText('javascript')
                ->nullable();

            $table->dropColumn([
                'instruction',
                'code',
            ]);
        });
    }
};