import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ArrowRight, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";


import axiosInstance from "../../../utils/axiosInstance";
import AuthSplitLayout from "../../../components/auth/AuthSplitLayout";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { loginStudent } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post(
        "/api/student/login",
        {
          email: email.trim(),
          password,
        }
      );

      const token =
        response.data?.data?.token;

      const student =
        response.data?.data?.student;

      if (!token || !student) {
        throw new Error(
          "Invalid response received from the server."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Store Student authentication
      |--------------------------------------------------------------------------
      */
      loginStudent(student, token);
      
      /*
      |--------------------------------------------------------------------------
      | Remove old authentication values if they exist
      |--------------------------------------------------------------------------
      */

      toast.success(
        "Logged in successfully!"
      );

      /*
      |--------------------------------------------------------------------------
      | Student dashboard
      |--------------------------------------------------------------------------
      */

      navigate("/dashboard");
    } catch (err) {
      console.error(
        "Student login failed:",
        err
      );

      console.error(
        "Laravel response:",
        err.response?.data
      );

      const validationErrors =
        err.response?.data?.errors;

      let message =
        err.response?.data?.message ||
        err.message ||
        "Failed to login. Please check your credentials.";

      if (validationErrors) {
        const firstError =
          Object.values(
            validationErrors
          )?.[0];

        if (
          Array.isArray(firstError) &&
          firstError.length > 0
        ) {
          message = firstError[0];
        }
      }

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      eyebrow="Welcome back"
      quote="Success is the sum of small efforts, repeated day in and day out."
      quoteAuthor="Robert Collier"
    >
      <div>
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#997500]">
            Student access
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0B1F3A]">
            Sign in to your account
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Continue your courses, practice and learning progress.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email address
            </label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="h-12 w-full rounded-md border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0B1F3A] focus:ring-4 focus:ring-[#0B1F3A]/5"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700"
              >
                Password
              </label>
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="h-12 w-full rounded-md border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0B1F3A] focus:ring-4 focus:ring-[#0B1F3A]/5"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#0B1F3A] px-5 text-sm font-semibold text-white transition hover:bg-[#102b4f] focus:outline-none focus:ring-4 focus:ring-[#0B1F3A]/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#0B1F3A] underline decoration-[#F4C95D] decoration-2 underline-offset-4"
            >
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-xs leading-5 text-slate-400">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </AuthSplitLayout>
  );
};

export default LoginPage;
