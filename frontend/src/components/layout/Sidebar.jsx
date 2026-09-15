import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Layers3,
  X,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

const Sidebar = ({
  isOpen,
  onClose,
}) => {
  const navigation = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Courses",
      path: "/courses",
      icon: BookOpen,
    },
    {
      name: "Flashcards",
      path: "/practice/flashcards",
      icon: Layers3,
    },
    {
      name: "Quizzes",
      path: "/practice/quizzes",
      icon: ClipboardCheck,
    },
  ];

  const getNavClass = ({
    isActive,
  }) => {
    return [
      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition",
      isActive
        ? "bg-[#F4C95D] text-[#0B1F3A]"
        : "text-slate-300 hover:bg-white/10 hover:text-white",
    ].join(" ");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0B1F3A] text-white shadow-xl transition-transform duration-300 lg:translate-x-0 ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">

          <NavLink
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F4C95D] text-[#0B1F3A]">
              <GraduationCap
                size={23}
                strokeWidth={2.3}
              />
            </div>

            <div>
              <p className="font-bold tracking-tight text-white">
                AI Learning
              </p>

              <p className="text-xs text-slate-400">
                Student Portal
              </p>
            </div>

          </NavLink>

          {/* Mobile close */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>

        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">

          <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Learning
          </p>

          <div className="space-y-1">

            {navigation.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={
                      getNavClass
                    }
                  >
                    <Icon
                      size={19}
                      strokeWidth={2}
                    />

                    <span>
                      {item.name}
                    </span>

                  </NavLink>
                );
              }
            )}

          </div>

        </nav>

        {/* Bottom message */}
        <div className="border-t border-white/10 p-4">

          <div className="rounded-lg bg-white/[0.06] p-4">

            <div className="mb-3 h-1 w-10 rounded-full bg-[#F4C95D]" />

            <p className="text-sm font-semibold text-white">
              Keep learning
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Continue your courses and
              build your skills every day.
            </p>

          </div>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;