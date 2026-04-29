import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'worker' ? 'worker' : 'customer';
  
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: defaultRole,
      startingPrice: '',
      phoneNumber: '',
      hasWhatsApp: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const selectedRole = watch('role');

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // 2. Update Profile
      await updateProfile(user, { displayName: data.name });

      // 3. Send Verification Email
      await sendEmailVerification(user);

      // 4. Save to Firestore `users` collection
      await setDoc(doc(db, 'users', user.uid), {
        userId: user.uid,
        email: data.email,
        displayName: data.name,
        role: data.role,
        photoURL: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'active'
      });

      // 5. If Worker, save empty WorkerProfile
      if (data.role === 'worker') {
        await setDoc(doc(db, 'workers', user.uid), {
          userId: user.uid,
          category: 'Uncategorized', // Requires them to update later
          skills: [],
          rating: 0,
          completedJobs: 0,
          rank: 'Bronze',
          approvalStatus: 'pending',
          startingPrice: parseFloat(data.startingPrice) || 0,
          location: 'Jamaica',
          phoneNumber: data.phoneNumber || '',
          hasWhatsApp: !!data.hasWhatsApp
        });
      }

      toast.success('Account created! Please check your email to verify.');
      
      // We will let them in, but in a real app, maybe enforce verification.
      if (data.role === 'worker') {
        navigate('/worker/profile');
      } else {
        navigate('/employer/profile');
      }

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        toast.error('This email is already in use. Please sign in instead.');
      } else {
        toast.error(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-zinc-900 p-10 rounded-2xl border border-zinc-800 shadow-sm">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-zinc-100">
            Join the Guild
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-yellow-500 hover:text-yellow-400">
              Sign in
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                className={`appearance-none block w-full px-3 py-2 border rounded-lg bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm ${errors.name ? 'border-red-500' : 'border-zinc-700'}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message as string}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Email address</label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                })}
                type="email"
                className={`appearance-none block w-full px-3 py-2 border rounded-lg bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm ${errors.email ? 'border-red-500' : 'border-zinc-700'}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message as string}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
              <div className="relative">
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-lg bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm ${errors.password ? 'border-red-500' : 'border-zinc-700'}`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-300 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message as string}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">I want to...</label>
              <select
                {...register('role')}
                className="block w-full pl-3 pr-10 py-2 border border-zinc-700 bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-lg"
              >
                <option value="customer">Hire Workers (Employer)</option>
                <option value="worker">Find Jobs (Worker)</option>
              </select>
            </div>

            {/* Starting Price for Workers */}
            {selectedRole === 'worker' && (
              <div className="space-y-4 pt-2 border-t border-zinc-800">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Starting Price (JMD)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">$</span>
                    <input
                      {...register('startingPrice', { 
                        required: 'Starting price is required for workers',
                        min: { value: 0, message: 'Minimum 0' }
                      })}
                      type="number"
                      placeholder="2500"
                      className={`appearance-none block w-full pl-8 pr-3 py-2 border rounded-lg bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm ${errors.startingPrice ? 'border-red-500' : 'border-zinc-700'}`}
                    />
                  </div>
                  {errors.startingPrice && <p className="mt-1 text-xs text-red-500">{errors.startingPrice.message as string}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Phone Number</label>
                  <input
                    {...register('phoneNumber', { 
                      required: 'Phone number is required for workers'
                    })}
                    type="tel"
                    placeholder="e.g. 18765555555"
                    className={`appearance-none block w-full px-3 py-2 border rounded-lg bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm ${errors.phoneNumber ? 'border-red-500' : 'border-zinc-700'}`}
                  />
                  {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message as string}</p>}
                </div>

                <div className="flex items-center">
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
            )}

          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-zinc-900 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
