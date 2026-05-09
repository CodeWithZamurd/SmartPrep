import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';

import Splash from './pages/Splash.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import AdminLogin from './pages/AdminLogin.jsx';

import Home from './pages/Home.jsx';
import EvaluationRules from './pages/EvaluationRules.jsx';
import DailyChallenge from './pages/DailyChallenge.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import Practice from './pages/Practice.jsx';
import InterviewDomain from './pages/InterviewDomain.jsx';
import InterviewSetup from './pages/InterviewSetup.jsx';
import Interview from './pages/Interview.jsx';
import Feedback from './pages/Feedback.jsx';
import QuestionDetails from './pages/QuestionDetails.jsx';
import Suggestions from './pages/Suggestions.jsx';
import Result from './pages/Result.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminInsights from './pages/admin/AdminInsights.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminQuestions from './pages/admin/AdminQuestions.jsx';
import AdminAddQuestion from './pages/admin/AdminAddQuestion.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';

function PrivateRoute({ children, role }) {
  const { token, user, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;
  if (role === 'admin' && user?.role !== 'admin') return <Navigate to="/home" replace />;
  if (role === 'user' && user?.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
}

export default function App() {
  const { token, user, loading } = useAuth();
  if (loading) return null;
  const home = user?.role === 'admin' ? '/admin' : '/home';

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to={home} replace /> : <Splash />} />
      <Route path="/login" element={token ? <Navigate to={home} replace /> : <Login />} />
      <Route path="/signup" element={token ? <Navigate to={home} replace /> : <Signup />} />
      <Route path="/admin-login" element={token ? <Navigate to={home} replace /> : <AdminLogin />} />

      <Route path="/home" element={<PrivateRoute role="user"><Home /></PrivateRoute>} />
      <Route path="/evaluation-rules" element={<PrivateRoute role="user"><EvaluationRules /></PrivateRoute>} />
      <Route path="/daily-challenge" element={<PrivateRoute role="user"><DailyChallenge /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute role="user"><Profile /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute role="user"><Settings /></PrivateRoute>} />
      <Route path="/practice" element={<PrivateRoute role="user"><Practice /></PrivateRoute>} />
      <Route path="/interview" element={<PrivateRoute role="user"><InterviewDomain /></PrivateRoute>} />
      <Route path="/interview/setup" element={<PrivateRoute role="user"><InterviewSetup /></PrivateRoute>} />
      <Route path="/interview/session" element={<PrivateRoute role="user"><Interview /></PrivateRoute>} />
      <Route path="/feedback/:sessionId" element={<PrivateRoute role="user"><Feedback /></PrivateRoute>} />
      <Route path="/question-details/:sessionId" element={<PrivateRoute role="user"><QuestionDetails /></PrivateRoute>} />
      <Route path="/suggestions/:sessionId" element={<PrivateRoute role="user"><Suggestions /></PrivateRoute>} />
      <Route path="/result" element={<PrivateRoute role="user"><Result /></PrivateRoute>} />

      <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/insights" element={<PrivateRoute role="admin"><AdminInsights /></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute role="admin"><AdminUsers /></PrivateRoute>} />
      <Route path="/admin/questions" element={<PrivateRoute role="admin"><AdminQuestions /></PrivateRoute>} />
      <Route path="/admin/questions/new" element={<PrivateRoute role="admin"><AdminAddQuestion /></PrivateRoute>} />
      <Route path="/admin/questions/edit" element={<PrivateRoute role="admin"><AdminAddQuestion /></PrivateRoute>} />
      <Route path="/admin/settings" element={<PrivateRoute role="admin"><AdminSettings /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
