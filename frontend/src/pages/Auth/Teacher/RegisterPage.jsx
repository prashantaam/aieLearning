import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Layers3,
} from "lucide-react";
import toast from "react-hot-toast";

import axiosInstance from "../../../utils/axiosInstance";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Handle Form Input
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Teacher Registration
  |--------------------------------------------------------------------------
  |
  | Backend endpoint:
  | POST /api/teacher/register
  |
  | This endpoint will create a record in the dedicated teachers table.
  |
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.password_confirmation
    ) {
      toast.error("Please complete all fields.");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      await axiosInstance.post(
        "/api/teacher/register",
        formData
      );

      toast.success(
        "Teacher account created successfully."
      );

      navigate("/teacher/login");
    } catch (error) {
      const errors = error.response?.data?.errors;

      if (errors) {
        const firstError = Object.values(errors)?.[0]?.[0];

        toast.error(
          firstError || "Unable to create teacher account."
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "Unable to create teacher account."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">

      {/*
      |--------------------------------------------------------------------------
      | Left Panel
      |--------------------------------------------------------------------------
      */}

      <div className="relative hidden overflow-hidden bg-indigo-950 lg:flex lg:flex-col lg:justify-between">

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-purple-500/20" />

        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-indigo-400/20" />

        {/* Logo */}

        <div className="relative z-10 p-12">
          <Link
            to="/"
            className="inline-flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-lg shadow-violet-900/30">
              <GraduationCap size={27} />
            </div>

            <div>
              <p className="text-xl font-bold text-white">
                AI Learning
              </p>

              <p className="text-xs font-medium uppercase tracking-widest text-violet-300">
                Teacher Portal
              </p>
            </div>
          </Link>
        </div>

        {/* Content */}

        <div className="relative z-10 max-w-xl px-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-200">
            <Sparkles size={16} />
            Start teaching
          </div>

          <h1 className="text-5xl font-bold leading-tight text-white">
            Turn your knowledge into interactive courses.
          </h1>

          <p className="mt-6 text-lg leading-8 text-indigo-200">
            Create your Teacher Portal account and start designing
            courses, lessons, quizzes and flashcards with AI assistance.
          </p>

          <div className="mt-10 space-y-4">

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                <BookOpen size={20} />
              </div>

              <div>
                <p className="font-semibold text-white">
                  Build structured courses
                </p>

                <p className="text-sm text-indigo-300">
                  Organise your learning material into courses and lessons.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                <Sparkles size={20} />
              </div>

              <div>
                <p className="font-semibold text-white">
                  Generate content with AI
                </p>

                <p className="text-sm text-indigo-300">
                  Produce lesson material, quizzes and flashcards faster.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                <Layers3 size={20} />
              </div>

              <div>
                <p className="font-semibold text-white">
                  Manage everything in one place
                </p>

                <p className="text-sm text-indigo-300">
                  One dedicated workspace for your teaching content.
                </p>
              </div>
            </div>

          </div>
        </div>

        <div className="relative z-10 p-12 text-sm text-indigo-300">
          AI Learning Platform · Teacher Registration
        </div>
      </div>


      {/*
      |--------------------------------------------------------------------------
      | Registration Form
      |--------------------------------------------------------------------------
      */}

      <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}

          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <GraduationCap size={24} />
            </div>

            <div>
              <p className="font-bold text-slate-900">
                AI Learning
              </p>

              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Teacher Portal
              </p>
            </div>
          </div>

          {/* Heading */}

          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Teacher Portal
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Create your account
            </h2>

            <p className="mt-2 text-slate-500">
              Start creating courses and learning experiences.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Full name */}

            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Full name
              </label>

              <div className="relative">
                <User
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Email */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="teacher@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Password */}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Password confirmation */}

            <div>
              <label
                htmlFor="password_confirmation"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password_confirmation"
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="Enter your password again"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Register */}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating account..."
                : "Create Teacher Account"}

              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          {/* Login */}

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have a teacher account?{" "}
            <Link
              to="/teacher/login"
              className="font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Sign in
            </Link>
          </p>

          {/* Student registration */}

          <div className="mt-8 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Are you a student?{" "}
              <Link
                to="/student/register"
                className="font-semibold text-slate-700 transition hover:text-indigo-600"
              >
                Student Registration
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;