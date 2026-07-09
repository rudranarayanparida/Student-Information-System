import React from 'react';
import { useParams } from 'wouter';
import { useGetStudent, getGetStudentQueryKey, useGetPersonalDetails, getGetPersonalDetailsQueryKey, useGetAcademicDetails, getGetAcademicDetailsQueryKey, useListExperience, getListExperienceQueryKey, useGetSkillsDetails, getGetSkillsDetailsQueryKey, useListAchievements, getListAchievementsQueryKey } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Calendar, Building2, ExternalLink, GraduationCap, CheckCircle2, XCircle, Award } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentProfilePage() {
  const { id } = useParams();
  const studentId = parseInt(id || '0', 10);

  const { data: studentProfile, isLoading: isStudentLoading } = useGetStudent(studentId, { query: { enabled: !!studentId, queryKey: getGetStudentQueryKey(studentId) } });
  const student = studentProfile?.student;
  const { data: personal } = useGetPersonalDetails(studentId, { query: { enabled: !!studentId, queryKey: getGetPersonalDetailsQueryKey(studentId) } });
  const { data: academic } = useGetAcademicDetails(studentId, { query: { enabled: !!studentId, queryKey: getGetAcademicDetailsQueryKey(studentId) } });
  const { data: experience } = useListExperience(studentId, { query: { enabled: !!studentId, queryKey: getListExperienceQueryKey(studentId) } });
  const { data: skills } = useGetSkillsDetails(studentId, { query: { enabled: !!studentId, queryKey: getGetSkillsDetailsQueryKey(studentId) } });
  const { data: achievements } = useListAchievements(studentId, { query: { enabled: !!studentId, queryKey: getListAchievementsQueryKey(studentId) } });

  if (isStudentLoading) {
    return <div className="space-y-6"><Skeleton className="h-40 w-full" /><Skeleton className="h-96 w-full" /></div>;
  }

  if (!student) {
    return <div className="text-center py-20 text-muted-foreground">Student not found</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Profile Card */}
      <Card className="border-t-4 border-t-primary shadow-md overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4">
          <Badge variant={student.placementStatus === 'PLACED' ? 'default' : student.placementStatus === 'OPTED_OUT' ? 'outline' : 'secondary'} className="text-sm px-3 py-1">
            {student.placementStatus?.replace('_', ' ')}
          </Badge>
        </div>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl shrink-0">
              {student.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{student.fullName}</h1>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground font-mono text-sm">
                  <span>{student.rollNumber}</span>
                  <span>•</span>
                  <span>{student.departmentName}</span>
                  {student.year && (
                    <>
                      <span>•</span>
                      <span>Class of {student.year}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-3 text-sm">
                {student.email && <div className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-muted-foreground" /> {student.email}</div>}
                {personal?.phone && <div className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-muted-foreground" /> {personal.phone}</div>}
                {personal?.city && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-muted-foreground" /> {personal.city}{personal.state ? `, ${personal.state}` : ''}</div>}
              </div>

              {/* Links */}
              <div className="flex gap-3 pt-3">
                {personal?.linkedinUrl && <a href={personal.linkedinUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md hover:bg-blue-100 transition-colors">LinkedIn</a>}
                {personal?.githubUrl && <a href={personal.githubUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md hover:bg-slate-200 transition-colors">GitHub</a>}
                {personal?.portfolioUrl && <a href={personal.portfolioUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md hover:bg-purple-100 transition-colors">Portfolio</a>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="academic" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit">
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
        </TabsList>
        
        <TabsContent value="academic" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-3">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> Undergraduate
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Degree</div>
                    <div className="font-medium">{academic?.ugDegree || '-'} in {academic?.ugBranch || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Institute</div>
                    <div className="font-medium">{academic?.ugInstitute || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">CGPA</div>
                    <div className="text-xl font-bold text-primary">{academic?.ugCgpa ? `${academic.ugCgpa}/10` : '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Passing Year</div>
                    <div className="font-medium">{academic?.ugPassingYear || '-'}</div>
                  </div>
                </div>
                
                <div className="flex gap-6 mt-6 pt-4 border-t border-dashed">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Active Backlogs</div>
                    <div className="font-medium flex items-center gap-1.5">
                      {academic?.activeBacklogs === 0 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      {academic?.activeBacklogs || '0'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total History</div>
                    <div className="font-medium">{academic?.totalBacklogs || '0'} backlogs</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Gap Years</div>
                    <div className="font-medium">{academic?.gapYears || '0'} years</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-base">Class 12th</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground">Board</div>
                  <div className="text-sm font-medium">{academic?.twelfthBoard || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">School</div>
                  <div className="text-sm font-medium truncate">{academic?.twelfthSchool || '-'}</div>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Year</div>
                    <div className="text-sm font-medium">{academic?.twelfthYear || '-'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Percentage</div>
                    <div className="text-lg font-bold">{academic?.twelfthPercentage ? `${academic.twelfthPercentage}%` : '-'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-base">Class 10th</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground">Board</div>
                  <div className="text-sm font-medium">{academic?.tenthBoard || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">School</div>
                  <div className="text-sm font-medium truncate">{academic?.tenthSchool || '-'}</div>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Year</div>
                    <div className="text-sm font-medium">{academic?.tenthYear || '-'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Percentage</div>
                    <div className="text-lg font-bold">{academic?.tenthPercentage ? `${academic.tenthPercentage}%` : '-'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Technical Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills?.technicalSkills?.length ? skills.technicalSkills.map(s => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  )) : <span className="text-sm text-muted-foreground">No technical skills listed</span>}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tools & Frameworks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills?.tools?.length ? skills.tools.map(s => (
                    <Badge key={s} variant="outline" className="bg-muted/50">{s}</Badge>
                  )) : <span className="text-sm text-muted-foreground">No tools listed</span>}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                {skills?.certifications?.length ? (
                  <div className="space-y-4">
                    {skills.certifications.map((c, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between border-b last:border-0 pb-4 last:pb-0 gap-2">
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-sm text-muted-foreground">{c.issuer}</div>
                        </div>
                        <div className="text-sm flex items-center gap-4 sm:text-right">
                          {c.issueDate && <span className="text-muted-foreground">Issued: {format(new Date(c.issueDate), 'MMM yyyy')}</span>}
                          {c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Verify <ExternalLink className="h-3 w-3" /></a>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <span className="text-sm text-muted-foreground">No certifications listed</span>}
              </CardContent>
            </Card>

            {achievements && achievements.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Award className="h-5 w-5 text-amber-500" /> Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements.map((ach) => (
                      <div key={ach.id} className="border-l-2 border-amber-300 pl-4 py-1">
                        <div className="font-medium text-foreground">{ach.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex gap-2">
                          {ach.category && <span className="bg-muted px-1.5 rounded">{ach.category}</span>}
                          {ach.date && <span>{format(new Date(ach.date), 'MMM yyyy')}</span>}
                        </div>
                        {ach.description && <p className="text-sm text-muted-foreground mt-1.5">{ach.description}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="experience" className="mt-6">
          <Card>
            <CardHeader className="border-b bg-muted/10">
              <CardTitle className="text-lg">Experience Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {experience?.length ? (
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {experience.map((exp, i) => (
                    <div key={exp.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <Building2 className="w-4 h-4" />
                      </div>
                      
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border bg-card shadow-sm hover-elevate transition-all">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 mb-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-primary">{exp.type.replace('_', ' ')}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {exp.startDate ? format(new Date(exp.startDate), 'MMM yy') : ''} - {exp.isCurrent ? 'Present' : exp.endDate ? format(new Date(exp.endDate), 'MMM yy') : ''}
                          </span>
                        </div>
                        <h4 className="font-bold text-base leading-tight">{exp.title}</h4>
                        <div className="text-sm font-medium text-muted-foreground mb-3">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                        {exp.description && <p className="text-sm text-foreground/80 whitespace-pre-wrap">{exp.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">No experience records found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-muted-foreground">Date of Birth</div>
                  <div className="md:col-span-2 text-sm">{personal?.dateOfBirth ? format(new Date(personal.dateOfBirth), 'dd MMM yyyy') : '-'}</div>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-muted-foreground">Gender</div>
                  <div className="md:col-span-2 text-sm capitalize">{personal?.gender?.toLowerCase() || '-'}</div>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-muted-foreground">Category</div>
                  <div className="md:col-span-2 text-sm">{personal?.category || '-'}</div>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-muted-foreground">Current Address</div>
                  <div className="md:col-span-2 text-sm">{personal?.currentAddress || '-'}</div>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-muted-foreground">Permanent Address</div>
                  <div className="md:col-span-2 text-sm">{personal?.permanentAddress || '-'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
