import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function PostJobPage() {
  const location = useLocation();
  const initialCategory = location.state?.category || '';
  const preSelectedWorkerId = location.state?.workerId || '';

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<any>({ 
    mode: 'onChange',
    defaultValues: {
      category: initialCategory
    }
  });
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const jobId = `job_${Date.now()}`;
      const budget = parseFloat(data.budget);

      await setDoc(doc(db, 'jobs', jobId), {
        customerId: currentUser.uid,
        workerId: preSelectedWorkerId, // Will be empty for open jobs, or have worker ID for direct hires
        title: data.title,
        description: data.description,
        category: data.category,
        location: `${data.town}, ${data.parish}`,
        budget: budget,
        status: preSelectedWorkerId ? 'awaiting_payment' : 'open',
        paymentStatus: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      toast.success(preSelectedWorkerId ? 'Job request sent successfully!' : 'Job posted successfully!');
      navigate(preSelectedWorkerId ? `/employer/profile` : '/employer/profile'); // Or navigate to a payment page? for now, profile
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-sm">
        <h1 className="text-3xl font-bold text-zinc-100 mb-6">{preSelectedWorkerId ? 'Hire Worker' : 'Post a Job'}</h1>
        
        {preSelectedWorkerId && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 p-4 rounded-xl mb-6 text-sm flex gap-3">
             <div className="bg-yellow-500/20 p-2 rounded-lg h-fit">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
               </svg>
             </div>
             <div>
               <p className="font-bold text-base mb-1">Your payment is secure and will NOT be released to the worker until the job is completed and confirmed.</p>
               <p>Once you submit this form, please proceed to pay your platform fee to unlock contact information and initiate the job. A platform fee of 5% will be applied.</p>
             </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Job Title</label>
            <input
              {...register('title', { required: 'Title is required', maxLength: 100 })}
              type="text"
              placeholder="e.g. Need a plumber for sink repair"
              className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none placeholder-zinc-500"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Category</label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            >
              <option value="">Select a category</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Repairs">Repairs</option>
              <option value="Moving">Moving</option>
              <option value="Electrical">Electrical</option>
              <option value="Babysitting">Babysitting</option>
              <option value="Yard Work">Yard Work</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message as string}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Parish</label>
              <select
                {...register('parish', { required: 'Parish is required' })}
                className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              >
                <option value="">Select Parish</option>
                <option value="Kingston">Kingston</option>
                <option value="St. Andrew">St. Andrew</option>
                <option value="St. Thomas">St. Thomas</option>
                <option value="Portland">Portland</option>
                <option value="St. Mary">St. Mary</option>
                <option value="St. Ann">St. Ann</option>
                <option value="Trelawny">Trelawny</option>
                <option value="St. James">St. James</option>
                <option value="Hanover">Hanover</option>
                <option value="Westmoreland">Westmoreland</option>
                <option value="St. Elizabeth">St. Elizabeth</option>
                <option value="Manchester">Manchester</option>
                <option value="Clarendon">Clarendon</option>
                <option value="St. Catherine">St. Catherine</option>
              </select>
              {errors.parish && <p className="text-red-500 text-xs mt-1">{errors.parish.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Town / City</label>
              <input
                {...register('town', { required: 'Town / City is required' })}
                type="text"
                placeholder="e.g. Half Way Tree"
                className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none placeholder-zinc-500"
              />
              {errors.town && <p className="text-red-500 text-xs mt-1">{errors.town.message as string}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Budget (JMD)</label>
            <input
              {...register('budget', { 
                required: 'Budget is required',
                min: { value: 500, message: 'Minimum budget $500 JMD' }
              })}
              type="number"
              placeholder="e.g. 5000"
              className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none placeholder-zinc-500"
            />
            {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Job Description</label>
            <textarea
              {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'Provide more details' } })}
              rows={4}
              placeholder="Describe the work that needs to be done..."
              className="w-full px-4 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none resize-none placeholder-zinc-500"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message as string}</p>}
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : (preSelectedWorkerId ? 'Create Job Request' : 'Post Job')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
