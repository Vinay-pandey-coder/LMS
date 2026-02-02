
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import RoleLayout from '../layouts/RoleLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import CourseDetail from '../pages/CourseDetail';
import Quiz from '../pages/Quiz';
import Assignment from '../pages/Assignment';
import GradeSubmission from '../pages/GradeSubmission';
import AssignmentResult from '../pages/AssignmentResult';
import ProgressDashboard from '../pages/ProgressDashboard';
import StudentDashboard from '../pages/StudentDashboard';
import TeacherDashboard from '../pages/TeacherDashboard';
import TeacherCourses from '../pages/TeacherCourses';
import TeacherStudents from '../pages/TeacherStudents';
import TeacherSubmissions from '../pages/TeacherSubmissions';
import CreateCourse from '../pages/CreateCourse';
import AddLecture from '../pages/AddLecture';
import CreateQuiz from '../pages/CreateQuiz';
import AddQuestion from '../pages/AddQuestion';
import QuizResults from '../pages/QuizResults';
import TeacherQuizzes from '../pages/TeacherQuizzes';
import AssignmentSubmissions from '../pages/AssignmentSubmissions';
import TeacherAssignments from '../pages/TeacherAssignments';
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';
import AdminTeachers from '../pages/AdminTeachers';
import AdminCourses from '../pages/AdminCourses';
import AllCourses from '../pages/AllCourses';

// Define all routes using createBrowserRouter
const router = createBrowserRouter([
  // PUBLIC ROUTE - Login page (Google OAuth only)
  {
    path: '/',
    element: <Login/>,
  },

  // PUBLIC ROUTE - Register page (Google OAuth only)
  {
    path: '/register',
    element: <Register/>,
  },

  // PROTECTED ROUTES - Wrapped with RoleLayout for role-based navbar
  // These routes are under /app to avoid conflict with login at /
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <RoleLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard route - students view their courses
      {
        path: 'dashboard',
        element: <Dashboard />,
      },

      // Course detail route - students view course content and video player
      {
        path: 'course/:courseId',
        element: <CourseDetail/>,
      },

      // Quiz route - students take quiz for a course
      {
        path: 'course/:courseId/quiz/:testId',
        element: <Quiz />,
      },

      // Assignment route - students view and submit assignments for a course
      {
        path: 'course/:courseId/assignment',
        element: <Assignment />,
      },

      // Grade submission route - teachers grade student submissions
      {
        path: 'submission/:submissionId/grade',
        element: <GradeSubmission />,
      },

      // Assignment result route - students view their marks and feedback
      {
        path: 'course/:courseId/assignment/:assignmentId/result',
        element: <AssignmentResult />,
      },

      // Progress dashboard route - students view their course progress
      {
        path: 'course/:courseId/progress',
        element: <ProgressDashboard />,
      },

      // Student dashboard route - students view their overall learning summary
      {
        path: 'student/dashboard',
        element: (
          <RoleProtectedRoute requiredRole="student">
            <StudentDashboard />
          </RoleProtectedRoute>
        ),
      },

      // Student browse courses route - students browse and enroll in courses
      {
        path: 'student/courses',
        element: (
          <RoleProtectedRoute requiredRole="student">
            <AllCourses />
          </RoleProtectedRoute>
        ),
      },

      // Teacher dashboard route - teachers view their teaching summary
      {
        path: 'teacher/dashboard',
        element: (
          <RoleProtectedRoute requiredRole="teacher">
            <TeacherDashboard />
          </RoleProtectedRoute>
        ),
      },

      // Teacher courses route - teachers view all courses they created
      {
        path: 'teacher/courses',
        element: (
          <RoleProtectedRoute requiredRole="teacher">
            <TeacherCourses />
          </RoleProtectedRoute>
        ),
      },

      // Teacher students route - teachers view all students enrolled in their courses
      {
        path: 'teacher/students',
        element: (
          <RoleProtectedRoute requiredRole="teacher">
            <TeacherStudents />
          </RoleProtectedRoute>
        ),
      },

      // Teacher submissions route - teachers view all pending submissions for grading
      {
        path: 'teacher/submissions',
        element: (
          <RoleProtectedRoute requiredRole="teacher">
            <TeacherSubmissions />
          </RoleProtectedRoute>
        ),
      },

      // Teacher quizzes route - teachers view all quizzes they created
      {
        path: 'teacher/quizzes',
        element: (
          <RoleProtectedRoute requiredRole="teacher">
            <TeacherQuizzes />
          </RoleProtectedRoute>
        ),
      },

      // Create course route - teachers create a new course
      {
        path: 'teacher/course/create',
        element: (
          <RoleProtectedRoute requiredRole="teacher">
            <CreateCourse />
          </RoleProtectedRoute>
        ),
      },

      // Add lecture route - teachers add lectures to a course
      {
        path: 'teacher/course/:courseId/add-lecture',
        element: (
          <RoleProtectedRoute requiredRole="teacher">
            <AddLecture />
          </RoleProtectedRoute>
        ),
      },

      // Create quiz route - teachers create a quiz for a course
      {
        path: 'teacher/course/:courseId/create-quiz',
        element: (
          <RoleProtectedRoute requiredRole="teacher">
            <CreateQuiz />
          </RoleProtectedRoute>
        ),
      },

      // Add question route - teachers add questions to a quiz
      {
        path: 'teacher/quiz/:testId/add-question',
        element: (
          <RoleProtectedRoute requiredRole="teacher">
            <AddQuestion />
          </RoleProtectedRoute>
        ),
      },

      // Quiz results route - teachers view student results for a quiz
      {
        path: 'teacher/quiz/:testId/results',
        element: (
          <RoleProtectedRoute requiredRole="teacher">
            <QuizResults />
          </RoleProtectedRoute>
        ),
      },

      // Teacher quizzes route - manage all quizzes for a course
      {
        path: 'teacher/course/:courseId/quizzes',
        element: (
          <RoleProtectedRoute requiredRole="teacher">
            <TeacherQuizzes />
          </RoleProtectedRoute>
        ),
      },

      // Assignment submissions route - teachers view all student submissions for assignment
      {
        path: 'teacher/assignment/:assignmentId/submissions',
        element: (
          <RoleProtectedRoute requiredRole="teacher">
            <AssignmentSubmissions />
          </RoleProtectedRoute>
        ),
      },

      // Teacher assignments route - manage all assignments for a course
      {
        path: 'teacher/course/:courseId/assignments',
        element: (
          <RoleProtectedRoute requiredRole="teacher">
            <TeacherAssignments />
          </RoleProtectedRoute>
        ),
      },

      // Admin dashboard route - admins view platform statistics
      {
        path: 'admin/dashboard',
        element: (
          <RoleProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </RoleProtectedRoute>
        ),
      },

      // Admin users route - admins view all users
      {
        path: 'admin/users',
        element: (
          <RoleProtectedRoute requiredRole="admin">
            <AdminUsers />
          </RoleProtectedRoute>
        ),
      },

      // Admin teachers route - admins view all teachers
      {
        path: 'admin/teachers',
        element: (
          <RoleProtectedRoute requiredRole="admin">
            <AdminTeachers />
          </RoleProtectedRoute>
        ),
      },

      // Admin courses route - admins view all courses
      {
        path: 'admin/courses',
        element: (
          <RoleProtectedRoute requiredRole="admin">
            <AdminCourses />
          </RoleProtectedRoute>
        ),
      },
      ],
      },
      ]);

export default router;
