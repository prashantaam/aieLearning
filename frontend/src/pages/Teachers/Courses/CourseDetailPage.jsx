import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CirclePlus,
  Layers3,
  Rocket,
} from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/Teachers/TeacherLayout";

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Course publish/unpublish loading state
  const [changingStatus, setChangingStatus] = useState(false);

  // Stores the lesson ID currently being published/unpublished
  const [changingLessonId, setChangingLessonId] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Load Course
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/api/teacher/courses/${courseId}`
      );

      setCourse(response.data?.data || null);
    } catch (err) {
      console.error("Failed to fetch course:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load course."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Publish Course
  |--------------------------------------------------------------------------
  */

  const handlePublishCourse = async () => {
    try {
      setChangingStatus(true);
      setError("");
      setSuccess("");

      await axiosInstance.patch(
        `/api/teacher/courses/${courseId}/publish`
      );

      setSuccess("Course published successfully.");

      await fetchCourse();
    } catch (err) {
      console.error("Failed to publish course:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to publish course."
      );
    } finally {
      setChangingStatus(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Unpublish Course
  |--------------------------------------------------------------------------
  */

  const handleUnpublishCourse = async () => {
    try {
      setChangingStatus(true);
      setError("");
      setSuccess("");

      await axiosInstance.patch(
        `/api/teacher/courses/${courseId}/unpublish`
      );

      setSuccess("Course moved back to draft.");

      await fetchCourse();
    } catch (err) {
      console.error("Failed to unpublish course:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to unpublish course."
      );
    } finally {
      setChangingStatus(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Publish Lesson
  |--------------------------------------------------------------------------
  */

  const handlePublishLesson = async (lessonId) => {
    try {
      setChangingLessonId(lessonId);
      setError("");
      setSuccess("");

      await axiosInstance.patch(
        `/api/teacher/lessons/${lessonId}/publish`
      );

      setSuccess("Lesson published successfully.");

      await fetchCourse();
    } catch (err) {
      console.error("Failed to publish lesson:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to publish lesson."
      );
    } finally {
      setChangingLessonId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Unpublish Lesson
  |--------------------------------------------------------------------------
  */

  const handleUnpublishLesson = async (lessonId) => {
    try {
      setChangingLessonId(lessonId);
      setError("");
      setSuccess("");

      await axiosInstance.patch(
        `/api/teacher/lessons/${lessonId}/unpublish`
      );

      setSuccess("Lesson moved back to draft.");

      await fetchCourse();
    } catch (err) {
      console.error("Failed to unpublish lesson:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to move lesson back to draft."
      );
    } finally {
      setChangingLessonId(null);
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
        <div className="p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <p className="text-gray-500">
                Loading course...
              </p>
            </div>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error Loading Course
  |--------------------------------------------------------------------------
  */

  if (error && !course) {
    return (
      <TeacherLayout>
        <div className="p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              {error}
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/teacher/courses")
              }
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              <ArrowLeft size={17} />
              Back to Courses
            </button>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Course Not Found
  |--------------------------------------------------------------------------
  */

  if (!course) {
    return (
      <TeacherLayout>
        <div className="p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <p className="text-gray-600">
                Course not found.
              </p>
            </div>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Data
  |--------------------------------------------------------------------------
  */

  const lessons = Array.isArray(course.lessons)
    ? course.lessons
    : [];

  const isPublished =
    course.status === "published";

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
          <Link
            to="/teacher/courses"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Courses
          </Link>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <CheckCircle2 size={19} />
              {success}
            </div>
          )}

          {/* ========================================================= */}
          {/* COURSE HEADER */}
          {/* ========================================================= */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="p-6 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                {/* Course Details */}
                <div className="max-w-3xl">
                  <div className="mb-4">
                    <span
                      className={
                        isPublished
                          ? "inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                          : "inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                      }
                    >
                      {isPublished
                        ? "Published"
                        : "Draft"}
                    </span>
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    {course.title}
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
                    {course.description ||
                      "No description available."}
                  </p>
                </div>

                {/* Publish / Draft Course */}
                <div className="flex shrink-0 flex-wrap gap-3">
                  {isPublished ? (
                    <button
                      type="button"
                      onClick={
                        handleUnpublishCourse
                      }
                      disabled={changingStatus}
                      className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {changingStatus
                        ? "Updating..."
                        : "Move to Draft"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={
                        handlePublishCourse
                      }
                      disabled={changingStatus}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Rocket size={17} />

                      {changingStatus
                        ? "Publishing..."
                        : "Publish Course"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Course Stats */}
            <div className="border-t border-gray-100 bg-gray-50/70 px-6 py-5 lg:px-8">
              <div className="grid gap-6 sm:grid-cols-3">

                {/* Lessons */}
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                    <Layers3
                      size={20}
                      className="text-blue-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Lessons
                    </p>

                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {lessons.length}
                    </p>
                  </div>
                </div>

                {/* Course ID */}
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
                    <BookOpen
                      size={20}
                      className="text-purple-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Course ID
                    </p>

                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      #{course.id}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </p>

                  <p className="mt-2 font-semibold capitalize text-gray-900">
                    {course.status || "draft"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* LESSONS */}
          {/* ========================================================= */}

          <div className="mt-8">

            {/* Lesson Header */}
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Lessons
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create and manage the lessons
                  included in this course.
                </p>
              </div>

              {/* Lesson Actions */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/teacher/courses/${courseId}/lessons/create`}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <CirclePlus size={18} />
                  Create Lesson
                </Link>
              </div>
            </div>

            {/* ===================================================== */}
            {/* NO LESSONS */}
            {/* ===================================================== */}

            {lessons.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                  <BookOpen
                    size={26}
                    className="text-blue-600"
                  />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                  No lessons yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Start building this course by
                  creating a lesson manually or use
                  AI to generate the lesson structure
                  automatically.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    to={`/teacher/courses/${courseId}/lessons/create`}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <CirclePlus size={18} />
                    Create Lesson
                  </Link>
                </div>
              </div>
            ) : (

              /* =================================================== */
              /* LESSON LIST */
              /* =================================================== */

              <div className="space-y-4">
                {lessons.map(
                  (lesson, index) => {
                    const lessonPublished =
                      lesson.status === "published";

                    const lessonChanging =
                      changingLessonId === lesson.id;

                    return (
                      <div
                        key={lesson.id}
                        className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                      >
                        <div className="flex items-start gap-4">

                          {/* Lesson Number */}
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                            {index + 1}
                          </div>

                          {/* Lesson Content */}
                          <div className="min-w-0 flex-1">

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                              <div className="min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 transition group-hover:text-blue-600">
                                  {lesson.title}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                  {lesson.description ||
                                    "No lesson description available."}
                                </p>
                              </div>

                              {/* Lesson Actions */}
                              <div className="flex shrink-0 flex-wrap items-center gap-3">

                                {lessonPublished ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUnpublishLesson(
                                        lesson.id
                                      )
                                    }
                                    disabled={
                                      lessonChanging
                                    }
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {lessonChanging
                                      ? "Updating..."
                                      : "Move to Draft"}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handlePublishLesson(
                                        lesson.id
                                      )
                                    }
                                    disabled={
                                      lessonChanging
                                    }
                                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {lessonChanging
                                      ? "Publishing..."
                                      : "Publish"}
                                  </button>
                                )}

                                <Link
                                  to={`/teacher/lessons/${lesson.id}`}
                                  className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
                                >
                                  Manage Lesson →
                                </Link>
                              </div>
                            </div>

                            {/* Lesson Status */}
                            <div className="mt-4">
                              <span
                                className={
                                  lessonPublished
                                    ? "rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                                    : "rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                                }
                              >
                                {lessonPublished
                                  ? "Published"
                                  : "Draft"}
                              </span>
                            </div>

                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default CourseDetailPage;
