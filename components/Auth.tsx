
import React, { useState } from 'react';
import { NIGERIAN_UNIVERSITIES } from '../data/universities';
import { UserRole } from '../types';
import { Upload, ChevronRight, CheckCircle2, Globe2, LayoutGrid, Facebook } from 'lucide-react';

interface AuthProps {
  onLogin: (userData: any) => void;
  onNavigateToLanding: () => void;
  onViewTerms: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onNavigateToLanding, onViewTerms }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (email && password) {
        onLogin({
          name: role === UserRole.STUDENT ? 'Student User' : 'Guest Explorer',
          email,
          role,
          university: role === UserRole.STUDENT ? 'University of Lagos' : 'N/A',
          verified: role === UserRole.STUDENT, // Mock verification for student demo
          joinedAt: new Date(Date.now() - 86400000).toISOString()
        });
      } else {
        setError('Please enter email and password');
      }
    } else {
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
          verified: role === UserRole.GUEST, // Guests auto-verified as users, Students need check
          joinedAt: new Date().toISOString()
        });
      } else {
        setError('Please fill all fields');
      }
    }
  };

  const handleSocialLogin = (provider: 'Google' | 'Facebook') => {
    // Mock Social Login
    onLogin({
      name: `${provider} User`,
      email: `user@${provider.toLowerCase()}.com`,
      role: role,
      university: 'N/A',
      verified: false,
      joinedAt: new Date().toISOString(),
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`
    });
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Visual Side (Hidden on Mobile) */}
      <div className={`hidden lg:flex w-5/12 ${role === UserRole.STUDENT ? 'bg-green-900' : 'bg-slate-900'} text-white relative overflow-hidden flex-col justify-between p-12 transition-colors duration-500`}>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

         <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-8">
               <div className="bg-white/20 backdrop-blur p-2 rounded-lg">
                  <span className="font-bold text-xl">U</span>
               </div>
               <span className="text-xl font-bold tracking-widest uppercase">Unispace</span>
            </div>
            
            <h1 className="text-5xl font-bold leading-tight mb-6">
              {role === UserRole.STUDENT ? (
                <>Connect.<br/>Study.<br/><span className="text-green-400">Thrive.</span></>
              ) : (
                <>Explore.<br/>Discover.<br/><span className="text-blue-400">Experience.</span></>
              )}
            </h1>
            <p className="text-lg opacity-80 max-w-sm leading-relaxed">
              {role === UserRole.STUDENT 
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
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative overflow-y-auto">
         <button onClick={onNavigateToLanding} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 font-medium text-sm">
            Skip to Home
         </button>

         <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
               <h2 className="text-3xl font-bold text-slate-900">
                 {isLogin ? 'Welcome Back' : 'Create Account'}
               </h2>
               <p className="text-slate-500 mt-2">
                 {isLogin ? 'Enter your credentials to access your space.' : 'Start your journey with Unispace today.'}
               </p>
            </div>

            {/* Role Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl flex">
               <button
                 type="button"
                 onClick={() => setRole(UserRole.STUDENT)}
                 className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${role === UserRole.STUDENT ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <span>Student</span>
               </button>
               <button
                 type="button"
                 onClick={() => setRole(UserRole.GUEST)}
                 className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${role === UserRole.GUEST ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <span>Guest</span>
               </button>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => handleSocialLogin('Google')} className="flex items-center justify-center space-x-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                     <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                     <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                     <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                     <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-600">Google</span>
               </button>
               <button onClick={() => handleSocialLogin('Facebook')} className="flex items-center justify-center space-x-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <Facebook className="text-[#1877F2]" size={20} fill="#1877F2" />
                  <span className="text-sm font-semibold text-slate-600">Facebook</span>
               </button>
            </div>

            <div className="relative">
               <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
               </div>
               <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or continue with email</span>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
               {!isLogin && (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                        <input 
                           type="text" 
                           required 
                           value={name} 
                           onChange={(e) => setName(e.target.value)} 
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all" 
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
                                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none"
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
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                     <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                        placeholder="you@example.com" 
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                     <input 
                        type="password" 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                        placeholder="••••••••" 
                     />
                  </div>
               </div>

               {!isLogin && (
                  <div className="flex items-center space-x-2">
                     <input
                        id="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                     />
                     <label htmlFor="terms" className="text-sm text-slate-600">
                        I agree to the <button type="button" onClick={onViewTerms} className="text-green-600 font-bold hover:underline">Terms of Service</button>
                     </label>
                  </div>
               )}

               {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center border border-red-100">
                     {error}
                  </div>
               )}

               <button 
                  type="submit" 
                  className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 ${role === UserRole.STUDENT ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-slate-800 hover:bg-slate-900 shadow-slate-200'}`}
               >
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ChevronRight size={20} />
               </button>
            </form>

            <div className="text-center pt-4">
               <p className="text-slate-500 text-sm">
                  {isLogin ? "New to Unispace? " : "Already have an account? "}
                  <button onClick={() => setIsLogin(!isLogin)} className={`font-bold hover:underline ${role === UserRole.STUDENT ? 'text-green-600' : 'text-slate-800'}`}>
                     {isLogin ? 'Register Now' : 'Log In'}
                  </button>
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};
