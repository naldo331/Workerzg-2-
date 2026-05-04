import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { Users, Briefcase, DollarSign, Ban, CheckCircle, XCircle, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserProfileHeader from '../../components/profile/UserProfileHeader';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'workers' | 'jobs' | 'disputes'>('users');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const openConfirm = (title: string, message: string, onConfirm: () => void, confirmText = "Confirm", isDestructive = true) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm, confirmText, isDestructive });
  };
  const closeConfirm = () => setConfirmDialog(prev => ({ ...prev, isOpen: false }));

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

        const dSnap = await getDocs(collection(db, 'disputes'));
        const dData = dSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a:any, b:any) => b.createdAt - a.createdAt);
        setDisputes(dData);

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
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to delete user: " + e.message);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      toast.success("Job deleted!");
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to delete job: " + e.message);
    }
  };

  const handleResolveDispute = async (disputeId: string, jobId: string, action: 'release_worker' | 'refund_client') => {
    try {
      // update dispute
      await updateDoc(doc(db, 'disputes', disputeId), { status: 'resolved', resolution: action });
      // update job
      await updateDoc(doc(db, 'jobs', jobId), {
        status: action === 'release_worker' ? 'completed' : 'cancelled', // Or whatever terminal status 
        paymentStatus: action === 'refund_client' ? 'refunded' : 'paid',
        updatedAt: Date.now()
      });
      toast.success(`Dispute resolved: ${action === 'release_worker' ? 'Paid to worker' : 'Refunded to client'}`);
      setDisputes(disputes.map(d => d.id === disputeId ? { ...d, status: 'resolved', resolution: action } : d));
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: action === 'release_worker' ? 'completed' : 'cancelled' } : j));
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to resolve dispute");
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
          className={`pb-2 font-medium transition-colors flex items-center gap-2 ${activeTab === 'jobs' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Jobs Monitoring
        </button>
        <button 
          onClick={() => setActiveTab('disputes')}
          className={`pb-2 font-medium transition-colors flex items-center gap-2 ${activeTab === 'disputes' ? 'text-red-500 border-b-2 border-red-500' : 'text-zinc-500 hover:text-red-400'}`}
        >
          Disputes {disputes.filter(d => d.status === 'open').length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{disputes.filter(d => d.status === 'open').length}</span>}
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
                            onClick={() => openConfirm(
                              user.status === 'suspended' ? 'Reactivate User' : 'Suspend User',
                              `Are you sure you want to ${user.status === 'suspended' ? 'reactivate' : 'suspend'} ${user.displayName}?`,
                              () => {
                                handleSuspendUser(user.id, user.status === 'suspended');
                                closeConfirm();
                              },
                              user.status === 'suspended' ? 'Reactivate' : 'Suspend',
                              user.status !== 'suspended'
                            )}
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
                          <button 
                            onClick={() => openConfirm(
                              'Delete User',
                              `Are you sure you want to completely delete ${user.displayName}? This action cannot be reversed.`,
                              () => {
                                handleDeleteUser(user.id);
                                closeConfirm();
                              },
                              'Delete User',
                              true
                            )}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded text-sm font-medium transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4"/> Delete
                          </button>
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
          <div className="flex flex-col">
            <div className="flex gap-4 p-4 border-b border-zinc-800 bg-zinc-800/20 overflow-x-auto">
              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex flex-col min-w-[140px]">
                <span className="text-sm font-medium text-zinc-400">Total Jobs</span>
                <span className="text-2xl font-bold text-zinc-100">{jobs.length}</span>
              </div>
              <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20 flex flex-col min-w-[140px]">
                <span className="text-sm font-medium text-yellow-500">In Progress</span>
                <span className="text-2xl font-bold text-yellow-500">{jobs.filter(j => j.status === 'in_progress').length}</span>
              </div>
              <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20 flex flex-col min-w-[140px]">
                <span className="text-sm font-medium text-purple-400">Worker Finished</span>
                <span className="text-2xl font-bold text-purple-400">{jobs.filter(j => j.status === 'awaiting_confirmation').length}</span>
                <span className="text-xs text-purple-400/60 mt-1">Awaiting Client</span>
              </div>
              <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20 flex flex-col min-w-[140px]">
                <span className="text-sm font-medium text-green-400">Fully Completed</span>
                <span className="text-2xl font-bold text-green-400">{jobs.filter(j => j.status === 'completed').length}</span>
                <span className="text-xs text-green-400/60 mt-1">Funds Released</span>
              </div>
            </div>
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
                  const isExpanded = expandedJobId === job.id;
                  
                  return (
                  <React.Fragment key={job.id}>
                  <tr className="hover:bg-zinc-800/30 cursor-pointer" onClick={() => setExpandedJobId(isExpanded ? null : job.id)}>
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
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize flex w-fit gap-1 items-center
                        ${job.status === 'completed' ? 'bg-green-500/10 text-green-400' : 
                          job.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                          job.status === 'awaiting_confirmation' ? 'bg-purple-500/10 text-purple-400' :
                          job.status === 'disputed' ? 'bg-red-500/10 text-red-500' :
                          job.status === 'awaiting_payment' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-zinc-800 text-zinc-300'}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${job.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {job.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      {job.paymentStatus === 'pending' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleConfirmPayment(job.id); }}
                          className="bg-yellow-500 text-zinc-900 px-3 py-1.5 rounded text-sm font-semibold hover:bg-yellow-400 transition"
                        >
                          Confirm
                        </button>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openConfirm(
                          'Delete Job',
                          `Are you sure you want to delete the job "${job.title}"? This cannot be undone.`,
                          () => {
                            handleDeleteJob(job.id);
                            closeConfirm();
                          },
                          'Delete Job',
                          true
                          );
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded text-sm font-medium transition"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4"/> Delete
                      </button>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-zinc-800/20 border-b border-zinc-800">
                      <td colSpan={6} className="px-6 py-6">
                        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
                           <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                              <h4 className="text-zinc-100 font-semibold flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Job Completion Status
                              </h4>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-6">
                             {/* Worker Section */}
                             <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-3">
                               <div className="flex items-center gap-2 text-zinc-400 font-medium text-sm mb-4">
                                  <span>Worker Status</span>
                               </div>
                               
                               {job.workerId ? (
                                  <>
                                    <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                                        ${['awaiting_confirmation', 'completed'].includes(job.status) ? 'bg-green-500/20 text-green-500' : 'bg-zinc-800 text-zinc-500'}
                                      `}>
                                        <CheckCircle className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-zinc-300">
                                          {['awaiting_confirmation', 'completed'].includes(job.status) ? 'Marked as Done' : 'Working / Pending'}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                          {['awaiting_confirmation', 'completed'].includes(job.status) 
                                            ? 'The worker has indicated the job is complete.' 
                                            : 'The worker has not yet completed the job.'}
                                        </p>
                                      </div>
                                    </div>
                                  </>
                               ) : (
                                 <div className="text-sm text-zinc-500 italic p-3">No worker assigned yet.</div>
                               )}
                             </div>
                             
                             {/* Employer Section */}
                             <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-3">
                               <div className="flex items-center gap-2 text-zinc-400 font-medium text-sm mb-4">
                                  <span>Employer Status</span>
                               </div>
                               
                               <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                                    ${job.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-zinc-800 text-zinc-500'}
                                  `}>
                                    <CheckCircle className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-zinc-300">
                                      {job.status === 'completed' ? 'Confirmed Complete' : 'Awaiting Confirmation'}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                      {job.status === 'completed' 
                                        ? 'The employer confirmed the job is finished.' 
                                        : 'The employer has not yet confirmed completion.'}
                                    </p>
                                  </div>
                                </div>
                             </div>
                           </div>
                           
                           {/* Details context string */}
                          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-sm text-blue-400 flex items-start gap-3 mt-2">
                             <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                             <p>
                               Once a worker marks the job as done, the status becomes <strong>Awaiting Confirmation</strong>. 
                               If the employer confirms, or if 24-48 hours pass without a dispute, the platform auto-releases the funds.
                             </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
        )}
        
        {activeTab === 'disputes' && (
          <div className="p-6">
            {disputes.length === 0 ? (
              <p className="text-zinc-500">No disputes recorded.</p>
            ) : (
              <div className="space-y-6">
                {disputes.map(dispute => {
                  const correlatedJob = jobs.find(j => j.id === dispute.jobId) || {};
                  return (
                    <div key={dispute.id} className="border border-zinc-800 rounded-xl p-4 bg-zinc-800/20">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-zinc-100 flex items-center gap-2">
                             Dispute for Job: <Link to={`/job/${dispute.jobId}`} className="text-yellow-500 hover:underline">{correlatedJob.title || dispute.jobId}</Link>
                             <span className={`px-2 py-0.5 text-xs rounded-full ${dispute.status === 'open' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-400'}`}>
                               {dispute.status === 'open' ? 'Action Required' : 'Resolved'}
                             </span>
                          </h4>
                          <p className="text-sm text-zinc-400 mt-1">Raised by: {dispute.raisedBy === correlatedJob.customerId ? 'Employer' : 'Worker'} on {new Date(dispute.createdAt).toLocaleString()}</p>
                        </div>
                        {dispute.status === 'open' && (
                          <div className="flex gap-2">
                            <button 
                               onClick={() => openConfirm('Refund Employer', 'Return held funds to the employer?', () => { handleResolveDispute(dispute.id, dispute.jobId, 'refund_client'); closeConfirm(); }, 'Refund', true)}
                               className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded text-sm font-semibold transition"
                            >
                              Refund Employer
                            </button>
                            <button 
                               onClick={() => openConfirm('Release Payment', 'Release held funds to the worker?', () => { handleResolveDispute(dispute.id, dispute.jobId, 'release_worker'); closeConfirm(); }, 'Release Payment', false)}
                               className="bg-green-500/10 text-green-400 hover:bg-green-500/20 px-3 py-1.5 rounded text-sm font-semibold transition"
                            >
                              Release to Worker
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                        <h5 className="text-sm font-semibold text-zinc-300 mb-2">Message:</h5>
                        <p className="text-zinc-400 text-sm whitespace-pre-wrap">{dispute.message}</p>
                      </div>

                      {dispute.images && dispute.images.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold text-zinc-300 mb-2">Proof Photos:</h5>
                          <div className="flex gap-4 overflow-x-auto pb-2">
                            {dispute.images.map((img: string, i: number) => (
                              <a href={img} target="_blank" rel="noreferrer" key={i}>
                                <img src={img} alt="Proof" className="w-32 h-32 object-cover rounded-lg border border-zinc-700 hover:opacity-80 transition cursor-pointer" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
        confirmText={confirmDialog.confirmText}
        isDestructive={confirmDialog.isDestructive}
      />
    </div>
  );
}
