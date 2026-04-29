import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setEmailSent(true);
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        toast.error('No account found with this email.');
      } else {
        toast.error(err.message || 'Failed to send reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-zinc-900 p-10 rounded-2xl border border-zinc-800 shadow-sm relative">
        <Link 
          to="/login"
          className="absolute top-6 left-6 p-2 rounded-full text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="text-center pt-4">
          <h2 className="text-3xl font-extrabold text-zinc-100">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Enter your email to receive a password reset link.
          </p>
        </div>
        
        {emailSent ? (
          <div className="mt-8 bg-zinc-800 p-6 rounded-xl border border-zinc-700 text-center space-y-4">
            <p className="text-zinc-200">
              We've sent a password reset link to your email address. Check your spam folder if you don't see it.
            </p>
            <Link 
              to="/login"
              className="inline-block mt-2 text-yellow-500 font-medium hover:text-yellow-400"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Email address</label>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className={`appearance-none block w-full px-3 py-2 border rounded-lg bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm ${errors.email ? 'border-red-500' : 'border-zinc-700'}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message as string}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !isValid}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-zinc-900 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
