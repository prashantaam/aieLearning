import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Plus,
  Save,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const QuizDetailPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] =
    useState(null);

  const [title, setTitle] =
    useState("");

  const [questions, setQuestions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [publishing, setPublishing] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          `/api/teacher/quizzes/${quizId}`
        );

      const quizData =
        response.data?.data?.quiz ||
        null;

      setQuiz(quizData);

      if (quizData) {
        setTitle(
          quizData.title || ""
        );

        setQuestions(
          Array.isArray(
            quizData.questions
          )
            ? quizData.questions
            : []
        );
      }
    } catch (err) {
      console.error(
        "Failed to load quiz:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load quiz."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const updateQuestion = (
    questionIndex,
    field,
    value
  ) => {
    setQuestions((current) =>
      current.map(
        (question, index) =>
          index === questionIndex
            ? {
                ...question,
                [field]: value,
              }
            : question
      )
    );
  };

  const updateOption = (
    questionIndex,
    optionIndex,
    value
  ) => {
    setQuestions((current) =>
      current.map(
        (question, index) => {
          if (
            index !== questionIndex
          ) {
            return question;
          }

          const oldOption =
            question.options[
              optionIndex
            ];

          const newOptions = [
            ...question.options,
          ];

          newOptions[
            optionIndex
          ] = value;

          return {
            ...question,

            options: newOptions,

            correctAnswer:
              question.correctAnswer ===
              oldOption
                ? value
                : question.correctAnswer,
          };
        }
      )
    );
  };

  const removeQuestion = (
    questionIndex
  ) => {
    if (
      questions.length === 1
    ) {
      setError(
        "A quiz must contain at least one question."
      );

      return;
    }

    setQuestions((current) =>
      current.filter(
        (_, index) =>
          index !== questionIndex
      )
    );
  };

  const addQuestion = () => {
    setQuestions((current) => [
      ...current,
      {
        id: crypto.randomUUID(),

        question: "",

        options: [
          "",
          "",
          "",
          "",
        ],

        correctAnswer: "",

        explanation: "",

        difficulty: "medium",
      },
    ]);
  };

  const addOption = (
    questionIndex
  ) => {
    setQuestions((current) =>
      current.map(
        (question, index) =>
          index === questionIndex
            ? {
                ...question,

                options: [
                  ...question.options,
                  "",
                ],
              }
            : question
      )
    );
  };

  const removeOption = (
    questionIndex,
    optionIndex
  ) => {
    setQuestions((current) =>
      current.map(
        (question, index) => {
          if (
            index !== questionIndex
          ) {
            return question;
          }

          if (
            question.options.length <=
            2
          ) {
            return question;
          }

          const removedOption =
            question.options[
              optionIndex
            ];

          return {
            ...question,

            options:
              question.options.filter(
                (_, index) =>
                  index !==
                  optionIndex
              ),

            correctAnswer:
              question.correctAnswer ===
              removedOption
                ? ""
                : question.correctAnswer,
          };
        }
      )
    );
  };

  const validateQuiz = () => {
    setError("");

    if (!title.trim()) {
      setError(
        "Quiz title is required."
      );

      return false;
    }

    if (questions.length === 0) {
      setError(
        "Quiz must contain at least one question."
      );

      return false;
    }

    for (
      let index = 0;
      index < questions.length;
      index++
    ) {
      const question =
        questions[index];

      if (
        !question.question?.trim()
      ) {
        setError(
          `Question ${
            index + 1
          } cannot be empty.`
        );

        return false;
      }

      const options =
        question.options
          ?.map((option) =>
            option.trim()
          )
          .filter(Boolean) || [];

      if (options.length < 2) {
        setError(
          `Question ${
            index + 1
          } must have at least two options.`
        );

        return false;
      }

      if (
        !question.correctAnswer
      ) {
        setError(
          `Select a correct answer for question ${
            index + 1
          }.`
        );

        return false;
      }

      if (
        !options.includes(
          question.correctAnswer
        )
      ) {
        setError(
          `Correct answer for question ${
            index + 1
          } must match one of its options.`
        );

        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateQuiz()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const cleanedQuestions =
        questions.map(
          (question) => ({
            question:
              question.question.trim(),

            options:
              question.options
                .map((option) =>
                  option.trim()
                )
                .filter(Boolean),

            correctAnswer:
              question.correctAnswer,

            explanation:
              question.explanation?.trim() ||
              "",

            difficulty:
              question.difficulty ||
              "medium",
          })
        );

      const response =
        await axiosInstance.put(
          `/api/teacher/quizzes/${quizId}`,
          {
            title:
              title.trim(),

            questions:
              cleanedQuestions,
          }
        );

      setQuiz(
        response.data?.data?.quiz ||
          quiz
      );

      setSuccess(
        "Quiz updated successfully."
      );

      await fetchQuiz();
    } catch (err) {
      console.error(
        "Failed to update quiz:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update quiz."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle =
    async () => {
      if (!quiz) {
        return;
      }

      try {
        setPublishing(true);
        setError("");
        setSuccess("");

        const isPublished =
          quiz.status === "published";

        const endpoint =
          isPublished
            ? `/api/teacher/quizzes/${quizId}/unpublish`
            : `/api/teacher/quizzes/${quizId}/publish`;

        const response =
          await axiosInstance.patch(
            endpoint
          );

        const updatedQuiz =
          response.data?.data?.quiz;

        if (updatedQuiz) {
          setQuiz(updatedQuiz);
        }

        setSuccess(
          response.data?.message ||
            (isPublished
              ? "Quiz unpublished."
              : "Quiz published.")
        );
      } catch (err) {
        console.error(
          "Failed to change quiz status:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to change quiz status."
        );
      } finally {
        setPublishing(false);
      }
    };

  const handleDeleteQuiz =
    async () => {
      if (
        !window.confirm(
          "Delete this quiz permanently?"
        )
      ) {
        return;
      }

      try {
        setDeleting(true);
        setError("");

        await axiosInstance.delete(
          `/api/teacher/quizzes/${quizId}`
        );

        const lessonId =
          typeof quiz.lessonId ===
          "object"
            ? quiz.lessonId.id
            : quiz.lessonId;

        navigate(
          `/teacher/lessons/${lessonId}/quizzes`
        );
      } catch (err) {
        console.error(
          "Failed to delete quiz:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to delete quiz."
        );
      } finally {
        setDeleting(false);
      }
    };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </TeacherLayout>
    );
  }

  if (!quiz) {
    return (
      <TeacherLayout>
        <div className="p-8">
          Quiz not found.
        </div>
      </TeacherLayout>
    );
  }

  const lessonId =
    typeof quiz.lessonId ===
    "object"
      ? quiz.lessonId.id
      : quiz.lessonId;

  return (
    <TeacherLayout>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/teacher/lessons/${lessonId}/quizzes`
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Quizzes
          </button>

          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                Quiz Management
              </p>

              <h1 className="mt-1 text-3xl font-bold text-gray-900">
                Edit Quiz
              </h1>

              <div className="mt-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    quiz.status ===
                    "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {quiz.status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={
                  handlePublishToggle
                }
                disabled={publishing}
                className="inline-flex items-center gap-2 rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-50 disabled:opacity-60"
              >
                {publishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : quiz.status ===
                  "published" ? (
                  <Undo2 className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}

                {quiz.status ===
                "published"
                  ? "Unpublish"
                  : "Publish"}
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteQuiz
                }
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                Delete Quiz
              </button>

            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              {success}
            </div>
          )}

          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Quiz Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />

          </div>

          <div className="space-y-6">

            {questions.map(
              (
                question,
                questionIndex
              ) => (
                <div
                  key={
                    question.id ||
                    questionIndex
                  }
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >

                  <div className="mb-5 flex items-center justify-between">

                    <h2 className="font-bold text-gray-900">
                      Question{" "}
                      {questionIndex + 1}
                    </h2>

                    <button
                      type="button"
                      onClick={() =>
                        removeQuestion(
                          questionIndex
                        )
                      }
                      className="inline-flex items-center gap-1 text-sm font-medium text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Question
                    </button>

                  </div>

                  <textarea
                    value={
                      question.question
                    }
                    onChange={(event) =>
                      updateQuestion(
                        questionIndex,
                        "question",
                        event.target.value
                      )
                    }
                    rows="3"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />

                  <div className="mt-5 space-y-3">

                    <label className="block text-sm font-semibold text-gray-700">
                      Answer Options
                    </label>

                    {question.options.map(
                      (
                        option,
                        optionIndex
                      ) => (
                        <div
                          key={
                            optionIndex
                          }
                          className="flex items-center gap-3"
                        >

                          <input
                            type="radio"
                            name={`correct-${questionIndex}`}
                            checked={
                              question.correctAnswer ===
                                option &&
                              option !== ""
                            }
                            onChange={() =>
                              updateQuestion(
                                questionIndex,
                                "correctAnswer",
                                option
                              )
                            }
                          />

                          <input
                            type="text"
                            value={option}
                            onChange={(
                              event
                            ) =>
                              updateOption(
                                questionIndex,
                                optionIndex,
                                event
                                  .target
                                  .value
                              )
                            }
                            className="flex-1 rounded-xl border border-gray-300 px-4 py-3"
                          />

                          {question.options
                            .length >
                            2 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeOption(
                                  questionIndex,
                                  optionIndex
                                )
                              }
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}

                        </div>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        addOption(
                          questionIndex
                        )
                      }
                      className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600"
                    >
                      <Plus className="h-4 w-4" />
                      Add Option
                    </button>

                  </div>

                  <div className="mt-5">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Explanation
                    </label>

                    <textarea
                      value={
                        question.explanation ||
                        ""
                      }
                      onChange={(event) =>
                        updateQuestion(
                          questionIndex,
                          "explanation",
                          event.target.value
                        )
                      }
                      rows="3"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />

                  </div>

                  <div className="mt-5">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Difficulty
                    </label>

                    <select
                      value={
                        question.difficulty ||
                        "medium"
                      }
                      onChange={(event) =>
                        updateQuestion(
                          questionIndex,
                          "difficulty",
                          event.target.value
                        )
                      }
                      className="rounded-xl border border-gray-300 px-4 py-3"
                    >
                      <option value="easy">
                        Easy
                      </option>

                      <option value="medium">
                        Medium
                      </option>

                      <option value="hard">
                        Hard
                      </option>
                    </select>

                  </div>

                </div>
              )
            )}

          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">

            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-2 rounded-xl border border-purple-200 px-5 py-3 text-sm font-semibold text-purple-700 hover:bg-purple-50"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    </TeacherLayout>
  );
};

export default QuizDetailPage;