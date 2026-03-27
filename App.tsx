
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatInterface from './components/ChatInterface';
import LoginModal from './components/LoginModal';
import GlobalCollege from './components/GlobalCollege';
import ContactOverlay from './components/ContactOverlay';
import ShipmentTracker from './components/ShipmentTracker';
import NewsSection from './components/NewsSection';
import AboutOverlay from './components/AboutOverlay';
import { ABOUT_US_SUMMARY } from './constants';

const App: React.FC = () => {
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = () => {
      const savedUser = localStorage.getItem('trade_user');
      if (savedUser) setUser(savedUser);
      else setUser(null);
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const handleLogin = (userName: string) => {
    setUser(userName);
    localStorage.setItem('trade_user', userName);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('trade_user');
  };

  const handleQuickAction = (topic: string) => {
    let prompt = "";
    switch(topic) {
      case 'DONLEMSONTRADE Intelligence': prompt = "Tell me about the DONLEMSONTRADE intelligence platform and how it helps with Nigerian trade data and standards."; break;
      case 'Trade as a Service': prompt = "How does DONLEMSONTRADE 'Trade as a Service' model work for outsourcing export departments?"; break;
      case 'E-Learning': 
        document.getElementById('college-section')?.scrollIntoView({ behavior: 'smooth' });
        return;
      case 'Tracking':
        document.getElementById('tracking-section')?.scrollIntoView({ behavior: 'smooth' });
        return;
      case 'News':
        setIsNewsOpen(true);
        return;
      case 'Contact':
        setIsContactOpen(true);
        return;
      case 'About':
        setIsAboutOpen(true);
        return;
      case 'Import': prompt = "Explain the Nigerian import process via DONLEMSONTRADE and best practices."; break;
      case 'Export': prompt = "What are the requirements for exporting goods from Nigeria internationally using DONLEMSONTRADE?"; break;
      case 'Home': window.scrollTo({ top: 0, behavior: 'smooth' }); return;
      default: return;
    }
    if (prompt) {
      setExternalPrompt(prompt);
      setTimeout(() => setExternalPrompt(null), 100);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar 
        onAction={handleQuickAction} 
        onLoginClick={() => setIsLoginModalOpen(true)}
        user={user}
        onLogout={handleLogout}
      />
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={handleLogin}
      />

      <ContactOverlay 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />

      <NewsSection 
        isOpen={isNewsOpen}
        onClose={() => setIsNewsOpen(false)}
      />

      <AboutOverlay
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Hero / Header Section */}
      <header className="shipping-bg py-40 relative overflow-hidden border-b border-blue-900 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10 animate-fade-up">
          <div className="inline-block bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-fade-up">
            Official Nigerian Trade Gateway
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-white mb-6 tracking-tighter leading-none animate-float">
            DONLEMSON<span className="text-emerald-400">TRADE</span>
          </h1>
          <p className="text-xl md:text-3xl text-blue-100 max-w-3xl mx-auto font-medium leading-relaxed stagger-1 animate-fade-up">
            The standard for digital trade intelligence. <br className="hidden md:block" /> 
            Navigating Nigerian borders with expert compliance.
          </p>
          <div className="mt-16 flex flex-wrap justify-center gap-6 stagger-2 animate-fade-up">
            <button 
              onClick={() => setIsContactOpen(true)}
              className="px-10 py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all"
            >
              Consult an Expert
            </button>
            <button 
              onClick={() => handleQuickAction('Tracking')}
              className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/20 transition-all"
            >
              Track Shipment <i className="fas fa-box-open ml-2"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full space-y-0">
        {/* Statistics or Social Proof */}
        <section className="bg-blue-900 py-12 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { label: 'Trade Volume', val: '$2B+' },
                { label: 'Compliance Rate', val: '100%' },
                { label: 'Port Partners', val: '45+' },
                { label: 'Global Reach', val: '120+' }
              ].map((stat, i) => (
                <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <p className="text-emerald-400 text-2xl font-black">{stat.val}</p>
                  <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Services Section */}
        <section className="max-w-7xl mx-auto px-4 py-32">
          <div className="text-center mb-20 animate-fade-up">
            <h2 className="text-4xl font-black text-blue-900 uppercase tracking-tighter mb-4">Our Trade Ecosystem</h2>
            <div className="w-24 h-2 bg-emerald-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'Shipping Intelligence',
                desc: 'Deep data analytics on Nigerian port arrivals, tariffs, and duty estimation via NRS.',
                img: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&q=80&w=800',
                label: 'Data Core',
                action: 'DONLEMSONTRADE Intelligence'
              },
              {
                title: 'Compliance Desk',
                desc: 'Expert Form M and PAAR assistance to ensure your goods never get stuck at the terminal.',
                img: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800',
                label: 'Logistics',
                action: 'Trade as a Service'
              },
              {
                title: 'Trade Academy',
                desc: 'The Global College offers certified pathways to becoming a logistics master.',
                img: 'https://images.unsplash.com/photo-1521791136064-7986c2923216?auto=format&fit=crop&q=80&w=800',
                label: 'Education',
                action: 'E-Learning'
              }
            ].map((card, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 group animate-fade-up" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="h-72 relative overflow-hidden">
                  <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-transparent"></div>
                  <div className="absolute top-8 left-8 bg-white/95 px-5 py-2 rounded-full shadow-xl">
                    <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{card.label}</span>
                  </div>
                </div>
                <div className="p-12 flex-1 flex flex-col">
                  <h3 className="text-3xl font-black text-blue-900 mb-6 group-hover:text-emerald-600 transition-colors tracking-tight uppercase leading-none">{card.title}</h3>
                  <p className="text-gray-500 leading-relaxed mb-10 text-sm font-medium">{card.desc}</p>
                  <button 
                    onClick={() => handleQuickAction(card.action)}
                    className="mt-auto py-5 px-8 bg-slate-50 text-blue-900 font-black rounded-2xl hover:bg-blue-900 hover:text-white transition-all text-[11px] uppercase tracking-[0.2em] flex items-center justify-center space-x-3 shadow-sm"
                  >
                    <span>Activate Service</span>
                    <i className="fas fa-arrow-right text-[10px]"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tracking Section */}
        <section id="tracking-section" className="bg-slate-50 py-32 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
             <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="lg:w-1/2 space-y-8 animate-fade-up">
                  <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <i className="fas fa-globe"></i>
                    <span>Global Logistics Network</span>
                  </div>
                  <h2 className="text-5xl font-black text-blue-900 leading-none tracking-tighter uppercase">Trace your documents across oceans.</h2>
                  <p className="text-gray-500 text-lg font-medium leading-relaxed">
                    Our intelligent tracking gateway connects directly to 50+ major shipping lines. Enter your Bill of Lading or Container number to get instant verification of your cargo's position and clearance status.
                  </p>
                  <ul className="space-y-4">
                    {['Automated Shipping Line Detection', 'Direct API Redirects', 'Nigerian Port Clearance Integration'].map((item, i) => (
                      <li key={i} className="flex items-center space-x-3 text-sm font-bold text-blue-900">
                        <i className="fas fa-check-circle text-emerald-500"></i>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="lg:w-1/2 w-full animate-fade-up stagger-1">
                  <ShipmentTracker />
                </div>
             </div>
          </div>
        </section>

        {/* Global Trade College Section */}
        <div id="college-section" className="bg-slate-100/50 py-16">
          <GlobalCollege />
        </div>

        {/* AI Chat Section */}
        <section className="bg-blue-900 py-32 px-4 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
             <img src="https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" />
          </div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-16 animate-fade-up">
              <div className="inline-block bg-emerald-500 text-white text-[9px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full mb-6 shadow-lg shadow-emerald-500/20">
                Trade Desk
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-4">Trade Intelligence Assistant</h2>
              <p className="text-blue-200 font-medium text-sm">Ask about Form M, PAAR, Incoterms, or Global Logistics.</p>
            </div>
            <div className="animate-fade-up stagger-2">
              <ChatInterface externalPrompt={externalPrompt} />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-12">
            <div className="w-12 h-12 bg-blue-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-900/20">
              <i className="fas fa-globe-africa text-xl"></i>
            </div>
            <span className="font-black text-3xl text-blue-900 uppercase tracking-[0.3em] cursor-pointer" onClick={() => handleQuickAction('Home')}>DONLEMSONTRADE</span>
          </div>
          <div className="flex justify-center space-x-10 mb-12 text-gray-400">
            <button onClick={() => window.open('https://linkedin.com', '_blank')} className="hover:text-blue-900 transition-all hover:scale-125"><i className="fab fa-linkedin text-2xl"></i></button>
            <button onClick={() => window.open('https://twitter.com', '_blank')} className="hover:text-blue-900 transition-all hover:scale-125"><i className="fab fa-twitter text-2xl"></i></button>
            <button onClick={() => handleQuickAction('Contact')} className="hover:text-blue-900 transition-all hover:scale-125"><i className="fab fa-whatsapp text-2xl"></i></button>
          </div>
          <div className="max-w-md mx-auto mb-12 h-px bg-gray-100"></div>
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <button onClick={() => handleQuickAction('About')} className="hover:text-blue-900">About Us</button>
            <button onClick={() => handleQuickAction('News')} className="hover:text-blue-900">News Feed</button>
            <button onClick={() => handleQuickAction('Contact')} className="hover:text-blue-900">Contact Desk</button>
          </div>
          <p className="text-[10px] text-gray-400 font-black tracking-[0.6em] uppercase">
            &copy; 2026 DONLEMSON TRADE CONSULTING. LAGOS, NIGERIA. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
