import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Layers3,
  Loader2,
  Plus,
} from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const FlashcardListPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFlashcards();
  }, [lessonId]);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/api/teacher/lessons/${lessonId}/flashcards`
      );

      const data = response.data?.data;

      setLesson(data?.lesson || null);
      setFlashcards(
        Array.isArray(data?.flashcards)
          ? data.flashcards
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load flashcards:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to load flashcards."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLesson = () => {
    navigate(
      `/teacher/lessons/${lessonId}`
    );
  };

  const handleCreateFlashcards = () => {
    navigate(
      `/teacher/lessons/${lessonId}/flashcards/create`
    );
  };

  const handleManageFlashcards = (
    flashcardId
  ) => {
    navigate(
      `/teacher/flashcards/${flashcardId}`
    );
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2
            size={32}
            className="animate-spin text-purple-600"
          />
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <button
            type="button"
            onClick={handleBackToLesson}
            className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-purple-700"
          >
            <ArrowLeft size={18} />
            Back to Lesson
          </button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Flashcards
              </h1>

              {lesson && (
                <p className="mt-2 text-gray-600">
                  {lesson.title}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleCreateFlashcards}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700"
            >
              <Plus size={18} />
              Create Flashcards
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {flashcards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
              <Layers3
                size={28}
                className="text-purple-600"
              />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No flashcards yet
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Create a flashcard set manually or generate one with AI.
            </p>

            <button
              type="button"
              onClick={handleCreateFlashcards}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700"
            >
              <Plus size={18} />
              Create Flashcards
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {flashcards.map((flashcard) => (
              <div
                key={flashcard.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Flashcard Set #{flashcard.id}
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                      <span>
                        {flashcard.totalCards} cards
                      </span>

                      <span>•</span>

                      <span className="capitalize">
                        {flashcard.status}
                      </span>

                      <span>•</span>

                      <span>
                        {flashcard.sourceType === "ai"
                          ? "AI generated"
                          : "Manual"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        flashcard.status ===
                        "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {flashcard.status}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleManageFlashcards(
                          flashcard.id
                        )
                      }
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-purple-300 hover:bg-gray-50 hover:text-purple-700"
                    >
                      Manage Flashcards
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default FlashcardListPage;