import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Edit3,
} from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const SublessonContentListPage = () => {
  const {
    lessonId,
    sublessonId,
  } = useParams();

  const navigate = useNavigate();

  const [sublesson, setSublesson] = useState(null);
  const [contents, setContents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Frontend Route Helpers
  |--------------------------------------------------------------------------
  */

  const sublessonPath =
    `/teacher/lessons/${lessonId}/sublessons/${sublessonId}`;

  const contentListPath =
    `${sublessonPath}/contents`;

  const createContentPath =
    `${contentListPath}/create`;

  const editContentPath = (contentId) =>
    `${contentListPath}/${contentId}/edit`;

  /*
  |--------------------------------------------------------------------------
  | Load Data
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchData();
  }, [sublessonId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        sublessonResponse,
        contentResponse,
      ] = await Promise.all([
        axiosInstance.get(
          `/api/teacher/sublessons/${sublessonId}`
        ),

        axiosInstance.get(
          `/api/teacher/sublessons/${sublessonId}/contents`
        ),
      ]);

      setSublesson(
        sublessonResponse.data?.data || null
      );

      setContents(
        Array.isArray(contentResponse.data?.data)
          ? contentResponse.data.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load sublesson content:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load sublesson content."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Content
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (contentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this content?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(contentId);
      setError("");

      await axiosInstance.delete(
        `/api/teacher/sublesson-contents/${contentId}`
      );

      setContents((currentContents) =>
        currentContents.filter(
          (item) => item.id !== contentId
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete content:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete content."
      );
    } finally {
      setDeletingId(null);
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
            onClick={() =>
              navigate(sublessonPath)
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sublesson
          </button>

          {/* Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Content
              </h1>

              {sublesson && (
                <p className="mt-1 text-gray-500">
                  {sublesson.title}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(createContentPath)
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Content
            </button>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Empty */}
          {contents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

              <FileText className="mx-auto h-10 w-10 text-gray-400" />

              <h2 className="mt-4 text-lg font-semibold text-gray-800">
                No content yet
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Create the first learning content block
                for this sublesson.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(createContentPath)
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create Content
              </button>

            </div>
          ) : (

            /* Content List */
            <div className="space-y-4">

              {contents.map(
                (contentItem, index) => (
                  <div
                    key={contentItem.id}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">

                      {/* Content information */}
                      <div className="flex min-w-0 flex-1 gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                              {contentItem.type || "text"}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                contentItem.status ===
                                "published"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {contentItem.status}
                            </span>

                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-600">
                              {contentItem.source_type ||
                                "manual"}
                            </span>

                          </div>

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                            {contentItem.content?.length >
                            300
                              ? `${contentItem.content.substring(
                                  0,
                                  300
                                )}...`
                              : contentItem.content}
                          </p>

                          <p className="mt-3 text-xs text-gray-400">
                            Sort order:{" "}
                            {contentItem.sort_order}
                          </p>

                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              editContentPath(
                                contentItem.id
                              )
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              contentItem.id
                            )
                          }
                          disabled={
                            deletingId ===
                            contentItem.id
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId ===
                          contentItem.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}

                          Delete
                        </button>

                      </div>
                    </div>
                  </div>
                )
              )}

            </div>
          )}

        </div>
      </div>
    </TeacherLayout>
  );
};

export default SublessonContentListPage;