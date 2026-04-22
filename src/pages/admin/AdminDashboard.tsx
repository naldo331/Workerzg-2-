import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { Users, Briefcase, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const wSnap = await getDocs(collection(db, 'workers'));
        const wData = wSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setWorkers(wData);

        const jSnap = await getDocs(collection(db, 'jobs'));
        const jData = jSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a:any, b:any) => b.createdAt - a.createdAt);
        setJobs(jData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleApproveWorker = async (workerId: string) => {
    try {
      await updateDoc(doc(db, 'workers', workerId), {
        approvalStatus: 'approved'
      });
      toast.success("Worker approved!");
      setWorkers(workers.map(w => w.id === workerId ? { ...w, approvalStatus: 'approved' } : w));
    } catch (e) {
      toast.error("Failed to approve worker.");
    }
  };

  const handleConfirmPayment = async (jobId: string) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        paymentStatus: 'paid'
      });
      toast.success("Payment confirmed!");
      setJobs(jobs.map(j => j.id === jobId ? { ...j, paymentStatus: 'paid' } : j));
    } catch (e) {
      toast.error("Failed to confirm payment.");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-zinc-100">Admin Command Center</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-full"><Users className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold text-zinc-100">{workers.length}</p><p className="text-sm font-medium text-zinc-400">Total Workers</p></div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-full"><Briefcase className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold text-zinc-100">{jobs.length}</p><p className="text-sm font-medium text-zinc-400">Total Jobs</p></div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-500/10 text-green-400 rounded-full"><DollarSign className="w-6 h-6" /></div>
          <div>
            <p className="text-2xl font-bold text-zinc-100">
              ${jobs.filter(j => j.paymentStatus === 'paid').reduce((acc, curr) => acc + curr.budget, 0).toLocaleString()}
            </p>
            <p className="text-sm font-medium text-zinc-400">Paid Volume JMD</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Pending Workers */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm overflow-hidden h-[500px] flex flex-col text-zinc-100">
          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/50">
            <h2 className="font-semibold text-lg">Pending Worker Approvals</h2>
          </div>
          <div className="overflow-y-auto p-4 space-y-4">
            {workers.filter(w => w.approvalStatus === 'pending').map(worker => (
              <div key={worker.id} className="border border-zinc-800 p-4 rounded-lg flex justify-between items-center bg-zinc-950">
                <div>
                  <p className="font-medium text-zinc-100">ID: {worker.userId.slice(0,8)}...</p>
                  <p className="text-sm text-zinc-400">{worker.category} • {worker.location}</p>
                </div>
                <button 
                  onClick={() => handleApproveWorker(worker.id)}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1.5 rounded text-sm transition-colors font-semibold"
                >
                  Approve
                </button>
              </div>
            ))}
            {workers.filter(w => w.approvalStatus === 'pending').length === 0 && (
              <p className="text-center text-zinc-500 mt-10">No pending workers.</p>
            )}
          </div>
        </div>

        {/* Jobs requiring payment confirmation */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm overflow-hidden h-[500px] flex flex-col text-zinc-100">
          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/50">
            <h2 className="font-semibold text-lg">Pending Payments</h2>
          </div>
          <div className="overflow-y-auto p-4 space-y-4">
            {jobs.filter(j => j.paymentStatus === 'pending').map(job => (
              <div key={job.id} className="border border-yellow-500/30 p-4 rounded-lg flex flex-col gap-3 bg-yellow-500/5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-zinc-100">{job.title}</p>
                    <p className="text-xs text-zinc-400">Job ID: {job.id.slice(4,12)}...</p>
                  </div>
                  <p className="font-bold text-yellow-500">${job.budget.toLocaleString()} JMD</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${job.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    Status: {job.status}
                  </span>
                  <button 
                    onClick={() => handleConfirmPayment(job.id)}
                    className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-semibold px-3 py-1.5 rounded text-sm transition-colors"
                  >
                    Confirm WiPay
                  </button>
                </div>
              </div>
            ))}
            {jobs.filter(j => j.paymentStatus === 'pending').length === 0 && (
              <p className="text-center text-gray-500 mt-10">All payments confirmed.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
