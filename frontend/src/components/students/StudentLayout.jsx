import StudentSidebar from "./StudentSidebar";
import StudentTopbar from "./StudentTopbar";

export default function StudentLayout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f8fafc",
      }}
    >
      <StudentSidebar />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: "100vh",
        }}
      >
        <StudentTopbar />

        <main
          style={{
            padding: "32px",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}