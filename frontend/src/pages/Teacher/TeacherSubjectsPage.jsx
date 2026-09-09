import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const TeacherSubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "draft",
  });

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
          "Failed to load subjects."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateSubject = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      await axiosInstance.post("/api/subjects", formData);

      setFormData({
        title: "",
        description: "",
        status: "draft",
      });

      setShowCreateForm(false);

      setSuccess("Subject created successfully.");

      await fetchSubjects();
    } catch (err) {
      console.error("Failed to create subject:", err);

      if (err.response?.data?.errors) {
        const validationErrors = Object.values(
          err.response.data.errors
        )
          .flat()
          .join(" ");

        setError(validationErrors);
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to create subject."
        );
      }
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (subject) => {
    try {
      setError("");
      setSuccess("");

      const newStatus =
        subject.status === "published"
          ? "draft"
          : "published";

      await axiosInstance.put(
        `/api/subjects/${subject.id}`,
        {
          title: subject.title,
          description: subject.description || "",
          status: newStatus,
        }
      );

      setSuccess(
        newStatus === "published"
          ? "Subject published successfully."
          : "Subject moved back to draft."
      );

      await fetchSubjects();
    } catch (err) {
      console.error("Failed to update subject:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update subject."
      );
    }
  };

  const handleDeleteSubject = async (subject) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${subject.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await axiosInstance.delete(
        `/api/subjects/${subject.id}`
      );

      setSuccess("Subject deleted successfully.");

      await fetchSubjects();
    } catch (err) {
      console.error("Failed to delete subject:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete subject."
      );
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Subjects
            </h1>

            <p className="mt-2 text-gray-600">
              Create and manage your learning subjects.
            </p>
          </div>

          <button
            onClick={() =>
              setShowCreateForm((current) => !current)
            }
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            {showCreateForm
              ? "Cancel"
              : "+ Create Subject"}
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        {/* Create Subject Form */}
        {showCreateForm && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-semibold text-gray-900">
              Create New Subject
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create the subject as a draft or publish it immediately.
            </p>

            <form
              onSubmit={handleCreateSubject}
              className="mt-6 space-y-5"
            >

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Subject Title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. PHP Development"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what students will learn..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="published">
                    Published
                  </option>
                </select>

                <p className="mt-2 text-sm text-gray-500">
                  Draft subjects are only visible to you.
                  Published subjects are visible to students.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating
                    ? "Creating..."
                    : "Create Subject"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateForm(false)
                  }
                  className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>
        )}

        {/* Subjects */}
        {loading ? (
          <p className="text-gray-600">
            Loading subjects...
          </p>
        ) : subjects.length === 0 ? (

          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">

            <h2 className="text-xl font-semibold text-gray-800">
              You haven't created any subjects yet
            </h2>

            <p className="mt-2 text-gray-500">
              Create your first subject to begin building your course.
            </p>

          </div>

        ) : (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {subjects.map((subject) => (

              <div
                key={subject.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >

                {/* Status */}
                <div className="mb-4 flex items-center justify-between">

                  <span
                    className={
                      subject.status === "published"
                        ? "rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                        : "rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700"
                    }
                  >
                    {subject.status === "published"
                      ? "Published"
                      : "Draft"}
                  </span>

                  <span className="text-sm text-gray-500">
                    {subject.chapters_count ?? 0} chapters
                  </span>

                </div>

                {/* Subject */}
                <h2 className="text-xl font-semibold text-gray-900">
                  {subject.title}
                </h2>

                <p className="mt-3 min-h-12 text-sm leading-6 text-gray-600">
                  {subject.description ||
                    "No description available."}
                </p>

                {/* Visibility */}
                <div className="mt-5 rounded-lg bg-gray-50 p-3">

                  <p className="text-sm text-gray-600">
                    {subject.status === "published"
                      ? "✓ Visible to students"
                      : "Only visible to you"}
                  </p>

                </div>

                {/* Actions */}
                <div className="mt-5 border-t border-gray-100 pt-4">

                  <Link
                    to={`/teacher/subjects/${subject.id}`}
                    className="block w-full rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Manage Subject
                  </Link>

                  <div className="mt-3 grid grid-cols-2 gap-3">

                    <button
                      onClick={() =>
                        handleStatusChange(subject)
                      }
                      className={
                        subject.status === "published"
                          ? "rounded-lg border border-yellow-300 px-3 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50"
                          : "rounded-lg border border-green-300 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                      }
                    >
                      {subject.status === "published"
                        ? "Unpublish"
                        : "Publish"}
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteSubject(subject)
                      }
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
    </div>
  );
};

export default TeacherSubjectsPage;