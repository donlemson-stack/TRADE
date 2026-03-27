
import React from 'react';

interface NavbarProps {
  onAction: (topic: string) => void;
  onLoginClick: () => void;
  user: string | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAction, onLoginClick, user, onLogout }) => {
  return (
    <nav className="bg-white/90 backdrop-blur-md text-blue-900 border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/10 animate-float">
            <i className="fas fa-globe-africa text-xl"></i>
          </div>
          <span className="font-black text-2xl tracking-tighter">DONLEMSON<span className="text-emerald-600">TRADE</span></span>
        </div>
        
        <div className="hidden lg:flex items-center space-x-8 text-[11px] font-black uppercase tracking-[0.2em]">
          <button onClick={() => onAction('Home')} className="hover:text-emerald-600 transition">Home</button>
          <button onClick={() => onAction('About')} className="hover:text-emerald-600 transition">About Us</button>
          <button onClick={() => onAction('News')} className="hover:text-emerald-600 transition">News</button>
          <button onClick={() => onAction('Contact')} className="hover:text-emerald-600 transition">Contact</button>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-blue-900 hover:text-emerald-600 transition-colors">
            <i className="fas fa-search text-lg"></i>
          </button>
          
          {user ? (
            <div className="flex items-center space-x-3 bg-gray-50 pl-1 pr-3 py-1 rounded-full border border-gray-200">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user.charAt(0)}
              </div>
              <span className="text-xs font-bold text-blue-900">{user}</span>
              <button 
                onClick={onLogout}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
              >
                <i className="fas fa-sign-out-alt text-xs"></i>
              </button>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-blue-900 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg shadow-blue-900/10 active:scale-95"
            >
              Portal Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
