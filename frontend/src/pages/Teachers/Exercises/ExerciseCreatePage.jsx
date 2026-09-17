import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  Loader2,
  Save,
} from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const ExerciseCreatePage = () => {
  const {
    lessonId,
    sublessonId,
  } = useParams();

  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Frontend Route Helpers
  |--------------------------------------------------------------------------
  */

  const exerciseListPath =
    `/teacher/lessons/${lessonId}/sublessons/${sublessonId}/exercises`;

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [sublesson, setSublesson] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    title: "",
    instructions: "",
    exercise_type: "code",
    language: "python",
    starter_code: "",
    solution_code: "",
    expected_output: "",
    runtime: "pyodide",
    timeout: 5000,
  });

  /*
  |--------------------------------------------------------------------------
  | Load Sublesson
  |--------------------------------------------------------------------------
  */

  const fetchSublesson = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          `/api/teacher/sublessons/${sublessonId}`
        );

      const sublessonData =
        response.data?.data || null;

      setSublesson(sublessonData);

      if (sublessonData) {
        setForm((current) => ({
          ...current,
          title:
            `${sublessonData.title} - Exercise`,
        }));
      }
    } catch (err) {
      console.error(
        "Failed to load sublesson:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to load sublesson."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sublessonId) {
      fetchSublesson();
    }
  }, [sublessonId]);

  /*
  |--------------------------------------------------------------------------
  | Update Form
  |--------------------------------------------------------------------------
  */

  const updateForm = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Exercise Type Change
  |--------------------------------------------------------------------------
  */

  const handleExerciseTypeChange = (
    value
  ) => {
    let language = form.language;
    let runtime = form.runtime;

    if (value === "code") {
      language = "python";
      runtime = "pyodide";
    }

    if (value === "sql") {
      language = "sql";
      runtime = "sqlite-wasm";
    }

    if (value === "terminal") {
      language = "bash";
      runtime = "terminal";
    }

    if (value === "project") {
      language = "react";
      runtime = "browser";
    }

    setForm((current) => ({
      ...current,
      exercise_type: value,
      language,
      runtime,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Language Change
  |--------------------------------------------------------------------------
  */

  const handleLanguageChange = (
    value
  ) => {
    let runtime = form.runtime;

    switch (value) {
      case "python":
        runtime = "pyodide";
        break;

      case "javascript":
        runtime = "browser";
        break;

      case "php":
        runtime = "php-wasm";
        break;

      case "sql":
        runtime = "sqlite-wasm";
        break;

      case "bash":
      case "git":
        runtime = "terminal";
        break;

      case "react":
        runtime = "browser";
        break;

      default:
        runtime = "";
    }

    setForm((current) => ({
      ...current,
      language: value,
      runtime,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Validate
  |--------------------------------------------------------------------------
  */

  const validateExercise = () => {
    if (!form.title.trim()) {
      setError(
        "Exercise title is required."
      );

      return false;
    }

    if (!form.exercise_type) {
      setError(
        "Exercise type is required."
      );

      return false;
    }

    if (
      form.exercise_type === "code" &&
      !form.language
    ) {
      setError(
        "Please select a programming language."
      );

      return false;
    }

    if (
      Number(form.timeout) < 1000
    ) {
      setError(
        "Runtime timeout must be at least 1000 milliseconds."
      );

      return false;
    }

    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | Save Exercise
  |--------------------------------------------------------------------------
  */

  const handleSaveExercise =
    async () => {
      setError("");
      setSuccess("");

      if (!validateExercise()) {
        return;
      }

      try {
        setSaving(true);

        const payload = {
          title: form.title.trim(),

          instructions:
            form.instructions.trim() ||
            null,

          exercise_type:
            form.exercise_type,

          language:
            form.language || null,

          starter_code:
            form.starter_code || null,

          solution_code:
            form.solution_code || null,

          expected_output:
            form.expected_output || null,

          settings: {
            runtime:
              form.runtime || null,

            timeout:
              Number(form.timeout),
          },

          source_type: "manual",
        };

        console.log(
          "Saving exercise:",
          payload
        );

        const response =
          await axiosInstance.post(
            API_PATHS.TEACHER_EXERCISES.CREATE(
              sublessonId
            ),
            payload
          );

        console.log(
          "Saved exercise:",
          response.data
        );

        setSuccess(
          response.data?.message ||
            "Exercise saved successfully."
        );

        navigate(
          exerciseListPath,
          {
            replace: true,
          }
        );
      } catch (err) {
        console.error(
          "Failed to save exercise:",
          err
        );

        console.error(
          "Laravel response:",
          err.response?.data
        );

        const validationErrors =
          err.response?.data?.errors;

        if (validationErrors) {
          const firstError =
            Object.values(
              validationErrors
            )?.[0]?.[0];

          setError(
            firstError ||
              "Please check the exercise fields."
          );
        } else {
          setError(
            err.response?.data
              ?.message ||
              err.response?.data
                ?.error ||
              "Failed to save exercise."
          );
        }
      } finally {
        setSaving(false);
      }
    };

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
  | Sublesson Not Found
  |--------------------------------------------------------------------------
  */

  if (!sublesson) {
    return (
      <TeacherLayout>
        <div className="p-6 lg:p-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error ||
              "Sublesson not found."}
          </div>
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

          {/* Back */}
          <button
            type="button"
            onClick={() =>
              navigate(
                exerciseListPath
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exercises
          </button>

          {/* Header */}
          <div className="mb-8 flex items-start gap-4">

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Code2 className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Exercise
              </p>

              <h1 className="mt-1 text-3xl font-bold text-gray-900">
                Create Exercise
              </h1>

              <p className="mt-2 text-gray-600">
                Create a practical exercise
                for{" "}
                <span className="font-semibold text-gray-900">
                  {sublesson.title}
                </span>
              </p>
            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              {success}
            </div>
          )}

          {/* Basic Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-900">
              Exercise Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Define what the student
              needs to complete.
            </p>

            {/* Title */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Exercise Title
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  updateForm(
                    "title",
                    event.target.value
                  )
                }
                placeholder="Create Your First Variable"
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            {/* Instructions */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Instructions
              </label>

              <textarea
                value={
                  form.instructions
                }
                onChange={(event) =>
                  updateForm(
                    "instructions",
                    event.target.value
                  )
                }
                rows="5"
                placeholder="Explain what the student needs to do..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            {/* Type / Language */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Exercise Type
                </label>

                <select
                  value={
                    form.exercise_type
                  }
                  onChange={(event) =>
                    handleExerciseTypeChange(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                >
                  <option value="code">
                    Code
                  </option>

                  <option value="sql">
                    SQL
                  </option>

                  <option value="terminal">
                    Terminal
                  </option>

                  <option value="project">
                    Project
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Language
                </label>

                <select
                  value={form.language}
                  onChange={(event) =>
                    handleLanguageChange(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                >

                  {form.exercise_type ===
                    "code" && (
                    <>
                      <option value="python">
                        Python
                      </option>

                      <option value="javascript">
                        JavaScript
                      </option>

                      <option value="php">
                        PHP
                      </option>
                    </>
                  )}

                  {form.exercise_type ===
                    "sql" && (
                    <option value="sql">
                      SQL
                    </option>
                  )}

                  {form.exercise_type ===
                    "terminal" && (
                    <>
                      <option value="bash">
                        Linux / Bash
                      </option>

                      <option value="git">
                        Git
                      </option>
                    </>
                  )}

                  {form.exercise_type ===
                    "project" && (
                    <option value="react">
                      React
                    </option>
                  )}

                </select>
              </div>

            </div>

          </div>

          {/* Code */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-900">
              Exercise Code
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Configure the starting code,
              solution and expected result.
            </p>

            {/* Starter Code */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Starter Code
              </label>

              <textarea
                value={
                  form.starter_code
                }
                onChange={(event) =>
                  updateForm(
                    "starter_code",
                    event.target.value
                  )
                }
                rows="8"
                spellCheck="false"
                placeholder="# Student starter code"
                className="w-full rounded-xl border border-gray-300 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100"
              />
            </div>

            {/* Solution */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Solution Code
              </label>

              <textarea
                value={
                  form.solution_code
                }
                onChange={(event) =>
                  updateForm(
                    "solution_code",
                    event.target.value
                  )
                }
                rows="8"
                spellCheck="false"
                placeholder="score = 10&#10;print(score)"
                className="w-full rounded-xl border border-gray-300 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100"
              />
            </div>

            {/* Expected Output */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Expected Output
              </label>

              <textarea
                value={
                  form.expected_output
                }
                onChange={(event) =>
                  updateForm(
                    "expected_output",
                    event.target.value
                  )
                }
                rows="4"
                spellCheck="false"
                placeholder="10"
                className="w-full rounded-xl border border-gray-300 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100"
              />
            </div>

          </div>

          {/* Runtime */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-900">
              Runtime Settings
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Runtime
                </label>

                <input
                  type="text"
                  value={form.runtime}
                  onChange={(event) =>
                    updateForm(
                      "runtime",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Timeout (milliseconds)
                </label>

                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={form.timeout}
                  onChange={(event) =>
                    updateForm(
                      "timeout",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
              </div>

            </div>

          </div>

          {/* Save */}
          <div className="mt-6 flex justify-end">

            <button
              type="button"
              onClick={
                handleSaveExercise
              }
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Exercise
                </>
              )}

            </button>

          </div>

        </div>
      </div>
    </TeacherLayout>
  );
};

export default ExerciseCreatePage;