import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const QuizCreatePage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);

  const [numQuestions, setNumQuestions] =
    useState(5);

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [quizTitle, setQuizTitle] =
    useState("");

  const [questions, setQuestions] =
    useState([]);

  /*
   * Load lesson
   */
  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          `/api/teacher/lessons/${lessonId}`
        );

      const lessonData =
        response.data?.data || null;

      setLesson(lessonData);

      if (lessonData) {
        setQuizTitle(
          `${lessonData.title} - Quiz`
        );
      }
    } catch (err) {
      console.error(
        "Failed to load lesson:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load lesson."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  /*
   * Convert Gemini correct answer such as:
   *
   * "O3: const"
   *
   * into:
   *
   * "const"
   */
  const normaliseCorrectAnswer = (
    question
  ) => {
    const options =
      question.options || [];

    let correctAnswer =
      question.correctAnswer ??
      question.correct_answer ??
      question.answer ??
      "";

    if (
      typeof correctAnswer === "string"
    ) {
      correctAnswer =
        correctAnswer.trim();

      const cleaned =
        correctAnswer.replace(
          /^O\d+\s*:\s*/i,
          ""
        );

      const exactOption =
        options.find(
          (option) =>
            String(option).trim() ===
            cleaned.trim()
        );

      if (exactOption) {
        return exactOption;
      }
    }

    if (
      typeof correctAnswer === "number" &&
      options[correctAnswer]
    ) {
      return options[correctAnswer];
    }

    return correctAnswer;
  };

  /*
   * Generate quiz using AI.
   *
   * IMPORTANT:
   * This should NOT save anything
   * to the database.
   */
  const handleGenerateQuiz = async () => {
    if (!lesson) {
      return;
    }

    if (
      Number(numQuestions) < 1 ||
      Number(numQuestions) > 20
    ) {
      setError(
        "Number of questions must be between 1 and 20."
      );

      return;
    }

    try {
      setGenerating(true);
      setError("");
      setSuccess("");
      setQuestions([]);

      const response =
        await axiosInstance.post(
          "/api/teacher/ai/generate-quiz",
          {
            lessonId:
              Number(lessonId),

            numQuestions:
              Number(numQuestions),
          }
        );

      console.log(
        "Generate quiz response:",
        response.data
      );

      const quiz =
        response.data?.data?.quiz ||
        response.data?.data ||
        response.data?.quiz ||
        null;

      if (!quiz) {
        throw new Error(
          "Quiz data was not returned."
        );
      }

      const generatedQuestions =
        Array.isArray(quiz.questions)
          ? quiz.questions
          : [];

      const editableQuestions =
        generatedQuestions.map(
          (question, index) => ({
            id:
              question.id ||
              crypto.randomUUID(),

            question:
              question.question ||
              question.text ||
              "",

            options: Array.isArray(
              question.options
            )
              ? question.options.map(
                  (option) =>
                    typeof option ===
                    "string"
                      ? option
                      : option.text ||
                        option.answer ||
                        option.label ||
                        ""
                )
              : [],

            correctAnswer:
              normaliseCorrectAnswer(
                question
              ),

            explanation:
              question.explanation ||
              "",

            difficulty:
              question.difficulty ||
              "medium",
          })
        );

      setQuizTitle(
        quiz.title ||
          `${lesson.title} - Quiz`
      );

      setQuestions(
        editableQuestions
      );

      setSuccess(
        "Quiz generated. Review and edit it before saving."
      );
    } catch (err) {
      console.error(
        "Failed to generate quiz:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to generate quiz."
      );
    } finally {
      setGenerating(false);
    }
  };

  /*
   * Update question text,
   * explanation or difficulty.
   */
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

  /*
   * Update individual option.
   */
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

            /*
             * If the edited option was
             * the correct answer,
             * update correctAnswer too.
             */
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

  /*
   * Add another option.
   */
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

  /*
   * Delete an option.
   */
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

  /*
   * Remove whole question.
   */
  const removeQuestion = (
    questionIndex
  ) => {
    setQuestions((current) =>
      current.filter(
        (_, index) =>
          index !== questionIndex
      )
    );
  };

  /*
   * Add manual question.
   */
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

  /*
   * Validate before save.
   */
  const validateQuiz = () => {
    if (!quizTitle.trim()) {
      setError(
        "Quiz title is required."
      );

      return false;
    }

    if (questions.length === 0) {
      setError(
        "The quiz must contain at least one question."
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
        !question.question.trim()
      ) {
        setError(
          `Question ${
            index + 1
          } cannot be empty.`
        );

        return false;
      }

      const validOptions =
        question.options.filter(
          (option) =>
            option.trim() !== ""
        );

      if (
        validOptions.length < 2
      ) {
        setError(
          `Question ${
            index + 1
          } must contain at least two options.`
        );

        return false;
      }

      if (
        !question.correctAnswer
      ) {
        setError(
          `Please select the correct answer for question ${
            index + 1
          }.`
        );

        return false;
      }

      if (
        !validOptions.includes(
          question.correctAnswer
        )
      ) {
        setError(
          `The correct answer for question ${
            index + 1
          } must match one of its options.`
        );

        return false;
      }
    }

    return true;
  };

  /*
   * Save final edited quiz.
   */
  const handleSaveQuiz = async () => {
    setError("");
    setSuccess("");

    if (!validateQuiz()) {
      return;
    }

    try {
      setSaving(true);

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
              question.explanation.trim(),

            difficulty:
              question.difficulty,
          })
        );

      const response =
        await axiosInstance.post(
          `/api/teacher/lessons/${lessonId}/quizzes`,
          {
            title:
              quizTitle.trim(),

            questions:
              cleanedQuestions,
          }
        );

      console.log(
        "Saved quiz:",
        response.data
      );

      setSuccess(
        response.data?.message ||
          "Quiz saved successfully."
      );

      navigate(
        `/teacher/lessons/${lessonId}/quizzes`
      );
    } catch (err) {
      console.error(
        "Failed to save quiz:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save quiz."
      );
    } finally {
      setSaving(false);
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

  if (!lesson) {
    return (
      <TeacherLayout>
        <div className="p-6 lg:p-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            Lesson not found.
          </div>
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
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lesson
          </button>

          <div className="mb-8 flex items-start gap-4">
            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <HelpCircle className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                Quiz
              </p>

              <h1 className="mt-1 text-3xl font-bold text-gray-900">
                Create Quiz
              </h1>

              <p className="mt-2 text-gray-600">
                Generate and review a quiz for{" "}
                <span className="font-semibold text-gray-900">
                  {lesson.title}
                </span>
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              {success}
            </div>
          )}

          {/* Generator */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="mb-5 flex items-center gap-2 font-semibold text-gray-900">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Quiz Generator
            </h2>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Number of Questions
            </label>

            <input
              type="number"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(event) =>
                setNumQuestions(
                  event.target.value
                )
              }
              className="w-full max-w-xs rounded-xl border border-gray-300 px-4 py-3"
            />

            <div className="mt-6">
              <button
                type="button"
                onClick={
                  handleGenerateQuiz
                }
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quiz Editor */}
          {questions.length > 0 && (
            <div className="mt-8">

              <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Quiz Title
                </label>

                <input
                  type="text"
                  value={quizTitle}
                  onChange={(event) =>
                    setQuizTitle(
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
                        question.id
                      }
                      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                    >

                      <div className="mb-5 flex items-center justify-between">

                        <h3 className="font-bold text-gray-900">
                          Question{" "}
                          {questionIndex +
                            1}
                        </h3>

                        <button
                          type="button"
                          onClick={() =>
                            removeQuestion(
                              questionIndex
                            )
                          }
                          className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>

                      <textarea
                        value={
                          question.question
                        }
                        onChange={(
                          event
                        ) =>
                          updateQuestion(
                            questionIndex,
                            "question",
                            event.target
                              .value
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
                                name={`correct-${question.id}`}
                                checked={
                                  question.correctAnswer ===
                                  option &&
                                  option !==
                                    ""
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
                                value={
                                  option
                                }
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

                              {question
                                .options
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
                            question.explanation
                          }
                          onChange={(
                            event
                          ) =>
                            updateQuestion(
                              questionIndex,
                              "explanation",
                              event.target
                                .value
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
                            question.difficulty
                          }
                          onChange={(
                            event
                          ) =>
                            updateQuestion(
                              questionIndex,
                              "difficulty",
                              event.target
                                .value
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

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

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
                  onClick={
                    handleSaveQuiz
                  }
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Quiz
                    </>
                  )}
                </button>

              </div>

            </div>
          )}

        </div>
      </div>
    </TeacherLayout>
  );
};

export default QuizCreatePage;