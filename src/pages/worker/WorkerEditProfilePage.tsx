import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

const CATEGORIES = ['Cleaning', 'Repairs', 'Moving', 'Electrical', 'Babysitting', 'Yard Work', 'Other'];

export default function WorkerEditProfilePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) return;
      try {
        const docRef = doc(db, 'workers', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const locationParts = (data.location || '').split(', ');
          const parish = locationParts.length > 1 ? locationParts[locationParts.length - 1] : '';
          const town = locationParts.length > 1 ? locationParts.slice(0, locationParts.length - 1).join(', ') : data.location || '';
          
          reset({
            category: data.category !== 'Uncategorized' ? data.category : '',
            skills: data.skills ? data.skills.join(', ') : '',
            description: data.description || '',
            startingPrice: data.startingPrice || '',
            parish,
            town,
            phoneNumber: data.phoneNumber || '',
            hasWhatsApp: !!data.hasWhatsApp
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [currentUser, reset]);

  const onSubmit = async (data: any) => {
    if (!currentUser) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'workers', currentUser.uid);
      
      const skillsArray = data.skills
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      await updateDoc(docRef, {
        category: data.category || 'Uncategorized',
        skills: skillsArray,
        description: data.description || '',
        startingPrice: parseFloat(data.startingPrice) || 0,
        location: data.town && data.parish ? `${data.town}, ${data.parish}` : '',
        phoneNumber: data.phoneNumber || '',
        hasWhatsApp: !!data.hasWhatsApp,
        updatedAt: Date.now()
      });

      toast.success('Profile updated successfully!');
      navigate('/worker/profile');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/worker/profile')}
          className="p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-zinc-100">Edit Worker Profile</h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Primary Category</label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-3 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">About Me / Description</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Tell employers about yourself and your experience..."
              className="w-full px-3 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y"
            ></textarea>
            <p className="mt-1 text-xs text-zinc-500">A good description helps you win more jobs.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Skills (comma separated)</label>
            <input
              {...register('skills')}
              type="text"
              placeholder="e.g. Plumbing, Sink repair, Pipe fitting"
              className="w-full px-3 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <p className="mt-1 text-xs text-zinc-500">List skills separated by commas to help employers find you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Starting Price (JMD)</label>
              <input
                {...register('startingPrice', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price cannot be negative' }
                })}
                type="number"
                placeholder="e.g. 5000"
                className="w-full px-3 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              {errors.startingPrice && <p className="mt-1 text-xs text-red-500">{errors.startingPrice.message as string}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Parish</label>
                <select
                  {...register('parish', { required: 'Parish is required' })}
                  className="w-full px-3 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                {errors.parish && <p className="mt-1 text-xs text-red-500">{errors.parish.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Town / City</label>
                <input
                  {...register('town', { required: 'Town / City is required' })}
                  type="text"
                  placeholder="e.g. Half Way Tree"
                  className="w-full px-3 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                {errors.town && <p className="mt-1 text-xs text-red-500">{errors.town.message as string}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Phone Number</label>
              <input
                {...register('phoneNumber', { required: 'Phone number is required' })}
                type="tel"
                placeholder="e.g. 18765555555"
                className="w-full px-3 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message as string}</p>}
            </div>

            <div className="flex items-center md:col-start-2 place-self-start mt-2">
              <input
                {...register('hasWhatsApp')}
                type="checkbox"
                id="hasWhatsApp"
                className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-zinc-700 rounded bg-zinc-950"
              />
              <label htmlFor="hasWhatsApp" className="ml-2 block text-sm text-zinc-300">
                Available on WhatsApp
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
