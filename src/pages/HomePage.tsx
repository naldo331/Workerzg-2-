import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, limit, getDocs, where } from 'firebase/firestore';
import { useAuth, UserProfile } from '../contexts/AuthContext';
import { Search, Star, ShieldCheck, Clock, MapPin, Loader2, AlertCircle } from 'lucide-react';

interface WorkerDisplay {
  userId: string;
  name: string;
  category: string;
  skills: string[];
  rating: number;
  startingPrice: number;
  location: string;
  photoURL?: string;
  rank: string;
  isPending?: boolean;
}

const CATEGORIES = [
  { id: 'cleaning', name: 'Cleaning', icon: '🧹', desc: 'House, Office, Deep Clean' },
  { id: 'repairs', name: 'Repairs', icon: '🔧', desc: 'Plumbing, Appliances' },
  { id: 'moving', name: 'Moving', icon: '📦', desc: 'Packing, Lifting, Transport' },
  { id: 'electrical', name: 'Electrical', icon: '⚡', desc: 'Wiring, Installations' },
  { id: 'babysitting', name: 'Babysitting', icon: '👶', desc: 'Childcare, Nanny' },
  { id: 'yardwork', name: 'Yard Work', icon: '🌱', desc: 'Lawn, Gardening' },
];

export default function HomePage() {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';

  const [heroSearch, setHeroSearch] = useState(searchQuery);
  const [workers, setWorkers] = useState<WorkerDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  useEffect(() => {
    async function loadWorkers() {
      try {
        const workersQuery = query(collection(db, 'workers'), limit(10));
        const wSnap = await getDocs(workersQuery);
        
        let loaded: WorkerDisplay[] = [];
        
        for (const wDoc of wSnap.docs) {
          const wData = wDoc.data();
          
          // Only show approved workers OR the current user if they are a worker
          const isOwner = currentUser?.uid === wData.userId;
          if (wData.approvalStatus !== 'approved' && !isOwner) continue;

          // Fetch user profile for name/photo
          const uSnap = await getDocs(query(collection(db, 'users'), where('userId', '==', wData.userId)));
          if (!uSnap.empty) {
            const uData = uSnap.docs[0].data() as UserProfile;
            loaded.push({
              userId: wData.userId,
              name: uData.displayName,
              photoURL: uData.photoURL,
              category: wData.category,
              skills: wData.skills || [],
              rating: wData.rating || 0,
              startingPrice: wData.startingPrice || 0,
              location: wData.location || 'Jamaica',
              rank: wData.rank || 'Bronze',
              isPending: wData.approvalStatus === 'pending'
            });
          }
        }
        
        // Basic client side search for MVP
        if (searchQuery) {
          loaded = loaded.filter(w => 
            w.name.toLowerCase().includes(searchQuery) || 
            w.category.toLowerCase().includes(searchQuery) ||
            w.skills.some(s => s.toLowerCase().includes(searchQuery))
          );
        }

        setWorkers(loaded);
      } catch (err) {
        console.error("Error loading workers:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkers();
  }, [searchQuery]);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="bg-zinc-900/50 rounded-3xl p-8 md:p-16 flex flex-col items-center text-center mt-6 shadow-sm border border-zinc-800">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 drop-shadow-sm">
          Find Skilled Workers Instantly
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl">
          Hire trusted professionals near you in minutes. From plumbing to babysitting, we connect you with Jamaica's best.
        </p>

        <div className="w-full max-w-2xl relative mb-8">
          <form onSubmit={handleHeroSearch} className="flex w-full bg-zinc-900 rounded-full shadow-lg p-1.5 md:p-2 overflow-hidden border border-zinc-800">
            <Search className="w-6 h-6 text-zinc-500 ml-4 mt-2.5 md:mt-3 hidden sm:block" />
            <input 
              type="text" 
              placeholder="What service are you looking for?"
              className="flex-1 px-4 py-3 focus:outline-none bg-transparent text-white placeholder-zinc-500 text-sm md:text-lg min-w-0"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
            />
            <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold py-2 md:py-3 px-4 md:px-8 rounded-full transition-colors flex-shrink-0">
              Search
            </button>
          </form>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <span className="text-sm font-medium text-zinc-500 py-1">Popular:</span>
          {['Cleaning', 'Repairs', 'Moving', 'Electrical'].map(tag => (
            <Link key={tag} to={`/?q=${tag.toLowerCase()}`} className="text-sm font-medium bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full border border-zinc-700 shadow-sm hover:border-yellow-500 transition-colors">
              {tag}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Workers */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-white">Featured Workers {searchQuery && `for "${searchQuery}"`}</h2>
          {!searchQuery && <Link to="/search" className="text-yellow-500 font-medium hover:underline">View all</Link>}
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 animate-pulse">
            <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
            <p className="text-zinc-500">Finding the best workers for you...</p>
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900 shadow-inner rounded-3xl border border-zinc-800 space-y-4">
            <div className="bg-zinc-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-zinc-500">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white">No results found</h3>
            <p className="text-zinc-400 max-w-md mx-auto">
              We couldn't find any workers matching "{searchQuery}". Try searching for categories like "plumber", "cleaner", or "babysitting".
            </p>
            <button 
              onClick={() => { setHeroSearch(''); navigate('/'); }}
              className="mt-4 text-yellow-500 font-semibold hover:underline"
            >
              Clear search and view all available workers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workers.map(w => (
              <div key={w.userId} className={`bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-yellow-500/50 transition-all group flex flex-col relative ${w.isPending ? 'opacity-75 ring-1 ring-zinc-700' : ''}`}>
                
                {w.isPending && (
                  <div className="absolute top-4 right-4 z-10 bg-yellow-500/20 text-yellow-500 text-[10px] uppercase font-black px-2 py-1 rounded-full border border-yellow-500/50 flex items-center gap-1 backdrop-blur-sm">
                    <AlertCircle className="w-3 h-3" />
                    Pending Approval
                  </div>
                )}

                <div className="h-32 bg-gradient-to-r from-zinc-800 to-zinc-700 relative">
                  {/* Banner placeholder */}
                </div>
                <div className="pt-0 p-5 flex flex-col flex-1 relative">
                  <div className="absolute -top-10 bg-zinc-900 p-1 rounded-full border border-zinc-800 shadow-sm">
                    {w.photoURL ? (
                      <img src={w.photoURL} alt={w.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center text-xl font-bold text-yellow-500">
                        {w.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-zinc-100">{w.name}</h3>
                    <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded text-sm font-medium text-yellow-500">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      {w.rating.toFixed(1)}
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium text-zinc-400 mb-3">{w.category}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {w.skills.slice(0,3).map((s, i) => (
                      <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700">
                        {s}
                      </span>
                    ))}
                    {w.skills.length > 3 && <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700">+{w.skills.length-3}</span>}
                  </div>
                  
                  <div className="mt-auto pt-4 flex gap-4 text-sm text-zinc-500">
                     <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {w.location}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center text-sm">
                    <div className="text-zinc-400">
                        Starting at <span className="font-bold text-white">${w.startingPrice.toLocaleString()} JMD</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Categories Grid */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-8">Explore Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {CATEGORIES.map(cat => (
            <Link key={cat.id} to={`/?q=${cat.name.toLowerCase()}`} className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center hover:border-yellow-500/50 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <h3 className="font-semibold text-zinc-100 mb-1">{cat.name}</h3>
              <p className="text-xs text-zinc-400">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-zinc-900 border border-zinc-800 text-white rounded-3xl p-10 md:p-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-zinc-100">Why Choose Workers Guild?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1 text-zinc-100">Verified Workers</h4>
                  <p className="text-zinc-400">Every worker undergoes a background check and identity verification process.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1 text-zinc-100">Trusted Ratings</h4>
                  <p className="text-zinc-400">Read reviews and ratings from your local community before hiring.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1 text-zinc-100">On-Demand Convenience</h4>
                  <p className="text-zinc-400">Post a job in minutes and get responses from available professionals quickly.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-950 p-8 rounded-2xl border border-yellow-500/20 shadow-lg">
             <div className="flex gap-4 items-center mb-6">
                <div className="w-14 h-14 bg-zinc-800 rounded-full border border-zinc-700"></div>
                <div>
                  <p className="font-semibold text-zinc-100">Sarah T. <span className="text-zinc-500 font-normal">from Kingston</span></p>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500"/>)}
                  </div>
                </div>
             </div>
             <p className="text-zinc-300 italic text-lg opacity-90">
               "I needed a plumber urgently on a Sunday. Posted the job on Workers Guild and within 20 minutes I had someone at my door. Absolute lifesaver!"
             </p>
          </div>
        </div>
      </section>

    </div>
  );
}
