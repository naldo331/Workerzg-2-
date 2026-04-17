import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, UserCheck, Zap, Star, ArrowRight } from 'lucide-react';
import { CATEGORIES } from '@/app/lib/types';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';

export default function Home() {
  const getImg = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 lg:pt-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 max-w-2xl relative z-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium animate-in fade-in slide-in-from-left duration-500">
                <ShieldCheck className="h-4 w-4" />
                <span>Verified Trusted Workers</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tighter">
                Hire Trusted <br />
                <span className="text-accent">Workers Instantly.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Connect with the best local professionals for yard work, house cleaning, 
                repairs, and more. Transparent pricing, verified reviews, and Guild-guaranteed quality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="guild-gradient text-lg h-14 px-8 shadow-xl hover:scale-105 transition-transform text-black">
                  <Link href="/request">Request a Worker</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg h-14 px-8 border-primary/50 hover:bg-primary/10 text-primary">
                  <Link href="/join">Join the Guild</Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <span>1000+ Workers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>On-demand response</span>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block group z-10">
              <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <Image 
                  src={getImg('hero-bg')}
                  alt="Trusted Workers"
                  fill
                  className="object-cover"
                  priority
                  data-ai-hint="construction workers"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <Card className="glass-morphism border-white/20">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                          <Image src={getImg('worker-1')} alt="Worker" width={48} height={48} className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">Marcus Johnson</p>
                          <div className="flex items-center text-xs text-primary">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}
                            <span className="ml-1 text-muted-foreground">Elite Rank</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-primary/20 border-primary/30 text-primary">Available</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Popular Categories</h2>
            <p className="text-muted-foreground max-w-md">Find the right specialist for any task around your home or office.</p>
          </div>
          <Button variant="link" asChild className="text-primary hidden sm:flex items-center gap-2">
            <Link href="/workers">View all <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat} href={`/workers?category=${encodeURIComponent(cat)}`}>
              <Card className="group hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1 bg-card/50 overflow-hidden">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-semibold block">{cat}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-card/30 py-24 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold">Simple Process, Elite Results</h2>
            <p className="text-muted-foreground">Getting help from the Guild is easy and secure.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Request a Worker', desc: 'Tell us about the job. Our AI helps categorize your request and suggest the best budget range.' },
              { step: '02', title: 'Matched Instantly', desc: 'Approved workers in your area get notified. Only those with high rankings and verified skills are suggested.' },
              { step: '03', title: 'Work Completed', desc: 'Secure payment is held in escrow. Funds are released only after you approve the completed job.' }
            ].map((item, idx) => (
              <div key={idx} className="relative space-y-4 text-center">
                <div className="text-6xl font-black text-primary/5 absolute -top-8 left-1/2 -translate-x-1/2 select-none">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold relative z-10">{item.title}</h3>
                <p className="text-muted-foreground relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="rounded-3xl guild-gradient p-12 lg:p-24 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="max-w-2xl space-y-8 relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black text-black leading-tight">
              Ready to hire the best? <br />The Guild is at your service.
            </h2>
            <p className="text-black/80 text-lg">
              Stop stressing over endless searches. Join thousands of homeowners who trust 
              the Guild for their daily needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" variant="secondary" className="text-lg h-14 px-8 font-bold bg-black text-primary hover:bg-black/90">
                <Link href="/request">Hire Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg h-14 px-8 font-bold border-black/20 bg-black/5 hover:bg-black/10 text-black">
                <Link href="/workers">Explore Profiles</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
