import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Code2,
  Loader2,
  Plus,
} from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const ExerciseListPage = () => {
  const {
    lessonId,
    sublessonId,
  } = useParams();

  const navigate = useNavigate();

  const [sublesson, setSublesson] =
    useState(null);

  const [exercises, setExercises] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Frontend Route Helpers
  |--------------------------------------------------------------------------
  */

  const sublessonPath =
    `/teacher/lessons/${lessonId}/sublessons/${sublessonId}`;

  const exerciseListPath =
    `${sublessonPath}/exercises`;

  const createExercisePath =
    `${exerciseListPath}/create`;

  const exerciseDetailPath = (
    exerciseId
  ) =>
    `${exerciseListPath}/${exerciseId}`;

  /*
  |--------------------------------------------------------------------------
  | Load Exercises
  |--------------------------------------------------------------------------
  */

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          API_PATHS.TEACHER_EXERCISES
            .GET_BY_SUBLESSON(
              sublessonId
            )
        );

      console.log(
        "Exercise list response:",
        response.data
      );

      /*
       * Expected backend response:
       *
       * data: {
       *   sublesson: {...},
       *   exercises: [...]
       * }
       */

      setSublesson(
        response.data?.data?.sublesson ||
          null
      );

      setExercises(
        Array.isArray(
          response.data?.data?.exercises
        )
          ? response.data.data.exercises
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load exercises:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load exercises."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sublessonId) {
      fetchExercises();
    }
  }, [sublessonId]);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </TeacherLayout>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <TeacherLayout>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">

          {/* Back to Sublesson */}
          <button
            type="button"
            onClick={() =>
              navigate(sublessonPath)
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sublesson
          </button>

          {/* Page Header */}
          <div className="mb-8 flex items-start justify-between gap-4">

            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Code2 className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Exercises
                </p>

                <h1 className="mt-1 text-3xl font-bold text-gray-900">
                  Exercise Management
                </h1>

                {sublesson && (
                  <p className="mt-2 text-gray-600">
                    Manage exercises for{" "}
                    <span className="font-semibold text-gray-900">
                      {sublesson.title}
                    </span>
                  </p>
                )}
              </div>

            </div>

            {/* Create Exercise */}
            <button
              type="button"
              onClick={() =>
                navigate(
                  createExercisePath
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Exercise
            </button>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Empty State */}
          {exercises.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

              <Code2 className="mx-auto h-10 w-10 text-gray-400" />

              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                No exercises yet
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Create a practical exercise
                for this sublesson.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    createExercisePath
                  )
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create Exercise
              </button>

            </div>
          ) : (

            /* Exercise List */
            <div className="space-y-4">

              {exercises.map(
                (exercise) => {

                  const isPublished =
                    exercise.status ===
                    "published";

                  return (
                    <div
                      key={exercise.id}
                      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                    >

                      <div className="flex flex-wrap items-start justify-between gap-4">

                        {/* Exercise Information */}
                        <div className="flex-1">

                          <h2 className="text-lg font-semibold text-gray-900">
                            {exercise.title}
                          </h2>

                          {exercise.instructions && (
                            <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-gray-600">
                              {
                                exercise.instructions
                              }
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">

                            <span className="capitalize">
                              {
                                exercise.exercise_type
                              }
                            </span>

                            {exercise.language && (
                              <>
                                <span>•</span>

                                <span className="capitalize">
                                  {
                                    exercise.language
                                  }
                                </span>
                              </>
                            )}

                            <span>•</span>

                            <span>
                              {exercise.source_type ===
                              "ai"
                                ? "AI generated"
                                : "Manual"}
                            </span>

                          </div>

                        </div>

                        {/* Exercise Actions */}
                        <div className="flex flex-col items-end gap-3">

                          {/* Status */}
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              isPublished
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {
                              exercise.status ||
                              "draft"
                            }
                          </span>

                          {/* Manage */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                exerciseDetailPath(
                                  exercise.id
                                )
                              )
                            }
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-gray-50 hover:text-blue-700"
                          >
                            Manage Exercise
                          </button>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>
      </div>
    </TeacherLayout>
  );
};

export default ExerciseListPage;