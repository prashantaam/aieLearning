import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Save,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const FlashcardDetailPage = () => {
  const { flashcardId } = useParams();
  const navigate = useNavigate();

  const [flashcard, setFlashcard] =
    useState(null);

  const [cards, setCards] =
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

  useEffect(() => {
    fetchFlashcard();
  }, [flashcardId]);

  const fetchFlashcard = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          `/api/teacher/flashcards/${flashcardId}`
        );

      const flashcardData =
        response.data?.data?.flashcard;

      if (!flashcardData) {
        throw new Error(
          "Flashcard set not found."
        );
      }

      setFlashcard(flashcardData);

      setCards(
        Array.isArray(flashcardData.cards)
          ? flashcardData.cards
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
          err.message ||
          "Failed to load flashcards."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateCard = (
    index,
    field,
    value
  ) => {
    setCards((currentCards) =>
      currentCards.map(
        (card, cardIndex) =>
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

    setSuccess("");
    setError("");
  };

  const validateCards = () => {
    if (cards.length === 0) {
      setError(
        "The flashcard set must contain at least one card."
      );

      return false;
    }

    for (
      let index = 0;
      index < cards.length;
      index++
    ) {
      const card = cards[index];

      if (!card.front?.trim()) {
        setError(
          `Card ${index + 1} front is required.`
        );

        return false;
      }

      if (!card.back?.trim()) {
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
          ...(card.id
            ? { id: card.id }
            : {}),

          front:
            card.front.trim(),

          back:
            card.back.trim(),
        }));

      const response =
        await axiosInstance.put(
          `/api/teacher/flashcards/${flashcardId}`,
          {
            cards: cleanedCards,
            source_type:
              flashcard?.sourceType ||
              "manual",
          }
        );

      const updatedFlashcard =
        response.data?.data?.flashcard;

      if (updatedFlashcard) {
        setFlashcard(
          updatedFlashcard
        );

        setCards(
          Array.isArray(
            updatedFlashcard.cards
          )
            ? updatedFlashcard.cards
            : []
        );
      }

      setSuccess(
        "Flashcards updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update flashcards:",
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
          "Failed to update flashcards."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle =
    async () => {
      if (!flashcard) {
        return;
      }

      setError("");
      setSuccess("");

      try {
        setPublishing(true);

        const isPublished =
          flashcard.status ===
          "published";

        const endpoint =
          isPublished
            ? `/api/teacher/flashcards/${flashcardId}/unpublish`
            : `/api/teacher/flashcards/${flashcardId}/publish`;

        const response =
          await axiosInstance.patch(
            endpoint
          );

        const updatedFlashcard =
          response.data?.data
            ?.flashcard;

        if (updatedFlashcard) {
          setFlashcard(
            updatedFlashcard
          );

          setCards(
            Array.isArray(
              updatedFlashcard.cards
            )
              ? updatedFlashcard.cards
              : cards
          );
        }

        setSuccess(
          isPublished
            ? "Flashcards moved back to draft."
            : "Flashcards published successfully."
        );
      } catch (err) {
        console.error(
          "Failed to change flashcard status:",
          err
        );

        console.error(
          "Laravel response:",
          err.response?.data
        );

        setError(
          err.response?.data?.message ||
            "Failed to update flashcard status."
        );
      } finally {
        setPublishing(false);
      }
    };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Delete this flashcard set permanently?"
      )
    ) {
      return;
    }

    const lessonId =
      typeof flashcard?.lessonId ===
      "object"
        ? flashcard.lessonId.id
        : flashcard?.lessonId;

    try {
      setDeleting(true);
      setError("");

      await axiosInstance.delete(
        `/api/teacher/flashcards/${flashcardId}`
      );

      navigate(
        `/teacher/lessons/${lessonId}/flashcards`
      );
    } catch (err) {
      console.error(
        "Failed to delete flashcards:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete flashcards."
      );
    } finally {
      setDeleting(false);
    }
  };

  const lessonId =
    typeof flashcard?.lessonId ===
    "object"
      ? flashcard.lessonId.id
      : flashcard?.lessonId;

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

  if (!flashcard) {
    return (
      <TeacherLayout>
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error ||
              "Flashcard set not found."}
          </div>
        </div>
      </TeacherLayout>
    );
  }

  const isPublished =
    flashcard.status === "published";

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

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Flashcards
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  isPublished
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {flashcard.status}
              </span>
            </div>

            {typeof flashcard.lessonId ===
              "object" && (
              <p className="mt-2 text-gray-600">
                {
                  flashcard.lessonId
                    .title
                }
              </p>
            )}

            <p className="mt-2 text-sm text-gray-500">
              {cards.length}{" "}
              {cards.length === 1
                ? "card"
                : "cards"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={
                handlePublishToggle
              }
              disabled={publishing}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isPublished
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {publishing ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : isPublished ? (
                <Undo2 size={18} />
              ) : (
                <Send size={18} />
              )}

              {isPublished
                ? "Unpublish"
                : "Publish"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={18} />
              )}

              Delete Set
            </button>
          </div>
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

        <div className="space-y-5">
          {cards.map(
            (card, index) => (
              <div
                key={
                  card.id || index
                }
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
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
                    <Trash2
                      size={16}
                    />
                    Remove Card
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Front
                    </label>

                    <textarea
                      value={
                        card.front || ""
                      }
                      onChange={(
                        event
                      ) =>
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
                      value={
                        card.back || ""
                      }
                      onChange={(
                        event
                      ) =>
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
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default FlashcardDetailPage;