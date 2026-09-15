<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'max:191',
                'unique:students,username',
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:students,email',
            ],
            'password' => [
                'required',
                'string',
                'min:6',
                'confirmed',
            ],
        ]);

        $student = Student::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Student registered successfully.',
            'data' => [
                'student' => [
                    'id' => $student->id,
                    'username' => $student->username,
                    'email' => $student->email,
                ],
            ],
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => [
                'required',
                'email',
            ],
            'password' => [
                'required',
                'string',
            ],
        ]);

        $student = Student::where(
            'email',
            $validated['email']
        )->first();

        if (
            ! $student ||
            ! Hash::check(
                $validated['password'],
                $student->password
            )
        ) {
            throw ValidationException::withMessages([
                'email' => [
                    'The provided credentials are incorrect.',
                ],
            ]);
        }

        if (! $student->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is inactive.',
            ], 403);
        }

        $student->tokens()->delete();

        $token = $student
            ->createToken('student-token')
            ->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data' => [
                'token' => $token,
                'student' => [
                    'id' => $student->id,
                    'username' => $student->username,
                    'email' => $student->email,
                    'profile_image' => $student->profile_image,
                ],
            ],
        ]);
    }

    public function me(Request $request)
    {
        $student = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'student' => [
                    'id' => $student->id,
                    'username' => $student->username,
                    'email' => $student->email,
                    'profile_image' => $student->profile_image,
                ],
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request
            ->user()
            ->currentAccessToken()
            ?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }
}