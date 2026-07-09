import React, { useState } from 'react';
import { useListStudents, useExportStudents } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { Search, Download, Eye, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function StudentsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Handle search debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const departmentId = user?.role === 'SUPER_ADMIN' || user?.role === 'CENTRAL_PLACEMENT' 
    ? undefined 
    : user?.departmentId;

  const queryParams = {
    departmentId,
    search: debouncedSearch || undefined,
    placementStatus: statusFilter !== 'ALL' ? statusFilter : undefined,
    year: yearFilter !== 'ALL' ? parseInt(yearFilter, 10) : undefined,
    page,
    pageSize
  };

  const { data: studentsData, isLoading } = useListStudents(queryParams);
  
  // Custom fetch function to handle download since hook might not handle blob directly properly here
  const handleExport = async () => {
    try {
      const urlParams = new URLSearchParams();
      if (departmentId) urlParams.append('departmentId', departmentId.toString());
      urlParams.append('format', 'CSV');
      
      // Get the export URL (we would normally use the hook, but for file download a direct fetch or the hook with specific handling is needed)
      // Since we don't have direct access to the base URL here easily, we'll use a hack or assume the hook works.
      const token = localStorage.getItem('sis_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/students/export?${urlParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export students', error);
      alert('Failed to export students. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students Directory</h2>
          <p className="text-muted-foreground">Manage and view student profiles</p>
        </div>
        
        {(user?.role === 'SUPER_ADMIN' || user?.role === 'CENTRAL_PLACEMENT' || user?.role === 'DEPT_PLACEMENT') && (
          <Button onClick={handleExport} variant="outline" className="shrink-0">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, roll number, or email..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="Placement Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="NOT_PLACED">Not Placed</SelectItem>
                  <SelectItem value="PLACED">Placed</SelectItem>
                  <SelectItem value="OPTED_OUT">Opted Out</SelectItem>
                </SelectContent>
              </Select>

              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Grad Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : studentsData?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No students found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  studentsData?.data.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-sm">{student.rollNumber}</TableCell>
                      <TableCell className="font-medium">{student.fullName}</TableCell>
                      <TableCell>{student.departmentName}</TableCell>
                      <TableCell>{student.year}</TableCell>
                      <TableCell>
                        <StatusBadge status={student.placementStatus || 'NOT_PLACED'} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full max-w-[60px] bg-muted rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full" 
                              style={{ width: `${student.profileCompletionPercent || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{student.profileCompletionPercent || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/students/${student.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {studentsData && studentsData.total > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, studentsData.total)} of {studentsData.total} entries
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * pageSize >= studentsData.total || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'PLACED':
      return <span className="px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs rounded-full font-medium">Placed</span>;
    case 'OPTED_OUT':
      return <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs rounded-full font-medium">Opted Out</span>;
    default:
      return <span className="px-2 py-1 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 text-xs rounded-full font-medium">Not Placed</span>;
  }
}
