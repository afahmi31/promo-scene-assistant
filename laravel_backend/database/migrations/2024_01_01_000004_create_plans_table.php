<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('monthly_price', 8, 2);
            $table->integer('campaign_limit')->default(0);
            $table->integer('scene_limit')->default(0);
            $table->integer('image_limit')->default(0);
            $table->integer('voice_limit')->default(0);
            $table->integer('storage_limit_mb')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
?>
