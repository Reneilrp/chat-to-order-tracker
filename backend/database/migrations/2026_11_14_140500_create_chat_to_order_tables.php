<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Sellers (Tenant)
        Schema::create('sellers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('shop_name', 120);
            $table->string('currency_symbol', 5)->default('₱');
            $table->text('payment_instructions')->nullable();
            $table->timestamps();
        });

        // 2. Link Users to Seller
        Schema::table('users', function (Blueprint $table) {
            $table->foreignUuid('seller_id')->nullable()->after('id')->constrained('sellers')->cascadeOnDelete();
        });

        // 3. Menu Items
        Schema::create('menu_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('seller_id')->constrained('sellers')->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('variant', 80)->nullable();
            $table->decimal('unit_price', 10, 2)->default(0.00);
            $table->integer('daily_cap')->default(15);
            $table->json('keywords')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['seller_id', 'updated_at']);
        });

        // 4. Orders
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('seller_id')->constrained('sellers')->cascadeOnDelete();
            $table->string('order_code', 12);
            $table->string('customer_name', 100);
            $table->enum('fulfillment_type', ['pickup', 'delivery', 'meetup'])->default('pickup');
            $table->text('delivery_address')->nullable();
            $table->date('due_date')->index();
            $table->time('due_time')->nullable();
            $table->enum('payment_status', ['unpaid', 'partial', 'paid'])->default('unpaid');
            $table->string('payment_method', 40)->default('GCash');
            $table->decimal('amount_paid', 10, 2)->default(0.00);
            $table->decimal('total_amount', 10, 2)->default(0.00);
            $table->enum('order_status', ['pending', 'prepping', 'ready', 'completed', 'cancelled'])->default('pending');
            $table->text('raw_chat_snippet')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['seller_id', 'updated_at']);
            $table->index(['seller_id', 'due_date']);
        });

        // 5. Order Line Items
        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('seller_id')->constrained('sellers')->cascadeOnDelete();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignUuid('menu_item_id')->nullable()->constrained('menu_items')->nullOnDelete();
            $table->string('item_name', 120);
            $table->string('variant', 80)->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->string('notes', 255)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['seller_id', 'order_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('menu_items');
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['seller_id']);
            $table->dropColumn('seller_id');
        });
        Schema::dropIfExists('sellers');
    }
};
