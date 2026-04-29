import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm<any>({ 
    mode: 'onChange'
  });

  useEffect(() => {
    async function loadJob() {
      if (!id) return;
      try {
        const docRef = doc(db, 'jobs', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.customerId !== currentUser?.uid) {
            toast.error("You do not have permission to edit this job.");
            navigate('/employer/profile');
            return;
          }
          if (data.status !== 'open') {
             toast.error("You can only edit open jobs.");
             navigate('/employer/profile');
             return;
          }
          
          const parts = (data.location || '').split(',');
          const town = parts[0]?.trim() || '';
          const parish = parts[1]?.trim() || '';

          reset({
            title: data.title,
            category: data.category,
            parish: parish,
            town: town,
            budget: data.budget,
            description: data.description
          });
        } else {
          toast.error("Job not found.");
          navigate('/employer/profile');
        }
      } catch (err) {
        console.error("Error fetching job", err);
        toast.error("Failed to load job details.");
      } finally {
        setFetching(false);
      }
    }
    loadJob();
  }, [id, currentUser, navigate, reset]);

  const onSubmit = async (data: any) => {
    if (!currentUser || !id) return;
    setLoading(true);
    try {
      const jobRef = doc(db, 'jobs', id);
      await updateDoc(jobRef, {
        title: data.title,
        description: data.description,
        category: data.category,
        location: `${data.town}, ${data.parish}`,
        budget: parseFloat(data.budget),
        updatedAt: Date.now()
      });

      toast.success('Job updated successfully!');
      navigate('/employer/profile');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-sm text-center">
          <p className="text-zinc-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-sm">
        <h1 className="text-3xl font-bold text-zinc-100 mb-6">Edit Job</h1>
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

          <div className="flex gap-4 pt-4 border-t border-zinc-800">
             <button
                type="button"
                onClick={() => navigate('/employer/profile')}
                className="w-1/3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold py-3 px-4 rounded-lg transition-colors border border-zinc-700"
             >
                Cancel
             </button>
            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-2/3 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
