<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('email');
            $table->date('booking_date');
            $table->enum('type', ['Guide', 'Hébergement', 'Activité', 'Gastronomie', 'Découverte']);
            $table->enum('region', ['Basse-Casamance', 'Moyenne-Casamance', 'Haute-Casamance']);
            $table->text('message')->nullable();
            $table->enum('status', ['en_attente', 'confirme', 'annule'])->default('en_attente');
            $table->text('refusal_reason')->nullable();
            $table->enum('payment_method', ['wave', 'orange_money', 'card'])->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
