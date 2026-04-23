import React, { useState } from 'react';
import { School, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e) => { 
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const role = document.getElementById('role').value;
    const identifier = document.getElementById('identifier').value;
    const password = document.getElementById('password').value; 

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password: password, role: role }),
      });

      const data = await response.json();
      if (data.success) {
        onLogin({ ...data.user });
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const email = document.getElementById('reset-identifier').value.toLowerCase();
    const newPassword = document.getElementById('new-password').value;

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }), // Sending both fields
      });

      const data = await response.json();

      if (data.success) {
        setResetSent(true);
        setTimeout(() => {
          setResetSent(false);
          setIsForgotPassword(false);
        }, 3000);
      } else {
        setError(data.message || 'Email not registered.');
      }
    } catch (err) {
      setError('Reset service unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f7f9fb]">
      <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-12 min-h-[720px] bg-white shadow-2xl rounded-xl overflow-hidden">
        {/* Left Panel - Styling Unchanged */}
        <section className="hidden md:flex md:col-span-5 bg-gradient-to-br from-[#002045] to-[#1a365d] p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img className="w-full h-full object-cover grayscale contrast-125" src="https://vjti.ac.in/wp-content/uploads/2024/06/vjti-maingate.png" referrerPolicy="no-referrer" alt="Campus" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <School size={36} className="text-white" />
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase">RMS-VJTI</h1>
            </div>
            <div className="space-y-6 mt-20">
              <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">Institutional Integrity, <br/><span className="text-[#86a0cd]">Digital Precision.</span></h2>
              <p className="text-[#86a0cd] max-w-sm text-lg font-light leading-relaxed">Access the centralized university reimbursement portal. Managed oversight for students, faculty, and administrative departments.</p>
            </div>
          </div>
        </section>

        {/* Right Panel - Styling Unchanged */}
        <section className="col-span-1 md:col-span-7 p-8 md:p-20 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <header className="mb-12">
              <h3 className="text-3xl font-bold tracking-tight text-[#002045] mb-2">
                {isForgotPassword ? 'Reset Password' : 'Sign In'}
              </h3>
              <p className="text-[#43474e] font-medium">
                {isForgotPassword ? 'Update your security credentials directly.' : 'Please enter your credentials.'}
              </p>
            </header>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            {resetSent ? (
              <div className="bg-green-50 text-green-800 p-8 rounded-xl flex flex-col items-center text-center space-y-4 border border-green-100">
                <CheckCircle2 size={56} className="text-green-500" />
                <div>
                  <h4 className="font-bold text-xl">Password Updated!</h4>
                  <p className="text-sm mt-2 text-green-700 leading-relaxed">Your new password has been saved. Redirecting to login...</p>
                </div>
              </div>
            ) : isForgotPassword ? (
              <form className="space-y-6" onSubmit={handleForgotSubmit}>
                <div className="space-y-2">
                  <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-[#43474e]" htmlFor="reset-identifier">Institutional Email</label>
                  <input className="w-full bg-[#f2f4f6] border-none rounded-lg h-12 px-4 focus:bg-white focus:ring-2 focus:ring-[#002045]/20 transition-all text-[#191c1e] font-medium outline-none" id="reset-identifier" type="email" required disabled={isLoading} />
                </div>
                {/* NEW INPUT: Added New Password Field with matching styling */}
                <div className="space-y-2">
                  <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-[#43474e]" htmlFor="new-password">Set New Password</label>
                  <input className="w-full bg-[#f2f4f6] border-none rounded-lg h-12 px-4 focus:bg-white focus:ring-2 focus:ring-[#002045]/20 transition-all text-[#191c1e] font-medium outline-none" id="new-password" type="password" required disabled={isLoading} />
                </div>
                <button className="w-full h-12 bg-[#002045] text-white font-bold rounded-lg mt-4 flex items-center justify-center gap-2 hover:bg-[#003366] transition-all disabled:opacity-50" type="submit" disabled={isLoading}>
                  {isLoading ? <span>Updating...</span> : <><span>Update Password</span><ArrowRight size={20} /></>}
                </button>
                <button type="button" onClick={() => { setIsForgotPassword(false); setError(''); }} className="w-full flex items-center justify-center gap-2 text-sm font-bold text-[#43474e] hover:text-[#002045] transition-colors mt-4">
                  <ArrowLeft size={16} />
                  <span>Back to Login</span>
                </button>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleLoginSubmit}>
                <div className="space-y-2">
                  <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-[#43474e]" htmlFor="role">User Role</label>
                  <select className="w-full bg-[#f2f4f6] border-none rounded-lg h-12 px-4 focus:bg-white focus:ring-2 focus:ring-[#002045]/20 transition-all text-[#191c1e] font-medium outline-none" id="role" required defaultValue="">
                    <option value="" disabled>Select your role</option>
                    <option value="Student">Student</option>
                    <option value="Professor">Professor</option>
                    <option value="HOD (Head of Department)">HOD (Head of Department)</option>
                    <option value="Account">Account</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-[#43474e]" htmlFor="identifier">Institutional Email ID</label>
                  <input className="w-full bg-[#f2f4f6] border-none rounded-lg h-12 px-4 focus:bg-white focus:ring-2 focus:ring-[#002045]/20 transition-all text-[#191c1e] font-medium outline-none" id="identifier" type="text" required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-[#43474e]" htmlFor="password">Security Password</label>
                    <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); }} className="text-[0.6875rem] font-bold text-[#002045] hover:underline transition-colors">Forgot password?</button>
                  </div>
                  <input className="w-full bg-[#f2f4f6] border-none rounded-lg h-12 px-4 focus:bg-white focus:ring-2 focus:ring-[#002045]/20 transition-all text-[#191c1e] font-medium outline-none" id="password" placeholder="••••••••" type="password" required disabled={isLoading} />
                </div>
                <button className="w-full h-12 bg-[#002045] text-white font-bold rounded-lg mt-4 flex items-center justify-center gap-2 hover:bg-[#003366] transition-all disabled:opacity-50" type="submit" disabled={isLoading}>
                  {isLoading ? <span>Authenticating...</span> : <><span>Access Dashboard</span><ArrowRight size={20} /></>}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}