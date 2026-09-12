import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Plus,
  ArrowRight,
  Layers3,
} from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        "/api/teacher/courses"
      );

      setCourses(response.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "published":
        return "bg-green-50 text-green-700";

      case "draft":
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  return (
    <TeacherLayout>
      <div className="p-6 lg:p-8">

        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Courses
            </h1>

            <p className="mt-2 text-gray-600">
              Create and manage your learning courses.
            </p>
          </div>

          <Link
            to="/teacher/courses/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Course
          </Link>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <p className="text-gray-600">
              Loading courses...
            </p>
          </div>
        ) : courses.length === 0 ? (

          /* Empty State */
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <BookOpen
                size={26}
                className="text-blue-600"
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              No courses yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Create your first course and start adding lessons,
              learning content, quizzes and flashcards.
            </p>

            <Link
              to="/teacher/courses/create"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Create Course
            </Link>

          </div>

        ) : (

          /* Course Cards */
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/teacher/courses/${course.id}`}
                className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >

                {/* Status */}
                <div className="mb-4 flex items-center justify-between">

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                      course.status
                    )}`}
                  >
                    {course.status || "draft"}
                  </span>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <BookOpen
                      size={18}
                      className="text-blue-600"
                    />
                  </div>

                </div>

                {/* Course Information */}
                <h2 className="text-xl font-semibold text-gray-900 transition group-hover:text-blue-600">
                  {course.title}
                </h2>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                  {course.description ||
                    "No description available."}
                </p>

                {/* Lesson Count */}
                <div className="mt-6 border-t border-gray-100 pt-4">

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Layers3 size={16} />

                    <span>
                      {course.lessons_count ?? 0}{" "}
                      {(course.lessons_count ?? 0) === 1
                        ? "Lesson"
                        : "Lessons"}
                    </span>
                  </div>

                </div>

                {/* View Course */}
                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-blue-600">
                  <span>
                    Manage Course
                  </span>

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>

              </Link>
            ))}

          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default CoursesPage;