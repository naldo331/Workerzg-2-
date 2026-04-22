import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function CustomerDashboard() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-zinc-100">My Dashboard</h1>
        <Link 
          to="/customer/post-job" 
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          Post New Job
        </Link>
      </div>

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
            <p className="text-2xl font-bold text-zinc-100">{jobs.filter(j => j.status === 'assigned').length}</p>
            <p className="text-sm font-medium text-zinc-400">In Progress</p>
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
             <Link to="/customer/post-job" className="text-yellow-500 font-medium hover:underline mt-2 inline-block">Post your first job</Link>
           </div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {jobs.map(job => (
              <li key={job.id} className="p-6 hover:bg-zinc-800/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-zinc-100 text-lg">{job.title}</h3>
                    <div className="flex gap-3 text-sm text-zinc-400 mt-1">
                      <span>{job.category}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span className="font-medium text-zinc-300">${job.budget.toLocaleString()} JMD</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                      ${job.status === 'open' ? 'bg-blue-500/10 text-blue-400' : 
                        job.status === 'assigned' ? 'bg-yellow-500/10 text-yellow-500' : 
                        'bg-green-500/10 text-green-400'}`}
                    >
                      {job.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                      ${job.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}
                    >
                      {job.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
