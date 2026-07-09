import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetAcademicDetails, useUpsertAcademicDetails, getGetAcademicDetailsQueryKey } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const academicDetailsSchema = z.object({
  tenthBoard: z.string().optional().nullable(),
  tenthSchool: z.string().optional().nullable(),
  tenthPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  tenthYear: z.coerce.number().min(2000).max(2100).optional().nullable(),
  
  twelfthBoard: z.string().optional().nullable(),
  twelfthSchool: z.string().optional().nullable(),
  twelfthPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  twelfthYear: z.coerce.number().min(2000).max(2100).optional().nullable(),
  
  diplomaInstitute: z.string().optional().nullable(),
  diplomaPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  diplomaYear: z.coerce.number().min(2000).max(2100).optional().nullable(),
  
  ugInstitute: z.string().optional().nullable(),
  ugDegree: z.string().optional().nullable(),
  ugBranch: z.string().optional().nullable(),
  ugCgpa: z.coerce.number().min(0).max(10).optional().nullable(),
  ugPassingYear: z.coerce.number().min(2000).max(2100).optional().nullable(),
  
  currentSemesterCgpa: z.coerce.number().min(0).max(10).optional().nullable(),
  activeBacklogs: z.coerce.number().min(0).optional().nullable(),
  totalBacklogs: z.coerce.number().min(0).optional().nullable(),
  gapYears: z.coerce.number().min(0).optional().nullable(),
});

type AcademicDetailsValues = z.infer<typeof academicDetailsSchema>;

export default function AcademicProfile() {
  const { user } = useAuth();
  const studentId = user?.studentId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: academicDetails, isLoading } = useGetAcademicDetails(
    studentId!,
    { query: { enabled: !!studentId, queryKey: getGetAcademicDetailsQueryKey(studentId!) } }
  );

  const upsertMutation = useUpsertAcademicDetails();

  const form = useForm<AcademicDetailsValues>({
    resolver: zodResolver(academicDetailsSchema),
    defaultValues: {
      tenthBoard: '', tenthSchool: '', tenthPercentage: null, tenthYear: null,
      twelfthBoard: '', twelfthSchool: '', twelfthPercentage: null, twelfthYear: null,
      diplomaInstitute: '', diplomaPercentage: null, diplomaYear: null,
      ugInstitute: '', ugDegree: '', ugBranch: '', ugCgpa: null, ugPassingYear: null,
      currentSemesterCgpa: null, activeBacklogs: 0, totalBacklogs: 0, gapYears: 0
    }
  });

  useEffect(() => {
    if (academicDetails) {
      form.reset({
        ...academicDetails
      });
    }
  }, [academicDetails, form]);

  const onSubmit = async (data: AcademicDetailsValues) => {
    if (!studentId) return;

    try {
      await upsertMutation.mutateAsync({
        studentId,
        data
      });
      
      queryClient.invalidateQueries({ queryKey: getGetAcademicDetailsQueryKey(studentId) });
      
      toast({
        title: "Academics Updated",
        description: "Your academic records have been saved.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update academics",
      });
    }
  };

  if (!studentId) return <div>No student profile found for this user.</div>;
  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Academic Records</h3>
        <p className="text-sm text-muted-foreground">Enter your educational history accurately as it determines drive eligibility.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2 text-primary">Current Degree (Undergraduate)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="ugInstitute" render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel>Institute Name</FormLabel>
                  <FormControl><Input placeholder="College name" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="ugDegree" render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree (e.g., B.Tech, B.E.)</FormLabel>
                  <FormControl><Input placeholder="B.Tech" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="ugBranch" render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch/Specialization</FormLabel>
                  <FormControl><Input placeholder="Computer Science" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="ugPassingYear" render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Passing Year</FormLabel>
                  <FormControl><Input type="number" placeholder="2025" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="ugCgpa" render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall CGPA (out of 10)</FormLabel>
                  <FormControl><Input type="number" step="0.01" placeholder="8.5" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="currentSemesterCgpa" render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Sem CGPA</FormLabel>
                  <FormControl><Input type="number" step="0.01" placeholder="8.7" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 p-4 bg-muted/50 rounded-lg border border-border">
              <FormField control={form.control} name="activeBacklogs" render={({ field }) => (
                <FormItem>
                  <FormLabel>Active Backlogs</FormLabel>
                  <FormControl><Input type="number" placeholder="0" {...field} value={field.value || 0} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="totalBacklogs" render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Backlogs (History)</FormLabel>
                  <FormControl><Input type="number" placeholder="0" {...field} value={field.value || 0} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="gapYears" render={({ field }) => (
                <FormItem>
                  <FormLabel>Gap Years</FormLabel>
                  <FormControl><Input type="number" placeholder="0" {...field} value={field.value || 0} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2 text-primary">Class 12th / Equivalent</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField control={form.control} name="twelfthBoard" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Board</FormLabel>
                  <FormControl><Input placeholder="CBSE, State Board, etc." {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="twelfthSchool" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>School Name</FormLabel>
                  <FormControl><Input placeholder="School name" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="twelfthPercentage" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Percentage (%)</FormLabel>
                  <FormControl><Input type="number" step="0.01" placeholder="85.5" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="twelfthYear" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Passing Year</FormLabel>
                  <FormControl><Input type="number" placeholder="2021" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2 text-primary">Class 10th</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField control={form.control} name="tenthBoard" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Board</FormLabel>
                  <FormControl><Input placeholder="CBSE, State Board, etc." {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tenthSchool" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>School Name</FormLabel>
                  <FormControl><Input placeholder="School name" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tenthPercentage" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Percentage (%)</FormLabel>
                  <FormControl><Input type="number" step="0.01" placeholder="90.5" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tenthYear" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Passing Year</FormLabel>
                  <FormControl><Input type="number" placeholder="2019" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={upsertMutation.isPending}>
              {upsertMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
