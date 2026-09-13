import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  HelpCircle,
  Loader2,
  Plus,
} from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const QuizListPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [quizzes, setQuizzes] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          `/api/teacher/lessons/${lessonId}/quizzes`
        );

      console.log(
        "Quiz list response:",
        response.data
      );

      setLesson(
        response.data?.data?.lesson ||
          null
      );

      setQuizzes(
        Array.isArray(
          response.data?.data?.quizzes
        )
          ? response.data.data.quizzes
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load quizzes:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load quizzes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [lessonId]);

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/teacher/lessons/${lessonId}`
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Lesson
          </button>

          <div className="mb-8 flex items-start justify-between gap-4">

            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <HelpCircle className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                  Quizzes
                </p>

                <h1 className="mt-1 text-3xl font-bold text-gray-900">
                  Quiz Management
                </h1>

                {lesson && (
                  <p className="mt-2 text-gray-600">
                    Manage quizzes for{" "}
                    <span className="font-semibold text-gray-900">
                      {lesson.title}
                    </span>
                  </p>
                )}
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/teacher/lessons/${lessonId}/quizzes/create`
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" />

              Create Quiz
            </button>

          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {quizzes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

              <HelpCircle className="mx-auto h-10 w-10 text-gray-400" />

              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                No quizzes yet
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Create an AI-generated quiz for this lesson.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/teacher/lessons/${lessonId}/quizzes/create`
                  )
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />

                Create Quiz
              </button>

            </div>
          ) : (
            <div className="space-y-4">

             {quizzes.map((quiz) => (
  <div
    key={quiz.id}
    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
  >
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900">
          {quiz.title}
        </h2>

        <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
          <span>{quiz.totalQuestions} questions</span>
          <span>•</span>
          <span className="capitalize">{quiz.status}</span>
          <span>•</span>
          <span>
            {quiz.sourceType === "ai"
              ? "AI generated"
              : "Manual"}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            quiz.status === "published"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {quiz.status}
        </span>

        <button
          type="button"
          onClick={() =>
            navigate(`/teacher/quizzes/${quiz.id}`)
          }
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:border-purple-300 hover:text-purple-700"
        >
          Manage Quiz
        </button>
      </div>
    </div>
  </div>
))}

            </div>
          )}

        </div>
      </div>
    </TeacherLayout>
  );
};

export default QuizListPage;