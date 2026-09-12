import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Layers3,
  ClipboardCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navigation = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Courses", to: "/courses", icon: BookOpen },
  { label: "Flashcards", to: "/practice/flashcards", icon: Layers3 },
  { label: "Quizzes", to: "/practice/quizzes", icon: ClipboardCheck },
];

export default function StudentSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    if (typeof logout === "function") {
      logout();
    }

    navigate("/login");
  };

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 flex-col bg-[#0B1F3A] text-white lg:flex">
      <div className="flex h-20 items-center border-b border-white/10 px-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200">
            AI Learning
          </p>
          <p className="mt-1 text-lg font-bold">Student Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 py-5">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-[#F4C95D] text-[#0B1F3A]"
                    : "text-slate-200 hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
            >
              <Icon className="h-5 w-5" strokeWidth={1.9} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.9} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
