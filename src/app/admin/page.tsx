
"use client";

import { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  ShieldCheck, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  BrainCircuit,
  Plus,
  Loader2,
  Lock
} from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { recommendWorkers } from '@/ai/flows/ai-worker-recommendation';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, useUser, useAuth } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export default function AdminPage() {
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, {id: string, reason: string}[]>>({});
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();

  // Fetch Jobs - Only if user is logged in
  const jobsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'job_requests'), orderBy('postedAt', 'desc'));
  }, [firestore, user]);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(jobsQuery);

  // Fetch Workers - Only if user is logged in
  const workersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'worker_profiles'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);
  const { data: workers, isLoading: isWorkersLoading } = useCollection(workersQuery);

  const handleRecommend = async (job: any) => {
    if (!workers) return;
    setIsAnalyzing(job.id);
    try {
      const result = await recommendWorkers({
        jobDescription: job.description,
        requiredSkills: [job.categoryId],
        jobLocation: job.customerLocation,
        budget: job.budgetAmount,
        date: job.requestedDateTime.split('T')[0],
        time: job.requestedDateTime.split('T')[1],
        availableWorkers: workers
          .filter(w => w.status === 'APPROVED')
          .map(w => ({
            id: w.id,
            name: `${w.firstName} ${w.lastName}`,
            skills: w.skillIds || [],
            location: w.location,
            rating: w.averageRating || 5,
            rank: w.currentRank || 'Bronze',
            availability: 'General'
          }))
      });
      
      setRecommendations(prev => ({ ...prev, [job.id]: result.recommendedWorkers }));
      toast({
        title: "AI Analysis Complete",
        description: `Found ${result.recommendedWorkers.length} matching workers.`,
      });
    } catch (error) {
      console.error("AI Recommendation Error:", error);
      toast({
        title: "AI Recommendation Failed",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(null);
    }
  };

  const handleApproveWorker = (workerId: string) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'worker_profiles', workerId), { status: 'APPROVED' });
    toast({ title: "Worker Approved", description: "The worker is now visible in the Guild directory." });
  };

  const handleRejectWorker = (workerId: string) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'worker_profiles', workerId), { status: 'REJECTED' });
    toast({ title: "Worker Rejected", variant: "destructive" });
  };

  if (isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Verifying Guild credentials...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Lock className="h-10 w-10" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-3xl font-black">Restricted Access</h1>
          <p className="text-muted-foreground">This dashboard is reserved for Guild Administrators. Please sign in to continue.</p>
        </div>
        <Button onClick={() => initiateAnonymousSignIn(auth)} className="guild-gradient px-8 h-12 font-bold shadow-xl">
          Sign In as Admin
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black">Guild Dashboard</h1>
          <p className="text-muted-foreground">Monitor jobs, workers, and marketplace health.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10"><Settings className="mr-2 h-4 w-4" /> Settings</Button>
          <Button className="guild-gradient"><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Market Revenue', value: '$12,450', icon: Briefcase, color: 'text-emerald-400' },
          { title: 'Open Requests', value: jobs?.filter(j => j.status === 'OPEN').length || 0, icon: Clock, color: 'text-amber-400' },
          { title: 'Total Workers', value: workers?.length || 0, icon: Users, color: 'text-blue-400' },
          { title: 'Trust Score', value: '98%', icon: ShieldCheck, color: 'text-purple-400' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/50 border-white/5 shadow-xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={cn("p-2 rounded-lg bg-background border border-white/5", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="jobs" className="space-y-8">
        <TabsList className="bg-background border border-white/5 p-1 h-12">
          <TabsTrigger value="jobs" className="h-10 px-6 font-bold">Job Requests</TabsTrigger>
          <TabsTrigger value="workers" className="h-10 px-6 font-bold">Worker Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle>Recent Job Requests</CardTitle>
              <CardDescription>Review and assign workers to incoming job requests.</CardDescription>
            </CardHeader>
            <CardContent>
              {isJobsLoading ? (
                <div className="py-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-white/5">
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs?.map((job) => (
                      <TableRow key={job.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell>
                          <div>
                            <p className="font-bold">{job.customerFirstName} {job.customerLastName}</p>
                            <p className="text-xs text-muted-foreground">{job.customerLocation}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-primary/20 text-primary-foreground border-primary/20">
                            {job.categoryId}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">${job.budgetAmount}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            job.status === 'OPEN' ? 'text-amber-400 border-amber-400/30' : 'text-emerald-400 border-emerald-400/30'
                          )}>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {job.status === 'OPEN' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-accent/10 hover:bg-accent/20 border-accent/30 text-accent font-bold"
                              onClick={() => handleRecommend(job)}
                              disabled={isAnalyzing === job.id}
                            >
                              {isAnalyzing === job.id ? <Clock className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4 mr-1" />}
                              AI Suggest
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><ExternalLink className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              {Object.keys(recommendations).length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-accent" /> AI Recommended Workers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(recommendations).map(([jobId, recs]) => (
                      recs.map((rec, i) => {
                        const worker = workers?.find(w => w.id === rec.id);
                        return (
                          <div key={`${jobId}-${i}`} className="p-4 rounded-xl bg-accent/5 border border-accent/20 flex gap-4 animate-in slide-in-from-bottom-2 duration-500">
                            <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center text-accent">
                              <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-bold">{worker?.firstName} {worker?.lastName} <span className="text-xs font-normal text-muted-foreground">({worker?.currentRank} Rank)</span></p>
                              <p className="text-xs text-muted-foreground line-clamp-2 italic">"{rec.reason}"</p>
                              <Button size="sm" className="mt-2 h-7 text-[10px] guild-gradient px-4">Assign Worker</Button>
                            </div>
                          </div>
                        );
                      })
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workers">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle>Worker Applications</CardTitle>
              <CardDescription>Review new applications and verify skills before approval.</CardDescription>
            </CardHeader>
            <CardContent>
              {isWorkersLoading ? (
                <div className="py-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
              ) : (
                <div className="space-y-4">
                  {workers?.map((worker) => (
                    <div key={worker.id} className="p-4 rounded-xl border border-white/5 bg-background flex items-center justify-between group hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted relative">
                          <Image src={worker.profileImageUrl || `https://picsum.photos/seed/${worker.id}/400/400`} alt={worker.firstName} fill className="object-cover" />
                        </div>
                        <div>
                          <h4 className="font-bold">{worker.firstName} {worker.lastName}</h4>
                          <p className="text-xs text-muted-foreground">{worker.categoryIds?.[0]} • {worker.location}</p>
                          <Badge variant="outline" className="text-[10px] mt-1 h-4">{worker.status}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                          {worker.status !== 'APPROVED' && (
                            <Button size="icon" variant="ghost" className="h-9 w-9 text-emerald-500 hover:bg-emerald-500/10" onClick={() => handleApproveWorker(worker.id)}>
                              <CheckCircle2 className="h-5 w-5" />
                            </Button>
                          )}
                          {worker.status !== 'REJECTED' && (
                            <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => handleRejectWorker(worker.id)}>
                              <XCircle className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {workers?.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">No worker applications found.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
