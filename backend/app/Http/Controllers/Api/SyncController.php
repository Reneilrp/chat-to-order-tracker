<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SyncController extends Controller
{
    public function sync(Request $request)
    {
        $request->validate([
            'last_synced_at' => 'nullable|date',
            'mutations' => 'nullable|array',
            'mutations.*.table' => 'required_with:mutations|in:orders,order_items,menu_items',
            'mutations.*.action' => 'required_with:mutations|in:upsert,delete',
            'mutations.*.data' => 'required_with:mutations|array',
            'mutations.*.data.id' => 'required_with:mutations|string',
        ]);

        $sellerId = $request->user()->seller_id;
        $now = now()->toISOString();

        // 1. Process client mutations inside a safe transaction
        DB::transaction(function () use ($request, $sellerId) {
            foreach ($request->input('mutations', []) as $mutation) {
                $table = $mutation['table'];
                $action = $mutation['action'];
                $data = $mutation['data'];

                // Always enforce tenant boundary
                $data['seller_id'] = $sellerId;

                if ($action === 'upsert') {
                    if ($table === 'orders') {
                        // Whitelist order attributes
                        $orderData = collect($data)->only([
                            'id', 'seller_id', 'order_code', 'customer_name',
                            'fulfillment_type', 'delivery_address', 'due_date',
                            'due_time', 'payment_status', 'payment_method',
                            'amount_paid', 'total_amount', 'order_status', 'raw_chat_snippet',
                        ])->toArray();

                        Order::withTrashed()->updateOrCreate(
                            ['id' => $data['id'], 'seller_id' => $sellerId],
                            $orderData
                        );
                    } elseif ($table === 'order_items') {
                        $itemData = collect($data)->only([
                            'id', 'seller_id', 'order_id', 'menu_item_id',
                            'item_name', 'variant', 'quantity', 'unit_price', 'notes',
                        ])->toArray();

                        OrderItem::withTrashed()->updateOrCreate(
                            ['id' => $data['id'], 'seller_id' => $sellerId],
                            $itemData
                        );
                    } elseif ($table === 'menu_items') {
                        $menuData = collect($data)->only([
                            'id', 'seller_id', 'name', 'variant',
                            'unit_price', 'daily_cap', 'keywords', 'is_active',
                        ])->toArray();

                        MenuItem::withTrashed()->updateOrCreate(
                            ['id' => $data['id'], 'seller_id' => $sellerId],
                            $menuData
                        );
                    }
                } elseif ($action === 'delete') {
                    if ($table === 'orders') {
                        Order::where('seller_id', $sellerId)->where('id', $data['id'])->delete();
                    } elseif ($table === 'order_items') {
                        OrderItem::where('seller_id', $sellerId)->where('id', $data['id'])->delete();
                    } elseif ($table === 'menu_items') {
                        MenuItem::where('seller_id', $sellerId)->where('id', $data['id'])->delete();
                    }
                }
            }
        });

        // 2. Fetch remote changes created or updated since last_synced_at
        $since = $request->input('last_synced_at');

        $remoteOrders = Order::withTrashed()
            ->where('seller_id', $sellerId)
            ->when($since, fn ($q) => $q->where('updated_at', '>', $since))
            ->get();

        $remoteOrderItems = OrderItem::withTrashed()
            ->where('seller_id', $sellerId)
            ->when($since, fn ($q) => $q->where('updated_at', '>', $since))
            ->get();

        $remoteMenuItems = MenuItem::withTrashed()
            ->where('seller_id', $sellerId)
            ->when($since, fn ($q) => $q->where('updated_at', '>', $since))
            ->get();

        return response()->json([
            'synced_at' => $now,
            'changes' => [
                'orders' => $remoteOrders,
                'order_items' => $remoteOrderItems,
                'menu_items' => $remoteMenuItems,
            ],
        ]);
    }
}
