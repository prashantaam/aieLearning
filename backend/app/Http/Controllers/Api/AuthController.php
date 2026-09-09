<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => ['required', 'string', 'min:3'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
                'statusCode' => 400,
            ], 400);
        }

        $data = $validator->validated();
        $data['email'] = strtolower($data['email']);

        $existing = User::where('email', $data['email'])
            ->orWhere('username', $data['username'])
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'error' => $existing->email === $data['email']
                    ? 'Email already registered'
                    : 'Username already taken',
                'statusCode' => 400,
            ], 400);
        }

        $user = User::create([
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user->toPublicArray(),
                'token' => $token,
            ],
            'message' => 'User registered successfully',
        ], 201);
    }

    /**
     * POST /api/auth/login
     */
    public function login(Request $request)
    {
        $email = $request->input('email');
        $password = $request->input('password');

        if (! $email || ! $password) {
            return response()->json([
                'success' => false,
                'error' => 'Please provide email and password',
                'statusCode' => 400,
            ], 400);
        }

        $user = User::where('email', strtolower($email))->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid credentials',
                'statusCode' => 401,
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'profileImage' => $user->profile_image,
            ],
            'token' => $token,
            'message' => 'Login successful',
        ]);
    }

    /**
     * GET /api/auth/profile
     */
    public function profile(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()->toPublicArray(),
        ]);
    }

    /**
     * PUT /api/auth/profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'username' => ['sometimes', 'string', 'min:3'],
            'email' => ['sometimes', 'email'],
            'profileImage' => ['sometimes', 'nullable', 'string'],
        ]);

        if (isset($data['username'])) {
            $user->username = $data['username'];
        }
        if (isset($data['email'])) {
            $user->email = strtolower($data['email']);
        }
        if (array_key_exists('profileImage', $data)) {
            $user->profile_image = $data['profileImage'];
        }

        $user->save();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'profileImage' => $user->profile_image,
            ],
            'message' => 'Profile updated successfully',
        ]);
    }

    /**
     * POST /api/auth/change-password
     */
    public function changePassword(Request $request)
    {
        $currentPassword = $request->input('currentPassword');
        $newPassword = $request->input('newPassword');

        if (! $currentPassword || ! $newPassword) {
            return response()->json([
                'success' => false,
                'error' => 'Please provide current and new password',
                'statusCode' => 400,
            ], 400);
        }

        $user = $request->user();

        if (! Hash::check($currentPassword, $user->password)) {
            return response()->json([
                'success' => false,
                'error' => 'Current password is incorrect',
                'statusCode' => 401,
            ], 401);
        }

        $user->password = Hash::make($newPassword);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    }
}
