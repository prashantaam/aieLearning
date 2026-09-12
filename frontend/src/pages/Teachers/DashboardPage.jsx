import React from "react";
import {
  BookOpen,
  FileText,
  Brain,
  Layers3,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";

import TeacherLayout from "../../components/teachers/TeacherLayout";

const DashboardPage = () => {
  const teacher = JSON.parse(
    localStorage.getItem("teacher") || "{}"
  );

  const stats = [
    {
      title: "Courses",
      value: "0",
      description: "Total courses",
      icon: BookOpen,
    },
    {
      title: "Lessons",
      value: "0",
      description: "Total lessons",
      icon: FileText,
    },
    {
      title: "Quizzes",
      value: "0",
      description: "Generated quizzes",
      icon: Brain,
    },
    {
      title: "Flashcards",
      value: "0",
      description: "Generated flashcards",
      icon: Layers3,
    },
  ];

  return (
    <TeacherLayout>

      {/* Header */}

      <div
        className="
          mb-8
          flex
          items-start
          justify-between
          gap-6
        "
      >
        <div>
          <p
            className="
              mb-2
              text-sm
              font-semibold
              uppercase
              tracking-wider
              text-indigo-600
            "
          >
            Teacher Dashboard
          </p>

          <h1
            className="
              text-3xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            Welcome, {teacher.username || "Teacher"}
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your courses, lessons and AI-generated
            learning content.
          </p>
        </div>

        <Link
          to="/teacher/courses/create"
          className="
            flex
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
          "
        >
          <Plus size={18} />

          Create Course
        </Link>
      </div>

      {/* Statistics */}

      <div
        className="
          grid
          grid-cols-1
          gap-5
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
              "
            >
              <div
                className="
                  mb-5
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-indigo-50
                  text-indigo-600
                "
              >
                <Icon size={22} />
              </div>

              <p className="text-sm font-medium text-slate-500">
                {stat.title}
              </p>

              <p
                className="
                  mt-1
                  text-3xl
                  font-bold
                  text-slate-900
                "
              >
                {stat.value}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main dashboard working area */}

      <div
        className="
          mt-8
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-3
        "
      >

        {/* Courses */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            xl:col-span-2
          "
        >
          <div
            className="
              mb-6
              flex
              items-center
              justify-between
            "
          >
            <div>
              <h2
                className="
                  text-lg
                  font-bold
                  text-slate-900
                "
              >
                Your Courses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recently created and updated courses.
              </p>
            </div>

            <Link
              to="/teacher/courses"
              className="
                flex
                items-center
                gap-1
                text-sm
                font-semibold
                text-indigo-600
                hover:text-indigo-700
              "
            >
              View all

              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Temporary empty state */}

          <div
            className="
              flex
              min-h-64
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-dashed
              border-slate-300
              bg-slate-50
              px-6
              text-center
            "
          >
            <div
              className="
                mb-4
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-indigo-100
                text-indigo-600
              "
            >
              <BookOpen size={26} />
            </div>

            <h3
              className="
                font-semibold
                text-slate-900
              "
            >
              Start building your first course
            </h3>

            <p
              className="
                mt-2
                max-w-sm
                text-sm
                leading-6
                text-slate-500
              "
            >
              Create a course, add lessons and then use AI
              to generate content, quizzes and flashcards.
            </p>

            <Link
              to="/teacher/courses/create"
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-indigo-600
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                hover:bg-indigo-700
              "
            >
              <Plus size={17} />

              Create Course
            </Link>
          </div>
        </div>

        {/* Quick Actions */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
          "
        >
          <h2
            className="
              text-lg
              font-bold
              text-slate-900
            "
          >
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Common teacher tasks.
          </p>

          <div className="mt-6 space-y-3">

            <Link
              to="/teacher/courses"
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                p-4
                transition
                hover:border-indigo-200
                hover:bg-indigo-50
              "
            >
              <BookOpen
                size={20}
                className="text-indigo-600"
              />

              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Manage Courses
                </p>

                <p className="text-xs text-slate-500">
                  Create and edit courses
                </p>
              </div>
            </Link>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                p-4
              "
            >
              <Brain
                size={20}
                className="text-indigo-600"
              />

              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Generate Quiz
                </p>

                <p className="text-xs text-slate-500">
                  Available from lesson pages
                </p>
              </div>
            </div>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                p-4
              "
            >
              <Layers3
                size={20}
                className="text-indigo-600"
              />

              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Generate Flashcards
                </p>

                <p className="text-xs text-slate-500">
                  Available from lesson pages
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </TeacherLayout>
  );
};

export default DashboardPage;