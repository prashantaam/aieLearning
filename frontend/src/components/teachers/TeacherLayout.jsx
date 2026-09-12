import TeacherSidebar from "./TeacherSidebar";

const TeacherLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <aside
        className="
          teacher-sidebar-scroll
          fixed left-0 top-0 z-40
          h-screen w-64
          overflow-y-auto overflow-x-hidden
          border-r border-gray-200
          bg-white
        "
      >
        <TeacherSidebar />
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default TeacherLayout;