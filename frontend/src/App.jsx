import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

/*
|--------------------------------------------------------------------------
| Public Pages
|--------------------------------------------------------------------------
*/

import LandingPage from "./pages/public/LandingPage";
import NotFoundPage from "./pages/NotFoundPage";

/*
|--------------------------------------------------------------------------
| Student Authentication
|--------------------------------------------------------------------------
*/

import LoginPage from "./pages/Auth/Student/LoginPage";
import RegisterPage from "./pages/Auth/Student/RegisterPage";

/*
|--------------------------------------------------------------------------
| Teacher Authentication
|--------------------------------------------------------------------------
*/

import TeacherLoginPage from "./pages/Auth/Teacher/LoginPage";
import TeacherRegistrationPage from "./pages/Auth/Teacher/RegisterPage";
import QuizCreatePage from "./pages/Teachers/Quizzes/QuizCreatePage";

/*
|--------------------------------------------------------------------------
| Authentication / Route Protection
|--------------------------------------------------------------------------
*/

import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

/*
|--------------------------------------------------------------------------
| Student Pages
|--------------------------------------------------------------------------
*/

import DashboardPage from "./pages/Students/DashboardPage";
import StudentFlashcardsPage from "./pages/Students/StudentFlashcardsPage";
import StudentQuizPage from "./pages/Students/StudentQuizPage";

/*
|--------------------------------------------------------------------------
| Teacher Pages - Dashboard
|--------------------------------------------------------------------------
*/

import TeacherDashboardPage from "./pages/Teachers/DashboardPage";

/*
|--------------------------------------------------------------------------
| Teacher Pages - Courses
|--------------------------------------------------------------------------
*/

import CoursesList from "./pages/Teachers/Courses/CourseList";
import CreateCoursePage from "./pages/Teachers/Courses/CreateCoursePage";
import CourseDetailPage from "./pages/Teachers/Courses/CourseDetailPage";

/*
|--------------------------------------------------------------------------
| Teacher Pages - Lessons
|--------------------------------------------------------------------------
*/

import LessonCreatePage from "./pages/Teachers/Lessons/LessonCreatePage";
import LessonDetailPage from "./pages/Teachers/Lessons/LessonDetailPage";

/*
|--------------------------------------------------------------------------
| Existing / Legacy Pages
|--------------------------------------------------------------------------
*/

import DocumentListPage from "./pages/Documents/DocumentListPage";
import DocumentDetailPage from "./pages/Documents/DocumentDetailPage";

import FlashcardsListPage from "./pages/Teachers/Flashcards/FlashcardsListPage";
import FlashcardPage from "./pages/Teachers/Flashcards/FlashcardPage";
import QuizDetailPage from "./pages/Teachers/Quizzes/QuizDetailPage";
import QuizListPage from "./pages/Teachers/Quizzes/QuizListPage";
import QuizTakePage from "./pages/Students/Quizzes/QuizTakePage";
import QuizResultPage from "./pages/Students/Quizzes/QuizResultPage";
import QuizAttemptResultPage from "./pages/Students/Quizzes/QuizAttemptResultPage";

import ProfilePage from "./pages/Profile/ProfilePage";
import LessonContentCreate from "./pages/Teachers/LessonContents/LessonContentCreate";

const App = () => {
  const { loading } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | Authentication Loading State
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>

        {/*
        |--------------------------------------------------------------------------
        | Public
        |--------------------------------------------------------------------------
        */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        {/*
        |--------------------------------------------------------------------------
        | Student Authentication
        |--------------------------------------------------------------------------
        */}

        <Route
          path="/student/login"
          element={<LoginPage />}
        />

        <Route
          path="/student/register"
          element={<RegisterPage />}
        />

        {/*
        |--------------------------------------------------------------------------
        | Teacher Authentication
        |--------------------------------------------------------------------------
        */}

        <Route
          path="/teacher/login"
          element={<TeacherLoginPage />}
        />

        <Route
          path="/teacher/register"
          element={<TeacherRegistrationPage />}
        />

        {/*
        |--------------------------------------------------------------------------
        | Protected Routes
        |--------------------------------------------------------------------------
        */}

        <Route element={<ProtectedRoute />}>

          {/*
          |--------------------------------------------------------------------------
          | Student
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/practice/flashcards"
            element={<StudentFlashcardsPage />}
          />

          <Route
            path="/practice/quizzes"
            element={<StudentQuizPage />}
          />

          {/*
          |--------------------------------------------------------------------------
          | Teacher Dashboard
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/teacher/dashboard"
            element={<TeacherDashboardPage />}
          />

          {/*
          |--------------------------------------------------------------------------
          | Teacher Courses
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/teacher/courses"
            element={<CoursesList />}
          />

          <Route
            path="/teacher/courses/create"
            element={<CreateCoursePage />}
          />

          <Route
            path="/teacher/courses/:courseId"
            element={<CourseDetailPage />}
          />

            
          {/*
          |--------------------------------------------------------------------------
          | Teacher Lessons
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/teacher/courses/:courseId/lessons/create"
            element={<LessonCreatePage />}
          />

          <Route
            path="/teacher/lessons/:lessonId"
            element={<LessonDetailPage />}
          />

            <Route
              path="/teacher/lessons/:lessonId/contents/create"
              element={<LessonContentCreate />}
            />

            <Route
              path="/teacher/lessons/:lessonId/quizzes/create"
              element={<QuizCreatePage />}
            />

            <Route
              path="/teacher/lessons/:lessonId/quizzes"
              element={<QuizListPage />}
            />

            <Route
              path="/teacher/quizzes/:quizId"
              element={<QuizDetailPage />}
            />
          {/*
          |--------------------------------------------------------------------------
          | Documents
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/documents"
            element={<DocumentListPage />}
          />

          <Route
            path="/documents/:id"
            element={<DocumentDetailPage />}
          />

          {/*
          |--------------------------------------------------------------------------
          | Flashcards
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/flashcards"
            element={<FlashcardsListPage />}
          />

          <Route
            path="/documents/:id/flashcards"
            element={<FlashcardPage />}
          />

          {/*
          |--------------------------------------------------------------------------
          | Quizzes
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/quizzes/:quizId"
            element={<QuizTakePage />}
          />

          <Route
            path="/quizzes/:quizId/results"
            element={<QuizResultPage />}
          />

          <Route
            path="/quizzes/:quizId/attempts/:attemptId"
            element={<QuizAttemptResultPage />}
          />

          {/*
          |--------------------------------------------------------------------------
          | Profile
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

        </Route>

        {/*
        |--------------------------------------------------------------------------
        | 404
        |--------------------------------------------------------------------------
        */}

        <Route
          path="*"
          element={<NotFoundPage />}
        />

      </Routes>
    </Router>
  );
};

export default App;