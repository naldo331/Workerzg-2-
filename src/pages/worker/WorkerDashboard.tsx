import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserProfileHeader from '../../components/profile/UserProfileHeader';

export default function WorkerDashboard() {
  const { currentUser } = useAuth();
  
  const [openJobs, setOpenJobs] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load jobs
  useEffect(() => {
    async function fetchJobs() {
      if (!currentUser) return;
      try {
        // Fetch open jobs
        const qOpen = query(collection(db, 'jobs'), where('status', '==', 'open'));
        const snapOpen = await getDocs(qOpen);
        let loadedOpen = snapOpen.docs.map(d => ({ id: d.id, ...d.data() } as any));

        // Fetch my assigned jobs
        const qMine = query(collection(db, 'jobs'), where('workerId', '==', currentUser.uid));
        const snapMine = await getDocs(qMine);
        let loadedMine = snapMine.docs.map(d => ({ id: d.id, ...d.data() } as any));
        
        const allJobs = [...loadedOpen, ...loadedMine];
        const employerIds = Array.from(new Set(allJobs.map(j => j.customerId).filter(id => id)));
        
        const employersMap: Record<string, any> = {};
        for(const eId of employerIds) {
          const uSnap = await getDocs(query(collection(db, 'users'), where('userId', '==', eId)));
          if(!uSnap.empty) {
            employersMap[eId] = uSnap.docs[0].data();
          }
        }
        
        loadedOpen = loadedOpen.map(j => ({
          ...j,
          employerName: employersMap[j.customerId]?.displayName,
          employerPhotoURL: employersMap[j.customerId]?.photoURL
        }));
        
        loadedMine = loadedMine.map(j => ({
          ...j,
          employerName: employersMap[j.customerId]?.displayName,
          employerPhotoURL: employersMap[j.customerId]?.photoURL
        }));

        setOpenJobs(loadedOpen.sort((a, b) => b.createdAt - a.createdAt));
        setMyJobs(loadedMine.sort((a, b) => b.createdAt - a.createdAt));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [currentUser]);

  const handleAcceptJob = async (jobId: string) => {
    if (!currentUser) return;
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        status: 'assigned',
        workerId: currentUser.uid,
        updatedAt: Date.now()
      });
      toast.success("Job accepted successfully!");
      // Optimistic update
      const job = openJobs.find(j => j.id === jobId);
      if (job) {
        setOpenJobs(openJobs.filter(j => j.id !== jobId));
        setMyJobs([{ ...job, status: 'assigned', workerId: currentUser.uid }, ...myJobs]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to accept job. It may be taken.");
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    if (!currentUser) return;
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        status: 'completed',
        updatedAt: Date.now()
      });
      toast.success("Job marked as completed!");
      setMyJobs(myJobs.map(j => j.id === jobId ? { ...j, status: 'completed' } : j));
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete job.");
    }
  };

  return (
    <div className="space-y-8">
      
      <UserProfileHeader title="Worker Profile">
        <Link 
          to="/worker/profile/edit"
          className="inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 rounded-lg border border-zinc-700 transition-colors"
        >
          <Pencil className="w-4 h-4 text-yellow-500" />
          <span className="font-medium text-sm">Edit Profile</span>
        </Link>
      </UserProfileHeader>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Available Jobs */}
        <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 flex flex-col h-[600px] text-zinc-100">
          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/50">
            <h2 className="font-semibold text-lg text-zinc-100">Available Jobs</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : openJobs.length === 0 ? (
              <p className="text-center text-zinc-500 py-20">No open jobs available right now.</p>
            ) : (
              <div className="space-y-3">
                {openJobs.map(job => (
                  <div key={job.id} className="p-4 border border-zinc-800 rounded-lg hover:border-yellow-500 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-zinc-100">{job.title}</h3>
                      <span className="font-bold text-yellow-500">${job.budget.toLocaleString()} JMD</span>
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
                    <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex justify-between items-end">
                      <div className="text-xs text-zinc-500">
                        <p>{job.category} • {job.location}</p>
                      </div>
                      <button 
                        onClick={() => handleAcceptJob(job.id)}
                        className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 px-4 py-1.5 rounded text-sm font-semibold transition-colors"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Jobs */}
        <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 flex flex-col h-[600px] text-zinc-100">
          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/50">
            <h2 className="font-semibold text-lg text-zinc-100">My Active & Completed Jobs</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : myJobs.length === 0 ? (
              <p className="text-center text-zinc-500 py-20">You haven't accepted any jobs yet.</p>
            ) : (
              <div className="space-y-3">
                {myJobs.map(job => (
                  <div key={job.id} className={`p-4 border rounded-lg ${job.status === 'completed' ? 'bg-zinc-950 border-zinc-800' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-zinc-100">{job.title}</h3>
                      <div className="text-right">
                        <span className="font-bold text-zinc-100">${job.budget.toLocaleString()} JMD</span>
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${job.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                            {job.status}
                          </span>
                        </div>
                      </div>
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
                    <p className="text-sm text-zinc-400 mb-3">{job.location}</p>
                    
                    {job.status === 'assigned' && (
                      <div className="pt-3 border-t border-zinc-800 flex justify-end">
                        <button 
                          onClick={() => handleCompleteJob(job.id)}
                          className="text-sm bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-md font-semibold transition-colors"
                        >
                          Mark as Completed
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
