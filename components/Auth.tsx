
import React, { useState } from 'react';
import { NIGERIAN_UNIVERSITIES } from '../data/universities';
import { UserRole } from '../types';
import { Upload, ChevronRight, BookOpen, ShoppingBag, Users } from 'lucide-react';

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
          name: 'Demo User',
          email,
          role: UserRole.STUDENT,
          university: 'University of Lagos',
          verified: true,
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
          verified: role === UserRole.GUEST, 
          joinedAt: new Date().toISOString()
        });
      } else {
        setError('Please fill all fields');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 bg-green-900 text-white relative overflow-hidden flex-col justify-between p-12">
         <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-green-950 opacity-90 z-0"></div>
         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-green-400 opacity-20 blur-3xl z-0"></div>
         
         <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-md inline-flex items-center space-x-2 px-4 py-2 rounded-lg mb-8">
               <div className="bg-white text-green-800 font-bold p-1 rounded">U</div>
               <span className="font-bold tracking-wide">Unispace</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
               Welcome to your <br/>
               <span className="text-green-400">Digital Campus.</span>
            </h1>
            <p className="text-green-100 text-lg max-w-md">Join thousands of Nigerian students buying, selling, and studying smarter.</p>
         </div>

         <div className="relative z-10 grid grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur p-4 rounded-xl border border-white/10">
               <ShoppingBag className="text-green-300 mb-2" />
               <p className="font-bold text-sm">UniMarket</p>
            </div>
            <div className="bg-white/10 backdrop-blur p-4 rounded-xl border border-white/10">
               <BookOpen className="text-green-300 mb-2" />
               <p className="font-bold text-sm">StudyHub AI</p>
            </div>
            <div className="bg-white/10 backdrop-blur p-4 rounded-xl border border-white/10">
               <Users className="text-green-300 mb-2" />
               <p className="font-bold text-sm">Campus</p>
            </div>
         </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 bg-white flex flex-col justify-center p-8 lg:p-20 overflow-y-auto">
         <div className="max-w-md mx-auto w-full">
            <div className="lg:hidden flex justify-center mb-8">
               <div className="bg-green-600 text-white p-2 rounded-lg font-bold text-2xl">U</div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-2">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
            <p className="text-slate-500 mb-8">
               {isLogin ? 'Enter your details to access your account.' : 'Join the community today.'}
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                   {/* Role Toggle */}
                   <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
                      <button
                        type="button"
                        onClick={() => setRole(UserRole.STUDENT)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === UserRole.STUDENT ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500'}`}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole(UserRole.GUEST)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === UserRole.GUEST ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500'}`}
                      >
                        Guest
                      </button>
                   </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" placeholder="John Doe" />
                  </div>

                  {role === UserRole.STUDENT && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">University</label>
                        <select required value={university} onChange={(e) => setUniversity(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                          <option value="">Select University</option>
                          {NIGERIAN_UNIVERSITIES.map((uni, index) => (
                            <option key={index} value={uni}>{uni}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">School ID / Admission Letter</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative group">
                           <input 
                             type="file" 
                             required 
                             accept=".pdf,.jpg,.png" 
                             onChange={(e) => setIdFile(e.target.files ? e.target.files[0] : null)}
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                           />
                           <div className="flex flex-col items-center">
                              <div className="bg-green-50 p-3 rounded-full text-green-600 mb-2 group-hover:scale-110 transition-transform">
                                 <Upload size={20} />
                              </div>
                              <p className="text-sm text-slate-500 font-medium">{idFile ? idFile.name : 'Click to upload document'}</p>
                           </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" placeholder="you@uni.edu.ng" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" placeholder="••••••••" />
              </div>

              {!isLogin && (
                <div className="flex items-start">
                   <div className="flex items-center h-5">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                      />
                   </div>
                   <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="font-medium text-slate-700">
                         I agree to the <button type="button" onClick={onViewTerms} className="text-green-600 hover:underline">Terms & Conditions</button>
                      </label>
                   </div>
                </div>
              )}

              {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg text-center">{error}</div>}

              <button type="submit" className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center space-x-2">
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ChevronRight size={20} />
              </button>
            </form>

            <div className="mt-8 text-center space-y-4">
               <p className="text-slate-600">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-green-600 hover:underline">
                     {isLogin ? 'Sign Up' : 'Log In'}
                  </button>
               </p>
               <button onClick={onNavigateToLanding} className="text-sm text-slate-400 hover:text-slate-600 font-medium">
                  Back to Homepage
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
