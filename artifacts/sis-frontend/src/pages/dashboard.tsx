import React from 'react';
import { useAuth } from '@/lib/auth';
import { 
  useGetDashboardStats, getGetDashboardStatsQueryKey,
  useGetPlacementSummary, getGetPlacementSummaryQueryKey,
  useGetRecentActivity, getGetRecentActivityQueryKey,
  useListDrives, getListDrivesQueryKey
} from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, GraduationCap, Briefcase, Building2, TrendingUp, Activity, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user.fullName}. Here's an overview of the current status.
        </p>
      </div>

      {(user.role === 'SUPER_ADMIN' || user.role === 'CENTRAL_PLACEMENT' || user.role === 'DEPT_PLACEMENT' || user.role === 'SRC') && (
        <AdminDashboard user={user} />
      )}

      {user.role === 'STUDENT' && (
        <StudentDashboard user={user} />
      )}
    </div>
  );
}

function AdminDashboard({ user }: { user: any }) {
  const departmentId = user.departmentId || undefined;
  
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats(
    { departmentId },
    { query: { enabled: true, queryKey: getGetDashboardStatsQueryKey({ departmentId }) } }
  );
  
  const canSeeSummary = user.role === 'SUPER_ADMIN' || user.role === 'CENTRAL_PLACEMENT';
  const { data: placementSummary, isLoading: summaryLoading } = useGetPlacementSummary(
    { query: { enabled: canSeeSummary, queryKey: getGetPlacementSummaryQueryKey() } }
  );
  
  const { data: recentActivity, isLoading: activityLoading } = useGetRecentActivity(
    { query: { enabled: true, queryKey: getGetRecentActivityQueryKey() } }
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Students" 
          value={stats?.totalStudents} 
          icon={<Users className="h-5 w-5 text-muted-foreground" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Placed Students" 
          value={stats?.placedStudents} 
          description={stats?.placementPercentage ? `${stats.placementPercentage}% placement rate` : undefined}
          icon={<GraduationCap className="h-5 w-5 text-muted-foreground" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Active Drives" 
          value={stats?.activeDrives} 
          icon={<Briefcase className="h-5 w-5 text-muted-foreground" />} 
          loading={statsLoading} 
        />
        {(user.role === 'SUPER_ADMIN' || user.role === 'CENTRAL_PLACEMENT') ? (
          <StatCard 
            title="Departments" 
            value={stats?.departmentsCount} 
            icon={<Building2 className="h-5 w-5 text-muted-foreground" />} 
            loading={statsLoading} 
          />
        ) : (
          <StatCard 
            title="Profile Completion" 
            value={stats?.profileCompletionAvg ? `${Math.round(stats.profileCompletionAvg)}%` : '0%'} 
            description="Average completion rate"
            icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />} 
            loading={statsLoading} 
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Chart */}
        {(user.role === 'SUPER_ADMIN' || user.role === 'CENTRAL_PLACEMENT') && (
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Placement by Department</CardTitle>
              <CardDescription>Percentage of placed students per department</CardDescription>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : placementSummary && placementSummary.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={placementSummary} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="departmentCode" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      />
                      <RechartsTooltip 
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                      />
                      <Bar 
                        dataKey="placementPercentage" 
                        name="Placement %" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No placement data available
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Activity Feed */}
        <Card className={(user.role === 'SUPER_ADMIN' || user.role === 'CENTRAL_PLACEMENT') ? 'col-span-1' : 'col-span-1 lg:col-span-3'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-6">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex gap-3 relative">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary ring-4 ring-primary/10 flex-shrink-0" />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm">
                        <span className="font-medium text-foreground">{activity.entityName}</span>{' '}
                        <span className="text-muted-foreground">{activity.description}</span>
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StudentDashboard({ user }: { user: any }) {
  const { data: drives, isLoading: drivesLoading } = useListDrives(
    { status: 'UPCOMING' },
    { query: { enabled: true, queryKey: getListDrivesQueryKey({ status: 'UPCOMING' }) } }
  );

  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg text-primary">Complete your profile</h3>
              <p className="text-sm text-muted-foreground mt-1">
                A complete profile increases your chances of getting shortlisted for placement drives.
              </p>
            </div>
            <Link href="/profile" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Go to Profile <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Upcoming Placement Drives</h3>
        {drivesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-[200px] rounded-xl" />)}
          </div>
        ) : drives && drives.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drives.slice(0, 3).map(drive => (
              <Card key={drive.id} className="hover-elevate transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{drive.company}</CardTitle>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {drive.jobType || 'Full Time'}
                    </span>
                  </div>
                  <CardDescription className="font-medium text-foreground">{drive.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Package</span>
                    <span className="font-medium">{drive.package || 'TBD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deadline</span>
                    <span className="font-medium">
                      {drive.applicationDeadline ? format(new Date(drive.applicationDeadline), 'MMM dd, yyyy') : 'TBD'}
                    </span>
                  </div>
                  <div className="pt-4">
                    <Link href={`/drives/${drive.id}`} className="text-primary text-sm font-medium hover:underline flex items-center">
                      View Details <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <Briefcase className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No upcoming drives at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, description, icon, loading }: { title: string, value?: number | string, description?: string, icon: React.ReactNode, loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value !== undefined ? value : '-'}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
