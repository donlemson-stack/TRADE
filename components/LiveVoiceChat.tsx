
import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { SYSTEM_PROMPT } from '../constants';

const LiveVoiceChat: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Live Voice Consult');
  const [isError, setIsError] = useState(false);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const encodePCM = (data: Float32Array): string => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsActive(false);
    setIsConnecting(false);
  }, []);

  const startSession = async () => {
    setIsError(false);
    setStatusMessage('Connecting...');
    setIsConnecting(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      const ai = new GoogleGenAI({ apiKey });

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      console.log('[LiveVoiceChat] Attempting to connect to Gemini Live API...');

      const sessionPromise = ai.live.connect({
        model: 'models/gemini-2.0-flash-exp',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          },
          systemInstruction: SYSTEM_PROMPT + "\n\nLIVE VOICE MODE: You are talking to a user. Be warm, ask for their name immediately if you don't know it. Once you know it, use their first name naturally to make the consult feel professional and friendly. Keep answers very concise for voice."
        },
        callbacks: {
          onopen: () => {
            console.log('[LiveVoiceChat] Session opened successfully');
            setIsConnecting(false);
            setIsActive(true);
            setStatusMessage('End Live Consult');
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;
            const processor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const base64Pcm = encodePCM(inputData);
              sessionPromise.then(session => {
                if (session) {
                  session.sendRealtimeInput({
                    media: { data: base64Pcm, mimeType: 'audio/pcm;rate=16000' }
                  });
                }
              }).catch(err => {
                console.error('[LiveVoiceChat] Error sending audio:', err);
              });
            };

            source.connect(processor);
            processor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            console.log('[LiveVoiceChat] Received message:', message);
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const ctx = audioContextRef.current;
              const binary = atob(audioData);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

              const buffer = await decodeAudioData(bytes, ctx);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);

              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              console.log('[LiveVoiceChat] Interrupted, clearing audio queue');
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log('[LiveVoiceChat] Session closed');
            stopSession();
            if (!isError) {
              setStatusMessage('Live Voice Consult');
            }
          },
          onerror: (e) => {
            console.error("[LiveVoiceChat] Session error:", e);
            setStatusMessage("Network Error. Retry?");
            setIsError(true);
            stopSession();
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error("Failed to start live session:", err);
      let msg = "Error. Retry?";
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        msg = "Mic permission denied.";
      } else if (err.message?.includes('permission') || err.message?.includes('403')) {
        msg = "API Permission Error.";
      } else if (err.message?.includes('API key')) {
        msg = "API key not found.";
      } else if (err.message?.includes('not found') || err.message?.includes('404')) {
        msg = "Model unavailable.";
      }
      setStatusMessage(msg);
      setIsError(true);
      setIsConnecting(false);
    }
  };

  const handleClick = () => {
    if (isActive) {
      stopSession();
      setStatusMessage('Live Voice Consult');
      setIsError(false);
    } else {
      startSession();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button 
        onClick={handleClick}
        disabled={isConnecting}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg transition-all ${
          isConnecting ? 'bg-slate-300 text-slate-500 cursor-not-allowed' :
          isError ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
          isActive ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 
          'bg-emerald-600 hover:bg-emerald-700 text-white'
        }`}
      >
        {isConnecting ? (
          <i className="fas fa-spinner fa-spin"></i>
        ) : isActive ? (
          <i className="fas fa-stop-circle"></i>
        ) : isError ? (
          <i className="fas fa-exclamation-triangle"></i>
        ) : (
          <i className="fas fa-microphone"></i>
        )}
        <span className="text-xs font-bold uppercase tracking-wider">
          {statusMessage}
        </span>
      </button>
      
      {isActive && !isConnecting && (
        <div className="flex space-x-1 items-center px-2">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className="w-1 bg-emerald-500 rounded-full animate-pulse" 
              style={{ height: `${Math.random() * 16 + 4}px`, animationName: 'live-pulse', animationDuration: '1s', animationIterationCount: 'infinite', animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
          <style>{`
            @keyframes live-pulse {
              50% { transform: scaleY(0.5); opacity: 0.7; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default LiveVoiceChat;
