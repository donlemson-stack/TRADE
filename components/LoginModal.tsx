
import React, { useState, useEffect } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (name: string) => void;
  initialData?: { fullName: string; email: string; courseName?: string };
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, initialData }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || '');
      setEmail(initialData.email || '');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('form');
    setTimeout(() => {
      onLogin(fullName);
      setIsLoading(null);
      onClose();
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(provider);
    setTimeout(() => {
      onLogin(`${fullName || 'User'} (${provider})`);
      setIsLoading(null);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        
        {isLoading && isLoading !== 'form' && (
          <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="text-lg font-bold text-blue-900 uppercase tracking-tighter">Connecting to {isLoading}...</h3>
            <p className="text-gray-500 text-sm">Please wait while we verify your credentials with the provider.</p>
          </div>
        )}

        <div className="bg-blue-900 p-8 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-300 hover:text-white transition"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
            <i className={`fas ${initialData ? 'fa-user-plus text-emerald-400' : 'fa-shield-alt text-emerald-400'} text-3xl`}></i>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {initialData ? 'Confirm Registration' : 'Trade Portal Login'}
          </h2>
          <p className="text-blue-200 text-sm mt-1 font-medium">
            {initialData ? `Finalize your enrollment in ${initialData.courseName}` : 'Access your global trade dashboard'}
          </p>
        </div>
        
        <div className="p-8">
          {initialData && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
              <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Information from Assistant</p>
              <p className="text-xs text-emerald-800 font-medium italic">"I've pre-filled your details. Please check if they are correct before confirming."</p>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <i className="fas fa-user"></i>
                </span>
                <input 
                  required
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <i className="fas fa-envelope"></i>
                </span>
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 transition-all text-sm"
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
                {!initialData && <a href="#" className="text-[10px] font-bold text-emerald-600 hover:underline tracking-tight">Forgot Password?</a>}
              </div>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <i className="fas fa-lock"></i>
                </span>
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 transition-all text-sm"
                />
              </div>
            </div>

            <button 
              disabled={isLoading !== null}
              type="submit"
              className={`w-full ${initialData ? 'bg-emerald-600' : 'bg-blue-900'} text-white font-bold py-4 rounded-xl hover:opacity-90 shadow-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-2`}
            >
              {isLoading === 'form' ? (
                <i className="fas fa-circle-notch fa-spin"></i>
              ) : (
                <>
                  <span className="uppercase tracking-widest text-xs">{initialData ? 'Confirm & Sign In' : 'Secure Sign In'}</span>
                  <i className={`fas ${initialData ? 'fa-check' : 'fa-chevron-right'} text-[10px]`}></i>
                </>
              )}
            </button>
          </form>

          {!initialData && (
            <>
              <div className="relative py-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="bg-white px-4 text-gray-400 font-bold uppercase tracking-widest">Or Continue With</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => handleSocialLogin('Google')}
                  disabled={isLoading !== null}
                  type="button" 
                  className="flex flex-col items-center justify-center space-y-1.5 border border-gray-200 rounded-xl py-3 hover:bg-gray-50 transition group"
                >
                  <i className="fab fa-google text-lg text-[#DB4437]"></i>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Google</span>
                </button>
                <button 
                  onClick={() => handleSocialLogin('LinkedIn')}
                  disabled={isLoading !== null}
                  type="button" 
                  className="flex flex-col items-center justify-center space-y-1.5 border border-gray-200 rounded-xl py-3 hover:bg-gray-50 transition"
                >
                  <i className="fab fa-linkedin text-lg text-[#0077B5]"></i>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">LinkedIn</span>
                </button>
                <button 
                  onClick={() => handleSocialLogin('Microsoft')}
                  disabled={isLoading !== null}
                  type="button" 
                  className="flex flex-col items-center justify-center space-y-1.5 border border-gray-200 rounded-xl py-3 hover:bg-gray-50 transition"
                >
                  <i className="fab fa-microsoft text-lg text-[#00A4EF]"></i>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Office</span>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 font-medium">
            {initialData ? 'By confirming, you agree to our ' : 'New to the portal? '}
            <a href="#" className="text-emerald-600 font-bold hover:underline">
              {initialData ? 'Terms of Learning' : 'Apply for Membership'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
