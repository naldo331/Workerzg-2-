import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import UserProfileHeader from '../../components/profile/UserProfileHeader';
import DisputeModal from '../../components/ui/DisputeModal';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [disputeModalJobId, setDisputeModalJobId] = useState<string | null>(null);

  const handleSimulatePayment = async (jobId: string) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        status: 'in_progress',
        paymentStatus: 'paid',
        updatedAt: Date.now()
      });
      toast.success("Payment secured. Funds held by Workers Guild.");
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'in_progress', paymentStatus: 'paid' } : j));
    } catch (e: any) {
      toast.error("Payment failed: " + e.message);
    }
  };

  const handleConfirmCompletion = async (jobId: string) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        status: 'completed',
        updatedAt: Date.now()
      });
      toast.success("Job confirmed completed! Payment released to worker.");
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'completed' } : j));
    } catch (e: any) {
      toast.error("Failed to confirm completion: " + e.message);
    }
  };

  useEffect(() => {
    async function loadJobs() {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'jobs'),
          where('customerId', '==', currentUser.uid)
        );
        const snap = await getDocs(q);
        const loadedJobs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        loadedJobs.sort((a: any, b: any) => b.createdAt - a.createdAt);
        setJobs(loadedJobs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <UserProfileHeader title="My Profile">
        <Link 
          to="/employer/post-job" 
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          Post New Job
        </Link>
      </UserProfileHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-full">
             <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-100">{jobs.filter(j => j.status === 'open').length}</p>
            <p className="text-sm font-medium text-zinc-400">Open Jobs</p>
          </div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-full">
             <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-100">{jobs.filter(j => ['in_progress', 'awaiting_payment', 'awaiting_confirmation'].includes(j.status)).length}</p>
            <p className="text-sm font-medium text-zinc-400">Active Jobs</p>
          </div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-500/10 text-green-400 rounded-full">
             <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-100">{jobs.filter(j => j.status === 'completed').length}</p>
            <p className="text-sm font-medium text-zinc-400">Completed</p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 overflow-hidden text-zinc-100">
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/50">
          <h2 className="font-semibold text-lg">My Posted Jobs</h2>
        </div>
        
        {loading ? (
           <div className="p-8 flex justify-center">
             <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
           </div>
        ) : jobs.length === 0 ? (
           <div className="p-12 text-center text-zinc-500">
             <p>You haven't posted any jobs yet.</p>
             <Link to="/employer/post-job" className="text-yellow-500 font-medium hover:underline mt-2 inline-block">Post your first job</Link>
           </div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {jobs.map(job => (
              <li key={job.id} className="p-6 hover:bg-zinc-800/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <Link to={`/job/${job.id}`} className="hover:text-yellow-500 transition-colors">
                      <h3 className="font-bold text-zinc-100 text-lg">{job.title}</h3>
                    </Link>
                    <div className="flex gap-3 text-sm text-zinc-400 mt-1">
                      <span>{job.category}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span className="font-medium text-zinc-300">${job.budget.toLocaleString()} JMD</span>
                    </div>
                  </div>
                  <div className="flex-1 w-full mt-4 md:mt-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                        ${job.status === 'completed' ? 'bg-green-500/10 text-green-400' : 
                          job.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                          job.status === 'awaiting_confirmation' ? 'bg-purple-500/10 text-purple-400' :
                          job.status === 'disputed' ? 'bg-red-500/10 text-red-500' :
                          job.status === 'awaiting_payment' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-zinc-800 text-zinc-300'}`}
                      >
                        {job.status.replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                        ${job.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}
                      >
                        {job.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                      {job.status === 'open' && (
                        <Link 
                          to={`/employer/edit-job/${job.id}`} 
                          className="px-3 py-1 rounded-full text-xs font-semibold capitalize bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-colors"
                        >
                          Edit
                        </Link>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800 space-y-3">
                      {job.status === 'awaiting_payment' && (
                        <div className="space-y-3">
                          <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-sm text-yellow-500">
                            Your payment is secure and will NOT be released to the worker until the job is completed and confirmed.
                          </div>
                          <button 
                            onClick={() => handleSimulatePayment(job.id)} 
                            className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold px-4 py-2 rounded-lg transition-colors w-full md:w-auto"
                          >
                            Pay Upfront to Secure Work
                          </button>
                        </div>
                      )}

                      {job.status === 'in_progress' && (
                        <div className="space-y-3">
                          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-sm text-blue-400">
                            Payment secured. Funds are safely held by Workers Guild until job completion.
                          </div>
                          {job.workerId && (
                            <div className="flex flex-col gap-1 p-3 bg-zinc-950 rounded border border-zinc-800 text-sm">
                               <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Contact Details Unlocked</p>
                               <span className="text-zinc-300">You may now contact your worker directly to begin the job.</span>
                               <span className="text-zinc-400">Use WhatsApp or Phone based on their profile contacts.</span>
                            </div>
                          )}
                          <div className="flex gap-3">
                            <button onClick={() => setDisputeModalJobId(job.id)} className="text-xs text-red-400 hover:text-red-300 underline mt-2">Report Issue</button>
                            <button onClick={() => handleConfirmCompletion(job.id)} className="text-sm bg-green-500 hover:bg-green-400 text-white font-bold px-4 py-2 rounded-lg transition">Confirm Completion</button>
                          </div>
                        </div>
                      )}

                      {job.status === 'awaiting_confirmation' && (
                        <div className="space-y-3">
                          <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-sm text-green-400">
                            Worker marked job as completed. If no action is taken, payment will be automatically released.
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => setDisputeModalJobId(job.id)} className="text-xs text-red-400 hover:text-red-300 underline mt-2">Report Issue</button>
                            <button onClick={() => handleConfirmCompletion(job.id)} className="text-sm bg-green-500 hover:bg-green-400 text-white font-bold px-4 py-2 rounded-lg transition">Confirm Job Completion</button>
                          </div>
                        </div>
                      )}

                      {job.status === 'disputed' && (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm text-red-400">
                          Job is currently in dispute. Platform admin is reviewing the case. Your funds are secured.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DisputeModal
        isOpen={!!disputeModalJobId}
        onClose={() => setDisputeModalJobId(null)}
        jobId={disputeModalJobId!}
        onDisputeRaised={() => {
          setJobs(jobs.map(j => j.id === disputeModalJobId ? { ...j, status: 'disputed' } : j));
        }}
      />
    </div>
  );
}
