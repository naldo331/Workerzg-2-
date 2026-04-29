import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // Get role
      const docSnap = await getDoc(doc(db, 'users', userCred.user.uid));
      if (docSnap.exists()) {
        const u = docSnap.data();
        if (from !== '/') {
          navigate(from, { replace: true });
        } else {
          if (u.role === 'admin') navigate('/admin', { replace: true });
          else if (u.role === 'worker') navigate('/worker/profile', { replace: true });
          else navigate('/employer/profile', { replace: true });
        }
      } else {
        toast.error('User data not found.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password.');
      } else if (err.code === 'auth/unauthorized-domain') {
        toast.error('Domain not authorized in Firebase Console. Please add your AIS domain to Authorized Domains.');
      } else {
        toast.error(err.message || 'An error occurred during sign in.');
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
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-yellow-500 hover:text-yellow-400">
              Sign up
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Email address</label>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                className={`appearance-none block w-full px-3 py-2 border rounded-lg bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm ${errors.email ? 'border-red-500' : 'border-zinc-700'}`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-zinc-300">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-yellow-500 hover:text-yellow-400">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password is required' })}
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
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-zinc-900 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
