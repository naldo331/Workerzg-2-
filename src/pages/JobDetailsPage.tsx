import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2, ArrowLeft, MapPin, Briefcase, FileText, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchJob() {
      if (!id) return;
      try {
        setLoading(true);
        const jobRef = doc(db, 'jobs', id);
        const jobSnap = await getDoc(jobRef);
        
        if (jobSnap.exists()) {
          const jData = { id: jobSnap.id, ...jobSnap.data() } as any;
          if (jData.customerId) {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('userId', '==', jData.customerId));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const uData = querySnapshot.docs[0].data();
              jData.employerName = uData.displayName;
              jData.employerPhotoURL = uData.photoURL;
            }
          }
          setJob(jData);
        } else {
          setJob(null);
        }
      } catch (err: any) {
        console.error("Error fetching job:", err);
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
        <p className="text-zinc-500">Loading job...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center py-20 px-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center max-w-md w-full shadow-2xl">
          <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-zinc-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Job Not Found</h2>
          <p className="text-zinc-400 mb-8">This job may have been removed or does not exist.</p>
          <Link to="/" className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold py-3 px-8 rounded-xl transition-colors inline-block w-full">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link to="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 md:p-10 border-b border-zinc-800 space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-lg border border-zinc-700 text-sm font-medium">
                  {job.category}
                </span>
                {job.status === 'open' ? (
                  <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-lg border border-green-500/20 text-sm font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Open
                  </span>
                ) : (
                  <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-lg border border-orange-500/20 text-sm font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {job.status}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold text-white leading-tight">{job.title}</h1>
            </div>
            <div className="text-left md:text-right shrink-0">
               <p className="text-zinc-500 text-sm font-medium mb-1">Budget</p>
               <div className="text-3xl font-bold text-yellow-500">
                 ${job.budget != null ? job.budget.toLocaleString() : '0'} <span className="text-lg text-yellow-500/80">JMD</span>
               </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
             <span className="flex items-center gap-1.5 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800">
                <MapPin className="w-4 h-4 text-zinc-500" /> {job.location || 'Location Not Set'}
             </span>
             <span className="flex items-center gap-1.5 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800">
                <Clock className="w-4 h-4 text-zinc-500" /> Posted {new Date(job.createdAt).toLocaleDateString()}
             </span>
          </div>
          
          {job.employerName && (
             <div className="mt-6 flex items-center gap-3 p-4 bg-zinc-950 rounded-xl border border-zinc-800 shrink-0 self-start">
               {job.employerPhotoURL ? (
                 <img src={job.employerPhotoURL} alt={job.employerName} className="w-10 h-10 rounded-full object-cover shrink-0" />
               ) : (
                 <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                   <span className="text-sm font-bold text-zinc-400">{job.employerName.charAt(0).toUpperCase()}</span>
                 </div>
               )}
               <div className="flex flex-col">
                 <span className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Employer</span>
                 <span className="text-sm text-zinc-100 font-bold">{job.employerName}</span>
               </div>
             </div>
          )}
        </div>

        <div className="p-8 md:p-10 space-y-8 bg-zinc-950/30">
          <div>
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-zinc-500" /> Job Description
             </h3>
             <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
               {job.description}
             </div>
          </div>

          {job.status === 'open' && (
            <div className="pt-6 flex flex-wrap gap-4">
              {currentUser?.uid !== job.customerId && (
                <button 
                  onClick={() => toast.success("Apply feature coming soon!")}
                  className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold py-4 px-10 rounded-xl transition-colors focus:ring-2 focus:ring-yellow-500 focus:outline-none text-lg"
                >
                  Apply for this Job
                </button>
              )}
              {currentUser?.uid === job.customerId && (
                <Link
                  to={`/employer/edit-job/${job.id}`}
                  className="w-full md:w-auto bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-bold py-4 px-10 rounded-xl transition-colors focus:ring-2 focus:ring-yellow-500 focus:outline-none text-lg text-center"
                >
                  Edit Job
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
