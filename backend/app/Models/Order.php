<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'seller_id',
        'order_code',
        'customer_name',
        'fulfillment_type',
        'delivery_address',
        'due_date',
        'due_time',
        'payment_status',
        'payment_method',
        'amount_paid',
        'total_amount',
        'order_status',
        'raw_chat_snippet',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'due_date' => 'date:Y-m-d',
        ];
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
