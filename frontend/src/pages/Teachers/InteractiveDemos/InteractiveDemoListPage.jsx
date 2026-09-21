import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Loader2,
  MonitorPlay,
  Plus,
  Rocket,
  Trash2,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const InteractiveDemoListPage = () => {
  const {
    lessonId,
    sublessonId,
  } = useParams();

  const navigate = useNavigate();

  const [sublesson, setSublesson] =
    useState(null);

  const [demo, setDemo] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [processing, setProcessing] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load Interactive Demo
  |--------------------------------------------------------------------------
  */

  const fetchDemo = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          `/api/teacher/sublessons/${sublessonId}/demos`
        );

      const responseData =
        response.data?.data || {};

      setSublesson(
        responseData.sublesson || null
      );

      const demos =
        Array.isArray(responseData.demos)
          ? responseData.demos
          : [];

      /*
       * New architecture:
       * one interactive-demo sublesson
       * has one primary demo.
       */
      setDemo(
        demos.length > 0
          ? demos[0]
          : null
      );
    } catch (err) {
      console.error(
        "Failed to load interactive demo:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load interactive demo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemo();
  }, [sublessonId]);

  /*
  |--------------------------------------------------------------------------
  | Back
  |--------------------------------------------------------------------------
  */

const handleBack = () => {
  navigate(
    `/teacher/lessons/${lessonId}`
  );
};

  /*
  |--------------------------------------------------------------------------
  | Create Demo
  |--------------------------------------------------------------------------
  */

  const handleCreate = () => {
    navigate(
      `/teacher/lessons/${lessonId}/sublessons/${sublessonId}/demos/create`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Edit Demo
  |--------------------------------------------------------------------------
  */

  const handleEdit = () => {
    if (!demo?.id) {
      return;
    }

    navigate(
      `/teacher/lessons/${lessonId}/sublessons/${sublessonId}/demos/${demo.id}/edit`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Publish Demo
  |--------------------------------------------------------------------------
  */

  const handlePublish = async () => {
    if (!demo?.id) {
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      const response =
        await axiosInstance.patch(
          `/api/teacher/sublessons/${sublessonId}/demos/${demo.id}/publish`
        );

      const updatedDemo =
        response.data?.data?.demo;

      if (updatedDemo) {
        setDemo(updatedDemo);
      } else {
        await fetchDemo();
      }

      setSuccess(
        "Interactive demo published successfully."
      );
    } catch (err) {
      console.error(
        "Failed to publish interactive demo:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to publish interactive demo."
      );
    } finally {
      setProcessing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Move Demo Back To Draft
  |--------------------------------------------------------------------------
  */

  const handleUnpublish = async () => {
    if (!demo?.id) {
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      const response =
        await axiosInstance.patch(
          `/api/teacher/sublessons/${sublessonId}/demos/${demo.id}/unpublish`
        );

      const updatedDemo =
        response.data?.data?.demo;

      if (updatedDemo) {
        setDemo(updatedDemo);
      } else {
        await fetchDemo();
      }

      setSuccess(
        "Interactive demo moved back to draft."
      );
    } catch (err) {
      console.error(
        "Failed to move interactive demo back to draft:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to move interactive demo back to draft."
      );
    } finally {
      setProcessing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Demo
  |--------------------------------------------------------------------------
  */

  const handleDelete = async () => {
    if (!demo?.id) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${
          sublesson?.title ||
          demo.title ||
          "this interactive demo"
        }"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      await axiosInstance.delete(
        `/api/teacher/sublessons/${sublessonId}/demos/${demo.id}`
      );

      setDemo(null);

      setSuccess(
        "Interactive demo deleted successfully."
      );
    } catch (err) {
      console.error(
        "Failed to delete interactive demo:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete interactive demo."
      );
    } finally {
      setProcessing(false);
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
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        </div>
      </TeacherLayout>
    );
  }

  const isPublished =
    demo?.status === "published";

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <TeacherLayout>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Back */}

          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Lesson
          </button>

          {/* Error */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}

          {success && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <CheckCircle2 className="h-5 w-5 shrink-0" />

              {success}
            </div>
          )}

          {/* Header */}

          <div className="mb-6 flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="shrink-0 rounded-xl bg-cyan-50 p-3 text-cyan-600">
                <MonitorPlay className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    Interactive Demo
                  </span>

                  {demo && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {isPublished
                        ? "Published"
                        : "Draft"}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                  {sublesson?.title ||
                    "Interactive Demo"}
                </h1>

                {sublesson?.description && (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                    {sublesson.description}
                  </p>
                )}
              </div>
            </div>

            {/* Header Actions */}

            {demo && (
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={processing}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Edit3 className="h-4 w-4" />

                  Edit Demo
                </button>

                {isPublished ? (
                  <button
                    type="button"
                    onClick={
                      handleUnpublish
                    }
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processing && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    Move to Draft
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={
                      handlePublish
                    }
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Rocket className="h-4 w-4" />
                    )}

                    Publish
                  </button>
                )}
              </div>
            )}
          </div>

          {/* No Demo */}

          {!demo && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <MonitorPlay className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-gray-900">
                Interactive demo content
                has not been created yet
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
                Add the instructions and
                interactive experience for
                this sublesson.
              </p>

              <button
                type="button"
                onClick={handleCreate}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                <Plus className="h-4 w-4" />

                Create Interactive Demo
              </button>
            </div>
          )}

          {/* Existing Demo */}

          {demo && (
            <>
              <div className="grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-[42%_58%]">
                {/* Instructions */}

                <section className="border-b border-gray-200 lg:border-b-0 lg:border-r">
                  <div className="p-6 lg:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                      Instructions
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-gray-900">
                      Try it yourself
                    </h2>

                    <div className="mt-6 border-t border-gray-100 pt-6">
                      {demo.instruction ? (
                        <div className="prose prose-slate max-w-none prose-headings:text-gray-900 prose-a:text-cyan-700 prose-code:text-gray-900">
                          <ReactMarkdown
                            remarkPlugins={[
                              remarkGfm,
                            ]}
                          >
                            {
                              demo.instruction
                            }
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">
                          No instructions
                          have been added.
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Preview */}

                <section className="flex min-h-[600px] flex-col bg-gray-50">
                  <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
                    <span className="text-sm font-bold text-gray-900">
                      Playground
                    </span>

                    <span className="text-xs text-gray-400">
                      Student Preview
                    </span>
                  </div>

                  <div className="min-h-0 flex-1 p-4">
                    <div className="h-full min-h-[520px] overflow-hidden rounded-xl border border-gray-200 bg-white">
                      {demo.code ? (
                        <iframe
                          title={
                            sublesson?.title ||
                            demo.title ||
                            "Interactive Demo"
                          }
                          srcDoc={
                            demo.code
                          }
                          sandbox="allow-scripts"
                          className="h-full min-h-[520px] w-full border-0 bg-white"
                        />
                      ) : (
                        <div className="flex h-full min-h-[520px] items-center justify-center p-8 text-center">
                          <div>
                            <MonitorPlay className="mx-auto h-8 w-8 text-gray-300" />

                            <p className="mt-3 text-sm text-gray-400">
                              No interactive
                              demo code has
                              been added.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              {/* Details / Delete */}

              <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-400">
                  <span>
                    Demo ID: {demo.id}
                  </span>

                  <span>
                    Source:{" "}
                    {demo.source_type ||
                      "manual"}
                  </span>

                  <span>
                    Sort order:{" "}
                    {demo.sort_order}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={processing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />

                  Delete Demo
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default InteractiveDemoListPage;