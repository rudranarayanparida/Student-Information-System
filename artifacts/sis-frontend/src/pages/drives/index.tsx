import React, { useState } from 'react';
import { useListDrives, useCreateDrive, getListDrivesQueryKey } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Building2, MapPin, Calendar, Plus, ExternalLink, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

const driveSchema = z.object({
  title: z.string().min(2, "Title required"),
  company: z.string().min(2, "Company required"),
  status: z.string().default('UPCOMING'),
  package: z.string().optional().nullable(),
  jobType: z.string().optional().nullable(),
  driveDate: z.string().optional().nullable(),
  applicationDeadline: z.string().optional().nullable(),
});

type DriveValues = z.infer<typeof driveSchema>;

export default function DrivesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const canManageDrives = user?.role === 'SUPER_ADMIN' || user?.role === 'CENTRAL_PLACEMENT' || user?.role === 'DEPT_PLACEMENT';

  const { data: drives, isLoading } = useListDrives({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    departmentId: user?.role === 'STUDENT' || user?.role === 'SRC' || user?.role === 'DEPT_PLACEMENT' ? user.departmentId : undefined
  });

  const createMutation = useCreateDrive();

  const form = useForm<DriveValues>({
    resolver: zodResolver(driveSchema),
    defaultValues: { title: '', company: '', status: 'UPCOMING', package: '', jobType: 'Full Time', driveDate: '', applicationDeadline: '' }
  });

  const onSubmit = async (data: DriveValues) => {
    try {
      const payload = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === '' ? null : v])
      ) as any;

      await createMutation.mutateAsync({ data: payload });
      queryClient.invalidateQueries({ queryKey: getListDrivesQueryKey() });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Success", description: "Placement drive created successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create drive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300';
      case 'ONGOING': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'CANCELLED': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Placement Drives</h2>
          <p className="text-muted-foreground">Discover and manage campus placement opportunities.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Drives</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>

          {canManageDrives && (
            <Button onClick={() => setIsDialogOpen(true)} className="shrink-0"><Plus className="mr-2 h-4 w-4" /> New Drive</Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : drives?.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/10 border-dashed">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">No drives found</h3>
          <p className="text-muted-foreground mt-1">There are no placement drives matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drives?.map((drive) => (
            <Card key={drive.id} className="flex flex-col hover-elevate transition-all border-border/60 shadow-sm">
              <CardHeader className="pb-4 border-b bg-card">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <Badge variant="outline" className={`font-semibold tracking-wide ${getStatusColor(drive.status)}`}>
                    {drive.status}
                  </Badge>
                  {drive.jobType && (
                    <Badge variant="secondary" className="bg-secondary/40 font-normal">
                      {drive.jobType}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl leading-tight line-clamp-1">{drive.company}</CardTitle>
                <CardDescription className="text-foreground/80 font-medium line-clamp-1 text-base">{drive.title}</CardDescription>
              </CardHeader>
              
              <CardContent className="pt-4 pb-2 flex-1 space-y-3 text-sm">
                {drive.package && (
                  <div className="flex items-start gap-2 text-foreground/90">
                    <IndianRupee className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span><span className="font-medium">Package:</span> {drive.package}</span>
                  </div>
                )}
                {drive.driveDate && (
                  <div className="flex items-start gap-2 text-foreground/90">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span><span className="font-medium">Date:</span> {format(new Date(drive.driveDate), 'MMM do, yyyy')}</span>
                  </div>
                )}
                {drive.applicationDeadline && (
                  <div className="flex items-start gap-2 text-destructive/80">
                    <Calendar className="h-4 w-4 mt-0.5 shrink-0" />
                    <span><span className="font-medium">Deadline:</span> {format(new Date(drive.applicationDeadline), 'MMM do, yyyy')}</span>
                  </div>
                )}
                {drive.location && (
                  <div className="flex items-start gap-2 text-foreground/90">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="line-clamp-1">{drive.location}</span>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-4 border-t bg-muted/10 flex justify-between items-center">
                <div className="text-xs text-muted-foreground font-medium">
                  {drive.applicantCount || 0} applied
                </div>
                <Link href={`/drives/${drive.id}`}>
                  <Button variant="secondary" size="sm" className="font-medium shadow-sm">
                    View Details <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Drive Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Placement Drive</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField control={form.control} name="company" render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name *</FormLabel>
                  <FormControl><Input placeholder="Google, Microsoft, etc." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title / Role *</FormLabel>
                  <FormControl><Input placeholder="Software Engineer" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="jobType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ''} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Full Time">Full Time</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                        <SelectItem value="Internship + PPO">Internship + PPO</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="package" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package / Stipend</FormLabel>
                    <FormControl><Input placeholder="12 LPA" {...field} value={field.value || ''} /></FormControl>
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="driveDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drive Date</FormLabel>
                    <FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="applicationDeadline" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl>
                  </FormItem>
                )} />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" className="mr-2" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  Create Drive
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
