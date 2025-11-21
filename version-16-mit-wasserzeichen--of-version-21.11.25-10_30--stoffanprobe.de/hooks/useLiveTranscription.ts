import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY as string;
const MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';

function encodePCM(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const useLiveTranscription = ({ onTranscript, onError }: { onTranscript: (text: string) => void, onError: (err: string) => void }) => {
  const [isListening, setIsListening] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);

  const stop = useCallback(() => {
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    if (sessionRef.current) {
        try {
            sessionRef.current.close();
        } catch (e) {
            console.warn("Error closing session", e);
        }
        sessionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const start = useCallback(async () => {
    if (isListening) return;
    
    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(audioContext.destination);

        const sessionPromise = ai.live.connect({
            model: MODEL,
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                systemInstruction: { parts: [{ text: "You are a silent transcription assistant. Do not speak. Listen and transcribe exactly what the user says." }] },
            },
            callbacks: {
                onopen: () => {
                    setIsListening(true);
                },
                onmessage: (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        if (text) {
                            onTranscript(text);
                        }
                    }
                },
                onclose: () => {
                    setIsListening(false);
                    stop();
                },
                onerror: (err) => {
                    console.error("Gemini Live Error:", err);
                    stop();
                }
            }
        });

        sessionPromise.then(sess => {
            sessionRef.current = sess;
        }).catch(e => {
             console.error(e);
             onError("Konnte keine Verbindung zu Gemini herstellen.");
             stop();
        });

        processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16Data = new Int16Array(l);
            for (let i = 0; i < l; i++) {
                int16Data[i] = inputData[i] * 32768;
            }
            const base64Data = encodePCM(new Uint8Array(int16Data.buffer));
            
            sessionPromise.then(session => {
                session.sendRealtimeInput({
                    media: {
                        mimeType: 'audio/pcm;rate=16000',
                        data: base64Data
                    }
                });
            });
        };

    } catch (error) {
        console.error("Microphone/Setup Error:", error);
        onError("Zugriff auf Mikrofon fehlgeschlagen.");
        stop();
    }
  }, [isListening, onTranscript, onError, stop]);

  useEffect(() => {
      return () => {
          if (isListening) stop();
      }
  }, []);

  return { isListening, start, stop };
};