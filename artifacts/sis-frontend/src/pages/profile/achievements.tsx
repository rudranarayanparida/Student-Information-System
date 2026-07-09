import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useListAchievements, useAddAchievement, useDeleteAchievement, getListAchievementsQueryKey } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Star, Trash2, Plus, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const achievementSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  proof: z.string().url("Must be a valid URL").optional().or(z.literal('')).nullable(),
});

type AchievementValues = z.infer<typeof achievementSchema>;

export default function AchievementsProfile() {
  const { user } = useAuth();
  const studentId = user?.studentId;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: achievements, isLoading } = useListAchievements(
    studentId!,
    { query: { enabled: !!studentId, queryKey: getListAchievementsQueryKey(studentId!) } }
  );

  const addMutation = useAddAchievement();
  const deleteMutation = useDeleteAchievement();

  const form = useForm<AchievementValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: '', description: '', date: '', category: '', proof: ''
    }
  });

  const openAddDialog = () => {
    form.reset({ title: '', description: '', date: '', category: '', proof: '' });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ studentId: studentId!, achievementId: id });
      queryClient.invalidateQueries({ queryKey: getListAchievementsQueryKey(studentId!) });
      toast({ title: "Deleted", description: "Achievement removed." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete record." });
    }
  };

  const onSubmit = async (data: AchievementValues) => {
    if (!studentId) return;

    try {
      const payload = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === '' ? null : v])
      ) as any;

      await addMutation.mutateAsync({
        studentId,
        data: payload
      });
      
      queryClient.invalidateQueries({ queryKey: getListAchievementsQueryKey(studentId) });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Achievement added successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add achievement",
      });
    }
  };

  if (!studentId) return <div>No student profile found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h3 className="text-lg font-medium">Achievements & Awards</h3>
          <p className="text-sm text-muted-foreground">Showcase your competition wins, hackathons, and special recognitions.</p>
        </div>
        <Button onClick={openAddDialog} className="shrink-0"><Plus className="mr-2 h-4 w-4" /> Add Achievement</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : achievements && achievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((ach) => (
            <Card key={ach.id} className="relative group overflow-hidden border-amber-100 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-900/10 transition-all hover-elevate">
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Achievement?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently remove "{ach.title}" from your profile.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(ach.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 p-2.5 rounded-full shrink-0">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5 flex-1 pr-6">
                    <h4 className="font-semibold text-base leading-snug">{ach.title}</h4>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {ach.category && <span className="bg-background px-2 py-0.5 border rounded-full font-medium">{ach.category}</span>}
                      {ach.date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(ach.date), 'MMM yyyy')}</span>}
                    </div>
                    
                    {ach.description && (
                      <p className="text-sm text-foreground/80 pt-1 line-clamp-3">
                        {ach.description}
                      </p>
                    )}
                    
                    {ach.proof && (
                      <a href={ach.proof} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline pt-2 font-medium">
                        View Proof / Link <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-muted/20 border-dashed">
          <Star className="mx-auto h-12 w-12 text-amber-400/40 mb-3" />
          <h3 className="text-lg font-medium text-foreground">No achievements added</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Highlight your wins to make your profile stand out.</p>
          <Button onClick={openAddDialog} variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20">Add Your First Achievement</Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Achievement</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title / Award Name *</FormLabel>
                  <FormControl><Input placeholder="1st Prize - Smart India Hackathon" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl><Input placeholder="Hackathon, Sports, etc." {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="proof" render={({ field }) => (
                <FormItem>
                  <FormLabel>Link / Proof URL</FormLabel>
                  <FormControl><Input type="url" placeholder="https://..." {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Briefly describe the achievement and your role..." 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Adding..." : "Add Achievement"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
