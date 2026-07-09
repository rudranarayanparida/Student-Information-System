import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useGetDrive, useUpdateDrive, useDeleteDrive, getGetDriveQueryKey, getListDrivesQueryKey } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Briefcase, Building2, MapPin, Calendar, Clock, FileText, IndianRupee, GraduationCap, AlertCircle, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const driveEditSchema = z.object({
  title: z.string().min(2),
  company: z.string().min(2),
  description: z.string().optional().nullable(),
  status: z.string(),
  package: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  jobType: z.string().optional().nullable(),
  driveDate: z.string().optional().nullable(),
  applicationDeadline: z.string().optional().nullable(),
  minCgpa: z.coerce.number().optional().nullable(),
  minTenthPercent: z.coerce.number().optional().nullable(),
  minTwelfthPercent: z.coerce.number().optional().nullable(),
  maxBacklogs: z.coerce.number().optional().nullable(),
});

type DriveEditValues = z.infer<typeof driveEditSchema>;

export default function DriveDetailPage() {
  const { id } = useParams();
  const driveId = parseInt(id || '0', 10);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);

  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'CENTRAL_PLACEMENT' || user?.role === 'DEPT_PLACEMENT';

  const { data: drive, isLoading } = useGetDrive(driveId, { query: { enabled: !!driveId, queryKey: getGetDriveQueryKey(driveId) } });
  const updateMutation = useUpdateDrive();
  const deleteMutation = useDeleteDrive();

  const form = useForm<DriveEditValues>({
    resolver: zodResolver(driveEditSchema),
    defaultValues: {
      title: '', company: '', description: '', status: 'UPCOMING',
      package: '', location: '', jobType: '', driveDate: '', applicationDeadline: '',
      minCgpa: null, minTenthPercent: null, minTwelfthPercent: null, maxBacklogs: null
    }
  });

  useEffect(() => {
    if (drive && isEditing) {
      form.reset({
        title: drive.title,
        company: drive.company,
        description: drive.description || '',
        status: drive.status,
        package: drive.package || '',
        location: drive.location || '',
        jobType: drive.jobType || '',
        driveDate: drive.driveDate?.split('T')[0] || '',
        applicationDeadline: drive.applicationDeadline?.split('T')[0] || '',
        minCgpa: drive.minCgpa,
        minTenthPercent: drive.minTenthPercent,
        minTwelfthPercent: drive.minTwelfthPercent,
        maxBacklogs: drive.maxBacklogs,
      });
    }
  }, [drive, isEditing, form]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ driveId });
      queryClient.invalidateQueries({ queryKey: getListDrivesQueryKey() });
      toast({ title: "Deleted", description: "Drive deleted successfully" });
      setLocation('/drives');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete" });
    }
  };

  const onSubmit = async (data: DriveEditValues) => {
    try {
      const payload = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === '' ? null : v])
      ) as any;

      await updateMutation.mutateAsync({ driveId, data: payload });
      queryClient.setQueryData(getGetDriveQueryKey(driveId), (old: any) => ({ ...old, ...payload }));
      setIsEditing(false);
      toast({ title: "Success", description: "Drive updated successfully" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update" });
    }
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-32" /><Skeleton className="h-[400px] w-full" /></div>;
  }

  if (!drive) {
    return <div className="text-center py-20 text-muted-foreground">Drive not found</div>;
  }

  if (isEditing) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}><ArrowLeft className="h-5 w-5" /></Button>
          <h2 className="text-2xl font-bold">Edit Drive</h2>
        </div>

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Basic Info</h3>
                    <FormField control={form.control} name="company" render={({ field }) => (
                      <FormItem><FormLabel>Company Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem><FormLabel>Job Title *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="UPCOMING">Upcoming</SelectItem>
                              <SelectItem value="ONGOING">Ongoing</SelectItem>
                              <SelectItem value="COMPLETED">Completed</SelectItem>
                              <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="jobType" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Full Time">Full Time</SelectItem>
                              <SelectItem value="Internship">Internship</SelectItem>
                              <SelectItem value="Internship + PPO">Internship + PPO</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="package" render={({ field }) => (
                      <FormItem><FormLabel>Package/Stipend</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Dates & Eligibility</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="driveDate" render={({ field }) => (
                        <FormItem><FormLabel>Drive Date</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="applicationDeadline" render={({ field }) => (
                        <FormItem><FormLabel>Deadline</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl></FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="minCgpa" render={({ field }) => (
                        <FormItem><FormLabel>Min CGPA</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value || ''} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="maxBacklogs" render={({ field }) => (
                        <FormItem><FormLabel>Max Backlogs</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="minTenthPercent" render={({ field }) => (
                        <FormItem><FormLabel>Min 10th %</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value || ''} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="minTwelfthPercent" render={({ field }) => (
                        <FormItem><FormLabel>Min 12th %</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value || ''} /></FormControl></FormItem>
                      )} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Description</h3>
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormControl><Textarea className="min-h-[200px]" placeholder="Job description, process details, etc." {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit" disabled={updateMutation.isPending}>Save Changes</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <Link href="/drives" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Drives
      </Link>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <Card className="border-t-4 border-t-primary shadow-sm overflow-hidden">
            <div className="bg-muted/20 px-6 py-8 border-b">
              <div className="flex justify-between items-start gap-4 mb-4">
                <Badge className={
                  drive.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                  drive.status === 'ONGOING' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' :
                  drive.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' :
                  'bg-destructive/10 text-destructive'
                }>
                  {drive.status}
                </Badge>
                
                {canManage && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Drive</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-destructive">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">{drive.title}</h1>
              <div className="flex items-center gap-2 text-xl font-medium text-muted-foreground">
                <Building2 className="h-6 w-6" /> {drive.company}
              </div>
            </div>

            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Description & Process
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {drive.description || "No description provided."}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="w-full md:w-80 shrink-0 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/10 pb-4 border-b">
              <CardTitle className="text-lg">Key Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                <div className="p-4 flex items-start gap-3">
                  <IndianRupee className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-0.5">Package/Stipend</div>
                    <div className="font-semibold text-foreground">{drive.package || 'Not specified'}</div>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-0.5">Job Type</div>
                    <div className="font-semibold text-foreground">{drive.jobType || 'Not specified'}</div>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-0.5">Location</div>
                    <div className="font-semibold text-foreground">{drive.location || 'Not specified'}</div>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-0.5">Drive Date</div>
                    <div className="font-semibold text-foreground">{drive.driveDate ? format(new Date(drive.driveDate), 'MMMM do, yyyy') : 'TBD'}</div>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3">
                  <Clock className="h-5 w-5 text-destructive/70 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-0.5">Apply By</div>
                    <div className="font-semibold text-destructive">{drive.applicationDeadline ? format(new Date(drive.applicationDeadline), 'MMMM do, yyyy') : 'TBD'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="bg-muted/10 pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Eligibility Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Min CGPA</span>
                  <span className="font-bold">{drive.minCgpa ? `${drive.minCgpa} / 10` : 'No cutoff'}</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Max Backlogs</span>
                  <span className="font-bold">{drive.maxBacklogs !== null && drive.maxBacklogs !== undefined ? drive.maxBacklogs : 'Any'}</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">10th / 12th</span>
                  <span className="font-bold">
                    {drive.minTenthPercent || '0'}% / {drive.minTwelfthPercent || '0'}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {user?.role === 'STUDENT' && drive.status === 'UPCOMING' && (
            <Button className="w-full size-lg text-base shadow-md h-12">
              Apply Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
