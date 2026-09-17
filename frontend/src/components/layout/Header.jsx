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

const Header = ({
  onMenuClick,
  isLearningPage = false,
}) => {
  const navigate = useNavigate();

  const {
    student,
    logout,
  } = useAuth();

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const profileRef = useRef(null);

  const studentName =
    student?.username ||
    student?.name ||
    student?.full_name ||
    "Student";

  const firstName =
    studentName
      .trim()
      .split(/\s+/)[0];

  const firstInitial =
    firstName
      .charAt(0)
      .toUpperCase();

  useEffect(() => {
    const handleClickOutside = (
      event
    ) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
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

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      {/* Left Side */}
      <div className="flex items-center">
        {isLearningPage ? (
          <>
            {/* Logo shown in learning mode because the global sidebar is hidden */}
            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
              className="flex items-center gap-3"
              aria-label="Go to dashboard"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B1F3A] text-[#F4C95D]">
                <BookOpen size={19} />
              </div>

              <span className="hidden text-base font-bold text-[#0B1F3A] sm:block">
                AI Learning
              </span>
            </button>

            <div className="mx-4 h-7 w-px bg-slate-200 sm:mx-5" />

            {/* Course Index burger - visible on desktop and mobile */}
            <button
              type="button"
              onClick={onMenuClick}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#0B1F3A] transition hover:bg-slate-100"
              aria-label="Open course index"
              title="Course index"
            >
              <Menu size={22} />
            </button>
          </>
        ) : (
          /* Normal application sidebar burger remains mobile-only */
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-[#0B1F3A] transition hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={23} />
          </button>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {isLearningPage && (
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
        )}

        <div
          ref={profileRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() =>
              setProfileOpen(
                (current) => !current
              )
            }
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#F4C95D] bg-[#0B1F3A] text-sm font-bold text-[#F4C95D] shadow-sm">
              {firstInitial}
            </div>

            <ChevronDown
              size={18}
              strokeWidth={2.5}
              className={`text-[#0B1F3A] transition-transform duration-200 ${
                profileOpen
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Signed in as
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-[#0B1F3A]">
                  {firstName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/profile");
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#0B1F3A] transition hover:bg-slate-50"
              >
                <User size={17} />
                <span>Profile</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={17} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
