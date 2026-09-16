import {
  ChevronDown,
  ChevronRight,
  CircleHelp,
} from "lucide-react";

export default function CourseIndex({
  course,
  lessons,
  currentSublessonId,
  currentMode = "content",
  expandedLessons,
  toggleLesson,
  goToSublesson,
  goToQuiz,
}) {
  return (
    <div className="p-4">
      {/* Course Title */}
      <div className="mb-5 border-b border-slate-200 pb-4">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
          Course
        </p>

        <h2 className="mt-1 text-base font-bold leading-6 text-[#0B1F3A]">
          {course?.title}
        </h2>
      </div>

      {/* Lessons */}
      <div className="space-y-2">
        {lessons.map((lesson, lessonIndex) => {
          const isExpanded =
            expandedLessons?.[lesson.id] ?? false;

          const sublessons = Array.isArray(
            lesson.sublessons
          )
            ? lesson.sublessons
            : [];

          return (
            <div key={lesson.id}>
              {/* Lesson */}
              <button
                type="button"
                onClick={() =>
                  toggleLesson(lesson.id)
                }
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-slate-50"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#0B1F3A] text-xs font-bold text-[#F4C95D]">
                  {lessonIndex + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-[#0B1F3A]">
                    {lesson.title}
                  </span>
                </span>

                {isExpanded ? (
                  <ChevronDown
                    size={17}
                    className="shrink-0 text-slate-400"
                  />
                ) : (
                  <ChevronRight
                    size={17}
                    className="shrink-0 text-slate-400"
                  />
                )}
              </button>

              {/* Sublessons */}
              {isExpanded && (
                <div className="ml-[26px] border-l border-slate-200 pl-4">
                  {sublessons.map(
                    (
                      sublesson,
                      sublessonIndex
                    ) => {
                      const isCurrentSublesson =
                        String(
                          currentSublessonId
                        ) ===
                        String(sublesson.id);

                      const isContentActive =
                        isCurrentSublesson &&
                        currentMode ===
                          "content";

                      const isQuizActive =
                        isCurrentSublesson &&
                        currentMode === "quiz";

                      const hasQuiz =
                        Array.isArray(
                          sublesson.quizzes
                        ) &&
                        sublesson.quizzes
                          .length > 0;

                      return (
                        <div
                          key={sublesson.id}
                          className="py-1"
                        >
                          {/* Sublesson Content */}
                          <button
                            type="button"
                            onClick={() =>
                              goToSublesson(
                                sublesson.id
                              )
                            }
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                              isContentActive
                                ? "bg-[#0B1F3A] text-white"
                                : "text-slate-600 hover:bg-slate-50 hover:text-[#0B1F3A]"
                            }`}
                          >
                            <span
                              className={`text-xs font-bold ${
                                isContentActive
                                  ? "text-[#F4C95D]"
                                  : "text-slate-400"
                              }`}
                            >
                              {lessonIndex + 1}.
                              {sublessonIndex +
                                1}
                            </span>

                            <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                              {
                                sublesson.title
                              }
                            </span>
                          </button>

                          {/* Quiz */}
                          {hasQuiz && (
                            <button
                              type="button"
                              onClick={() =>
                                goToQuiz(
                                  sublesson.id
                                )
                              }
                              className={`ml-8 mt-1 flex w-[calc(100%-2rem)] items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                                isQuizActive
                                  ? "bg-amber-50 text-[#0B1F3A]"
                                  : "text-slate-500 hover:bg-slate-50 hover:text-[#0B1F3A]"
                              }`}
                            >
                              <CircleHelp
                                size={15}
                                className={
                                  isQuizActive
                                    ? "text-[#B8860B]"
                                    : "text-slate-400"
                                }
                              />

                              <span>
                                Quiz
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}