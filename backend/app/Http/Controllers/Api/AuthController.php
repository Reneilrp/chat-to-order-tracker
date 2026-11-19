<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'shop_name' => 'required|string|max:120',
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:191|unique:users,email',
            'password' => 'required|string|min:8',
            'currency_symbol' => 'nullable|string|max:5',
            'payment_instructions' => 'nullable|string',
        ]);

        $result = DB::transaction(function () use ($validated) {
            $seller = Seller::create([
                'shop_name' => $validated['shop_name'],
                'currency_symbol' => $validated['currency_symbol'] ?? '₱',
                'payment_instructions' => $validated['payment_instructions'] ?? null,
            ]);

            $user = User::create([
                'seller_id' => $seller->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $token = $user->createToken('bakeflow_mobile_client')->plainTextToken;

            return [
                'token' => $token,
                'user' => $user,
                'seller' => $seller,
            ];
        });

        return response()->json($result, 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::with('seller')->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        $token = $user->createToken('bakeflow_mobile_client')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'seller' => $user->seller,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
            'seller' => $request->user()->seller,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
}
