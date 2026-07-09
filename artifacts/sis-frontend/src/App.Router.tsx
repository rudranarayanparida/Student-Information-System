// Re-export router from App.tsx content we just wrote
import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import NotFound from '@/pages/not-found';

import StudentsPage from '@/pages/students';
import StudentProfilePage from '@/pages/students/[id]';
import ProfilePage from '@/pages/profile';
import DepartmentsPage from '@/pages/departments';
import DrivesPage from '@/pages/drives';
import DriveDetailPage from '@/pages/drives/[id]';
import UsersPage from '@/pages/admin/users';

function ProtectedRoute({ component: Component, roles }: { component: React.ComponentType<any>, roles?: string[] }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  if (roles && !roles.includes(user.role)) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function RootRedirect() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading) {
      if (user) setLocation('/dashboard');
      else setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  return null;
}

function SettingsPlaceholder() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
      <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
        Settings functionality is not yet available in this environment.
      </div>
    </div>
  );
}

export function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
      <Route path="/dashboard">
        {() => <ProtectedRoute component={DashboardPage} />}
      </Route>
      
      <Route path="/students">
        {() => <ProtectedRoute component={StudentsPage} roles={['SUPER_ADMIN', 'CENTRAL_PLACEMENT', 'DEPT_PLACEMENT', 'SRC']} />}
      </Route>
      
      <Route path="/students/:id">
        {() => <ProtectedRoute component={StudentProfilePage} roles={['SUPER_ADMIN', 'CENTRAL_PLACEMENT', 'DEPT_PLACEMENT', 'SRC']} />}
      </Route>
      
      <Route path="/profile*">
        {() => <ProtectedRoute component={ProfilePage} roles={['STUDENT']} />}
      </Route>

      <Route path="/departments">
        {() => <ProtectedRoute component={DepartmentsPage} roles={['SUPER_ADMIN', 'CENTRAL_PLACEMENT']} />}
      </Route>

      <Route path="/drives">
        {() => <ProtectedRoute component={DrivesPage} roles={['SUPER_ADMIN', 'CENTRAL_PLACEMENT', 'DEPT_PLACEMENT', 'SRC', 'STUDENT']} />}
      </Route>

      <Route path="/drives/:id">
        {() => <ProtectedRoute component={DriveDetailPage} roles={['SUPER_ADMIN', 'CENTRAL_PLACEMENT', 'DEPT_PLACEMENT', 'SRC', 'STUDENT']} />}
      </Route>

      <Route path="/admin/users">
        {() => <ProtectedRoute component={UsersPage} roles={['SUPER_ADMIN']} />}
      </Route>

      <Route path="/admin/settings">
        {() => <ProtectedRoute component={SettingsPlaceholder} roles={['SUPER_ADMIN']} />}
      </Route>
      
      <Route path="/" component={RootRedirect} />
      
      <Route component={NotFound} />
    </Switch>
  );
}
