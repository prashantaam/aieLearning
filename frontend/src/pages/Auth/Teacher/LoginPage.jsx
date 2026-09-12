import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  BookOpen,
  Sparkles,
  BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";

import axiosInstance from "../../../utils/axiosInstance";

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
  | Teacher Login
  |--------------------------------------------------------------------------
  |
  | This will authenticate against the dedicated Teacher model/table.
  |
  | Backend endpoint:
  | POST /api/teacher/login
  |
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post(
        "/api/teacher/login",
        formData
      );

      const { token, teacher } = response.data;

      /*
      |--------------------------------------------------------------------------
      | Store Teacher Authentication
      |--------------------------------------------------------------------------
      |
      | We are keeping teacher authentication clearly identifiable.
      | We can integrate this with a dedicated TeacherAuthContext later.
      |
      */

      localStorage.setItem("token", token);
      localStorage.setItem(
        "teacher",
        JSON.stringify(teacher)
      );

      toast.success("Welcome back!");

      /*
      |--------------------------------------------------------------------------
      | Redirect to Teacher Portal
      |--------------------------------------------------------------------------
      */

      navigate("/teacher/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to sign in. Please check your credentials.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">

      {/*
      |--------------------------------------------------------------------------
      | Left Panel - Teacher Portal Branding
      |--------------------------------------------------------------------------
      */}

      <div className="relative hidden overflow-hidden bg-indigo-950 lg:flex lg:flex-col lg:justify-between">

        {/* Decorative background */}

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-purple-500/20" />

        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-indigo-400/20" />

        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/5" />

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

        {/* Main content */}

        <div className="relative z-10 max-w-xl px-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-200">
            <Sparkles size={16} />
            AI-powered teaching
          </div>

          <h1 className="text-5xl font-bold leading-tight text-white">
            Create better learning experiences.
          </h1>

          <p className="mt-6 text-lg leading-8 text-indigo-200">
            Build structured courses, create engaging lessons and use AI
            to generate learning content, quizzes and flashcards.
          </p>

          {/* Feature cards */}

          <div className="mt-10 grid grid-cols-3 gap-4">

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <BookOpen
                size={22}
                className="mb-3 text-violet-300"
              />

              <p className="text-sm font-semibold text-white">
                Courses
              </p>

              <p className="mt-1 text-xs text-indigo-300">
                Build lessons
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Sparkles
                size={22}
                className="mb-3 text-violet-300"
              />

              <p className="text-sm font-semibold text-white">
                AI Tools
              </p>

              <p className="mt-1 text-xs text-indigo-300">
                Generate content
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <BarChart3
                size={22}
                className="mb-3 text-violet-300"
              />

              <p className="text-sm font-semibold text-white">
                Insights
              </p>

              <p className="mt-1 text-xs text-indigo-300">
                Track learning
              </p>
            </div>

          </div>
        </div>

        <div className="relative z-10 p-12 text-sm text-indigo-300">
          AI Learning Platform · Teacher Workspace
        </div>
      </div>


      {/*
      |--------------------------------------------------------------------------
      | Right Panel - Login Form
      |--------------------------------------------------------------------------
      */}

      <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}

          <div className="mb-10 flex items-center gap-3 lg:hidden">
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
              Welcome back
            </h2>

            <p className="mt-2 text-slate-500">
              Sign in to manage your courses and learning content.
            </p>
          </div>

          {/* Login form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

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
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Login button */}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign in to Teacher Portal"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Registration link */}

          <p className="mt-8 text-center text-sm text-slate-500">
            New teacher?{" "}
            <Link
              to="/teacher/register"
              className="font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Create an account
            </Link>
          </p>

          {/* Student portal */}

          <div className="mt-8 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Are you a student?{" "}
              <Link
                to="/student/login"
                className="font-semibold text-slate-700 transition hover:text-indigo-600"
              >
                Go to Student Login
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;