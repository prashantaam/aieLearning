import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/api/subjects");

      setSubjects(response.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load subjects."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Subjects
        </h1>

        <p className="mt-2 text-gray-600">
          Browse available learning subjects.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            No subjects available
          </h2>

          <p className="mt-2 text-gray-500">
            Subjects created by teachers will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              to={`/subjects/${subject.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  {subject.status || "draft"}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-gray-900">
                {subject.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {subject.description || "No description available."}
              </p>

              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500">
                  Chapters: {subject.chapters_count ?? 0}
                </p>

                {subject.teacher && (
                  <p className="mt-1 text-sm text-gray-500">
                    Teacher: {subject.teacher.username}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <span className="text-sm font-medium text-blue-600">
                  View Subject →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;