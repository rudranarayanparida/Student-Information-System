import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useListExperience, useAddExperience, useUpdateExperience, useDeleteExperience, getListExperienceQueryKey, ExperienceEntryType } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Briefcase, Building2, Calendar, MapPin, Edit, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const experienceSchema = z.object({
  type: z.string().min(1, "Type is required"),
  title: z.string().min(2, "Title is required"),
  company: z.string().min(2, "Company is required"),
  location: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional().nullable(),
  stipend: z.coerce.number().optional().nullable(),
  offerLetter: z.boolean().default(false),
  completionCertificate: z.boolean().default(false),
});

type ExperienceValues = z.infer<typeof experienceSchema>;

export default function ExperienceProfile() {
  const { user } = useAuth();
  const studentId = user?.studentId;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: experiences, isLoading } = useListExperience(
    studentId!,
    { query: { enabled: !!studentId, queryKey: getListExperienceQueryKey(studentId!) } }
  );

  const addMutation = useAddExperience();
  const updateMutation = useUpdateExperience();
  const deleteMutation = useDeleteExperience();

  const form = useForm<ExperienceValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      type: 'INTERNSHIP',
      title: '', company: '', location: '', startDate: '', endDate: '',
      isCurrent: false, description: '', stipend: null,
      offerLetter: false, completionCertificate: false
    }
  });

  const isCurrent = form.watch("isCurrent");

  const openAddDialog = () => {
    setEditingId(null);
    form.reset({
      type: 'INTERNSHIP', title: '', company: '', location: '', startDate: '', endDate: '',
      isCurrent: false, description: '', stipend: null, offerLetter: false, completionCertificate: false
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (exp: any) => {
    setEditingId(exp.id);
    form.reset({
      type: exp.type,
      title: exp.title,
      company: exp.company,
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      isCurrent: exp.isCurrent || false,
      description: exp.description || '',
      stipend: exp.stipend || null,
      offerLetter: exp.offerLetter || false,
      completionCertificate: exp.completionCertificate || false
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ studentId: studentId!, experienceId: id });
      queryClient.invalidateQueries({ queryKey: getListExperienceQueryKey(studentId!) });
      toast({ title: "Deleted", description: "Experience record removed." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete record." });
    }
  };

  const onSubmit = async (data: ExperienceValues) => {
    if (!studentId) return;

    try {
      const payload = { ...data, endDate: data.isCurrent ? null : data.endDate };
      
      if (editingId) {
        await updateMutation.mutateAsync({
          studentId,
          experienceId: editingId,
          data: payload
        });
      } else {
        await addMutation.mutateAsync({
          studentId,
          data: payload
        });
      }
      
      queryClient.invalidateQueries({ queryKey: getListExperienceQueryKey(studentId) });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: `Experience ${editingId ? 'updated' : 'added'} successfully.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save record",
      });
    }
  };

  if (!studentId) return <div>No student profile found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h3 className="text-lg font-medium">Experience & Internships</h3>
          <p className="text-sm text-muted-foreground">Add your professional experiences and internships.</p>
        </div>
        <Button onClick={openAddDialog} className="shrink-0"><Plus className="mr-2 h-4 w-4" /> Add Experience</Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>
      ) : experiences && experiences.length > 0 ? (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <Card key={exp.id} className="overflow-hidden border-border/60 shadow-sm">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="bg-muted/40 p-4 sm:w-48 flex flex-col justify-center items-center text-center border-r border-border/40">
                    <Building2 className="h-8 w-8 text-primary mb-2 opacity-80" />
                    <span className="font-semibold text-sm line-clamp-2 w-full">{exp.company}</span>
                    <span className="text-xs text-muted-foreground mt-1 capitalize bg-background px-2 py-0.5 rounded-full border">
                      {exp.type.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                  <div className="p-5 flex-1 relative">
                    <div className="absolute top-4 right-4 flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => openEditDialog(exp)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. This will permanently delete this experience record.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(exp.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    
                    <h4 className="font-semibold text-lg pr-20">{exp.title}</h4>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                      {exp.location && (
                        <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {exp.location}</div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> 
                        {exp.startDate ? format(new Date(exp.startDate), 'MMM yyyy') : 'Unknown'} - 
                        {exp.isCurrent ? ' Present' : exp.endDate ? ` ${format(new Date(exp.endDate), 'MMM yyyy')}` : ' Unknown'}
                      </div>
                      {exp.stipend && (
                        <div className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> ₹{exp.stipend.toLocaleString()}/mo</div>
                      )}
                    </div>
                    
                    {exp.description && (
                      <p className="mt-4 text-sm text-foreground/80 line-clamp-3 whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                    
                    <div className="mt-4 flex gap-2">
                      {exp.offerLetter && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">Offer Letter Available</span>}
                      {exp.completionCertificate && <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded border border-emerald-200 dark:border-emerald-800">Certificate Available</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/20 border-dashed">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-lg font-medium text-foreground">No experience added</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Add your internships or projects to stand out to recruiters.</p>
          <Button onClick={openAddDialog} variant="outline">Add Your First Experience</Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="INTERNSHIP">Internship</SelectItem>
                        <SelectItem value="FULL_TIME">Full Time</SelectItem>
                        <SelectItem value="PART_TIME">Part Time</SelectItem>
                        <SelectItem value="FREELANCE">Freelance</SelectItem>
                        <SelectItem value="PROJECT">Project</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role / Title</FormLabel>
                    <FormControl><Input placeholder="Software Engineer Intern" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="company" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company / Organization</FormLabel>
                    <FormControl><Input placeholder="Google" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input placeholder="Bangalore / Remote" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <div className="space-y-2">
                  <FormField control={form.control} name="endDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl><Input type="date" disabled={isCurrent} {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="isCurrent" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-1">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I currently work here</FormLabel>
                      </div>
                    </FormItem>
                  )} />
                </div>
              </div>

              <FormField control={form.control} name="stipend" render={({ field }) => (
                <FormItem>
                  <FormLabel>Stipend/Salary (Monthly in ₹)</FormLabel>
                  <FormControl><Input type="number" placeholder="25000" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description / Responsibilities</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your role, technologies used, and impact..." 
                      className="min-h-[100px]"
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex gap-6 border rounded-md p-4 bg-muted/30">
                <FormField control={form.control} name="offerLetter" render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="font-normal cursor-pointer">Offer Letter Available</FormLabel>
                  </FormItem>
                )} />
                <FormField control={form.control} name="completionCertificate" render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="font-normal cursor-pointer">Certificate Available</FormLabel>
                  </FormItem>
                )} />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
                  {(addMutation.isPending || updateMutation.isPending) ? "Saving..." : "Save Experience"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
