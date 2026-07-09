import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/lib/auth';
import { useLogout } from '@workspace/api-client-react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout: clearLocalAuth } = useAuth();
  const [location] = useLocation();
  const logoutMutation = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (e) {
      // Ignore errors on logout
    } finally {
      clearLocalAuth();
    }
  };

  if (!user) return null;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'CENTRAL_PLACEMENT', 'DEPT_PLACEMENT', 'SRC', 'STUDENT'] },
    { name: 'My Profile', href: '/profile', icon: UserIcon, roles: ['STUDENT'] },
    { name: 'Students', href: '/students', icon: Users, roles: ['SUPER_ADMIN', 'CENTRAL_PLACEMENT', 'DEPT_PLACEMENT', 'SRC'] },
    { name: 'Departments', href: '/departments', icon: Building2, roles: ['SUPER_ADMIN', 'CENTRAL_PLACEMENT'] },
    { name: 'Placement Drives', href: '/drives', icon: Briefcase, roles: ['SUPER_ADMIN', 'CENTRAL_PLACEMENT', 'DEPT_PLACEMENT', 'SRC', 'STUDENT'] },
    { name: 'User Management', href: '/admin/users', icon: Users, roles: ['SUPER_ADMIN'] },
    { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['SUPER_ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="font-bold text-lg tracking-tight">SIS Portal</div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-sidebar-primary">SIS Portal</h1>
          <div className="mt-2 text-sm text-sidebar-foreground/70">
            {user.departmentName || 'Central Administration'}
          </div>
        </div>

        <div className="px-4 py-2 border-t border-sidebar-border border-b mb-4 bg-sidebar-accent/30">
          <div className="font-medium truncate">{user.fullName}</div>
          <div className="text-xs text-sidebar-foreground/60 mt-0.5 truncate flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            {user.role.replace('_', ' ')}
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link key={item.name} href={item.href}>
                <div 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer
                  ${isActive 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                    : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground'}
                `}>
                  <item.icon size={18} className={isActive ? 'text-primary-foreground' : 'text-sidebar-foreground/60'} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-3 text-sidebar-foreground/60" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
