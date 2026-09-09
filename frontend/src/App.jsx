import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import DashboardPage from "./pages/Dashboard/DashboardPage";

import DocumentListPage from "./pages/Documents/DocumentListPage";
import DocumentDetailPage from "./pages/Documents/DocumentDetailPage";

import FlashcardsListPage from "./pages/Flashcards/FlashcardsListPage";
import FlashcardPage from "./pages/Flashcards/FlashcardPage";

import QuizTakePage from "./pages/Quizzes/QuizTakePage";
import QuizResultPage from "./pages/Quizzes/QuizResultPage";
import QuizAttemptResultPage from "./pages/Quizzes/QuizAttemptResultPage";

import ProfilePage from "./pages/Profile/ProfilePage";

import { useAuth } from "./context/AuthContext";
import SubjectsPage from "./pages/Subjects/SubjectsPage";
import SubjectDetailPage from "./pages/Subjects/SubjectDetailPage";
import ChapterDetailPage from "./pages/Chapters/ChapterDetailPage";
import TeacherSubjectsPage from "./pages/Teacher/TeacherSubjectsPage";


const App = () => {

  const {
    isAuthenticated,
    loading,
  } = useAuth();


  if (loading) {

    return (

      <div className="flex items-center justify-center h-screen">

        <p>Loading...</p>

      </div>

    );

  }


  return (

    <Router>

      <Routes>


        {/* ========================= */}
        {/* Public Routes */}
        {/* ========================= */}

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate
                to="/dashboard"
                replace
              />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />


        <Route
          path="/login"
          element={<LoginPage />}
        />


        <Route
          path="/register"
          element={<RegisterPage />}
        />


        {/* ========================= */}
        {/* Protected Routes */}
        {/* ========================= */}

        <Route element={<ProtectedRoute />}>


          {/* Dashboard */}

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />


          {/* Documents */}

          <Route
            path="/documents"
            element={<DocumentListPage />}
          />


          <Route
            path="/documents/:id"
            element={<DocumentDetailPage />}
          />


          {/* Flashcards */}

          <Route
            path="/flashcards"
            element={<FlashcardsListPage />}
          />


          <Route
            path="/documents/:id/flashcards"
            element={<FlashcardPage />}
          />


          {/* ========================= */}
          {/* Quizzes */}
          {/* ========================= */}

          {/* Take Quiz */}

          <Route
            path="/quizzes/:quizId"
            element={<QuizTakePage />}
          />


          {/* Latest Quiz Result */}

          <Route
            path="/quizzes/:quizId/results"
            element={<QuizResultPage />}
          />


          {/* Historical Attempt Result */}

          <Route
            path="/quizzes/:quizId/attempts/:attemptId"
            element={<QuizAttemptResultPage />}
          />


          {/* Profile */}

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          {/* Subjects */}
          <Route
            path="/subjects"
            element={<SubjectsPage />}
          />
          <Route
            path="/subjects/:subjectId"
            element={<SubjectDetailPage />}
          />

          {/* Chapters */}
          <Route
            path="/chapters/:chapterId"
            element={<ChapterDetailPage />}
          />

          {/* teacher subjects */}
          <Route
            path="/teacher/subjects"
            element={<TeacherSubjectsPage />}
          />

          <Route
            path="/teacher/subjects/:subjectId"
            element={<SubjectDetailPage />}
          />

          <Route
            path="/subjects/:subjectId"
            element={<SubjectDetailPage />}
          />
        </Route>

        <Route
          path="/teacher/subjects/:subjectId/chapters/:chapterId"
          element={<ChapterDetailPage />}
        />

        {/* ========================= */}
        {/* 404 */}
        {/* ========================= */}

        <Route
          path="*"
          element={<NotFoundPage />}
        />


      </Routes>

    </Router>

  );

};


export default App;
