import React from 'react';
import { UserPlusIcon } from './Icon';
import { glassHeaderButton } from '../glass';

interface HeaderProps {
    onNewSession: () => void;
    onShowSessions: () => void;
    onSaveSession: () => void;
    hasSession: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNewSession, onShowSessions, onSaveSession, hasSession }) => {
  return (
    <header className="bg-[#FAF1DC]/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <span className="font-bold text-2xl text-[#532418]">stoffanprobe.de</span>
          </div>
          {hasSession && (
              <div className="flex items-center space-x-1">
                 <button onClick={onSaveSession} className={`${glassHeaderButton} flex items-center gap-2`}>
                     <UserPlusIcon /> Kundendaten speichern
                 </button>
                 <button onClick={onShowSessions} className={glassHeaderButton}>
                     Sitzung fortsetzen
                 </button>
                 <button 
                    onClick={onNewSession}
                    className="px-3 py-2 text-sm font-medium text-white bg-[#FF954F] rounded-md hover:bg-[#CC5200] transition-colors">
                     Neue Sitzung
                 </button>
              </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;