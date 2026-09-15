import {
  useState,
} from "react";

import {
  Outlet,
} from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";

const AppLayout = () => {
  const [
    isSidebarOpen,
    setIsSidebarOpen,
  ] = useState(false);

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Student Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Application Area */}
      <div className="min-h-screen lg:pl-64">

        {/* Student Header */}
        <Header
          onMenuClick={openSidebar}
        />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AppLayout;