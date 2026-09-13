import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const FlashcardCreatePage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);

  const [numberOfCards, setNumberOfCards] =
    useState(10);

  const [cards, setCards] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          `/api/teacher/lessons/${lessonId}`
        );

      const lessonData =
        response.data?.data?.lesson ||
        response.data?.data ||
        response.data;

      setLesson(lessonData);
    } catch (err) {
      console.error(
        "Failed to load lesson:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to load lesson."
      );
    } finally {
      setLoading(false);
    }
  };

  const normaliseCards = (rawCards) => {
    if (!Array.isArray(rawCards)) {
      return [];
    }

    return rawCards.map((card) => ({
      front:
        card.front ??
        card.question ??
        card.term ??
        "",

      back:
        card.back ??
        card.answer ??
        card.definition ??
        "",
    }));
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError("");
      setSuccess("");

      const response =
        await axiosInstance.post(
          "/api/teacher/ai/generate-flashcards",
          {
            lessonId: Number(lessonId),
            numberOfCards:
              Number(numberOfCards),
          }
        );

      console.log(
        "Flashcard AI response:",
        response.data
      );

      const generatedCards =
        response.data?.data?.flashcards?.cards ||
        response.data?.data?.cards ||
        response.data?.flashcards ||
        response.data?.cards ||
        [];

      const normalised =
        normaliseCards(generatedCards);

      if (normalised.length === 0) {
        setError(
          "AI did not return any flashcards."
        );

        return;
      }

      setCards(normalised);

      setSuccess(
        "Flashcards generated. Review and edit them before saving."
      );
    } catch (err) {
      console.error(
        "Failed to generate flashcards:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to generate flashcards."
      );
    } finally {
      setGenerating(false);
    }
  };

  const updateCard = (
    index,
    field,
    value
  ) => {
    setCards((currentCards) =>
      currentCards.map((card, cardIndex) =>
        cardIndex === index
          ? {
              ...card,
              [field]: value,
            }
          : card
      )
    );
  };

  const addCard = () => {
    setCards((currentCards) => [
      ...currentCards,
      {
        front: "",
        back: "",
      },
    ]);
  };

  const removeCard = (index) => {
    if (cards.length <= 1) {
      setError(
        "A flashcard set must contain at least one card."
      );

      return;
    }

    setCards((currentCards) =>
      currentCards.filter(
        (_, cardIndex) =>
          cardIndex !== index
      )
    );
  };

  const validateCards = () => {
    if (cards.length === 0) {
      setError(
        "Please generate or add at least one flashcard."
      );

      return false;
    }

    for (
      let index = 0;
      index < cards.length;
      index++
    ) {
      const card = cards[index];

      if (!card.front.trim()) {
        setError(
          `Card ${index + 1} front is required.`
        );

        return false;
      }

      if (!card.back.trim()) {
        setError(
          `Card ${index + 1} back is required.`
        );

        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!validateCards()) {
      return;
    }

    try {
      setSaving(true);

      const cleanedCards =
        cards.map((card) => ({
          front: card.front.trim(),
          back: card.back.trim(),
        }));

      await axiosInstance.post(
        `/api/teacher/lessons/${lessonId}/flashcards`,
        {
          cards: cleanedCards,
          source_type: "ai",
        }
      );

      navigate(
        `/teacher/lessons/${lessonId}/flashcards`
      );
    } catch (err) {
      console.error(
        "Failed to save flashcards:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      console.error(
        "Validation errors:",
        err.response?.data?.errors
      );

      setError(
        err.response?.data?.message ||
          "Failed to save flashcards."
      );
    } finally {
      setSaving(false);
    }
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
      <div className="mx-auto max-w-5xl px-4 py-8">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/teacher/lessons/${lessonId}/flashcards`
            )
          }
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-purple-700"
        >
          <ArrowLeft size={18} />
          Back to Flashcards
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Flashcards
          </h1>

          {lesson && (
            <p className="mt-2 text-gray-600">
              {lesson.title}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Generate with AI
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Generate flashcards using the lesson content,
            then review and edit them before saving.
          </p>

          <div className="mt-5 flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Number of cards
              </label>

              <select
                value={numberOfCards}
                onChange={(event) =>
                  setNumberOfCards(
                    event.target.value
                  )
                }
                className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="5">
                  5
                </option>

                <option value="10">
                  10
                </option>

                <option value="15">
                  15
                </option>

                <option value="20">
                  20
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Flashcards
                </>
              )}
            </button>
          </div>
        </div>

        {cards.length > 0 && (
          <>
            <div className="space-y-5">
              {cards.map(
                (card, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="font-semibold text-gray-900">
                        Card {index + 1}
                      </h2>

                      <button
                        type="button"
                        onClick={() =>
                          removeCard(index)
                        }
                        className="flex items-center gap-1 text-sm font-medium text-red-600 transition hover:text-red-700"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Front
                        </label>

                        <textarea
                          value={card.front}
                          onChange={(event) =>
                            updateCard(
                              index,
                              "front",
                              event.target
                                .value
                            )
                          }
                          rows={3}
                          placeholder="Question or term"
                          className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Back
                        </label>

                        <textarea
                          value={card.back}
                          onChange={(event) =>
                            updateCard(
                              index,
                              "back",
                              event.target
                                .value
                            )
                          }
                          rows={4}
                          placeholder="Answer or explanation"
                          className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={addCard}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
              >
                <Plus size={18} />
                Add Card
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Flashcards
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {cards.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-gray-500">
              Generate flashcards with AI or add a
              card manually.
            </p>

            <button
              type="button"
              onClick={addCard}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
            >
              <Plus size={18} />
              Add Card Manually
            </button>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default FlashcardCreatePage;