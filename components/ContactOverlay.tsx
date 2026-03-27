
import React, { useState } from 'react';
import { OFFICIAL_CONTACT } from '../constants';

interface ContactOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactOverlay: React.FC<ContactOverlayProps> = ({ isOpen, onClose }) => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({ name: '', contact: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');

    // Construct the message for WhatsApp
    const messageBody = `*New Inquiry from DONLEMSONTRADE*\n\n*Name:* ${formData.name}\n*Contact:* ${formData.contact}\n\n*Message:*\n${formData.message}`;
    
    const whatsappNumber = OFFICIAL_CONTACT.whatsapp.replace(/\+/g, '');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageBody)}`;

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');

    setTimeout(() => {
      setFormState('success');
      setTimeout(() => {
        setFormState('idle');
        setFormData({ name: '', contact: '', message: '' });
      }, 5000);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] bg-blue-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="bg-blue-900 p-8 text-white md:w-5/12 relative">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20">
            <i className="fas fa-headset text-2xl text-emerald-400"></i>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-4">Direct<br/>Contact</h2>
          <div className="space-y-6">
            <div className="group">
              <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">Call / WhatsApp</p>
              <a href={`tel:${OFFICIAL_CONTACT.phone}`} className="text-lg font-bold hover:text-emerald-400 transition">{OFFICIAL_CONTACT.phone}</a>
            </div>
            <div className="group">
              <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">Email Destination</p>
              <p className="text-sm font-bold truncate">{OFFICIAL_CONTACT.email}</p>
            </div>
            <div className="pt-4 flex space-x-4">
              <a href={`https://wa.me/${OFFICIAL_CONTACT.whatsapp.replace(/\+/g, '')}`} target="_blank" className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center hover:scale-110 transition">
                <i className="fab fa-whatsapp"></i>
              </a>
              <a href={`mailto:${OFFICIAL_CONTACT.email}`} className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center hover:scale-110 transition">
                <i className="fas fa-envelope"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 md:w-7/12 relative bg-white">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-blue-900 transition">
            <i className="fas fa-times text-xl"></i>
          </button>

          {formState === 'success' ? (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-check text-3xl text-emerald-600"></i>
              </div>
              <h3 className="text-xl font-black text-blue-900 uppercase">Inquiry Prepared</h3>
              <p className="text-gray-500 text-sm mt-2 font-medium">Opening WhatsApp to send your message to {OFFICIAL_CONTACT.phone}.</p>
              <div className="mt-6 flex flex-col space-y-2">
                <p className="text-gray-400 text-[10px] uppercase tracking-widest">Or send via Email</p>
                <a 
                  href={`mailto:${OFFICIAL_CONTACT.email}?subject=${encodeURIComponent(`New Trade Inquiry: ${formData.name}`)}&body=${encodeURIComponent(`Name: ${formData.name}\nContact: ${formData.contact}\n\nMessage:\n${formData.message}`)}`}
                  className="text-blue-900 font-black text-[10px] uppercase tracking-widest hover:text-emerald-600 transition"
                >
                  {OFFICIAL_CONTACT.email}
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-xl font-black text-blue-900 uppercase tracking-tighter mb-4">Send an Inquiry</h3>
              <input 
                required 
                placeholder="Full Name" 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <input 
                required 
                placeholder="Email or Phone Number" 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 outline-none"
                value={formData.contact}
                onChange={e => setFormData({...formData, contact: e.target.value})}
              />
              <textarea 
                required 
                placeholder="How can we help your business today?" 
                rows={4}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 outline-none resize-none"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              ></textarea>
              <button 
                type="submit" 
                className="w-full bg-blue-900 text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-3 hover:bg-emerald-600 transition shadow-xl"
              >
                <i className="fas fa-paper-plane text-[10px]"></i>
                <span className="uppercase tracking-widest text-[10px]">Submit to Trade Desk</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactOverlay;
