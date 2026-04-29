import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { Users, Briefcase, DollarSign, Ban, CheckCircle, XCircle, Trash2, Shield } from 'lucide-react';
import UserProfileHeader from '../../components/profile/UserProfileHeader';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'workers' | 'jobs'>('users');

  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const uSnap = await getDocs(collection(db, 'users'));
        const uData = uSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsers(uData);

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

  const handleApproveWorker = async (workerId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'workers', workerId), { approvalStatus: status });
      toast.success(`Worker ${status}!`);
      setWorkers(workers.map(w => w.id === workerId ? { ...w, approvalStatus: status } : w));
    } catch (e) {
      toast.error("Failed to update worker status.");
    }
  };

  const handleConfirmPayment = async (jobId: string) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), { paymentStatus: 'paid' });
      toast.success("Payment confirmed!");
      setJobs(jobs.map(j => j.id === jobId ? { ...j, paymentStatus: 'paid' } : j));
    } catch (e) {
      toast.error("Failed to confirm payment.");
    }
  };

  const handleSuspendUser = async (userId: string, isSuspended: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: isSuspended ? 'active' : 'suspended' });
      toast.success(`User ${isSuspended ? 'reactivated' : 'suspended'}!`);
      setUsers(users.map(u => u.id === userId ? { ...u, status: isSuspended ? 'active' : 'suspended' } : u));
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to update user: " + e.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      
      const workerDocs = workers.filter(w => w.userId === userId);
      for (const w of workerDocs) {
        await deleteDoc(doc(db, 'workers', w.id));
      }

      toast.success("User deleted!");
      setUsers(users.filter(u => u.id !== userId));
      setWorkers(workers.filter(w => w.userId !== userId));
      setDeletingUser(null);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to delete user: " + e.message);
      setDeletingUser(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-8">
      <UserProfileHeader title="Admin Profile">
        <div className="flex bg-zinc-800/50 p-1 px-3 rounded-full text-zinc-300 text-sm">
          <Shield className="w-4 h-4 mr-1 text-purple-400 mt-0.5" />
          System Administrator
        </div>
      </UserProfileHeader>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-full"><Users className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold text-zinc-100">{users.length}</p><p className="text-sm font-medium text-zinc-400">Total Users</p></div>
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

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-6">
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-2 font-medium transition-colors ${activeTab === 'users' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Users Management
        </button>
        <button 
          onClick={() => setActiveTab('workers')}
          className={`pb-2 font-medium transition-colors ${activeTab === 'workers' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Worker Approvals
        </button>
        <button 
          onClick={() => setActiveTab('jobs')}
          className={`pb-2 font-medium transition-colors ${activeTab === 'jobs' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Jobs Monitoring
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden min-h-[500px]">
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-zinc-300">
              <thead className="bg-zinc-800/50 text-zinc-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-zinc-800/30">
                    <td className="px-6 py-4 font-medium text-zinc-100">{user.displayName}</td>
                    <td className="px-6 py-4 text-zinc-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : user.role === 'worker' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === 'suspended' ? (
                        <span className="flex items-center text-red-400 text-sm"><Ban className="w-4 h-4 mr-1"/> Suspended</span>
                      ) : (
                        <span className="flex items-center text-green-400 text-sm"><CheckCircle className="w-4 h-4 mr-1"/> Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      {user.role !== 'admin' && (
                        <>
                          <button 
                            onClick={() => handleSuspendUser(user.id, user.status === 'suspended')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition ${
                              user.status === 'suspended' 
                              ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                              : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                            }`}
                            title={user.status === 'suspended' ? 'Reactivate User' : 'Suspend User'}
                          >
                            {user.status === 'suspended' ? (
                              <><CheckCircle className="w-4 h-4"/> Reactivate</>
                            ) : (
                              <><Ban className="w-4 h-4"/> Suspend</>
                            )}
                          </button>
                          {deletingUser === user.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-red-400 font-medium mr-1 text-nowrap">Are you sure?</span>
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-bold transition"
                                title="Confirm Delete"
                              >
                                Yes
                              </button>
                              <button 
                                onClick={() => setDeletingUser(null)}
                                className="px-2.5 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded text-sm font-medium transition"
                                title="Cancel Delete"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setDeletingUser(user.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded text-sm font-medium transition"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4"/> Delete
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'workers' && (
          <div className="p-4 grid gap-4">
            {workers.filter(w => w.approvalStatus === 'pending').map(worker => {
              const u = users.find(user => user.id === worker.userId);
              return (
                <div key={worker.id} className="border border-zinc-800 p-5 rounded-xl bg-zinc-950 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <p className="font-bold text-zinc-100 text-lg">{u?.displayName || 'Unknown User'}</p>
                    <p className="text-zinc-400">{u?.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full">Category: {worker.category}</span>
                      <span className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full">Location: {worker.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApproveWorker(worker.id, 'rejected')}
                      className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium rounded-lg flex items-center transition"
                    >
                      <XCircle className="w-4 h-4 mr-2"/> Reject
                    </button>
                    <button 
                      onClick={() => handleApproveWorker(worker.id, 'approved')}
                      className="px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 font-medium rounded-lg flex items-center transition"
                    >
                      <CheckCircle className="w-4 h-4 mr-2"/> Approve
                    </button>
                  </div>
                </div>
              )
            })}
            {workers.filter(w => w.approvalStatus === 'pending').length === 0 && (
              <div className="text-center py-20 text-zinc-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No pending worker applications.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-zinc-300">
              <thead className="bg-zinc-800/50 text-zinc-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold">Job Title</th>
                  <th className="px-6 py-4 font-semibold">Assigned Worker</th>
                  <th className="px-6 py-4 font-semibold">Budget</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Payment</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {jobs.map(job => {
                  const assignedUser = job.workerId ? users.find(u => u.id === job.workerId) : null;
                  return (
                  <tr key={job.id} className="hover:bg-zinc-800/30">
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-100">{job.title}</p>
                      <p className="text-xs text-zinc-500">ID: {job.id.slice(0,8)}</p>
                    </td>
                    <td className="px-6 py-4">
                      {assignedUser ? (
                        <p className="text-sm text-zinc-300">{assignedUser.displayName}</p>
                      ) : (
                        <p className="text-sm text-zinc-500 italic">Unassigned</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-yellow-500 font-medium">${job.budget.toLocaleString()}</td>
                    <td className="px-6 py-4 capitalize text-sm">{job.status}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${job.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {job.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {job.paymentStatus === 'pending' && (
                        <button 
                          onClick={() => handleConfirmPayment(job.id)}
                          className="bg-yellow-500 text-zinc-900 px-3 py-1.5 rounded text-sm font-semibold hover:bg-yellow-400 transition"
                        >
                          Confirm
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
