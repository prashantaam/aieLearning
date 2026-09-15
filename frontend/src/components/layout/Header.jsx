import {
  Menu,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const {
    student,
    logout,
  } = useAuth();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const profileRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Student Details
  |--------------------------------------------------------------------------
  */

  const studentName =
    student?.username ||
    student?.name ||
    student?.full_name ||
    "Student";

  const firstName =
    studentName.trim().split(/\s+/)[0];

  const firstInitial =
    firstName.charAt(0).toUpperCase();

  /*
  |--------------------------------------------------------------------------
  | Close Dropdown When Clicking Outside
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
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
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">

      {/* Mobile Menu */}
      <div>
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-[#0B1F3A] transition hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={23} />
        </button>
      </div>

      {/* Profile Area */}
      <div
        ref={profileRef}
        className="relative"
      >

        {/* Profile Button */}
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

          {/* Student Initial */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#F4C95D] bg-[#0B1F3A] text-sm font-bold text-[#F4C95D] shadow-sm">
            {firstInitial}
          </div>

          {/* Arrow */}
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

        {/* Profile Dropdown */}
        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

            {/* Student Name */}
            <div className="border-b border-slate-100 px-4 py-3">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Signed in as
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-[#0B1F3A]">
                {firstName}
              </p>

            </div>

            {/* Profile */}
            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                navigate("/profile");
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#0B1F3A] transition hover:bg-slate-50"
            >
              <User size={17} />

              <span>
                Profile
              </span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={17} />

              <span>
                Logout
              </span>
            </button>

          </div>
        )}

      </div>

    </header>
  );
};

export default Header;