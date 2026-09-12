import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Save,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

import TeacherLayout from "../../../components/teachers/TeacherLayout";
import axiosInstance from "../../../utils/axiosInstance";

const CreateCoursePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a course title.");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post(
        "/api/teacher/courses",
        {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
        }
      );

      const course = response.data?.data;

      toast.success("Course created as draft.");

      if (course?.id) {
        navigate("/teacher/courses");
        return;
      }

      navigate("/teacher/courses");
    } catch (error) {
      console.error("Create course error:", error);

      const validationErrors =
        error.response?.data?.errors;

      if (validationErrors) {
        const firstError =
          Object.values(validationErrors)?.[0]?.[0];

        toast.error(
          firstError || "Unable to create course."
        );

        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Unable to create course."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="mx-auto max-w-4xl">

        {/* Back link */}

        <button
          type="button"
          onClick={() => navigate("/teacher/courses")}
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-slate-500
            transition
            hover:text-indigo-600
          "
        >
          <ArrowLeft size={18} />
          Back to Courses
        </button>

        {/* Page heading */}

        <div className="mb-8">
          <div
            className="
              mb-3
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-indigo-50
              px-3
              py-1.5
              text-sm
              font-semibold
              text-indigo-700
            "
          >
            <Sparkles size={15} />
            New Course
          </div>

          <h1
            className="
              text-3xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            Create Course
          </h1>

          <p
            className="
              mt-2
              max-w-2xl
              text-slate-500
            "
          >
            Start with the basic course information.
            Your new course will be saved as a draft
            until you choose to publish it.
          </p>
        </div>

        {/* Main form */}

        <form
          onSubmit={handleSubmit}
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >

          {/* Form header */}

          <div
            className="
              border-b
              border-slate-200
              bg-slate-50
              px-7
              py-5
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-indigo-100
                  text-indigo-600
                "
              >
                <BookOpen size={20} />
              </div>

              <div>
                <h2
                  className="
                    font-bold
                    text-slate-900
                  "
                >
                  Course Details
                </h2>

                <p
                  className="
                    mt-0.5
                    text-sm
                    text-slate-500
                  "
                >
                  Add a title and description for your course.
                </p>
              </div>
            </div>
          </div>

          {/* Form fields */}

          <div className="space-y-7 p-7">

            {/* Title */}

            <div>
              <label
                htmlFor="title"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Course title
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Introduction to React"
                maxLength={255}
                disabled={loading}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-4
                  py-3.5
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-indigo-500
                  focus:ring-4
                  focus:ring-indigo-100
                  disabled:cursor-not-allowed
                  disabled:bg-slate-50
                "
              />

              <div
                className="
                  mt-2
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <p className="text-xs text-slate-500">
                  Choose a clear title that describes what students will learn.
                </p>

                <span className="text-xs text-slate-400">
                  {formData.title.length}/255
                </span>
              </div>
            </div>

            {/* Description */}

            <div>
              <label
                htmlFor="description"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Course description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what this course covers, who it is for, and what students can expect to learn..."
                rows={7}
                disabled={loading}
                className="
                  w-full
                  resize-y
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-4
                  py-3.5
                  leading-7
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-indigo-500
                  focus:ring-4
                  focus:ring-indigo-100
                  disabled:cursor-not-allowed
                  disabled:bg-slate-50
                "
              />

              <p className="mt-2 text-xs text-slate-500">
                You can update this description later.
              </p>
            </div>

            {/* Draft message */}

            <div
              className="
                rounded-xl
                border
                border-amber-200
                bg-amber-50
                p-4
              "
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                    mt-0.5
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-amber-100
                    text-amber-700
                  "
                >
                  <Save size={16} />
                </div>

                <div>
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-amber-900
                    "
                  >
                    This course will be saved as a draft
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      leading-6
                      text-amber-800
                    "
                  >
                    Draft courses are not visible to students.
                    After creating the course, you can add lessons,
                    content, quizzes and flashcards before publishing it.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              border-t
              border-slate-200
              bg-slate-50
              px-7
              py-5
            "
          >
            <button
              type="button"
              onClick={() => navigate("/teacher/courses")}
              disabled={loading}
              className="
                rounded-xl
                border
                border-slate-300
                bg-white
                px-5
                py-3
                text-sm
                font-semibold
                text-slate-700
                transition
                hover:bg-slate-100
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                !formData.title.trim()
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-indigo-600
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-indigo-700
                focus:outline-none
                focus:ring-4
                focus:ring-indigo-200
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Save size={18} />

              {loading
                ? "Creating Course..."
                : "Create Draft Course"}
            </button>
          </div>

        </form>
      </div>
    </TeacherLayout>
  );
};

export default CreateCoursePage;
