
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { chatWithGemini, analyzeTradeDocument } from '../services/geminiService';
import LiveVoiceChat from './LiveVoiceChat';

interface ChatInterfaceProps {
  externalPrompt?: string | null;
}

interface AttachedFile {
  data: string;
  name: string;
  type: string;
  id: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ externalPrompt }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your DONLEMSONTRADE global consultant. How can I assist with your international trade queries today? You can attach multiple shipping documents (PDF, Word, Excel) or images for comprehensive analysis.",
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<AttachedFile[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const stripMarkdown = (text: string) => {
    // Removes ** symbols used for bolding in markdown
    return text.replace(/\*\*/g, '');
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (externalPrompt) {
      handleSend(externalPrompt);
    }
  }, [externalPrompt]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedFiles(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            data: reader.result as string,
            name: file.name,
            type: file.type
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (mime: string) => {
    if (mime.includes('image')) return 'fa-file-image text-emerald-500';
    if (mime.includes('pdf')) return 'fa-file-pdf text-red-500';
    if (mime.includes('word') || mime.includes('officedocument.word')) return 'fa-file-word text-blue-500';
    if (mime.includes('excel') || mime.includes('officedocument.spreadsheet')) return 'fa-file-excel text-green-600';
    if (mime.includes('audio')) return 'fa-file-audio text-purple-500';
    if (mime.includes('video')) return 'fa-file-video text-orange-500';
    return 'fa-file-alt text-gray-500';
  };

  const handleSend = async (overrideInput?: string) => {
    const messageText = overrideInput || input;
    if (!messageText.trim() && selectedFiles.length === 0) return;

    const firstImage = selectedFiles.find(f => f.type.includes('image'))?.data;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: stripMarkdown(messageText) || (selectedFiles.length > 0 ? `Analyzing ${selectedFiles.length} attached document(s): ${selectedFiles.map(f => f.name).join(', ')}` : ""),
      image: firstImage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!overrideInput) setInput('');
    setIsLoading(true);

    const currentFiles = [...selectedFiles];
    setSelectedFiles([]);

    try {
      if (currentFiles.length > 0) {
        const result = await analyzeTradeDocument(
          messageText || `Analyze these ${currentFiles.length} documents for trade compliance.`,
          currentFiles[0].data,
          currentFiles[0].type,
          currentFiles.slice(1).map(f => ({ data: f.data, mimeType: f.type }))
        );
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: stripMarkdown(result.feedbackText || "I've analyzed the documents and provided the relevant trade insights."),
          image: result.imageUrl || undefined,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const result = await chatWithGemini(messageText);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: stripMarkdown(result.text),
          sources: result.sources,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please ensure the files are valid trade documents and try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-blue-900 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-white border border-blue-700">
            <i className="fas fa-user-tie text-lg"></i>
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Trade Support Desk</h3>
            <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">Global Intelligence</p>
          </div>
        </div>
        <LiveVoiceChat />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${m.role === 'user' ? 'ml-8' : 'mr-8'}`}>
              <div className={`px-4 py-3 rounded-xl shadow-sm ${
                m.role === 'user' 
                  ? 'bg-blue-900 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
              }`}>
                {m.image && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-gray-100">
                    <img src={m.image} alt="Trade Content" className="max-h-60 w-full object-contain" />
                  </div>
                )}
                <div className="text-[14px] leading-relaxed whitespace-pre-wrap">
                  {m.content}
                </div>
                
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-2">Reference Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {m.sources.map((src, idx) => (
                        <a key={idx} href={src.uri} target="_blank" rel="noreferrer" className="bg-blue-50 text-blue-800 text-[10px] px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition">
                          {src.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className={`text-[9px] mt-1 text-gray-400 font-medium ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-xl border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        {selectedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2">
            {selectedFiles.map((file) => (
              <div key={file.id} className="flex items-center p-2 bg-slate-50 border border-slate-200 rounded-lg max-w-[200px]">
                <i className={`fas ${getFileIcon(file.type)} mr-2 text-sm`}></i>
                <span className="text-[10px] font-bold text-blue-900 truncate flex-1 uppercase tracking-tighter">{file.name}</span>
                <button onClick={() => removeFile(file.id)} className="ml-2 text-gray-400 hover:text-red-500">
                  <i className="fas fa-times-circle text-xs"></i>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 text-gray-500 hover:text-blue-900 transition hover:bg-blue-50"
            title="Attach Document(s)"
          >
            <i className="fas fa-paperclip"></i>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx" 
          />
          <div className="flex-1 relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your document(s) or policy..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white transition-all text-sm"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || (!input.trim() && selectedFiles.length === 0)}
              className="absolute right-1.5 top-1.5 w-7 h-7 bg-blue-900 text-white rounded flex items-center justify-center disabled:opacity-50 hover:bg-emerald-600 transition-colors"
            >
              <i className="fas fa-paper-plane text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
