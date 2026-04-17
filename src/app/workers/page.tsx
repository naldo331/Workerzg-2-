
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Search, Filter, Star, MapPin, Briefcase, ChevronRight, Verified, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORIES } from '@/app/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function WorkersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const firestore = useFirestore();

  const workerProfilesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Only show approved workers to the public
    return query(
      collection(firestore, 'worker_profiles'),
      where('status', '==', 'APPROVED')
    );
  }, [firestore]);

  const { data: workers, isLoading } = useCollection(workerProfilesQuery);

  const filteredWorkers = (workers || []).filter(worker => {
    const nameMatch = (worker.firstName + ' ' + worker.lastName).toLowerCase().includes(searchQuery.toLowerCase());
    const skillMatch = (worker.skillIds || []).some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSearch = nameMatch || skillMatch;
    
    const matchesCategory = activeCategory ? (worker.categoryIds || []).includes(activeCategory) : true;
    return matchesSearch && matchesCategory;
  });

  const getRankBadgeClass = (rank: string) => {
    switch(rank) {
      case 'Elite': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Platinum': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'Gold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Silver': return 'bg-slate-400/20 text-slate-400 border-slate-400/30';
      case 'Bronze': return 'bg-orange-700/20 text-orange-400 border-orange-700/30';
      default: return 'bg-muted text-muted-foreground border-white/5';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 space-y-6">
        <h1 className="text-4xl font-black">Find the Guild's Finest</h1>
        <p className="text-muted-foreground max-w-2xl">Browse our directory of verified professionals. All workers are background-checked and rated by customers like you.</p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by name or skill (e.g. Plumbing)..." 
              className="pl-10 h-12 bg-card/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 border-white/10 flex gap-2">
            <Filter className="h-5 w-5" /> Filters
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <Badge 
            variant={activeCategory === null ? 'default' : 'secondary'}
            className="cursor-pointer whitespace-nowrap px-4 py-2"
            onClick={() => setActiveCategory(null)}
          >
            All Services
          </Badge>
          {CATEGORIES.map(cat => (
            <Badge 
              key={cat}
              variant={activeCategory === cat ? 'default' : 'secondary'}
              className="cursor-pointer whitespace-nowrap px-4 py-2"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-medium">Summoning workers from the Guild...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWorkers.map(worker => (
            <Card key={worker.id} className="group overflow-hidden border-white/5 bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/20">
                      <Image 
                        src={worker.profileImageUrl || `https://picsum.photos/seed/${worker.id}/400/400`} 
                        alt={`${worker.firstName} ${worker.lastName}`} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                    <Badge className={cn("px-3 py-1 font-bold", getRankBadgeClass(worker.currentRank))}>
                      {worker.currentRank || 'Bronze'} Rank
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xl font-bold">{worker.firstName} {worker.lastName}</h3>
                      <Verified className="h-4 w-4 text-blue-400 fill-blue-400/20" />
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center text-yellow-500 font-bold">
                        <Star className="h-4 w-4 fill-current mr-1" />
                        {worker.averageRating?.toFixed(1) || '0.0'}
                      </div>
                      <div className="text-muted-foreground">{worker.jobsCompletedCount || 0} jobs completed</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 py-2">
                    {(worker.skillIds || []).slice(0, 3).map((skill: string) => (
                      <Badge key={skill} variant="outline" className="bg-primary/5 border-primary/10 text-xs text-primary-foreground/70">
                        {skill}
                      </Badge>
                    ))}
                    {worker.skillIds?.length > 3 && (
                      <span className="text-xs text-muted-foreground flex items-center">+{worker.skillIds.length - 3} more</span>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span>{worker.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-accent" />
                      <span>{worker.categoryIds?.[0] || 'General'} Specialist</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/20 border-t border-white/5 flex gap-2">
                  <Button asChild variant="outline" className="flex-1 text-sm border-white/10 h-10">
                    <Link href={`/workers/${worker.id}`}>Profile</Link>
                  </Button>
                  <Button asChild className="flex-1 guild-gradient text-sm font-bold h-10">
                    <Link href={`/request?category=${worker.categoryIds?.[0] || ''}&worker=${worker.id}`}>
                      Hire Now <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredWorkers.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold">No workers found matching your criteria</h2>
          <p className="text-muted-foreground">Try adjusting your search or category filters.</p>
          <Button variant="link" onClick={() => { setSearchQuery(""); setActiveCategory(null); }}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
