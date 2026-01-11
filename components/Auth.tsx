
import React, { useState } from 'react';
import { NIGERIAN_UNIVERSITIES } from '../data/universities';
import { UserRole } from '../types';
import { Upload, ChevronRight, CheckCircle2, Facebook, ShieldAlert, KeyRound, Mail, ArrowLeft, RefreshCw } from 'lucide-react';

interface AuthProps {
  onLogin: (userData: any) => void;
  onNavigateToLanding: () => void;
  onViewTerms: () => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';
type ForgotStep = 'EMAIL' | 'VERIFY' | 'RESET' | 'SUCCESS';

export const Auth: React.FC<AuthProps> = ({ onLogin, onNavigateToLanding, onViewTerms }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [forgotStep, setForgotStep] = useState<ForgotStep>('EMAIL');
  
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (view === 'LOGIN') {
      if (email && password) {
        onLogin({
          name: role === UserRole.STUDENT ? 'Student User' : 'Guest Explorer',
          email,
          role,
          university: role === UserRole.STUDENT ? 'University of Lagos' : 'N/A',
          verified: role === UserRole.STUDENT,
          joinedAt: new Date(Date.now() - 86400000).toISOString(),
          reportsCount: 0,
          isBanned: false,
          blockedUsers: []
        });
      } else {
        setError('Please enter email and password');
      }
    } else if (view === 'REGISTER') {
      if (!agreedToTerms) {
        setError('You must agree to the Terms & Conditions.');
        return;
      }
      if (email && password && name) {
        if (role === UserRole.STUDENT && (!university || !idFile)) {
          setError('Students must select a university and upload valid ID.');
          return;
        }
        
        onLogin({
          name,
          email,
          role,
          university: role === UserRole.STUDENT ? university : 'N/A',
          verified: role === UserRole.GUEST,
          joinedAt: new Date().toISOString(),
          reportsCount: 0,
          isBanned: false,
          blockedUsers: []
        });
      } else {
        setError('Please fill all fields');
      }
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    // Simulate API calls
    setTimeout(() => {
      if (forgotStep === 'EMAIL') {
        if (!email.includes('@')) {
          setError('Please enter a valid email address.');
          setIsProcessing(false);
          return;
        }
        setForgotStep('VERIFY');
      } else if (forgotStep === 'VERIFY') {
        if (verificationCode.length !== 6) {
          setError('Enter the 6-digit code sent to your email.');
          setIsProcessing(false);
          return;
        }
        setForgotStep('RESET');
      } else if (forgotStep === 'RESET') {
        if (newPassword.length < 6) {
          setError('Password must be at least 6 characters.');
          setIsProcessing(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setError('Passwords do not match.');
          setIsProcessing(false);
          return;
        }
        setForgotStep('SUCCESS');
      }
      setIsProcessing(false);
    }, 1000);
  };

  const handleSocialLogin = (provider: 'Google' | 'Facebook') => {
    onLogin({
      name: `${provider} User`,
      email: `user@${provider.toLowerCase()}.com`,
      role: role,
      university: 'N/A',
      verified: false,
      joinedAt: new Date().toISOString(),
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
      reportsCount: 0,
      isBanned: false,
      blockedUsers: []
    });
  };

  const isGuest = role === UserRole.GUEST;
  const isLogin = view === 'LOGIN';

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${isGuest ? 'bg-green-900' : 'bg-white'}`}>
      {/* Visual Side (Hidden on Mobile) */}
      <div className={`hidden lg:flex w-5/12 relative overflow-hidden flex-col justify-between p-12 transition-colors duration-500 ${isGuest ? 'bg-green-950 text-green-50' : 'bg-green-900 text-white'}`}>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

         <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-8">
               <div className="bg-white/20 backdrop-blur p-2 rounded-lg">
                  <span className="font-bold text-xl text-white">U</span>
               </div>
               <span className="text-xl font-bold tracking-widest uppercase text-white">UniSpace</span>
            </div>
            
            <h1 className="text-5xl font-bold leading-tight mb-6">
              {view === 'FORGOT_PASSWORD' ? (
                <>Recover.<br/>Restore.<br/><span className="text-yellow-400">Return.</span></>
              ) : role === UserRole.STUDENT ? (
                <>Connect.<br/>Study.<br/><span className="text-green-400">Thrive.</span></>
              ) : (
                <>Explore.<br/>Discover.<br/><span className="text-emerald-400">Experience.</span></>
              )}
            </h1>
            <p className="text-lg opacity-80 max-w-sm leading-relaxed">
              {view === 'FORGOT_PASSWORD'
                ? "Don't worry, it happens to the best of us. Follow the steps to get back to your campus ecosystem."
                : role === UserRole.STUDENT 
                ? "The ultimate digital ecosystem for Nigerian scholars. Verify your status to unlock premium campus features."
                : "Browse the marketplace, explore study tools, and get a taste of the campus life before you commit."}
            </p>
         </div>

         <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-3 text-sm font-medium opacity-70">
               <CheckCircle2 size={18} />
               <span>Trusted by students nationwide</span>
            </div>
            <div className="flex items-center space-x-3 text-sm font-medium opacity-70">
               <CheckCircle2 size={18} />
               <span>Secure UniWallet payments</span>
            </div>
         </div>
      </div>

      {/* Form Side */}
      <div className={`flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative overflow-y-auto ${isGuest ? 'text-white' : 'text-slate-900'}`}>
         <button onClick={onNavigateToLanding} className={`absolute top-8 right-8 font-medium text-sm ${isGuest ? 'text-green-200 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
            Skip to Home
         </button>

         <div className="w-full max-w-md space-y-8">
            {view !== 'FORGOT_PASSWORD' ? (
               <>
                  <div className="text-center lg:text-left">
                     <h2 className="text-3xl font-bold">
                       {isLogin ? 'Welcome Back' : 'Create Account'}
                     </h2>
                     <p className={`mt-2 ${isGuest ? 'text-green-200' : 'text-slate-500'}`}>
                       {isLogin ? 'Enter your credentials to access your space.' : 'Start your journey with UniSpace today.'}
                     </p>
                  </div>

                  {/* Role Switcher */}
                  <div className={`p-1 rounded-xl flex ${isGuest ? 'bg-green-800' : 'bg-slate-100'}`}>
                     <button
                        type="button"
                        onClick={() => setRole(UserRole.STUDENT)}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${role === UserRole.STUDENT ? 'bg-white text-green-700 shadow-sm' : 'text-green-200 hover:text-white'}`}
                     >
                        <span>Student</span>
                     </button>
                     <button
                        type="button"
                        onClick={() => setRole(UserRole.GUEST)}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${role === UserRole.GUEST ? 'bg-white text-green-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                        <span>Guest</span>
                     </button>
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => handleSocialLogin('Google')} className={`flex items-center justify-center space-x-2 py-2.5 border rounded-xl transition-colors ${isGuest ? 'border-green-700 hover:bg-green-800 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-900'}`}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                           <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                           <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                           <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                           <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-sm font-semibold">Google</span>
                     </button>
                     <button onClick={() => handleSocialLogin('Facebook')} className={`flex items-center justify-center space-x-2 py-2.5 border rounded-xl transition-colors ${isGuest ? 'border-green-700 hover:bg-green-800 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-900'}`}>
                        <Facebook className="text-[#1877F2]" size={20} fill="#1877F2" />
                        <span className="text-sm font-semibold">Facebook</span>
                     </button>
                  </div>

                  <div className="relative">
                     <div className="absolute inset-0 flex items-center">
                        <div className={`w-full border-t ${isGuest ? 'border-green-800' : 'border-slate-200'}`}></div>
                     </div>
                     <div className="relative flex justify-center text-sm">
                        <span className={`px-2 ${isGuest ? 'bg-green-900 text-green-300' : 'bg-white text-slate-500'}`}>Or continue with email</span>
                     </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                     {!isLogin && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                           <div>
                              <label className={`block text-xs font-bold uppercase mb-1 ${isGuest ? 'text-green-300' : 'text-slate-500'}`}>Full Name</label>
                              <input 
                                 type="text" 
                                 required 
                                 value={name} 
                                 onChange={(e) => setName(e.target.value)} 
                                 className={`w-full px-4 py-3 rounded-xl outline-none transition-all placeholder:text-opacity-50 ${isGuest ? 'bg-green-800 border-green-700 text-white focus:ring-green-400 placeholder:text-green-200' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-green-500 placeholder:text-slate-400 border'}`}
                                 placeholder="John Doe" 
                              />
                           </div>

                           {role === UserRole.STUDENT && (
                              <div className="grid grid-cols-1 gap-4">
                                 <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">University</label>
                                    <select 
                                       required 
                                       value={university} 
                                       onChange={(e) => setUniversity(e.target.value)} 
                                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none text-slate-900"
                                    >
                                       <option value="">Select University</option>
                                       {NIGERIAN_UNIVERSITIES.map((uni, index) => (
                                          <option key={index} value={uni}>{uni}</option>
                                       ))}
                                    </select>
                                 </div>
                                 
                                 <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student Verification</label>
                                    <div className="relative">
                                       <input 
                                          type="file" 
                                          required 
                                          accept=".pdf,.jpg,.png" 
                                          onChange={(e) => setIdFile(e.target.files ? e.target.files[0] : null)}
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                       />
                                       <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 border-dashed rounded-xl flex items-center justify-between text-slate-500">
                                          <span className="text-sm truncate">{idFile ? idFile.name : 'Upload ID Card / Letter'}</span>
                                          <Upload size={16} />
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           )}
                        </div>
                     )}

                     <div className="space-y-4">
                        <div>
                           <label className={`block text-xs font-bold uppercase mb-1 ${isGuest ? 'text-green-300' : 'text-slate-500'}`}>Email Address</label>
                           <input 
                              type="email" 
                              required 
                              value={email} 
                              onChange={(e) => setEmail(e.target.value)} 
                              className={`w-full px-4 py-3 rounded-xl outline-none transition-all placeholder:text-opacity-50 ${isGuest ? 'bg-green-800 border-green-700 text-white focus:ring-green-400 placeholder:text-green-200' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-green-500 placeholder:text-slate-400 border'}`}
                              placeholder="you@example.com" 
                           />
                        </div>
                        <div>
                           <div className="flex justify-between items-center mb-1">
                              <label className={`block text-xs font-bold uppercase ${isGuest ? 'text-green-300' : 'text-slate-500'}`}>Password</label>
                              {isLogin && (
                                 <button 
                                    type="button"
                                    onClick={() => { setView('FORGOT_PASSWORD'); setForgotStep('EMAIL'); setError(''); }}
                                    className={`text-xs font-bold hover:underline ${isGuest ? 'text-green-200' : 'text-green-600'}`}
                                 >
                                    Forgot Password?
                                 </button>
                              )}
                           </div>
                           <input 
                              type="password" 
                              required 
                              value={password} 
                              onChange={(e) => setPassword(e.target.value)} 
                              className={`w-full px-4 py-3 rounded-xl outline-none transition-all placeholder:text-opacity-50 ${isGuest ? 'bg-green-800 border-green-700 text-white focus:ring-green-400 placeholder:text-green-200' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-green-500 placeholder:text-slate-400 border'}`}
                              placeholder="••••••••" 
                           />
                        </div>
                     </div>

                     {!isLogin && (
                        <div className="space-y-3">
                           <div className={`p-3 rounded-lg text-xs leading-relaxed ${isGuest ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-700'}`}>
                              <div className="flex items-center font-bold mb-1"><ShieldAlert size={14} className="mr-1"/> Community Covenant</div>
                              <ul className="list-disc pl-4 space-y-0.5">
                                 <li>No Drugs, Cybercrime, or Occultism.</li>
                                 <li>No Sexual Abuse or Harassment.</li>
                                 <li>No Hate Speech or Harmful content.</li>
                              </ul>
                           </div>
                           <div className="flex items-center space-x-2">
                              <input
                                 id="terms"
                                 type="checkbox"
                                 checked={agreedToTerms}
                                 onChange={(e) => setAgreedToTerms(e.target.checked)}
                                 className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                              />
                              <label htmlFor="terms" className={`text-sm ${isGuest ? 'text-green-200' : 'text-slate-600'}`}>
                                 I agree to the <button type="button" onClick={onViewTerms} className="font-bold hover:underline">Terms of Service</button>
                              </label>
                           </div>
                        </div>
                     )}

                     {error && (
                        <div className={`p-3 text-sm font-medium rounded-lg text-center border animate-shake ${isGuest ? 'bg-red-900/50 border-red-800 text-red-200' : 'bg-red-50 border-red-100 text-red-600'}`}>
                           {error}
                        </div>
                     )}

                     <button 
                        type="submit" 
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 ${isGuest ? 'bg-white text-green-900 hover:bg-green-50' : 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'}`}
                     >
                        <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                        <ChevronRight size={20} />
                     </button>
                  </form>

                  <div className="text-center pt-4">
                     <p className={`text-sm ${isGuest ? 'text-green-300' : 'text-slate-500'}`}>
                        {isLogin ? "New to UniSpace? " : "Already have an account? "}
                        <button onClick={() => setView(isLogin ? 'REGISTER' : 'LOGIN')} className={`font-bold hover:underline ${isGuest ? 'text-white' : 'text-green-600'}`}>
                           {isLogin ? 'Register Now' : 'Log In'}
                        </button>
                     </p>
                  </div>
               </>
            ) : (
               /* FORGOT PASSWORD VIEW */
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center lg:text-left">
                     <button 
                        onClick={() => { setView('LOGIN'); setError(''); }} 
                        className={`flex items-center text-sm font-bold mb-6 hover:underline ${isGuest ? 'text-green-300' : 'text-green-600'}`}
                     >
                        <ArrowLeft size={16} className="mr-1" /> Back to Login
                     </button>
                     
                     {forgotStep === 'SUCCESS' ? (
                        <div className="text-center space-y-4">
                           <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600">
                              <CheckCircle2 size={32} />
                           </div>
                           <h2 className="text-3xl font-bold">Password Reset!</h2>
                           <p className={`${isGuest ? 'text-green-200' : 'text-slate-500'}`}>
                              Your password has been successfully recovered. You can now log in with your new credentials.
                           </p>
                           <button 
                              onClick={() => { setView('LOGIN'); setError(''); }}
                              className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all"
                           >
                              Go to Login
                           </button>
                        </div>
                     ) : (
                        <>
                           <h2 className="text-3xl font-bold">
                              {forgotStep === 'EMAIL' && 'Password Recovery'}
                              {forgotStep === 'VERIFY' && 'Verify Identity'}
                              {forgotStep === 'RESET' && 'Set New Password'}
                           </h2>
                           <p className={`mt-2 ${isGuest ? 'text-green-200' : 'text-slate-500'}`}>
                              {forgotStep === 'EMAIL' && 'Enter your email to receive a secure verification code.'}
                              {forgotStep === 'VERIFY' && `We've sent a 6-digit code to ${email}.`}
                              {forgotStep === 'RESET' && 'Create a strong new password for your account.'}
                           </p>

                           <form onSubmit={handleForgotPassword} className="mt-8 space-y-5">
                              {forgotStep === 'EMAIL' && (
                                 <div className="space-y-4">
                                    <div className="relative">
                                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                       <input 
                                          type="email" 
                                          required 
                                          value={email} 
                                          onChange={(e) => setEmail(e.target.value)} 
                                          className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all ${isGuest ? 'bg-green-800 border-green-700 text-white focus:ring-green-400 placeholder:text-green-200' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-green-500 placeholder:text-slate-400 border'}`}
                                          placeholder="Enter your email" 
                                       />
                                    </div>
                                 </div>
                              )}

                              {forgotStep === 'VERIFY' && (
                                 <div className="space-y-4">
                                    <div className="flex justify-center">
                                       <input 
                                          type="text" 
                                          maxLength={6}
                                          required 
                                          value={verificationCode} 
                                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} 
                                          className={`w-full max-w-[200px] text-center text-2xl tracking-[0.5em] font-bold py-3 rounded-xl outline-none transition-all ${isGuest ? 'bg-green-800 border-green-700 text-white focus:ring-green-400' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-green-500 border'}`}
                                          placeholder="000000" 
                                       />
                                    </div>
                                    <div className="text-center">
                                       <button type="button" className={`text-xs font-bold hover:underline ${isGuest ? 'text-green-300' : 'text-green-600'}`}>
                                          Resend Verification Code
                                       </button>
                                    </div>
                                 </div>
                              )}

                              {forgotStep === 'RESET' && (
                                 <div className="space-y-4">
                                    <div className="relative">
                                       <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                       <input 
                                          type="password" 
                                          required 
                                          value={newPassword} 
                                          onChange={(e) => setNewPassword(e.target.value)} 
                                          className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all ${isGuest ? 'bg-green-800 border-green-700 text-white focus:ring-green-400 placeholder:text-green-200' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-green-500 placeholder:text-slate-400 border'}`}
                                          placeholder="New Password" 
                                       />
                                    </div>
                                    <div className="relative">
                                       <RefreshCw className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                       <input 
                                          type="password" 
                                          required 
                                          value={confirmPassword} 
                                          onChange={(e) => setConfirmPassword(e.target.value)} 
                                          className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all ${isGuest ? 'bg-green-800 border-green-700 text-white focus:ring-green-400 placeholder:text-green-200' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-green-500 placeholder:text-slate-400 border'}`}
                                          placeholder="Confirm New Password" 
                                       />
                                    </div>
                                 </div>
                              )}

                              {error && (
                                 <div className={`p-3 text-sm font-medium rounded-lg text-center border animate-shake ${isGuest ? 'bg-red-900/50 border-red-800 text-red-200' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                    {error}
                                 </div>
                              )}

                              <button 
                                 type="submit" 
                                 disabled={isProcessing}
                                 className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 ${isGuest ? 'bg-white text-green-900 hover:bg-green-50' : 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'} ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                              >
                                 {isProcessing ? (
                                    <RefreshCw className="animate-spin" size={20} />
                                 ) : (
                                    <>
                                       <span>
                                          {forgotStep === 'EMAIL' && 'Send Code'}
                                          {forgotStep === 'VERIFY' && 'Verify Code'}
                                          {forgotStep === 'RESET' && 'Reset Password'}
                                       </span>
                                       <ChevronRight size={20} />
                                    </>
                                 )}
                              </button>
                           </form>
                        </>
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};
