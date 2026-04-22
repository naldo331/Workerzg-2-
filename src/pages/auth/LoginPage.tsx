import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
  const [loading, setLoading] = useState(false);
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
          if (u.role === 'admin') navigate('/admin/dashboard', { replace: true });
          else if (u.role === 'worker') navigate('/worker/dashboard', { replace: true });
          else navigate('/customer/dashboard', { replace: true });
        }
      } else {
        toast.error('User data not found.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Invalid email or password.');
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
              <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                className={`appearance-none block w-full px-3 py-2 border rounded-lg bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm ${errors.password ? 'border-red-500' : 'border-zinc-700'}`}
              />
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
