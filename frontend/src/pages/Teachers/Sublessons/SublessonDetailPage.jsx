import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  CreditCard,
  FileText,
  HelpCircle,
  Loader2,
} from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const SublessonDetailPage = () => {
  const { lessonId, sublessonId } = useParams();

  const navigate = useNavigate();

  const [sublesson, setSublesson] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /**
   * Load Sublesson
   */
  const fetchSublesson = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          `/api/teacher/sublessons/${sublessonId}`
        );

      setSublesson(
        response.data?.data || null
      );
    } catch (err) {
      console.error(
        "Failed to load sublesson:",
        err
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
    fetchSublesson();
  }, [sublessonId]);

  /**
   * Back to Sublesson List
   */
  const handleBack = () => {
    navigate(
      `/teacher/lessons/${lessonId}/sublessons`
    );
  };

  /**
   * Manage Content
   */
  const handleManageContent = () => {
    navigate(
      `/teacher/lessons/${lessonId}/sublessons/${sublessonId}/contents`
    );
  };

  /**
   * Manage Quiz
   */
  const handleManageQuiz = () => {
    navigate(
      `/teacher/lessons/${lessonId}/sublessons/${sublessonId}/quizzes`
    );
  };

  /**
   * Manage Flashcards
   */
  const handleManageFlashcards = () => {
    navigate(
      `/teacher/lessons/${lessonId}/sublessons/${sublessonId}/flashcards`
    );
  };

  /**
   * Loading
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

  /**
   * Sublesson Not Found
   */
  if (!sublesson) {
    return (
      <TeacherLayout>
        <div className="p-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error ||
              "Sublesson not found."}
          </div>
        </div>
      </TeacherLayout>
    );
  }

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
            Back to Sublessons
          </button>

          {/* Header */}
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <BookOpen className="h-6 w-6" />
              </div>

              <div className="min-w-0">

                <div className="mb-2 flex flex-wrap items-center gap-3">

                  <h1 className="text-3xl font-bold text-gray-900">
                    {sublesson.title}
                  </h1>

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
                  <p className="max-w-3xl text-gray-600">
                    {sublesson.description}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">

                  <span>
                    Sublesson ID:{" "}
                    {sublesson.id}
                  </span>

                  <span>
                    Sort order:{" "}
                    {sublesson.sort_order}
                  </span>

                </div>

              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Management Header */}
          <div className="mb-8">

            <h2 className="text-xl font-bold text-gray-900">
              Sublesson Management
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage the learning material and
              activities for this sublesson.
            </p>

          </div>

          {/* Management Cards */}
          <div className="grid gap-4 md:grid-cols-3">

            {/* Content */}
            <button
              type="button"
              onClick={
                handleManageContent
              }
              className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
            >

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>

              <div>

                <p className="font-semibold text-gray-900">
                  Manage Content
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Add text, Markdown, code,
                  images and other learning
                  material.
                </p>

              </div>

            </button>

            {/* Quiz */}
            <button
              type="button"
              onClick={
                handleManageQuiz
              }
              className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-purple-300 hover:bg-purple-50"
            >

              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <HelpCircle className="h-5 w-5" />
              </div>

              <div>

                <p className="font-semibold text-gray-900">
                  Manage Quiz
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Generate, edit and publish
                  quiz questions for this
                  sublesson.
                </p>

              </div>

            </button>

            {/* Flashcards */}
            <button
              type="button"
              onClick={
                handleManageFlashcards
              }
              className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-green-300 hover:bg-green-50"
            >

              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <CreditCard className="h-5 w-5" />
              </div>

              <div>

                <p className="font-semibold text-gray-900">
                  Manage Flashcards
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Generate, edit and publish
                  revision cards for this
                  sublesson.
                </p>

              </div>

            </button>

          </div>

        </div>
      </div>
    </TeacherLayout>
  );
};

export default SublessonDetailPage;