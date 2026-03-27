
import React, { useState, useEffect, useRef } from 'react';
import { TRADE_COURSES, COURSE_FEE } from '../constants';
import { Course } from '../types';
import { chatWithGemini } from '../services/geminiService';
import { GoogleGenAI, Modality } from "@google/genai";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

const generateAudioWithRetry = async (chunk: string, retryCount = 0): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: chunk }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { voiceName: 'Kore' } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (err: any) {
    if ((err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) && retryCount < MAX_RETRIES) {
      const delay = INITIAL_BACKOFF_MS * Math.pow(2, retryCount);
      console.warn(`Rate limit hit for TTS. Retrying in ${delay}ms... (Attempt ${retryCount + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateAudioWithRetry(chunk, retryCount + 1);
    }
    throw err;
  }
};

const GlobalCollege: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState<string[]>([]);
  const [filter, setFilter] = useState<'All' | 'My Learning'>('All');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<Course | null>(null);
  const [user, setUser] = useState<string>('Trade Professional');
  
  const [showNameConfirmation, setShowNameConfirmation] = useState(false);
  const [certificateName, setCertificateName] = useState('');

  const [activeLesson, setActiveLesson] = useState<{ course: Course, moduleIndex: number } | null>(null);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [isLessonLoading, setIsLessonLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizStep, setCurrentQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [isGraduated, setIsGraduated] = useState(false);

  // Tutor Chat State
  const [isTutorChatOpen, setIsTutorChatOpen] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [tutorInput, setTutorInput] = useState('');
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const tutorChatEndRef = useRef<HTMLDivElement>(null);

  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseOffsetRef = useRef<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('donlemson_enrolled');
    if (saved) setEnrolled(JSON.parse(saved));
    const savedUser = localStorage.getItem('trade_user');
    if (savedUser) {
        setUser(savedUser);
        setCertificateName(savedUser);
    }
    
    return () => {
      stopAudioCompletely();
    };
  }, []);

  useEffect(() => {
    tutorChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tutorMessages, isTutorLoading]);

  const stopAudioCompletely = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    pauseOffsetRef.current = 0;
  };

  const toggleAudio = async (text: string) => {
    if (isPlaying) {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }
      pauseOffsetRef.current += audioContextRef.current ? audioContextRef.current.currentTime - startTimeRef.current : 0;
      setIsPlaying(false);
      setIsPaused(true);
      return;
    }

    if (audioBufferRef.current) {
      startPlayback(pauseOffsetRef.current);
      return;
    }

    setIsAudioLoading(true);
    try {
      const chunks = text.match(/.{1,1000}(\s|$)/g) || [text];
      const fullAudioBuffers: AudioBuffer[] = [];

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      for (const chunk of chunks) {
        const base64Audio = await generateAudioWithRetry(chunk);

        if (base64Audio) {
          const binaryString = atob(base64Audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
          
          const dataInt16 = new Int16Array(bytes.buffer);
          const buffer = audioContextRef.current.createBuffer(1, dataInt16.length, 24000);
          const channelData = buffer.getChannelData(0);
          for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
          fullAudioBuffers.push(buffer);
        }
      }

      if (fullAudioBuffers.length === 0) throw new Error("No audio data was generated.");

      const totalLength = fullAudioBuffers.reduce((acc, b) => acc + b.length, 0);
      const combinedBuffer = audioContextRef.current.createBuffer(1, totalLength, 24000);
      let offset = 0;
      for (const buffer of fullAudioBuffers) {
        combinedBuffer.getChannelData(0).set(buffer.getChannelData(0), offset);
        offset += buffer.length;
      }

      audioBufferRef.current = combinedBuffer;
      pauseOffsetRef.current = 0;
      startPlayback(0);
    } catch (err: any) {
      console.error("Audio generation failed:", err);
      let errorMessage = "Audio trainer failed to synthesize content. Please check your connection.";
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = "Audio generation is temporarily unavailable due to high demand. Please try again in a few moments.";
      }
      alert(errorMessage);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const startPlayback = (offset: number) => {
    if (!audioContextRef.current || !audioBufferRef.current) return;
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      if (audioSourceRef.current === source) {
        setIsPlaying(false);
        setIsPaused(false);
        pauseOffsetRef.current = 0;
        audioSourceRef.current = null;
      }
    };

    const playTime = Math.max(0, offset);
    source.start(0, playTime);
    
    startTimeRef.current = audioContextRef.current.currentTime;
    audioSourceRef.current = source;
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleEnrollInitiation = (course: Course) => {
    if (enrolled.includes(course.id)) return;
    if (course.isFree) {
      completeEnrollment(course.id);
      return;
    }
    setShowPaymentModal(course);
  };

  const completeEnrollment = (courseId: string) => {
    const newEnrolled = [...enrolled, courseId];
    setEnrolled(newEnrolled);
    localStorage.setItem('donlemson_enrolled', JSON.stringify(newEnrolled));
  };

  const handleConfirmPayment = () => {
    if (!showPaymentModal) return;
    setIsProcessingPayment(true);
    setShowPaymentModal(null);
    setTimeout(() => {
      completeEnrollment(showPaymentModal.id);
      setIsProcessingPayment(false);
      alert(`Payment Confirmed! Access granted.`);
    }, 2500);
  };

  const startLesson = async (course: Course, index: number = 0) => {
    stopAudioCompletely();
    audioBufferRef.current = null;
    setActiveLesson({ course, moduleIndex: index });
    setIsLessonLoading(true);
    setLessonContent('');
    setShowQuiz(false);
    setIsGraduated(false);
    setCurrentQuizStep(0);
    setQuizScore(0);
    setTutorMessages([]);
    setIsTutorChatOpen(false);
    
    try {
      const prompt = `Act as a world-class trade professor at DONLEMSONTRADE Global College. 
      The course is "${course.title}". 
      Teach Module ${index + 1}: "${course.modules[index]}" from beginning to end with extreme detail. 
      Structure your lesson with clear text and professional tone.`;
      
      const result = await chatWithGemini(prompt);
      setLessonContent(result.text);
    } catch (err) {
      setLessonContent("Failed to load lesson. Please retry.");
    } finally {
      setIsLessonLoading(false);
    }
  };

  const generateQuiz = async () => {
    if (!activeLesson) return;
    setIsQuizLoading(true);
    try {
      const prompt = `Generate a 3-question multiple choice quiz for: "${activeLesson.course.modules[activeLesson.moduleIndex]}". 
      Return JSON: [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": 0}].`;
      const response = await chatWithGemini(prompt);
      const jsonStr = response.text.replace(/```json|```/g, '').trim();
      setQuizQuestions(JSON.parse(jsonStr));
      setShowQuiz(true);
    } catch (err) {
      alert("Grading system failed. Please try again.");
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleAnswer = (selectedIndex: number) => {
    const isCorrect = selectedIndex === quizQuestions[currentQuizStep].correctAnswer;
    const newScore = isCorrect ? quizScore + 1 : quizScore;
    if (isCorrect) setQuizScore(newScore);

    if (currentQuizStep < quizQuestions.length - 1) {
      setCurrentQuizStep(currentQuizStep + 1);
    } else {
      if (newScore >= 2) {
        if (activeLesson!.moduleIndex === activeLesson!.course.modules.length - 1) {
          setIsGraduated(true);
        } else {
          alert(`Module Passed! Moving to next section.`);
          startLesson(activeLesson!.course, activeLesson!.moduleIndex + 1);
        }
      } else {
        alert("Review required. Re-read the material and try again.");
        setShowQuiz(false);
      }
    }
  };

  const initiateCertification = () => {
    setShowNameConfirmation(true);
  };

  const downloadCertificatePDF = () => {
    if (!activeLesson) return;
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const nameToPrint = certificateName.trim() || user;
    const completionDate = new Date().toLocaleDateString('en-GB', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const pageWidth = 297;
    const pageHeight = 210;
    doc.setFillColor(248, 249, 250);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(2);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
    doc.setDrawColor(218, 165, 32);
    doc.setLineWidth(1);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.line(15, 15, 25, 15); doc.line(15, 15, 15, 25);
    doc.line(pageWidth - 15, 15, pageWidth - 25, 15); doc.line(pageWidth - 15, 15, pageWidth - 15, 25);
    doc.line(15, pageHeight - 15, 25, pageHeight - 15); doc.line(15, pageHeight - 15, 15, pageHeight - 25);
    doc.line(pageWidth - 15, pageHeight - 15, pageWidth - 25, pageHeight - 15); doc.line(pageWidth - 15, pageHeight - 15, pageWidth - 15, pageHeight - 25);
    doc.setTextColor(30, 58, 138);
    doc.setFont("times", "bold");
    doc.setFontSize(36);
    doc.text("Certificate of Excellence", pageWidth / 2, 40, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("PROUDLY PRESENTED TO", pageWidth / 2, 55, { align: "center" });
    doc.setTextColor(22, 163, 74);
    doc.setFont("helvetica", "bold");
    let fontSize = 52;
    doc.setFontSize(fontSize);
    const nameWidth = doc.getTextWidth(nameToPrint.toUpperCase());
    const maxNameWidth = pageWidth - 80;
    if (nameWidth > maxNameWidth) {
      fontSize = fontSize * (maxNameWidth / nameWidth);
      doc.setFontSize(fontSize);
    }
    doc.text(nameToPrint.toUpperCase(), pageWidth / 2, 85, { align: "center" });
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("For successfully demonstrating outstanding achievement and professional mastery in:", pageWidth / 2, 105, { align: "center" });
    doc.setTextColor(30, 58, 138);
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.text(activeLesson.course.title, pageWidth / 2, 120, { align: "center" });
    const sealX = pageWidth / 2;
    const sealY = 160;
    doc.setDrawColor(218, 165, 32);
    doc.setLineWidth(1);
    for (let i = 0; i < 360; i += 15) {
        const angle = i * Math.PI / 180;
        doc.line(sealX + 15 * Math.cos(angle), sealY + 15 * Math.sin(angle), sealX + 20 * Math.cos(angle), sealY + 20 * Math.sin(angle));
    }
    doc.setFillColor(255, 255, 255);
    doc.circle(sealX, sealY, 15, 'F');
    doc.setDrawColor(30, 58, 138);
    doc.circle(sealX, sealY, 15, 'D');
    doc.setTextColor(30, 58, 138);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("VERIFIED", sealX, sealY - 2, { align: "center" });
    doc.text("DONLEMSON", sealX, sealY + 2, { align: "center" });
    doc.text("TRADE", sealX, sealY + 5, { align: "center" });
    const sigY = 175;
    doc.setDrawColor(200, 200, 200);
    doc.line(40, sigY, 110, sigY);
    doc.setFont("times", "italic");
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text("Leo Donlems", 75, sigY - 3, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Chief Trade Consultant", 75, sigY + 5, { align: "center" });
    doc.text("DONLEMSON TRADE", 75, sigY + 10, { align: "center" });
    doc.line(pageWidth - 110, sigY, pageWidth - 40, sigY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(completionDate, pageWidth - 75, sigY - 3, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Date of Completion", pageWidth - 75, sigY + 5, { align: "center" });

    doc.save(`DonlemsonTrade_Certificate_${nameToPrint.replace(/\s+/g, '_')}.pdf`);
    setShowNameConfirmation(false);
  };

  const handleAskTutor = async () => {
    if (!tutorInput.trim() || !activeLesson) return;

    const userMessage = { role: 'user' as const, content: tutorInput };
    setTutorMessages(prev => [...prev, userMessage]);
    const currentInput = tutorInput;
    setTutorInput('');
    setIsTutorLoading(true);

    try {
      const prompt = `You are a helpful AI Tutor for DONLEMSONTRADE Global College.
      The student is in the course "${activeLesson.course.title}", studying module "${activeLesson.course.modules[activeLesson.moduleIndex]}".
      The lesson content is: """${lessonContent}"""
      
      The student's question is: "${currentInput}"

      Answer the question directly based *only* on the provided lesson content. Be concise and helpful. Do not use bold markdown.`;

      const result = await chatWithGemini(prompt);
      const assistantMessage = { role: 'assistant' as const, content: result.text };
      setTutorMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = { role: 'assistant' as const, content: "Sorry, I couldn't process that question. Please try again." };
      setTutorMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTutorLoading(false);
    }
  };


  return (
    <section className="bg-white py-16">
      {isProcessingPayment && (
        <div className="fixed inset-0 z-[300] bg-blue-900/90 flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="font-black uppercase tracking-widest">Verifying Secure Payment...</h3>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[250] bg-blue-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 space-y-8 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-center text-blue-900 uppercase">Premium Enrollment</h3>
            <div className="text-4xl font-black text-center text-emerald-600">{COURSE_FEE}</div>
            <div className="bg-slate-50 p-6 rounded-3xl text-xs font-bold text-blue-900 space-y-2">
              <p>Bank: Kuda Bank | Account: 3000454101 | Name: JOELRIT VENTURES</p>
            </div>
            <button onClick={handleConfirmPayment} className="w-full bg-blue-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs">I Have Paid</button>
            <button onClick={() => setShowPaymentModal(null)} className="w-full text-gray-400 font-bold uppercase text-xs">Cancel</button>
          </div>
        </div>
      )}

      {showNameConfirmation && (
        <div className="fixed inset-0 z-[400] bg-blue-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="bg-blue-900 p-10 text-center text-white">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
                  <i className="fas fa-id-card text-3xl"></i>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">Issue My Certificate</h3>
                <p className="text-blue-200 text-sm mt-2">Please confirm the full name you want displayed boldly on your official Trade Mastery document.</p>
             </div>
             <div className="p-10 space-y-8">
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Certificate Candidate Name</label>
                   <input 
                    type="text"
                    value={certificateName}
                    onChange={(e) => setCertificateName(e.target.value)}
                    placeholder="e.g., ADELAKUN OLOWO TRADE"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-6 px-8 text-center text-2xl font-black text-blue-900 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-200"
                   />
                </div>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={downloadCertificatePDF}
                    className="w-full bg-blue-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center space-x-3"
                  >
                    <i className="fas fa-file-download"></i>
                    <span>Generate & Download Certificate</span>
                  </button>
                  <button 
                    onClick={() => setShowNameConfirmation(false)}
                    className="text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-red-500"
                  >
                    Go Back
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">Global Trade College</h2>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setFilter('All')} className={`px-6 py-2 rounded-lg text-sm font-bold ${filter === 'All' ? 'bg-white shadow-sm' : ''}`}>Catalog</button>
            <button onClick={() => setFilter('My Learning')} className={`px-6 py-2 rounded-lg text-sm font-bold ${filter === 'My Learning' ? 'bg-white shadow-sm' : ''}`}>My Portal</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(filter === 'All' ? TRADE_COURSES : TRADE_COURSES.filter(c => enrolled.includes(c.id))).map(course => (
            <div key={course.id} className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all group">
              <div className="h-48 relative">
                <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase shadow-lg">
                  {course.isFree ? 'FREE ACCESS' : COURSE_FEE}
                </div>
              </div>
              <div className="p-8">
                <h3 className="font-black text-blue-900 text-lg uppercase mb-2 tracking-tighter leading-none">{course.title}</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase mb-6 tracking-widest"><i className="fas fa-volume-up mr-2 text-emerald-500"></i> Narrative Audio Enabled</p>
                <div className="flex items-center justify-between">
                  <button onClick={() => setSelectedCourse(course)} className="text-[10px] font-black uppercase text-blue-900 hover:text-emerald-600">Syllabus</button>
                  {enrolled.includes(course.id) ? (
                    <button onClick={() => startLesson(course, 0)} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">Enter Classroom</button>
                  ) : (
                    <button onClick={() => handleEnrollInitiation(course)} className="bg-blue-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">Enroll Now</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeLesson && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-bottom duration-500">
          <div className="bg-blue-900 px-6 py-4 text-white flex items-center justify-between shadow-xl">
            <div className="flex items-center space-x-6">
              <button onClick={() => setActiveLesson(null)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition"><i className="fas fa-times"></i></button>
              <div>
                <h2 className="font-black text-xs uppercase tracking-widest">{activeLesson.course.title}</h2>
                <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Module {activeLesson.moduleIndex + 1} / {activeLesson.course.modules.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => toggleAudio(lessonContent)}
                disabled={isAudioLoading || !lessonContent}
                className={`flex items-center space-x-3 px-8 py-3 rounded-full transition-all shadow-xl ${
                  isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'
                } disabled:opacity-50 active:scale-95`}
              >
                {isAudioLoading ? (
                  <i className="fas fa-sync fa-spin"></i>
                ) : isPlaying ? (
                  <i className="fas fa-pause"></i>
                ) : (
                  <i className="fas fa-play"></i>
                )}
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {isAudioLoading ? 'Loading Audio...' : isPlaying ? 'Pause Audio' : isPaused ? 'Resume Audio' : 'Play Lesson Audio'}
                </span>
              </button>
              {isPaused && (
                 <button onClick={stopAudioCompletely} className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center hover:bg-red-500 transition-all shadow-lg"><i className="fas fa-stop text-xs"></i></button>
              )}
               <button onClick={() => setIsTutorChatOpen(true)} className="flex items-center space-x-3 px-8 py-3 rounded-full transition-all shadow-xl bg-slate-700 hover:bg-slate-800 active:scale-95">
                <i className="fas fa-user-graduate"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Ask Trainer</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-20 custom-scrollbar relative">
            <div className="max-w-4xl mx-auto">
              {isGraduated ? (
                <div className="text-center py-20 bg-slate-50 border border-slate-100 rounded-[4rem] p-16 shadow-sm">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <i className="fas fa-graduation-cap text-4xl"></i>
                  </div>
                  <h1 className="text-5xl font-black text-blue-900 uppercase tracking-tighter mb-4">Course Mastery!</h1>
                  <p className="text-gray-500 font-medium text-lg mb-12">You have completed all modules for {activeLesson.course.title}.</p>
                  <button onClick={initiateCertification} className="bg-blue-900 text-white px-16 py-6 rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Claim Official Certificate</button>
                </div>
              ) : showQuiz ? (
                <div className="space-y-12 animate-in slide-in-from-right duration-500">
                  <div className="flex justify-between items-center bg-blue-50 px-8 py-4 rounded-2xl">
                    <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Question {currentQuizStep + 1} of {quizQuestions.length}</span>
                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Correct: {quizScore}</span>
                  </div>
                  <h2 className="text-4xl font-black text-blue-900 uppercase tracking-tighter leading-tight">{quizQuestions[currentQuizStep].question}</h2>
                  <div className="grid grid-cols-1 gap-6">
                    {quizQuestions[currentQuizStep].options.map((opt, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleAnswer(i)} 
                        className="w-full text-left p-8 rounded-[2rem] border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 font-bold transition-all text-blue-900 shadow-sm hover:shadow-md group"
                      >
                        <span className="inline-block w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-center leading-8 mr-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-700">
                  <h1 className="text-5xl font-black text-blue-900 uppercase mb-12 tracking-tighter leading-none border-b border-slate-100 pb-8">{activeLesson.course.modules[activeLesson.moduleIndex]}</h1>
                  {isLessonLoading ? (
                    <div className="space-y-8 animate-pulse">
                      <div className="h-8 bg-slate-100 rounded-2xl w-1/3"></div>
                      <div className="space-y-4">
                        <div className="h-4 bg-slate-50 rounded w-full"></div>
                        <div className="h-4 bg-slate-50 rounded w-full"></div>
                        <div className="h-4 bg-slate-50 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-50 rounded w-full"></div>
                        <div className="h-4 bg-slate-50 rounded w-4/6"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="prose max-none">
                      <div className="whitespace-pre-wrap text-slate-700 font-medium leading-[2.2] mb-16 text-xl tracking-tight">{lessonContent}</div>
                      <div className="flex justify-center border-t border-slate-100 pt-16">
                        <button 
                          onClick={generateQuiz} 
                          disabled={isQuizLoading}
                          className="bg-blue-900 text-white px-20 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-emerald-600 hover:scale-105 transition-all disabled:opacity-50"
                        >
                          {isQuizLoading ? <><i className="fas fa-spinner fa-spin mr-3"></i> Generating Assessment...</> : 'Take Mastery Quiz'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {isTutorChatOpen && (
              <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-sm" onClick={() => setIsTutorChatOpen(false)}>
                  <div 
                      className="absolute top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-500"
                      onClick={e => e.stopPropagation()}
                  >
                      <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                              <i className="fas fa-user-graduate text-blue-900 text-xl"></i>
                              <h3 className="font-black text-blue-900 uppercase tracking-tighter">Module Trainer</h3>
                          </div>
                          <button onClick={() => setIsTutorChatOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center transition">
                            <i className="fas fa-times text-sm text-slate-500"></i>
                          </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {tutorMessages.map((msg, i) => (
                           <div key={i} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs shrink-0"><i className="fas fa-user-graduate"></i></div>}
                              <div className={`max-w-xs md:max-w-md p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-100 text-blue-900 rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                                <p className="text-sm font-medium whitespace-pre-wrap">{msg.content}</p>
                              </div>
                           </div>
                        ))}
                        {isTutorLoading && (
                          <div className="flex items-end gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs shrink-0"><i className="fas fa-user-graduate"></i></div>
                            <div className="p-4 rounded-2xl bg-slate-100">
                              <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={tutorChatEndRef}></div>
                      </div>
                      <div className="p-4 bg-white border-t border-slate-200">
                          <div className="flex items-center space-x-2">
                              <input 
                                value={tutorInput}
                                onChange={e => setTutorInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAskTutor()}
                                placeholder="Ask about this module..."
                                className="w-full bg-slate-100 border border-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white transition-all text-sm"
                              />
                              <button onClick={handleAskTutor} disabled={isTutorLoading || !tutorInput.trim()} className="w-10 h-10 bg-blue-900 text-white rounded-lg flex items-center justify-center disabled:opacity-50 hover:bg-emerald-600 transition">
                                <i className="fas fa-paper-plane text-sm"></i>
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedCourse && (
        <div className="fixed inset-0 z-[110] bg-blue-900/40 backdrop-blur-sm flex justify-end" onClick={() => setSelectedCourse(null)}>
          <div className="bg-white w-full max-w-md h-full p-12 flex flex-col animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-12">
              <h3 className="text-4xl font-black text-blue-900 uppercase tracking-tighter leading-none">{selectedCourse.title}</h3>
              <button onClick={() => setSelectedCourse(null)} className="text-gray-300 hover:text-red-500 transition-colors"><i className="fas fa-times text-2xl"></i></button>
            </div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-8 border-b border-emerald-500/20 pb-4">Curriculum Syllabus</p>
            <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
              {selectedCourse.modules.map((mod, i) => (
                <div key={i} className="group relative pl-12">
                  <span className="absolute left-0 top-0 w-8 h-8 bg-blue-50 text-blue-900 rounded-xl flex items-center justify-center text-xs font-black border border-blue-100 group-hover:bg-blue-900 group-hover:text-white transition-all">{i + 1}</span>
                  <p className="font-bold text-blue-900 uppercase text-[11px] leading-tight tracking-widest">{mod}</p>
                </div>
              ))}
            </div>
            <button 
              onClick={() => { handleEnrollInitiation(selectedCourse); setSelectedCourse(null); }}
              className="mt-12 w-full bg-blue-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-emerald-600 transition-all active:scale-95"
            >
              Confirm Enrollment
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default GlobalCollege;
