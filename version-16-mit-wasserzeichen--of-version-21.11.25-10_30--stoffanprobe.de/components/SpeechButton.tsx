import React, { useState } from 'react';
import { requestMicPermission, isIOS } from '../services/permissionService';
import { MicIcon } from './Icon';

interface SpeechButtonProps {
    onStart: () => void;
    onStop: () => void;
    isListening: boolean;
}

const SpeechButton: React.FC<SpeechButtonProps> = ({ onStart, onStop, isListening }) => {
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);

    if (isListening) {
        onStop();
        return;
    }

    const status = await requestMicPermission();

    if (status === 'granted') {
      onStart();
      return;
    }

    // Microphone permission denied
    if (isIOS()) {
      setError(
        "Bitte Mikrofon in den iOS-Einstellungen aktivieren:\nEinstellungen → Safari → Mikrofon"
      );
    } else {
      setError("Mikrofonzugriff wurde verweigert. Bitte in den Browsereinstellungen erlauben.");
    }
  };
  
  const listeningClasses = "bg-red-500 text-white animate-pulse shadow-[0_0_8px_2px_#FF6B6B,0_0_20px_5px_rgba(255,107,107,0.5)]";
  const idleClasses = "bg-gray-200 text-gray-600 hover:bg-gray-300";


  return (
    <div className="flex flex-col items-center">
        <button
            type="button"
            onClick={handleClick}
            className={`p-2 rounded-full transition-all duration-300 ${isListening ? listeningClasses : idleClasses}`}
            aria-label={isListening ? 'Aufnahme stoppen' : 'Spracheingabe starten'}
        >
            <MicIcon />
        </button>
        {error && (
            <p className="text-xs text-red-600 mt-2 whitespace-pre-line text-center">
              {error}
            </p>
        )}
    </div>
  );
};

export default SpeechButton;
