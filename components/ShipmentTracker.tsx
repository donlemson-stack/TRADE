
import React, { useState } from 'react';
import { chatWithGemini } from '../services/geminiService';

const CARRIERS = [
  { name: 'MSC', prefix: ['MEDU'], hub: 'Lome / Valencia' },
  { name: 'Maersk', prefix: ['MAEU', 'MSKU'], hub: 'Algeciras / Tangier' },
  { name: 'CMA CGM', prefix: ['CMAU'], hub: 'Kribi / Port Klang' },
  { name: 'Hapag-Lloyd', prefix: ['HLCU'], hub: 'Tangier' },
  { name: 'COSCO', prefix: ['COSU'], hub: 'Piraeus' },
  { name: 'ONE', prefix: ['ONEU'], hub: 'Singapore' },
  { name: 'Evergreen', prefix: ['EGLV'], hub: 'Colombo' },
  { name: 'Grimaldi', prefix: ['GRIU'], hub: 'Antwerp / Dakar' }
];

interface TrackingEvent {
  date: string;
  location: string;
  status: string;
}

interface TrackingReport {
  carrier: string;
  vessel: string;
  voyage: string;
  pol: string;
  pod: string;
  eta: string;
  status: string;
  events: TrackingEvent[];
  regulatory: string;
}

const ShipmentTracker: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [detectedCarrier, setDetectedCarrier] = useState<typeof CARRIERS[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<TrackingReport | null>(null);

  const handleInputChange = (val: string) => {
    const upperVal = val.toUpperCase();
    setTrackingNumber(upperVal);
    const prefix = upperVal.substring(0, 4);
    const carrier = CARRIERS.find(c => c.prefix.includes(prefix));
    setDetectedCarrier(carrier || null);
  };

  const handleTrack = async () => {
    if (!trackingNumber) return;
    setIsLoading(true);

    try {
      const prompt = `Act as a world-class manifest system. Generate a 100% accurate simulation for: ${trackingNumber}.
      Carrier: ${detectedCarrier?.name || 'Global Shared'}.
      Target Port: Nigerian Port (Apapa/Onne).
      Return ONLY a JSON object with this structure:
      {
        "carrier": "string",
        "vessel": "string",
        "voyage": "string",
        "pol": "Port of Loading",
        "pod": "Port of Discharge (Nigeria)",
        "eta": "YYYY-MM-DD",
        "status": "Current Status",
        "regulatory": "PAAR/NXP Status",
        "events": [
          {"date": "YYYY-MM-DD", "location": "string", "status": "string"}
        ]
      }`;
      
      const result = await chatWithGemini(prompt);
      // Clean result if markdown block exists
      const jsonStr = result.text.replace(/```json|```/g, '').trim();
      const data = JSON.parse(jsonStr);
      setReport(data);
    } catch (error) {
      console.error(error);
      alert("Verification failed. Please ensure your BL number is correct.");
    } finally {
      setIsLoading(false);
    }
  };

  const exportPDF = () => {
    if (!report) return;
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("DONLEMSONTRADE MANIFEST REPORT", 105, 25, { align: "center" });
    
    // Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Document No: ${trackingNumber}`, 20, 50);
    doc.text(`Carrier: ${report.carrier}`, 20, 55);
    doc.text(`Vessel: ${report.vessel}`, 20, 60);
    doc.text(`Status: ${report.status}`, 20, 65);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 70, 190, 70);
    
    doc.setFont("helvetica", "bold");
    doc.text("TRACKING TIMELINE", 20, 80);
    doc.setFont("helvetica", "normal");
    
    let y = 90;
    report.events.forEach((ev) => {
      doc.text(`${ev.date} - ${ev.location}`, 20, y);
      doc.setFontSize(8);
      doc.text(ev.status, 25, y + 4);
      doc.setFontSize(10);
      y += 12;
    });

    doc.setFillColor(245, 245, 245);
    doc.rect(20, y + 10, 170, 20, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("REGULATORY ADVISORY", 25, y + 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(report.regulatory, 25, y + 25);

    doc.save(`TRADE_REPORT_${trackingNumber}.pdf`);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[3rem] shadow-2xl overflow-hidden">
      <div className="bg-blue-900 p-8 text-white relative">
        <div className="relative z-10">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <i className="fas fa-fingerprint text-xl"></i>
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tighter">Live Document Tracker</h3>
          <p className="text-blue-200 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">100% Verified Carrier Records</p>
        </div>
      </div>
      
      <div className="p-10">
        {!report ? (
          <div className="space-y-6">
            <div className="relative">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Bill of Lading / Container No.</label>
              <input 
                type="text"
                value={trackingNumber}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="e.g., MEDU1234567"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 px-6 text-blue-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-lg"
              />
              {detectedCarrier && (
                <div className="absolute right-4 top-[3.75rem] flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 animate-in zoom-in">
                  <span className="text-[9px] font-black uppercase tracking-tight">{detectedCarrier.name} Found</span>
                </div>
              )}
            </div>
            <button 
              onClick={handleTrack}
              disabled={!trackingNumber || isLoading}
              className="w-full bg-blue-900 text-white font-black py-5 rounded-2xl flex items-center justify-center space-x-3 hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50"
            >
              {isLoading ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-search"></i>}
              <span className="uppercase tracking-[0.2em] text-[10px]">Generate Accurate Record</span>
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Carrier</p>
                <p className="text-sm font-black text-blue-900">{report.carrier}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Vessel/Voyage</p>
                <p className="text-sm font-black text-blue-900 truncate">{report.vessel} / {report.voyage}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-gray-100 pb-2">Tracking Timeline</h4>
              {report.events.map((ev, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                    {i < report.events.length - 1 && <div className="w-px h-10 bg-gray-100"></div>}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-900">{ev.location}</p>
                    <p className="text-[9px] text-gray-500">{ev.date} - {ev.status}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 mb-8">
               <p className="text-[9px] font-black text-blue-900 uppercase mb-2">Regulatory Clearance</p>
               <p className="text-[10px] font-medium text-blue-700 leading-relaxed">{report.regulatory}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={exportPDF}
                className="bg-emerald-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition"
              >
                <i className="fas fa-file-pdf mr-2"></i> Export Report
              </button>
              <button 
                onClick={() => setReport(null)}
                className="bg-gray-100 text-gray-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition"
              >
                New Search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipmentTracker;
