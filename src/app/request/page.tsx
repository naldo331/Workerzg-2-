
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, Sparkles, Loader2, MapPin, Phone, User, Calendar, DollarSign, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { CATEGORIES } from '@/app/lib/types';
import { suggestJobCategories } from '@/ai/flows/ai-powered-job-category-suggestion';
import { useAuth, useUser, addDocumentNonBlocking } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { collection, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  customerFirstName: z.string().min(2, "First name required"),
  customerLastName: z.string().min(2, "Last name required"),
  phone: z.string().min(10, "Valid phone number required"),
  location: z.string().min(5, "Full address or area required"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(20, "Please describe the job in more detail"),
  budget: z.coerce.number().min(10, "Minimum budget is $10"),
  dateTime: z.string().min(1, "Preferred date and time required"),
});

export default function RequestPage() {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerFirstName: "",
      customerLastName: "",
      phone: "",
      location: "",
      category: "",
      description: "",
      budget: 50,
      dateTime: "",
    },
  });

  const description = form.watch("description");

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (description && description.length > 30) {
        setIsSuggesting(true);
        try {
          const result = await suggestJobCategories({ jobDescription: description });
          setAiSuggestions(result.categories);
        } catch (error) {
          console.error("AI Category suggestion failed", error);
        } finally {
          setIsSuggesting(false);
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [description]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) return;

    if (!user) {
      initiateAnonymousSignIn(auth);
      toast({ title: "Authenticating", description: "Signing you in to submit your request..." });
      return;
    }

    setIsSubmitting(true);
    
    const requestData = {
      customerFirstName: values.customerFirstName,
      customerLastName: values.customerLastName,
      customerPhoneNumber: values.phone,
      customerLocation: values.location,
      customerId: user.uid,
      categoryId: values.category,
      description: values.description,
      budgetAmount: values.budget,
      budgetCurrency: 'USD',
      requestedDateTime: values.dateTime,
      postedAt: serverTimestamp(),
      status: 'OPEN',
    };

    addDocumentNonBlocking(collection(require('firebase/firestore').getFirestore(), 'job_requests'), requestData);

    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Request Sent to the Guild!",
        description: "We're reviewing your request and will notify suitable workers.",
      });
      form.reset();
    }, 1500);
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl guild-gradient text-white shadow-lg mb-4">
          <Shield className="h-6 w-6" />
        </div>
        <h1 className="text-4xl font-black">Request a Worker</h1>
        <p className="text-muted-foreground">The Guild's finest professionals are ready for your call.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-card/50 border-white/5 h-fit">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Contact Details
                </CardTitle>
                <CardDescription>Tell us who you are and where you need help.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="(555) 000-0000" {...field} />
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
                      <FormLabel>Job Location</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="123 Street Name, City" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" /> Job Details
                  </CardTitle>
                  <CardDescription>Describe what you need done.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="min-h-[120px] resize-none"
                            placeholder="Example: Need help cleaning out the garage and organizing shelving units..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {description.length > 30 && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 text-xs text-accent font-semibold uppercase tracking-wider">
                        {isSuggesting ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>AI Analyzing Description...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3" />
                            <span>AI Suggested Categories</span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.map(suggestion => (
                          <Badge 
                            key={suggestion} 
                            variant="secondary"
                            className="cursor-pointer hover:bg-primary/30 border-primary/20"
                            onClick={() => form.setValue("category", suggestion)}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <div className="flex items-center gap-2">
                                <List className="h-4 w-4 text-muted-foreground" />
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget ($)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type="number" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date & Time</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type="datetime-local" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" disabled={isSubmitting || isUserLoading} className="w-full h-14 guild-gradient text-lg font-bold shadow-xl">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Dispatching to Guild...
                  </>
                ) : user ? "Submit Request" : "Sign In to Submit"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
