import React, { useEffect, useState } from 'react';
import { useGetSkillsDetails, useUpsertSkillsDetails, getGetSkillsDetailsQueryKey } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { TagInput } from '@/components/ui/tag-input';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

export default function SkillsProfile() {
  const { user } = useAuth();
  const studentId = user?.studentId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: skillsDetails, isLoading } = useGetSkillsDetails(
    studentId!,
    { query: { enabled: !!studentId, queryKey: getGetSkillsDetailsQueryKey(studentId!) } }
  );

  const upsertMutation = useUpsertSkillsDetails();

  const [techSkills, setTechSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);

  useEffect(() => {
    if (skillsDetails) {
      setTechSkills(skillsDetails.technicalSkills || []);
      setSoftSkills(skillsDetails.softSkills || []);
      setLanguages(skillsDetails.languages || []);
      setTools(skillsDetails.tools || []);
      setCertifications(skillsDetails.certifications || []);
    }
  }, [skillsDetails]);

  const handleSave = async () => {
    if (!studentId) return;

    try {
      await upsertMutation.mutateAsync({
        studentId,
        data: {
          technicalSkills: techSkills,
          softSkills,
          languages,
          tools,
          certifications: certifications.map(c => ({
            name: c.name,
            issuer: c.issuer,
            issueDate: c.issueDate || null,
            expiryDate: c.expiryDate || null,
            credentialId: c.credentialId || null,
            credentialUrl: c.credentialUrl || null,
          }))
        }
      });
      
      queryClient.invalidateQueries({ queryKey: getGetSkillsDetailsQueryKey(studentId) });
      
      toast({
        title: "Skills Updated",
        description: "Your skills and certifications have been saved.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update skills",
      });
    }
  };

  const addCert = () => {
    setCertifications([...certifications, { name: '', issuer: '', id: Date.now() }]);
  };

  const removeCert = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const updateCert = (index: number, field: string, value: string) => {
    const newCerts = [...certifications];
    newCerts[index] = { ...newCerts[index], [field]: value };
    setCertifications(newCerts);
  };

  if (!studentId) return <div>No student profile found for this user.</div>;
  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Skills & Tools</h3>
        <p className="text-sm text-muted-foreground">Add relevant skills for better matching with placement drives.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-base font-semibold text-primary">Technical Skills</Label>
          <TagInput 
            tags={techSkills} 
            setTags={setTechSkills} 
            placeholder="e.g. Python, React, SQL..." 
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold text-primary">Tools & Frameworks</Label>
          <TagInput 
            tags={tools} 
            setTags={setTools} 
            placeholder="e.g. Git, Docker, Figma..." 
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold text-primary">Soft Skills</Label>
          <TagInput 
            tags={softSkills} 
            setTags={setSoftSkills} 
            placeholder="e.g. Leadership, Communication..." 
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold text-primary">Languages</Label>
          <TagInput 
            tags={languages} 
            setTags={setLanguages} 
            placeholder="e.g. English, Hindi, German..." 
          />
        </div>
      </div>

      <div className="pt-6 border-t">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">Certifications</h3>
            <p className="text-sm text-muted-foreground">Add verified certifications to boost your profile.</p>
          </div>
          <Button onClick={addCert} variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" /> Add Certificate</Button>
        </div>

        {certifications.length === 0 ? (
          <div className="text-center p-8 border rounded border-dashed bg-muted/10 text-muted-foreground text-sm">
            No certifications added yet.
          </div>
        ) : (
          <div className="space-y-4">
            {certifications.map((cert, idx) => (
              <Card key={cert.id || idx} className="relative overflow-visible">
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute -top-3 -right-3 h-8 w-8 rounded-full shadow-md z-10" 
                  onClick={() => removeCert(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardContent className="p-4 pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Certificate Name *</Label>
                      <Input 
                        value={cert.name} 
                        onChange={(e) => updateCert(idx, 'name', e.target.value)} 
                        placeholder="AWS Cloud Practitioner"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuing Organization *</Label>
                      <Input 
                        value={cert.issuer} 
                        onChange={(e) => updateCert(idx, 'issuer', e.target.value)} 
                        placeholder="Amazon Web Services"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Issue Date</Label>
                        <Input 
                          type="date" 
                          value={cert.issueDate?.split('T')[0] || ''} 
                          onChange={(e) => updateCert(idx, 'issueDate', e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input 
                          type="date" 
                          value={cert.expiryDate?.split('T')[0] || ''} 
                          onChange={(e) => updateCert(idx, 'expiryDate', e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Credential ID</Label>
                        <Input 
                          value={cert.credentialId || ''} 
                          onChange={(e) => updateCert(idx, 'credentialId', e.target.value)} 
                          placeholder="Credential ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Credential URL</Label>
                        <Input 
                          type="url" 
                          value={cert.credentialUrl || ''} 
                          onChange={(e) => updateCert(idx, 'credentialUrl', e.target.value)} 
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={upsertMutation.isPending}>
          {upsertMutation.isPending ? "Saving..." : "Save All Skills & Certs"}
        </Button>
      </div>
    </div>
  );
}
