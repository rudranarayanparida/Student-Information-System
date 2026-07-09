import React, { useState } from 'react';
import { useListDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment, getListDepartmentsQueryKey } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Building2, Edit, Plus, Trash2 } from 'lucide-react';

const deptSchema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required").toUpperCase(),
  headName: z.string().optional().nullable(),
});

type DeptValues = z.infer<typeof deptSchema>;

export default function DepartmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: departments, isLoading } = useListDepartments();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const form = useForm<DeptValues>({
    resolver: zodResolver(deptSchema),
    defaultValues: { name: '', code: '', headName: '' }
  });

  const openAddDialog = () => {
    setEditingId(null);
    form.reset({ name: '', code: '', headName: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (dept: any) => {
    setEditingId(dept.id);
    form.reset({ name: dept.name, code: dept.code, headName: dept.headName || '' });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ departmentId: id });
      queryClient.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });
      toast({ title: "Deleted", description: "Department removed successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete" });
    }
  };

  const onSubmit = async (data: DeptValues) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ departmentId: editingId, data });
      } else {
        await createMutation.mutateAsync({ data });
      }
      queryClient.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });
      setIsDialogOpen(false);
      toast({ title: "Success", description: `Department ${editingId ? 'updated' : 'created'} successfully.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Operation failed" });
    }
  };

  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'CENTRAL_PLACEMENT') {
    return <div>Access Denied</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground">Manage academic departments and programs.</p>
        </div>
        {user.role === 'SUPER_ADMIN' && (
          <Button onClick={openAddDialog}><Plus className="mr-2 h-4 w-4" /> Add Department</Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>HOD</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">Placed</TableHead>
                {user.role === 'SUPER_ADMIN' && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : departments?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">No departments found.</TableCell></TableRow>
              ) : (
                departments?.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-mono font-medium">{dept.code}</TableCell>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.headName || '-'}</TableCell>
                    <TableCell className="text-right">{dept.studentCount || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {dept.placedCount || 0}
                        {dept.studentCount ? (
                          <span className="text-xs text-muted-foreground">({Math.round(((dept.placedCount || 0) / dept.studentCount) * 100)}%)</span>
                        ) : null}
                      </div>
                    </TableCell>
                    {user.role === 'SUPER_ADMIN' && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(dept)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Department</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure? This action cannot be undone. You cannot delete a department that has associated users or students.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(dept.id)} className="bg-destructive">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Department' : 'Add Department'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Code *</FormLabel>
                  <FormControl><Input placeholder="CSE" className="uppercase" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name *</FormLabel>
                  <FormControl><Input placeholder="Computer Science and Engineering" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="headName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Head of Department (HOD)</FormLabel>
                  <FormControl><Input placeholder="Dr. John Doe" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  Save Department
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
