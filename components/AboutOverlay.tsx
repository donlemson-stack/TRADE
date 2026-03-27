
import React from 'react';
import { ABOUT_US_SUMMARY } from '../constants';

interface AboutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutOverlay: React.FC<AboutOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[210] bg-white overflow-y-auto animate-in slide-in-from-right duration-500">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-blue-900 text-white p-6 flex items-center justify-between shadow-2xl z-20">
        <div className="flex items-center space-x-4">
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
            <i className="fas fa-chevron-left"></i>
          </button>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">About DONLEMSONTRADE</h2>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Our Mission & Expertise</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-blue-300">
          <i className="fas fa-shield-alt"></i>
          <span>Verified Trade Gateway</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[40vh] bg-blue-900 flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1521791136064-7986c2923216?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 scale-110"
          alt="Trade background"
        />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-6">
            Leading <span className="text-emerald-400">Nigeria</span> To The World.
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Bridging the gap between Nigerian businesses and the global market through intelligence, education, and technology.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-8">
            <h2 className="text-4xl font-black text-blue-900 uppercase tracking-tighter mb-8 border-b-4 border-emerald-500 inline-block">About Us</h2>
            <div className="prose prose-xl text-slate-600 leading-relaxed font-medium space-y-6">
              {ABOUT_US_SUMMARY.split('\n\n').map((paragraph, i) => (
                <p key={i} className="whitespace-pre-wrap">{paragraph}</p>
              ))}
            </div>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <i className="fas fa-history text-3xl text-emerald-600 mb-4"></i>
                <h4 className="text-xl font-black text-blue-900 uppercase mb-2">Our Foundation</h4>
                <p className="text-sm text-slate-500">Established to automate the complex regulatory framework of Nigerian customs and maritime laws.</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <i className="fas fa-rocket text-3xl text-emerald-600 mb-4"></i>
                <h4 className="text-xl font-black text-blue-900 uppercase mb-2">Our Vision</h4>
                <p className="text-sm text-slate-500">To become the default digital twin of the Nigerian Trade Corridor for every importer and exporter.</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 space-y-8">
            <div className="bg-blue-900 rounded-[3rem] p-10 text-white shadow-2xl">
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-6">Core Values</h3>
              <ul className="space-y-6">
                {[
                  { title: 'Transparency', icon: 'fa-eye' },
                  { title: 'Compliance', icon: 'fa-check-double' },
                  { title: 'Intelligence', icon: 'fa-brain' },
                  { title: 'Reliability', icon: 'fa-anchor' }
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <i className={`fas ${item.icon} text-emerald-400`}></i>
                    </div>
                    <span className="font-black uppercase tracking-widest text-[10px]">{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-10 border-2 border-slate-100 rounded-[3rem] text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Headquarters</p>
              <h4 className="text-blue-900 font-black text-lg uppercase leading-tight">Lagos, Nigeria</h4>
              <p className="text-slate-500 text-xs mt-2 font-medium">Global Operations Center</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-slate-50 py-24 px-6 text-center">
        <h3 className="text-3xl font-black text-blue-900 uppercase tracking-tighter mb-8">Ready to grow your global trade?</h3>
        <button 
          onClick={onClose}
          className="bg-blue-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl"
        >
          Explore Services
        </button>
      </div>

      {/* Footer Branding */}
      <div className="bg-white border-t border-gray-100 p-12 text-center">
        <div className="flex items-center justify-center space-x-2 text-blue-900 font-black text-xl tracking-tighter uppercase">
          <i className="fas fa-globe-africa"></i>
          <span>DONLEMSON<span className="text-emerald-600">TRADE</span></span>
        </div>
        <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.4em] mt-4">&copy; 2026 DONLEMSON TRADE CONSULTING</p>
      </div>
    </div>
  );
};

export default AboutOverlay;
