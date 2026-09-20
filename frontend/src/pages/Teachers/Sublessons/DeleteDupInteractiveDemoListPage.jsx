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

  const [demos, setDemos] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [processingId, setProcessingId] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Load Interactive Demos
  |--------------------------------------------------------------------------
  */

  const fetchDemos = async () => {
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

      setDemos(
        responseData.demos || []
      );
    } catch (err) {
      console.error(
        "Failed to load interactive demos:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load interactive demos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemos();
  }, [sublessonId]);

  /*
  |--------------------------------------------------------------------------
  | Back
  |--------------------------------------------------------------------------
  */

  const handleBack = () => {
    navigate(
      `/teacher/lessons/${lessonId}/sublessons/${sublessonId}`
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

  const handleEdit = (demoId) => {
    navigate(
      `/teacher/lessons/${lessonId}/sublessons/${sublessonId}/demos/${demoId}/edit`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Publish Demo
  |--------------------------------------------------------------------------
  */

  const handlePublish = async (demoId) => {
    try {
      setProcessingId(demoId);
      setError("");
      setSuccess("");

      const response =
        await axiosInstance.patch(
          `/api/teacher/sublessons/${sublessonId}/demos/${demoId}/publish`
        );

      const updatedDemo =
        response.data?.data?.demo;

      if (updatedDemo) {
        setDemos((currentDemos) =>
          currentDemos.map((demo) =>
            demo.id === demoId
              ? updatedDemo
              : demo
          )
        );
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
      setProcessingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Unpublish Demo
  |--------------------------------------------------------------------------
  */

  const handleUnpublish = async (demoId) => {
    try {
      setProcessingId(demoId);
      setError("");
      setSuccess("");

      const response =
        await axiosInstance.patch(
          `/api/teacher/sublessons/${sublessonId}/demos/${demoId}/unpublish`
        );

      const updatedDemo =
        response.data?.data?.demo;

      if (updatedDemo) {
        setDemos((currentDemos) =>
          currentDemos.map((demo) =>
            demo.id === demoId
              ? updatedDemo
              : demo
          )
        );
      }

      setSuccess(
        "Interactive demo moved back to draft."
      );
    } catch (err) {
      console.error(
        "Failed to unpublish interactive demo:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to move interactive demo back to draft."
      );
    } finally {
      setProcessingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Demo
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (demo) => {
    const confirmed = window.confirm(
      `Delete "${demo.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(demo.id);
      setError("");
      setSuccess("");

      await axiosInstance.delete(
        `/api/teacher/sublessons/${sublessonId}/demos/${demo.id}`
      );

      setDemos((currentDemos) =>
        currentDemos.filter(
          (item) => item.id !== demo.id
        )
      );

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
      setProcessingId(null);
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

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <TeacherLayout>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">

          {/* Back */}

          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Sublesson
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

          <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">

            <div className="flex min-w-0 items-start gap-4">

              <div className="shrink-0 rounded-xl bg-cyan-50 p-3 text-cyan-600">
                <MonitorPlay className="h-6 w-6" />
              </div>

              <div className="min-w-0">

                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                  Interactive Demos
                </h1>

                {sublesson?.title && (
                  <p className="mt-1 font-medium text-gray-700">
                    {sublesson.title}
                  </p>
                )}

                <p className="mt-2 max-w-2xl text-sm text-gray-500">
                  Create browser-based interactive
                  demonstrations using HTML, CSS and
                  JavaScript.
                </p>

              </div>
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              <Plus className="h-4 w-4" />

              Create Demo
            </button>

          </div>

          {/* Empty State */}

          {demos.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <MonitorPlay className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-gray-900">
                No interactive demos yet
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
                Create an interactive demonstration
                that students can use alongside the
                learning content.
              </p>

              <button
                type="button"
                onClick={handleCreate}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                <Plus className="h-4 w-4" />

                Create First Demo
              </button>

            </div>
          )}

          {/* Demo List */}

          {demos.length > 0 && (
            <div className="space-y-4">

              {demos.map((demo) => {
                const isPublished =
                  demo.status === "published";

                const isProcessing =
                  processingId === demo.id;

                return (
                  <div
                    key={demo.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* Demo information */}

                      <div className="flex min-w-0 items-start gap-4">

                        <div className="shrink-0 rounded-xl bg-cyan-50 p-3 text-cyan-600">
                          <MonitorPlay className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-3">

                            <h2 className="text-lg font-semibold text-gray-900">
                              {demo.title}
                            </h2>

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

                          </div>

                          {demo.description && (
                            <p className="mt-2 max-w-2xl text-sm text-gray-500">
                              {demo.description}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">

                            <span>
                              Demo ID: {demo.id}
                            </span>

                            <span>
                              Sort order:{" "}
                              {demo.sort_order}
                            </span>

                            <span>
                              Source:{" "}
                              {demo.source_type ||
                                "manual"}
                            </span>

                          </div>

                        </div>
                      </div>

                      {/* Actions */}

                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(demo.id)
                          }
                          disabled={isProcessing}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Edit3 className="h-4 w-4" />

                          Edit
                        </button>

                        {isPublished ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleUnpublish(
                                demo.id
                              )
                            }
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}

                            Move to Draft
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handlePublish(
                                demo.id
                              )
                            }
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Rocket className="h-4 w-4" />
                            )}

                            Publish
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(demo)
                          }
                          disabled={isProcessing}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />

                          Delete
                        </button>

                      </div>

                    </div>
                  </div>
                );
              })}

            </div>
          )}

        </div>
      </div>
    </TeacherLayout>
  );
};

export default InteractiveDemoListPage;
