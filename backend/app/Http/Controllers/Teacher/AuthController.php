<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new teacher.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:teachers,email',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $teacher = Teacher::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Teacher account created successfully.',
            'teacher' => $teacher,
        ], 201);
    }

    /**
     * Login teacher and issue Sanctum token.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $teacher = Teacher::where(
            'email',
            $validated['email']
        )->first();

        if (
            !$teacher ||
            !Hash::check(
                $validated['password'],
                $teacher->password
            )
        ) {
            throw ValidationException::withMessages([
                'email' => [
                    'The provided credentials are incorrect.',
                ],
            ]);
        }

        if (!$teacher->is_active) {
            return response()->json([
                'message' => 'This teacher account is inactive.',
            ], 403);
        }

        $teacher->tokens()->delete();

        $token = $teacher
            ->createToken('teacher-token')
            ->plainTextToken;

        return response()->json([
            'message' => 'Teacher logged in successfully.',
            'token' => $token,
            'teacher' => $teacher,
        ]);
    }

    /**
     * Return the authenticated teacher.
     */
    public function me(Request $request)
    {
        return response()->json([
            'teacher' => $request->user(),
        ]);
    }

    /**
     * Logout the authenticated teacher.
     */
    public function logout(Request $request)
    {
        $request->user()
            ->currentAccessToken()
            ?->delete();

        return response()->json([
            'message' => 'Teacher logged out successfully.',
        ]);
    }
}