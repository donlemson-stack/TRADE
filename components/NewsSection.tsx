
import React, { useState, useEffect } from 'react';
import { chatWithGemini } from '../services/geminiService';

interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  date: string;
  category: 'CBN Policy' | 'Local Trade' | 'International Trade';
  url: string;
}

const NewsSection: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNews();
    }
  }, [isOpen]);

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const prompt = `Search for the most recent (last 30 days) trade-related updates. 
      Specifically focus on:
      1. Central Bank of Nigeria (CBN) trade policies and circulars (e.g., Form M, NXP, Forex manuals).
      2. Local Nigerian trade news (Customs CET tariffs, port operations).
      3. International trade policy shifts affecting Nigeria (AfCFTA, global shipping regulations).

      Format the response as a JSON array of objects.
      Each object must have: 
      "title", 
      "summary" (3 detailed sentences explaining the impact), 
      "source", 
      "date", 
      "category" (must be one of: 'CBN Policy', 'Local Trade', 'International Trade'), 
      "url" (the original source link).`;
      
      const result = await chatWithGemini(prompt);
      // Clean result if markdown block exists
      const jsonStr = result.text.replace(/```json|```/g, '').trim();
      const data = JSON.parse(jsonStr);
      setNews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch trade news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto animate-in slide-in-from-right duration-500">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-blue-900 text-white p-6 flex items-center justify-between shadow-2xl z-20">
        <div className="flex items-center space-x-4">
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
            <i className="fas fa-chevron-left"></i>
          </button>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Policy & News Feed</h2>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Real-time CBN & International Intelligence</p>
          </div>
        </div>
        <button 
          onClick={fetchNews} 
          disabled={isLoading}
          className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl transition-all disabled:opacity-50"
        >
          {isLoading ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-redo-alt"></i>}
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-5xl font-black text-blue-900 uppercase tracking-tighter mb-4">Latest Regulatory Updates</h1>
          <p className="text-gray-500 font-medium text-lg">Stay ahead of the curve with direct insights into Nigerian and Global trade policy shifts.</p>
        </div>

        {isLoading ? (
          <div className="space-y-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row gap-10">
                <div className="md:w-1/4 h-32 bg-slate-200 rounded-3xl"></div>
                <div className="md:w-3/4 space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-10 bg-slate-200 rounded w-full"></div>
                  <div className="h-20 bg-slate-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10">
            {news.length > 0 ? news.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col md:flex-row gap-10 items-start"
              >
                <div className="md:w-1/4 shrink-0">
                  <div className={`inline-flex items-center space-x-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 ${
                    item.category === 'CBN Policy' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' :
                    item.category === 'Local Trade' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                    'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  }`}>
                    <i className={item.category === 'CBN Policy' ? 'fas fa-university' : 'fas fa-globe'}></i>
                    <span>{item.category}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-blue-900 uppercase tracking-tight">{item.source}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.date}</p>
                  </div>
                </div>
                
                <div className="md:w-3/4">
                  <h3 className="text-3xl font-black text-blue-900 mb-6 group-hover:text-emerald-600 transition-colors leading-none tracking-tighter uppercase">
                    {item.title}
                  </h3>
                  <div className="relative">
                    <div className="absolute left-0 top-0 w-1 h-full bg-emerald-100 group-hover:bg-emerald-500 transition-colors"></div>
                    <p className="text-gray-500 font-medium pl-6 mb-8 text-lg leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-3 bg-slate-50 text-blue-900 hover:bg-blue-900 hover:text-white px-8 py-4 rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest shadow-sm"
                  >
                    <span>Analyze Full Policy</span>
                    <i className="fas fa-external-link-alt text-[10px]"></i>
                  </a>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <i className="fas fa-newspaper text-5xl text-slate-200 mb-4"></i>
                <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">No recent policy updates found.</h3>
                <button onClick={fetchNews} className="mt-4 text-emerald-600 font-black uppercase tracking-widest text-xs hover:underline">Try Refreshing</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="bg-slate-50 border-t border-gray-100 p-12 text-center">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] mb-4">Powered by DONLEMSONTRADE Intelligence Engine</p>
        <div className="flex items-center justify-center space-x-2 text-blue-900 font-black text-xl tracking-tighter">
          <i className="fas fa-globe-africa"></i>
          <span>DONLEMSON<span className="text-emerald-600">TRADE</span></span>
        </div>
      </div>
    </div>
  );
};

export default NewsSection;
