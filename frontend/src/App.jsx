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

import StudentLoginPage from "./pages/Auth/Student/LoginPage";
import StudentRegisterPage from "./pages/Auth/Student/RegisterPage";

import DashboardPage from "./pages/Students/DashboardPage";

import StudentFlashcardsPage from "./pages/Students/StudentFlashcardsPage";
import StudentQuizPage from "./pages/Students/StudentQuizPage";

import QuizTakePage from "./pages/Students/Quizzes/QuizTakePage";
import QuizResultPage from "./pages/Students/Quizzes/QuizResultPage";
import QuizAttemptResultPage from "./pages/Students/Quizzes/QuizAttemptResultPage";
/*
|--------------------------------------------------------------------------
| Teacher Authentication
|--------------------------------------------------------------------------
*/

import TeacherLoginPage from "./pages/Auth/Teacher/LoginPage";
import TeacherRegistrationPage from "./pages/Auth/Teacher/RegisterPage";

/*
|--------------------------------------------------------------------------
| Authentication / Route Protection
|--------------------------------------------------------------------------
*/

import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import { useAuth } from "./context/AuthContext";

/*
|--------------------------------------------------------------------------
| Student Pages
|--------------------------------------------------------------------------
*/

import CourseListPage from "./pages/Students/CourseListPage";
import StudentCourseDetailPage from "./pages/Students/CourseDetailPage";
import CourseLearningPage from "./pages/Students/CourseLearningPage";

/*
|--------------------------------------------------------------------------
| Teacher Dashboard
|--------------------------------------------------------------------------
*/

import TeacherDashboardPage from "./pages/Teachers/DashboardPage";

/*
|--------------------------------------------------------------------------
| Teacher Courses
|--------------------------------------------------------------------------
*/

import CoursesList from "./pages/Teachers/Courses/CourseList";
import CreateCoursePage from "./pages/Teachers/Courses/CreateCoursePage";
import CourseDetailPage from "./pages/Teachers/Courses/CourseDetailPage";

/*
|--------------------------------------------------------------------------
| Teacher Lessons
|--------------------------------------------------------------------------
*/

import LessonCreatePage from "./pages/Teachers/Lessons/LessonCreatePage";
import LessonDetailPage from "./pages/Teachers/Lessons/LessonDetailPage";
import LessonContentCreate from "./pages/Teachers/LessonContents/LessonContentCreate";

/*
|--------------------------------------------------------------------------
| Teacher Sublessons
|--------------------------------------------------------------------------
*/

import SublessonListPage from "./pages/Teachers/Sublessons/SublessonListPage";
import CreateSublessonPage from "./pages/Teachers/Sublessons/CreateSublessonPage";
import SublessonDetailPage from "./pages/Teachers/Sublessons/SublessonDetailPage";

/*
|--------------------------------------------------------------------------
| Teacher Sublesson Contents
|--------------------------------------------------------------------------
*/

import SublessonContentListPage from "./pages/Teachers/SublessonContents/SublessonContentListPage";
import CreateSublessonContentPage from "./pages/Teachers/SublessonContents/CreateSublessonContentPage";

/*
|--------------------------------------------------------------------------
| Teacher Quizzes
|--------------------------------------------------------------------------
*/

import QuizListPage from "./pages/Teachers/Quizzes/QuizListPage";
import QuizCreatePage from "./pages/Teachers/Quizzes/QuizCreatePage";
import QuizDetailPage from "./pages/Teachers/Quizzes/QuizDetailPage";

/*
|--------------------------------------------------------------------------
| Teacher Flashcards
|--------------------------------------------------------------------------
*/

import FlashcardListPage from "./pages/Teachers/Flashcards/FlashcardListPage";
import FlashcardCreatePage from "./pages/Teachers/Flashcards/FlashcardCreatePage";
import FlashcardDetailPage from "./pages/Teachers/Flashcards/FlashcardDetailPage";
import FlashcardPage from "./pages/Teachers/Flashcards/FlashcardPage";

/*
|--------------------------------------------------------------------------
| Documents
|--------------------------------------------------------------------------
*/

import DocumentListPage from "./pages/Documents/DocumentListPage";
import DocumentDetailPage from "./pages/Documents/DocumentDetailPage";

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

import ProfilePage from "./pages/Profile/ProfilePage";

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
          path="/login"
          element={<StudentLoginPage />}
        />

        <Route
          path="/register"
          element={<StudentRegisterPage />}
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
          | Student Application
          |--------------------------------------------------------------------------
          |
          | These pages use the shared student AppLayout:
          |
          | AppLayout
          | ├── Sidebar
          | ├── Header
          | └── Outlet
          |
          */}

          <Route element={<AppLayout />}>

            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/courses"
              element={<CourseListPage />}
            />

            <Route
              path="/courses/:slug"
              element={<StudentCourseDetailPage />}
            />

            <Route
              path="/practice/flashcards"
              element={<StudentFlashcardsPage />}
            />

            <Route
              path="/practice/quizzes"
              element={<StudentQuizPage />}
            />
           
          </Route>

          <Route
            path="/courses/:slug/learn/:sublessonId"
            element={<CourseLearningPage />}
          />
          
          <Route
            path="/courses/:slug/learn/:sublessonId/quiz"
            element={<CourseLearningPage />}
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

          {/*
          |--------------------------------------------------------------------------
          | Teacher Sublessons
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/teacher/lessons/:lessonId/sublessons"
            element={<SublessonListPage />}
          />

          <Route
            path="/teacher/lessons/:lessonId/sublessons/create"
            element={<CreateSublessonPage />}
          />

          <Route
            path="/teacher/lessons/:lessonId/sublessons/:sublessonId"
            element={<SublessonDetailPage />}
          />

          {/*
          |--------------------------------------------------------------------------
          | Teacher Sublesson Content
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/teacher/lessons/:lessonId/sublessons/:sublessonId/contents"
            element={<SublessonContentListPage />}
          />

          <Route
            path="/teacher/lessons/:lessonId/sublessons/:sublessonId/contents/create"
            element={<CreateSublessonContentPage />}
          />

          <Route
            path="/teacher/lessons/:lessonId/sublessons/:sublessonId/contents/:contentId/edit"
            element={<CreateSublessonContentPage />}
          />

          {/*
          |--------------------------------------------------------------------------
          | Legacy Lesson Content
          |--------------------------------------------------------------------------
          |
          | Keep temporarily while the old LessonContent functionality still exists.
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/teacher/lessons/:lessonId/contents/create"
            element={<LessonContentCreate />}
          />

          {/*
          |--------------------------------------------------------------------------
          | Teacher Sublesson Quizzes
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/teacher/lessons/:lessonId/sublessons/:sublessonId/quizzes"
            element={<QuizListPage />}
          />

          <Route
            path="/teacher/lessons/:lessonId/sublessons/:sublessonId/quizzes/create"
            element={<QuizCreatePage />}
          />

          <Route
            path="/teacher/lessons/:lessonId/sublessons/:sublessonId/quizzes/:quizId"
            element={<QuizDetailPage />}
          />

          {/*
          |--------------------------------------------------------------------------
          | Teacher Sublesson Flashcards
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/teacher/lessons/:lessonId/sublessons/:sublessonId/flashcards"
            element={<FlashcardListPage />}
          />

          <Route
            path="/teacher/lessons/:lessonId/sublessons/:sublessonId/flashcards/create"
            element={<FlashcardCreatePage />}
          />

          <Route
            path="/teacher/lessons/:lessonId/sublessons/:sublessonId/flashcards/:flashcardId"
            element={<FlashcardDetailPage />}
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
          | Legacy Document Flashcards
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/documents/:id/flashcards"
            element={<FlashcardPage />}
          />

          {/*
          |--------------------------------------------------------------------------
          | Student Quizzes
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