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
  description?: string;
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
  const locationQuery = searchParams.get('location')?.toLowerCase() || '';
  const categoryQuery = searchParams.get('category')?.toLowerCase() || '';

  const [heroSearch, setHeroSearch] = useState(searchQuery);
  const [heroLocation, setHeroLocation] = useState(locationQuery);
  const [heroCategory, setHeroCategory] = useState(categoryQuery);

  const [workers, setWorkers] = useState<WorkerDisplay[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroSearch.trim()) params.set('q', heroSearch.trim());
    if (heroLocation.trim()) params.set('location', heroLocation.trim());
    if (heroCategory) params.set('category', heroCategory);
    
    navigate(`/?${params.toString()}`);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load workers
        const workersQuery = query(collection(db, 'workers'), limit(100)); // Increased limit for client side filtering
        const wSnap = await getDocs(workersQuery);
        
        let loadedWorkers: WorkerDisplay[] = [];
        
        for (const wDoc of wSnap.docs) {
          const wData = wDoc.data();
          
          // Only show approved workers OR the current user if they are a worker
          const isOwner = currentUser?.uid === wData.userId;
          if (wData.approvalStatus !== 'approved' && !isOwner) continue;

          // Fetch user profile for name/photo
          const uSnap = await getDocs(query(collection(db, 'users'), where('userId', '==', wData.userId)));
          if (!uSnap.empty) {
            const uData = uSnap.docs[0].data() as UserProfile;
            
            // Do not show suspended users in the public directory (unless they are the current user looking at their own pending card)
            if (uData.status === 'suspended' && !isOwner) continue;

            loadedWorkers.push({
              userId: wData.userId,
              name: uData.displayName,
              photoURL: uData.photoURL,
              category: wData.category,
              skills: wData.skills || [],
              description: wData.description || '',
              rating: wData.rating || 0,
              startingPrice: wData.startingPrice || 0,
              location: wData.location || 'Jamaica',
              rank: wData.rank || 'Bronze',
              isPending: wData.approvalStatus === 'pending'
            });
          }
        }
        
        // Load Open Jobs
        const jobsQuery = query(collection(db, 'jobs'), where('status', '==', 'open'), limit(100));
        const jSnap = await getDocs(jobsQuery);
        let loadedJobs: any[] = [];
        
        for (const docSnapshot of jSnap.docs) {
          const jData = { id: docSnapshot.id, ...docSnapshot.data() } as any;
          if (jData.customerId) {
            const uSnap = await getDocs(query(collection(db, 'users'), where('userId', '==', jData.customerId)));
            if (!uSnap.empty) {
              const uData = uSnap.docs[0].data();
              jData.employerName = uData.displayName;
              jData.employerPhotoURL = uData.photoURL;
            }
          }
          loadedJobs.push(jData);
        }

        // Basic client side filtering for MVP
        if (searchQuery) {
          const searchTokens = searchQuery.split(' ').filter(t => t.trim().length > 0);
          
          loadedWorkers = loadedWorkers.filter(w => {
            const workerText = `${w.name} ${w.category} ${(w.skills || []).join(' ')} ${w.description || ''} ${w.location || ''}`.toLowerCase();
            return searchTokens.every(token => workerText.includes(token));
          });
          
          loadedJobs = loadedJobs.filter((j: any) => {
            const jobText = `${j.title || ''} ${j.category || ''} ${j.description || ''} ${j.location || ''}`.toLowerCase();
            return searchTokens.every(token => jobText.includes(token));
          });
        }

        if (locationQuery) {
          loadedWorkers = loadedWorkers.filter(w => (w.location || '').toLowerCase().includes(locationQuery));
          loadedJobs = loadedJobs.filter((j: any) => (j.location || '').toLowerCase().includes(locationQuery));
        }

        if (categoryQuery) {
          loadedWorkers = loadedWorkers.filter(w => (w.category || '').toLowerCase() === categoryQuery);
          loadedJobs = loadedJobs.filter((j: any) => (j.category || '').toLowerCase() === categoryQuery);
        }

        setWorkers(loadedWorkers);
        setJobs(loadedJobs);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchQuery, locationQuery, categoryQuery, currentUser]);

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

        <div className="w-full max-w-4xl relative mb-8 mx-auto">
          <form onSubmit={handleHeroSearch} className="flex flex-col md:flex-row w-full bg-zinc-900/90 backdrop-blur-md rounded-2xl md:rounded-full shadow-2xl p-2 md:p-1.5 border border-zinc-800 gap-2 md:gap-0 items-center">
            
            <div className="flex flex-1 items-center px-4 w-full h-12 bg-zinc-800/50 md:bg-transparent rounded-xl md:rounded-none text-zinc-200 hover:bg-zinc-800/70 md:hover:bg-transparent transition-colors">
              <Search className="w-5 h-5 text-zinc-400 shrink-0" />
              <input 
                type="text" 
                placeholder="What service do you need?"
                className="w-full pl-3 focus:outline-none bg-transparent placeholder-zinc-500 text-base"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
              />
            </div>
            
            <div className="hidden md:block w-px h-6 bg-zinc-800 shrink-0"></div>
            
            <div className="flex w-full md:w-48 items-center px-4 h-12 bg-zinc-800/50 md:bg-transparent rounded-xl md:rounded-none text-zinc-200 hover:bg-zinc-800/70 md:hover:bg-transparent transition-colors">
              <select 
                className="w-full focus:outline-none bg-transparent placeholder-zinc-500 text-base cursor-pointer appearance-none"
                value={heroCategory}
                onChange={(e) => setHeroCategory(e.target.value)}
              >
                <option value="" className="bg-zinc-900 text-zinc-400">Any Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-zinc-900 text-white">
                     {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden md:block w-px h-6 bg-zinc-800 shrink-0"></div>

            <div className="flex w-full md:w-48 xl:w-56 items-center px-4 h-12 bg-zinc-800/50 md:bg-transparent rounded-xl md:rounded-none text-zinc-200 hover:bg-zinc-800/70 md:hover:bg-transparent transition-colors">
              <MapPin className="w-5 h-5 text-zinc-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Where?"
                className="w-full pl-3 focus:outline-none bg-transparent placeholder-zinc-500 text-base"
                value={heroLocation}
                onChange={(e) => setHeroLocation(e.target.value)}
              />
            </div>

            <button type="submit" className="w-full md:w-auto h-12 md:h-11 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold px-8 rounded-xl md:rounded-full transition-colors shrink-0">
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

      {/* Search Results / Lists */}
      <section className="space-y-16">
        
        {/* Workers Section */}
        <div>
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-white">
              {(searchQuery || locationQuery || categoryQuery) ? "Featured Workers" : "Featured Workers"}
            </h2>
            {!(searchQuery || locationQuery || categoryQuery) && <Link to="/search" className="text-yellow-500 font-medium hover:underline">View all</Link>}
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
              <h3 className="text-2xl font-bold text-white">No workers found</h3>
              <p className="text-zinc-400 max-w-md mx-auto">
                We couldn't find any workers matching your search criteria. Try adjusting your keywords, location or category.
              </p>
              <button 
                onClick={() => { setHeroSearch(''); setHeroLocation(''); setHeroCategory(''); navigate('/'); }}
                className="mt-4 text-yellow-500 font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {workers.map(w => (
                <Link to={`/worker/${w.userId}`} key={w.userId} className={`bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-yellow-500/50 transition-all group flex flex-col relative focus:outline-none focus:ring-2 focus:ring-yellow-500 ${w.isPending ? 'opacity-75 ring-1 ring-zinc-700' : ''}`}>
                  
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
                      <h3 className="font-bold text-lg text-zinc-100 group-hover:text-yellow-500 transition-colors">{w.name}</h3>
                      <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded text-sm font-medium text-yellow-500 shrink-0">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        {w.rating.toFixed(1)}
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-yellow-500/80 mb-2">{w.category}</p>
                    
                    {w.description && (
                      <p className="text-sm text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
                        {w.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {w.skills.slice(0,3).map((s, i) => (
                        <span key={i} className="text-[11px] font-medium bg-zinc-800/80 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700">
                          {s}
                        </span>
                      ))}
                      {w.skills.length > 3 && <span className="text-[11px] font-medium bg-zinc-800/80 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700">+{w.skills.length-3}</span>}
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-zinc-800/80 flex flex-col gap-2">
                       <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 min-w-0 truncate"><MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-500"/> {w.location || 'Not set'}</span>
                       <div className="flex justify-between items-center text-sm">
                         <div className="text-zinc-400">
                             Starting at <span className="font-bold text-white">${w.startingPrice != null ? w.startingPrice.toLocaleString() : '0'}</span> <span className="text-xs">JMD</span>
                         </div>
                       </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Available Jobs Section */}
        <div>
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-white">
              {(searchQuery || locationQuery || categoryQuery) ? "Search Results for Jobs" : "Recent Open Jobs"}
            </h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10 animate-pulse">
              <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
             <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-2xl">
               <p className="text-zinc-500">
                 {(searchQuery || locationQuery || categoryQuery) ? `No open jobs found matching your search criteria.` : "No open jobs right now."}
               </p>
               {(searchQuery || locationQuery || categoryQuery) && (
                 <button 
                   onClick={() => navigate('/')} 
                   className="mt-4 text-yellow-500 font-semibold hover:underline"
                 >
                   Clear filters
                 </button>
               )}
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {jobs.map(job => (
                 <Link to={`/job/${job.id}`} key={job.id} className="block bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-yellow-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 group">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-zinc-100 text-lg group-hover:text-yellow-500 transition-colors">{job.title}</h3>
                      <span className="font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-sm shrink-0 whitespace-nowrap">${job.budget?.toLocaleString() || '0'} JMD</span>
                   </div>
                   {job.employerName && (
                     <div className="flex items-center gap-2 mb-3">
                       {job.employerPhotoURL ? (
                         <img src={job.employerPhotoURL} alt={job.employerName} className="w-5 h-5 rounded-full object-cover shrink-0" />
                       ) : (
                         <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                           <span className="text-[10px] font-bold text-zinc-400">{job.employerName.charAt(0).toUpperCase()}</span>
                         </div>
                       )}
                       <span className="text-xs text-zinc-300 truncate">{job.employerName}</span>
                     </div>
                   )}
                   <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{job.description}</p>
                   <div className="flex flex-wrap gap-2 text-xs text-zinc-500 mt-auto">
                      <span className="bg-zinc-800 px-2 py-1 rounded">{job.category}</span>
                      <span className="bg-zinc-800 px-2 py-1 rounded flex items-center gap-1 max-w-[150px] truncate"><MapPin className="w-3 h-3 shrink-0"/> {job.location || 'Not set'}</span>
                   </div>
                 </Link>
               ))}
             </div>
          )}
        </div>
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
