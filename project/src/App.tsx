import { useEffect } from 'react';
import { AppProvider, useApp } from '@/store/AppContext';
import { Layout } from '@/components/layout/Layout';
import { ToastContainer } from '@/components/ui/Toast';
import { DashboardPage } from '@/pages/DashboardPage';
import { ApplyLeavePage } from '@/pages/ApplyLeavePage';
import { LeaveHistoryPage } from '@/pages/LeaveHistoryPage';
import { LeaveApprovalsPage } from '@/pages/LeaveApprovalsPage';
import { GreenCardPage } from '@/pages/GreenCardPage';
import { MyBookingsPage } from '@/pages/MyBookingsPage';
import { ClassroomPage } from '@/pages/ClassroomPage';
import { UserManagementPage } from '@/pages/UserManagementPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { WelcomePage } from '@/pages/WelcomePage';
import { RoleLoginPage } from '@/pages/RoleLoginPage';
import { StudentSignUpPage } from '@/pages/StudentSignUpPage';
import { TeacherSignUpPage } from '@/pages/TeacherSignUpPage';
import { RestrictedSignUpPage } from '@/pages/RestrictedSignUpPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { AccessDeniedPage } from '@/pages/AccessDeniedPage';
import { useRouter, getDashboardRouteForRole } from '@/lib/router';
import type { Page } from '@/types';

const pageMap: Record<Page, React.ComponentType> = {
  'dashboard': DashboardPage,
  'apply-leave': ApplyLeavePage,
  'leave-history': LeaveHistoryPage,
  'leave-approvals': LeaveApprovalsPage,
  'green-card': GreenCardPage,
  'my-bookings': MyBookingsPage,
  'classroom': ClassroomPage,
  'users': UserManagementPage,
  'notifications': NotificationsPage,
};

function AppContent() {
  const { currentUser, page, logout, toast } = useApp();
  const { parsedRoute, navigate } = useRouter();

  // Handle route synchronization when login status changes
  useEffect(() => {
    if (currentUser) {
      // If user is logged in and currently on public/auth routes, redirect to their role dashboard
      if (
        parsedRoute.type === 'welcome' ||
        parsedRoute.type === 'login' ||
        parsedRoute.type === 'signup' ||
        parsedRoute.type === 'signup-restricted' ||
        parsedRoute.type === 'forgot-password'
      ) {
        navigate(getDashboardRouteForRole(currentUser.role));
      }
    }
  }, [currentUser, parsedRoute.type, navigate]);

  // 1. Welcome Page (Role Selection)
  if (parsedRoute.type === 'welcome') {
    if (currentUser) {
      // If logged in, redirect to user's dashboard
      const target = getDashboardRouteForRole(currentUser.role);
      navigate(target);
      return null;
    }
    return (
      <>
        <WelcomePage onSelectRole={(role) => navigate(`/login/${role}`)} />
        <ToastContainer />
      </>
    );
  }

  // 2. Role-Specific Login Pages (/login/student, /login/teacher, /login/hod, /login/admin)
  if (parsedRoute.type === 'login') {
    const role = parsedRoute.targetRole!;
    if (currentUser) {
      if (currentUser.role === role) {
        navigate(getDashboardRouteForRole(currentUser.role));
        return null;
      }
      return (
        <>
          <AccessDeniedPage
            userRole={currentUser.role}
            attemptedRole={role}
            onNavigate={navigate}
            onLogout={logout}
          />
          <ToastContainer />
        </>
      );
    }
    return (
      <>
        <RoleLoginPage role={role} onNavigate={navigate} />
        <ToastContainer />
      </>
    );
  }

  // 3. Student Registration (/signup/student)
  if (parsedRoute.type === 'signup' && parsedRoute.targetRole === 'student') {
    return (
      <>
        <StudentSignUpPage onNavigate={navigate} />
        <ToastContainer />
      </>
    );
  }

  // 4. Teacher Registration (/signup/teacher)
  if (parsedRoute.type === 'signup' && parsedRoute.targetRole === 'teacher') {
    return (
      <>
        <TeacherSignUpPage onNavigate={navigate} />
        <ToastContainer />
      </>
    );
  }

  // 5. Restricted Registration (/signup/hod, /signup/admin)
  if (parsedRoute.type === 'signup-restricted') {
    return (
      <>
        <RestrictedSignUpPage role={parsedRoute.targetRole!} onNavigate={navigate} />
        <ToastContainer />
      </>
    );
  }

  // 6. Forgot Password (/forgot-password)
  if (parsedRoute.type === 'forgot-password') {
    return (
      <>
        <ForgotPasswordPage onNavigate={navigate} />
        <ToastContainer />
      </>
    );
  }

  // 7. Role Dashboards (/student/dashboard, /teacher/dashboard, /hod/dashboard, /admin/dashboard)
  if (parsedRoute.type === 'dashboard') {
    const requestedRole = parsedRoute.targetRole!;

    // Check Authentication
    if (!currentUser) {
      // Unauthenticated access -> redirect to appropriate role login page
      navigate(`/login/${requestedRole}`);
      toast('warning', `Please sign in to access the ${requestedRole.toUpperCase()} dashboard.`);
      return null;
    }

    // Check Role Authorization (Security Rule)
    if (currentUser.role !== requestedRole) {
      return (
        <>
          <AccessDeniedPage
            userRole={currentUser.role}
            attemptedRole={requestedRole}
            onNavigate={navigate}
            onLogout={logout}
          />
          <ToastContainer />
        </>
      );
    }

    // Authorized dashboard view
    const PageComponent = pageMap[page] || DashboardPage;
    return (
      <>
        <Layout>
          <PageComponent />
        </Layout>
        <ToastContainer />
      </>
    );
  }

  // 8. Fallback / Internal App View
  if (!currentUser) {
    return (
      <>
        <WelcomePage onSelectRole={(role) => navigate(`/login/${role}`)} />
        <ToastContainer />
      </>
    );
  }

  const PageComponent = pageMap[page] || DashboardPage;
  return (
    <>
      <Layout>
        <PageComponent />
      </Layout>
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
