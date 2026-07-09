import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetPersonalDetails, useUpsertPersonalDetails, getGetPersonalDetailsQueryKey } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const personalDetailsSchema = z.object({
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  phone: z.string().min(10, "Valid phone number required").optional().nullable(),
  alternatePhone: z.string().optional().nullable(),
  permanentAddress: z.string().min(5, "Address required").optional().nullable(),
  currentAddress: z.string().min(5, "Address required").optional().nullable(),
  city: z.string().min(2, "City required").optional().nullable(),
  state: z.string().min(2, "State required").optional().nullable(),
  pincode: z.string().min(6, "Valid pincode required").optional().nullable(),
  nationality: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  aadharNumber: z.string().optional().nullable(),
  panNumber: z.string().optional().nullable(),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')).nullable(),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')).nullable(),
  portfolioUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')).nullable(),
});

type PersonalDetailsValues = z.infer<typeof personalDetailsSchema>;

export default function PersonalProfile() {
  const { user } = useAuth();
  const studentId = user?.studentId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: personalDetails, isLoading } = useGetPersonalDetails(
    studentId!,
    { query: { enabled: !!studentId, queryKey: getGetPersonalDetailsQueryKey(studentId!) } }
  );

  const upsertMutation = useUpsertPersonalDetails();

  const form = useForm<PersonalDetailsValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      dateOfBirth: '', gender: '', phone: '', alternatePhone: '',
      permanentAddress: '', currentAddress: '', city: '', state: '',
      pincode: '', nationality: '', category: '', aadharNumber: '',
      panNumber: '', linkedinUrl: '', githubUrl: '', portfolioUrl: ''
    }
  });

  useEffect(() => {
    if (personalDetails) {
      form.reset({
        dateOfBirth: personalDetails.dateOfBirth || '',
        gender: personalDetails.gender || '',
        phone: personalDetails.phone || '',
        alternatePhone: personalDetails.alternatePhone || '',
        permanentAddress: personalDetails.permanentAddress || '',
        currentAddress: personalDetails.currentAddress || '',
        city: personalDetails.city || '',
        state: personalDetails.state || '',
        pincode: personalDetails.pincode || '',
        nationality: personalDetails.nationality || '',
        category: personalDetails.category || '',
        aadharNumber: personalDetails.aadharNumber || '',
        panNumber: personalDetails.panNumber || '',
        linkedinUrl: personalDetails.linkedinUrl || '',
        githubUrl: personalDetails.githubUrl || '',
        portfolioUrl: personalDetails.portfolioUrl || ''
      });
    }
  }, [personalDetails, form]);

  const onSubmit = async (data: PersonalDetailsValues) => {
    if (!studentId) return;
    
    // Clean up empty strings to null for API
    const cleanedData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === '' ? null : v])
    );

    try {
      await upsertMutation.mutateAsync({
        studentId,
        data: cleanedData
      });
      
      queryClient.invalidateQueries({ queryKey: getGetPersonalDetailsQueryKey(studentId) });
      
      toast({
        title: "Profile Updated",
        description: "Your personal details have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    }
  };

  if (!studentId) return <div>No student profile found for this user.</div>;
  if (isLoading) return <div className="space-y-4">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Personal Information</h3>
        <p className="text-sm text-muted-foreground">Basic contact and demographic details.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ''} value={field.value || ''}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Phone</FormLabel>
                <FormControl><Input placeholder="+91 9876543210" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="alternatePhone" render={({ field }) => (
              <FormItem>
                <FormLabel>Alternate Phone</FormLabel>
                <FormControl><Input placeholder="+91 9876543211" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ''} value={field.value || ''}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="OBC">OBC</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="ST">ST</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="nationality" render={({ field }) => (
              <FormItem>
                <FormLabel>Nationality</FormLabel>
                <FormControl><Input placeholder="Indian" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2">Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="currentAddress" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Current Address</FormLabel>
                  <FormControl><Input placeholder="Street address, apartment, etc." {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="permanentAddress" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Permanent Address</FormLabel>
                  <FormControl><Input placeholder="Street address, apartment, etc." {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl><Input placeholder="Mumbai" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl><Input placeholder="Maharashtra" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="pincode" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode</FormLabel>
                  <FormControl><Input placeholder="400001" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium border-b pb-2">Identity & Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="aadharNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Aadhar Number</FormLabel>
                  <FormControl><Input placeholder="XXXX XXXX XXXX" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="panNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>PAN Number</FormLabel>
                  <FormControl><Input placeholder="ABCDE1234F" className="uppercase" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <FormControl><Input type="url" placeholder="https://linkedin.com/in/..." {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="githubUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub URL</FormLabel>
                  <FormControl><Input type="url" placeholder="https://github.com/..." {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="portfolioUrl" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Portfolio Website</FormLabel>
                  <FormControl><Input type="url" placeholder="https://..." {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={upsertMutation.isPending}>
              {upsertMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
