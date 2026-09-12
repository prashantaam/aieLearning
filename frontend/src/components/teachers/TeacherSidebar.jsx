import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Layers3,
  LogOut,
  GraduationCap,
  UserCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import axiosInstance from "../../utils/axiosInstance";

const TeacherSidebar = () => {
  const navigate = useNavigate();

  const teacher = JSON.parse(
    localStorage.getItem("teacher") || "{}"
  );

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/api/teacher/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("teacher");

      toast.success("Logged out successfully.");

      navigate("/teacher/login");
    }
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/teacher/dashboard",
    },
    {
      label: "Courses",
      icon: BookOpen,
      path: "/teacher/courses",
    },
    {
      label: "Quizzes",
      icon: Brain,
      path: "/teacher/quizzes",
    },
    {
      label: "Flashcards",
      icon: Layers3,
      path: "/teacher/flashcards",
    },
  ];

  return (
    <aside
      className="
        flex
        h-screen
        w-72
        flex-col
        border-r
        border-indigo-900
        bg-indigo-950
        text-white
      "
    >
      {/* Logo */}

      <div className="border-b border-indigo-900 px-6 py-6">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-violet-500
            "
          >
            <GraduationCap size={24} />
          </div>

          <div>
            <h1 className="font-bold">
              AI Learning
            </h1>

            <p
              className="
                text-xs
                font-medium
                uppercase
                tracking-wider
                text-violet-300
              "
            >
              Teacher Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}

      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-medium
                  transition
                  ${
                    isActive
                      ? "bg-violet-500 text-white"
                      : "text-indigo-200 hover:bg-white/10 hover:text-white"
                  }
                  `
                }
              >
                <Icon size={19} />

                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Teacher profile + Logout */}

      <div className="border-t border-indigo-900 p-4">

        {/* Profile */}

        <div
          className="
            mb-3
            flex
            items-center
            gap-3
            rounded-xl
            bg-white/5
            p-3
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-violet-500/20
              text-violet-300
            "
          >
            <UserCircle size={24} />
          </div>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-sm
                font-semibold
                text-white
              "
            >
              {teacher.username || "Teacher"}
            </p>

            <p
              className="
                truncate
                text-xs
                text-indigo-300
              "
            >
              {teacher.email || ""}
            </p>
          </div>
        </div>

        {/* Logout */}

        <button
          onClick={handleLogout}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-sm
            font-medium
            text-indigo-200
            transition
            hover:bg-red-500/10
            hover:text-red-300
          "
        >
          <LogOut size={19} />

          Logout
        </button>

      </div>
    </aside>
  );
};

export default TeacherSidebar;