import React from 'react';
import { useLocation, Link, Route, Switch } from 'wouter';
import { useAuth } from '@/lib/auth';
import { useGetCurrentUser } from '@workspace/api-client-react';

import PersonalProfile from './personal';
import AcademicProfile from './academic';
import ExperienceProfile from './experience';
import SkillsProfile from './skills';
import AchievementsProfile from './achievements';

const sections = [
  { id: 'personal', title: 'Personal Details', path: '/profile/personal' },
  { id: 'academic', title: 'Academic Details', path: '/profile/academic' },
  { id: 'experience', title: 'Experience', path: '/profile/experience' },
  { id: 'skills', title: 'Skills & Certs', path: '/profile/skills' },
  { id: 'achievements', title: 'Achievements', path: '/profile/achievements' },
];

export default function ProfileLayout() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: currentUser, isLoading } = useGetCurrentUser();

  // Redirect /profile to /profile/personal
  React.useEffect(() => {
    if (location === '/profile' || location === '/profile/') {
      setLocation('/profile/personal');
    }
  }, [location, setLocation]);

  if (isLoading || !currentUser) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">
          Keep your profile updated. This information is used for placement drives.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0">
            {sections.map((section) => {
              const isActive = location.startsWith(section.path);
              return (
                <Link key={section.id} href={section.path}>
                  <div
                    className={`
                      whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                    `}
                  >
                    {section.title}
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 bg-card border rounded-lg shadow-sm">
          <div className="p-6">
            <Switch>
              <Route path="/profile/personal" component={PersonalProfile} />
              <Route path="/profile/academic" component={AcademicProfile} />
              <Route path="/profile/experience" component={ExperienceProfile} />
              <Route path="/profile/skills" component={SkillsProfile} />
              <Route path="/profile/achievements" component={AchievementsProfile} />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
}
