
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, User, Phone, MapPin, Award, Briefcase, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { CATEGORIES } from '@/app/lib/types';
import { useAuth, useUser, setDocumentNonBlocking } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { doc, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  phone: z.string().min(10, "Valid phone number required"),
  location: z.string().min(5, "Service area required"),
  category: z.string().min(1, "Please select a primary category"),
  experience: z.coerce.number().min(0, "Invalid experience"),
  experienceDetails: z.string().min(20, "Please provide more details about your work history"),
  skillsInput: z.string().optional(),
});

export default function JoinPage() {
  const [skills, setSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      location: "",
      category: "",
      experience: 0,
      experienceDetails: "",
      skillsInput: "",
    },
  });

  const addSkill = () => {
    const skill = form.getValues("skillsInput")?.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      form.setValue("skillsInput", "");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) return;
    
    if (!user) {
      initiateAnonymousSignIn(auth);
      toast({ title: "Authenticating", description: "Signing you in to save your application..." });
      return;
    }

    if (skills.length === 0) {
      toast({ title: "Skills required", description: "Please add at least one specific skill.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    // Prepare WorkerProfile document
    const workerId = user.uid;
    const workerRef = doc(auth.app.options.projectId ? require('firebase/firestore').getFirestore() : null, 'worker_profiles', workerId);
    
    // We use the non-blocking helper, but we manually build the ref for clarity
    const profileData = {
      id: workerId,
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phone,
      location: values.location,
      skillIds: skills,
      categoryIds: [values.category],
      experienceYears: values.experience,
      status: 'PENDING',
      currentRank: 'Bronze',
      averageRating: 0,
      jobsCompletedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    setDocumentNonBlocking(doc(require('firebase/firestore').getFirestore(), 'worker_profiles', workerId), profileData, { merge: true });

    // Artificial delay for UI feedback
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Application Received!",
        description: "Your profile has been saved. Our Guild masters will review it soon.",
      });
      form.reset();
      setSkills([]);
    }, 1500);
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl guild-gradient text-white shadow-xl mb-4">
            <Award className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black leading-tight">Join the <br /><span className="text-accent">Guild Elite.</span></h1>
          <p className="text-muted-foreground leading-relaxed">
            The Guild isn't just a platform—it's a fraternity of elite professionals. 
            Grow your business, gain exclusive access to high-budget jobs, and rise through the ranks from Bronze to Elite.
          </p>
          
          <div className="space-y-6">
            {[
              { title: 'Higher Visibility', desc: 'Top-ranked workers appear first in search results.', icon: Shield },
              { title: 'Secure Payments', desc: 'We handle escrow so you get paid on time, every time.', icon: Shield },
              { title: 'Build Your Legacy', desc: 'Collect verified reviews and build an unshakeable reputation.', icon: Shield }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle>Worker Application</CardTitle>
                  <CardDescription>All applications are manually reviewed by our team.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-10" placeholder="Marcus" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-10" placeholder="Johnson" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="555-0000" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Area / Location</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Metropolis Downtown and Suburbs" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                                  <SelectValue placeholder="Select category" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-3">
                    <FormLabel>Specific Skills</FormLabel>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g. Drywall repair, Cabinetry..." 
                        {...form.register("skillsInput")}
                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      />
                      <Button type="button" variant="secondary" onClick={addSkill} className="shrink-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="pl-3 pr-1 py-1 gap-1 flex items-center bg-primary/20 border-primary/20">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="experienceDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Experience & Credentials</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="min-h-[100px]"
                            placeholder="Tell us about your years in the trade..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button type="submit" disabled={isSubmitting || isUserLoading} className="w-full h-14 guild-gradient text-lg font-bold shadow-xl">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting Application...
                  </>
                ) : user ? "Apply to Join the Guild" : "Sign In to Apply"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
