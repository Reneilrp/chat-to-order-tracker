<?php

namespace Tests\Feature;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SyncEngineTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_create_seller_tenant(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'shop_name' => 'Maria Brownies',
            'name' => 'Maria Santos',
            'email' => 'maria@example.com',
            'password' => 'password123',
            'currency_symbol' => '₱',
            'payment_instructions' => 'GCash: 0917-123-4567',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'seller_id', 'name', 'email'],
                'seller' => ['id', 'shop_name', 'currency_symbol', 'payment_instructions'],
            ]);

        $this->assertDatabaseHas('sellers', ['shop_name' => 'Maria Brownies']);
        $this->assertDatabaseHas('users', ['email' => 'maria@example.com']);
    }

    public function test_user_can_login(): void
    {
        $seller = Seller::create(['shop_name' => 'Test Kitchen']);
        User::create([
            'seller_id' => $seller->id,
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'john@example.com',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user', 'seller']);
    }

    public function test_sync_endpoint_applies_mutations_and_scopes_by_tenant(): void
    {
        $seller = Seller::create(['shop_name' => 'BakeFlow Demo']);
        $user = User::create([
            'seller_id' => $seller->id,
            'name' => 'Baker Bob',
            'email' => 'bob@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $token = $user->createToken('test_token')->plainTextToken;

        $orderId = 'ord-test-uuid-1';
        $itemId = 'item-test-uuid-1';

        $syncPayload = [
            'last_synced_at' => null,
            'mutations' => [
                [
                    'table' => 'orders',
                    'action' => 'upsert',
                    'data' => [
                        'id' => $orderId,
                        'order_code' => 'ORD-101',
                        'customer_name' => 'Camille Tan',
                        'fulfillment_type' => 'delivery',
                        'delivery_address' => 'Pasonanca Park',
                        'due_date' => '2026-11-15',
                        'due_time' => '16:00',
                        'payment_status' => 'paid',
                        'payment_method' => 'GCash',
                        'amount_paid' => 550,
                        'total_amount' => 550,
                        'order_status' => 'pending',
                        'raw_chat_snippet' => 'Camille Tan: 1 basque cheesecake tomorrow 4pm gcash paid',
                    ]
                ],
                [
                    'table' => 'order_items',
                    'action' => 'upsert',
                    'data' => [
                        'id' => $itemId,
                        'order_id' => $orderId,
                        'item_name' => 'Burnt Basque Cheesecake',
                        'variant' => '6-inch Whole',
                        'quantity' => 1,
                        'unit_price' => 550,
                        'notes' => 'less sweet',
                    ]
                ]
            ]
        ];

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/sync', $syncPayload);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'synced_at',
                'changes' => ['orders', 'order_items', 'menu_items']
            ]);

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'seller_id' => $seller->id,
            'customer_name' => 'Camille Tan',
            'total_amount' => 550.00
        ]);

        $this->assertDatabaseHas('order_items', [
            'id' => $itemId,
            'seller_id' => $seller->id,
            'item_name' => 'Burnt Basque Cheesecake'
        ]);
    }
}
