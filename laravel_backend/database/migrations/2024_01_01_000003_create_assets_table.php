<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->onDelete('cascade');
            $table->string('type'); // e.g., uploaded_product, generated_image
            $table->string('path'); // storage path
            $table->bigInteger('size');
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
?>
