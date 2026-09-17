import {
  BookOpen,
  ChevronDown,
  Home,
  LogOut,
  Menu,
  User,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function LearningHeader({
  onToggleIndex,
}) {
  const navigate = useNavigate();

  const {
    student,
    logout,
  } = useAuth();

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const dropdownRef =
    useRef(null);

  const studentName =
    student?.username ||
    student?.name ||
    student?.full_name ||
    "Student";

  const firstName =
    studentName
      .trim()
      .split(/\s+/)[0];

  const initial =
    firstName
      .charAt(0)
      .toUpperCase();

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = async () => {
    setProfileOpen(false);

    await logout();

    navigate("/login");
  };

  /*
  |--------------------------------------------------------------------------
  | Close Profile Dropdown
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleClickOutside = (
      event
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-5 lg:px-7">
        {/*
        |--------------------------------------------------------------------------
        | Left Side
        |--------------------------------------------------------------------------
        */}

        <div className="flex items-center">
          {/* Logo */}
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B1F3A] text-[#F4C95D]">
              <BookOpen
                size={19}
              />
            </div>

            <span className="hidden text-base font-bold text-[#0B1F3A] sm:block">
              AI Learning
            </span>
          </button>

          {/*
          |--------------------------------------------------------------------------
          | Course Index Burger
          |--------------------------------------------------------------------------
          */}

          {onToggleIndex && (
            <>
              <div className="mx-5 hidden h-7 w-px bg-slate-200 sm:block" />

              <button
                type="button"
                onClick={onToggleIndex}
                title="Course index"
                aria-label="Open course index"
                className="ml-3 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0B1F3A] sm:ml-0"
              >
                <Menu
                  size={21}
                />
              </button>
            </>
          )}
        </div>

        {/*
        |--------------------------------------------------------------------------
        | Right Navigation
        |--------------------------------------------------------------------------
        */}

        <div className="flex items-center gap-3">
          {/* Home */}
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            title="Dashboard"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0B1F3A] sm:flex"
          >
            <Home size={18} />
          </button>

          {/*
          |--------------------------------------------------------------------------
          | Profile
          |--------------------------------------------------------------------------
          */}

          <div
            ref={dropdownRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (previous) =>
                    !previous
                )
              }
              className="flex items-center gap-2 rounded-full pr-1"
              aria-expanded={
                profileOpen
              }
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B1F3A] text-sm font-bold text-[#F4C95D]">
                {initial}
              </div>

              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${
                  profileOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {/*
            |--------------------------------------------------------------------------
            | Profile Dropdown
            |--------------------------------------------------------------------------
            */}

            {profileOpen && (
              <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-xs text-slate-400">
                    Signed in as
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-[#0B1F3A]">
                    {firstName}
                  </p>
                </div>

                {/* Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(
                      false
                    );

                    navigate(
                      "/profile"
                    );
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-[#0B1F3A]"
                >
                  <User size={17} />

                  Profile
                </button>

                {/* Logout */}
                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <LogOut
                    size={17}
                  />

                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}