import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Plus,
  Settings,
} from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const SublessonListPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [sublessons, setSublessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSublessons();
  }, [lessonId]);

  const fetchSublessons = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/api/teacher/lessons/${lessonId}/sublessons`
      );

      setSublessons(
        Array.isArray(response.data?.data)
          ? response.data.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load sublessons:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load sublessons."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">

          {/* Back */}
          <button
            type="button"
            onClick={() =>
              navigate(
                `/teacher/lessons/${lessonId}`
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lesson
          </button>

          {/* Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Sublessons
              </h1>

              <p className="mt-1 text-gray-500">
                Manage the learning sections within this lesson.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/teacher/lessons/${lessonId}/sublessons/create`
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Sublesson
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : sublessons.length === 0 ? (

            /* Empty state */
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-gray-400" />

              <h2 className="mt-4 text-lg font-semibold text-gray-800">
                No sublessons yet
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Create your first sublesson to start adding
                learning content.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/teacher/lessons/${lessonId}/sublessons/create`
                  )
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create Sublesson
              </button>
            </div>
          ) : (

            /* Sublesson list */
            <div className="space-y-4">
              {sublessons.map(
                (sublesson, index) => (
                  <div
                    key={sublesson.id}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">

                      {/* Sublesson information */}
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-semibold text-gray-900">
                              {sublesson.title}
                            </h2>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                sublesson.status ===
                                "published"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {sublesson.status}
                            </span>
                          </div>

                          {sublesson.description && (
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                              {sublesson.description}
                            </p>
                          )}

                          <p className="mt-2 text-xs text-gray-400">
                            Sort order:{" "}
                            {sublesson.sort_order}
                          </p>
                        </div>
                      </div>

                      {/* Manage */}
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/teacher/lessons/${lessonId}/sublessons/${sublesson.id}`
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Settings className="h-4 w-4" />
                        Manage
                      </button>
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

export default SublessonListPage;