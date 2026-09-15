import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import toast from "react-hot-toast";

import axiosInstance from "../../../utils/axiosInstance";
import AuthSplitLayout from "../../../components/auth/AuthSplitLayout";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Password confirmation does not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await axiosInstance.post("/api/student/register", {
        username: username.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });

      toast.success("Registration successful! Please log in.");

      navigate("/login");
    } catch (err) {
      console.error("Student registration failed:", err);
      console.error("Laravel response:", err.response?.data);

      const validationErrors = err.response?.data?.errors;

      let message =
        err.response?.data?.message ||
        "Failed to register. Please try again.";

      if (validationErrors) {
        const firstError = Object.values(validationErrors)?.[0];

        if (Array.isArray(firstError) && firstError.length > 0) {
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
      eyebrow="Start your journey"
      quote="The beautiful thing about learning is that nobody can take it away from you."
      quoteAuthor="B. B. King"
    >
      <div>
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#997500]">
            Student registration
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0B1F3A]">
            Create your account
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Join the platform and start learning through structured courses and
            intelligent practice.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Username
            </label>

            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                autoComplete="username"
                required
                className="h-12 w-full rounded-md border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0B1F3A] focus:ring-4 focus:ring-[#0B1F3A]/5"
              />
            </div>
          </div>

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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="h-12 w-full rounded-md border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0B1F3A] focus:ring-4 focus:ring-[#0B1F3A]/5"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Password
            </label>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                required
                className="h-12 w-full rounded-md border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0B1F3A] focus:ring-4 focus:ring-[#0B1F3A]/5"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password_confirmation"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Confirm password
            </label>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                id="password_confirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Enter password again"
                autoComplete="new-password"
                required
                className="h-12 w-full rounded-md border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0B1F3A] focus:ring-4 focus:ring-[#0B1F3A]/5"
              />
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Use at least 6 characters.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
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
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#0B1F3A] underline decoration-[#F4C95D] decoration-2 underline-offset-4"
            >
              Sign in
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

export default RegisterPage;
