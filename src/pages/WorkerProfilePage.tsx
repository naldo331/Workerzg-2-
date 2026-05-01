import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth, UserProfile } from '../contexts/AuthContext';
import { Star, MapPin, Loader2, ArrowLeft, ShieldCheck, Mail, CheckCircle, Phone, MessageCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface WorkerProfile {
  userId: string;
  category: string;
  skills: string[];
  rating: number;
  completedJobs: number;
  rank: string;
  approvalStatus: string;
  startingPrice: number;
  location: string;
  phoneNumber?: string;
  hasWhatsApp?: boolean;
}

export default function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [hasPaidJob, setHasPaidJob] = useState(false);
  const { currentUser } = useAuth(); // need to import useAuth and query, collection, where, getDocs

  useEffect(() => {
    async function fetchWorker() {
      if (!id) return;
      try {
        setLoading(true);
        // Fetch worker profile
        const workerRef = doc(db, 'workers', id);
        const workerSnap = await getDoc(workerRef);
        
        if (workerSnap.exists()) {
          setWorker(workerSnap.data() as WorkerProfile);
          
          // Fetch user profile for name and picture
          const userRef = doc(db, 'users', id);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
          }

          // Check if currentUser has paid this worker
          if (currentUser) {
            const q = query(
              collection(db, 'jobs'),
              where('customerId', '==', currentUser.uid),
              where('workerId', '==', id),
              where('paymentStatus', '==', 'paid')
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              setHasPaidJob(true);
            }
          }
        } else {
          setWorker(null);
        }
      } catch (err: any) {
        console.error("Error fetching worker:", err);
        toast.error("Failed to load worker profile");
      } finally {
        setLoading(false);
      }
    }

    fetchWorker();
  }, [id, currentUser]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
        <p className="text-zinc-500">Loading profile...</p>
      </div>
    );
  }

  if (!worker || !userProfile) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center py-20 px-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center max-w-md w-full shadow-2xl">
          <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-zinc-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Worker Not Found</h2>
          <p className="text-zinc-400 mb-8">This worker profile may have been removed or does not exist.</p>
          <Link to="/" className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold py-3 px-8 rounded-xl transition-colors inline-block w-full">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link to="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="h-48 bg-gradient-to-r from-zinc-800 to-zinc-700 relative">
          {worker.approvalStatus === 'pending' && (
            <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-500 text-xs font-bold px-3 py-1.5 rounded-full border border-yellow-500/50 backdrop-blur-sm">
              Pending Approval
            </div>
          )}
        </div>
        
        <div className="px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 mb-8 relative z-10">
            <div className="bg-zinc-900 p-1.5 rounded-full border border-zinc-800 shadow-xl shrink-0 inline-block w-fit">
              {userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt={userProfile.displayName} className="w-32 h-32 rounded-full object-cover" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-yellow-500/10 flex items-center justify-center text-4xl font-bold text-yellow-500">
                  {userProfile.displayName.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="pb-2">
              <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
                {userProfile.displayName}
                {worker.approvalStatus === 'approved' && (
                  <div title="Verified Worker">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                )}
              </h1>
              <p className="text-lg text-zinc-400 mt-1 font-medium">{worker.category}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="flex flex-wrap gap-4 text-sm font-medium">
                <div className="flex items-center justify-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg">
                  <Star className="w-4 h-4 fill-yellow-500" />
                  {worker.rating.toFixed(1)} Rating
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-700">
                  <MapPin className="w-4 h-4" />
                  {worker.location || 'Location Not Set'}
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-700">
                   <ShieldCheck className="w-4 h-4" />
                   {worker.completedJobs} Jobs Completed
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">Skills</h3>
                {worker.skills && worker.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {worker.skills.map((skill: string, index: number) => (
                      <span key={index} className="bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-700 text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 italic">No skills listed.</p>
                )}
              </div>
            </div>

            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 h-fit space-y-6">
              <div>
                <p className="text-zinc-500 text-sm font-medium mb-1">Starting Price</p>
                <div className="text-2xl font-bold text-white">
                  ${worker.startingPrice != null ? worker.startingPrice.toLocaleString() : '0'} JMD
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <Link 
                  to="/employer/post-job"
                  state={{ category: worker.category, workerId: worker.userId }}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold py-3 px-4 rounded-xl transition-colors focus:ring-2 focus:ring-yellow-500 focus:outline-none flex justify-center mt-2"
                >
                  Hire Me
                </Link>
                
                {hasPaidJob && (
                  worker.phoneNumber ? (
                    <div className="space-y-3 pt-2">
                      {worker.hasWhatsApp && (
                        <a 
                          href={`https://wa.me/${worker.phoneNumber.replace(/\D/g,'')}?text=Hi%20I%20found%20you%20on%20Workers%20Guild%20and%20I%20need%20a%20job%20done`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        >
                          <MessageCircle className="w-5 h-5" /> Contact on WhatsApp
                        </a>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3">
                        <a 
                          href={`tel:+${worker.phoneNumber.replace(/\D/g,'')}`}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-zinc-500 focus:outline-none"
                        >
                          <Phone className="w-4 h-4" /> Call Worker
                        </a>
                        <a 
                          href={`sms:+${worker.phoneNumber.replace(/\D/g,'')}`}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-zinc-500 focus:outline-none"
                        >
                          <MessageSquare className="w-4 h-4" /> Send Text
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 text-center text-zinc-500 text-sm border border-zinc-800 border-dashed rounded-xl py-4 bg-zinc-900/50">
                      Contact not available
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
