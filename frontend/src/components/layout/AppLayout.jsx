import {
  useState,
} from "react";

import {
  Outlet,
  useLocation,
} from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";

const AppLayout = () => {
  const location = useLocation();

  const [
    isSidebarOpen,
    setIsSidebarOpen,
  ] = useState(false);

  const [
    learningIndexOpen,
    setLearningIndexOpen,
  ] = useState(false);

  const isLearningPage =
    location.pathname.includes(
      "/learn/"
    );

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleLearningIndex = () => {
    setLearningIndexOpen(
      (previous) => !previous
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Normal student sidebar is hidden on learning pages */}
      {!isLearningPage && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />
      )}

      {/* Learning pages use full width */}
      <div
        className={
          isLearningPage
            ? "min-h-screen"
            : "min-h-screen lg:pl-64"
        }
      >
        <Header
          onMenuClick={
            isLearningPage
              ? toggleLearningIndex
              : openSidebar
          }
          isLearningPage={
            isLearningPage
          }
        />

        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet
            context={{
              learningIndexOpen,
              setLearningIndexOpen,
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
