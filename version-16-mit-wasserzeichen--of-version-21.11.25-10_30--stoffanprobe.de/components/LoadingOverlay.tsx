import React, { useEffect, useState } from "react";

const messages = [
  "Stoff wird geladen …",
  "Farben werden berechnet …",
  "Raum wird vorbereitet …"
];

const LoadingOverlay: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50">
      <div className="text-white text-xl mb-4">{messages[msgIndex]}</div>
      <div className="w-40 h-2 bg-white/20 rounded overflow-hidden">
        <div className="h-full w-full bg-white animate-progress-indeterminate"></div>
      </div>
    </div>
  );
};

export default LoadingOverlay;