<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | List Published Courses
    |--------------------------------------------------------------------------
    */

    public function index(): JsonResponse
    {
        $courses = Course::query()
            ->where('status', 'published')
            ->withCount('lessons')
            ->orderBy('title')
            ->get([
                'id',
                'title',
                'slug',
                'description',
                'status',
                'created_at',
                'updated_at',
            ]);

        return response()->json([
            'data' => $courses,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Show Published Course
    |--------------------------------------------------------------------------
    */

    public function show(string $slug): JsonResponse
    {
        $course = Course::query()
            ->where('slug', $slug)
            ->where('status', 'published')
            ->with([
                'lessons' => function ($query) {
                    $query
                        ->where(
                            'status',
                            'published'
                        )
                        ->with([
                            'sublessons' => function ($query) {
                                $query
                                    ->where(
                                        'status',
                                        'published'
                                    )
                                    ->orderBy(
                                        'sort_order'
                                    )
                                    ->with([

                                        /*
                                        |--------------------------------------------------------------------------
                                        | Published Content
                                        |--------------------------------------------------------------------------
                                        */

                                        'contents' => function ($query) {
                                            $query
                                                ->where(
                                                    'status',
                                                    'published'
                                                )
                                                ->orderBy(
                                                    'sort_order'
                                                );
                                        },


                                        /*
                                        |--------------------------------------------------------------------------
                                        | Published Quizzes
                                        |--------------------------------------------------------------------------
                                        */

                                        'quizzes' => function ($query) {
                                            $query
                                                ->where(
                                                    'status',
                                                    'published'
                                                )
                                                ->orderBy(
                                                    'sort_order'
                                                );
                                        },

                                         /*
                                        |--------------------------------------------------------------------------
                                        | Published Exercises
                                        |--------------------------------------------------------------------------
                                        */
                                        'exercises' => function ($query) {
                                            $query
                                                ->where(
                                                    'status',
                                                    'published'
                                                )
                                                ->orderBy(
                                                    'sort_order'
                                                );
                                        },

                                    ]);
                            },
                        ]);
                },
            ])
            ->firstOrFail();

        return response()->json([
            'data' => $course,
        ]);
    }
}