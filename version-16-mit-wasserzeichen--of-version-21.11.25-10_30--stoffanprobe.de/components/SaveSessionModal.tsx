import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Session, CustomerData } from '../types';
import { glassBase } from '../glass';
import SpeechButton from './SpeechButton';
import { useLiveTranscription } from '../hooks/useLiveTranscription';

type SalesCategory = CustomerData['salesCategories'][0];

const salesCategoryOptions: SalesCategory[] = [
    "Gardine", "Tapete", "Polster", "Teppich", "Zubehör", "Komplettpaket"
];

interface SaveSessionModalProps {
  session: Session;
  onClose: () => void;
  onSave: (details: { name: string; customerData: CustomerData; notes: string; }) => void;
  isSpeechRecognitionSupported: boolean;
}

const SaveSessionModal: React.FC<SaveSessionModalProps> = ({ session, onClose, onSave, isSpeechRecognitionSupported }) => {
  const [sessionName, setSessionName] = useState(session.name || '');
  
  // Customer Data State
  const [customerName, setCustomerName] = useState(session.customerData?.customerName || '');
  const [customerAddress, setCustomerAddress] = useState(session.customerData?.address || '');
  const [customerEmail, setCustomerEmail] = useState(session.customerData?.email || '');
  const [customerPhone, setCustomerPhone] = useState(session.customerData?.phone || '');
  const [notes, setNotes] = useState(session.notes || '');
  
  // Sales Data State
  const [orderStatus, setOrderStatus] = useState(session.customerData?.orderStatus || '');
  const [orderAmount, setOrderAmount] = useState<number | null>(session.customerData?.orderAmount ?? null);
  const [salesCategories, setSalesCategories] = useState<SalesCategory[]>(session.customerData?.salesCategories || []);

  const [error, setError] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);

  const handleTranscript = useCallback((text: string) => {
      setNotes(prev => prev + text);
  }, []);

  const handleSpeechError = useCallback((err: string) => {
      setError(err);
  }, []);

  const { isListening, start: startSpeechToText, stop: stopSpeechToText } = useLiveTranscription({
      onTranscript: handleTranscript,
      onError: handleSpeechError
  });

  useEffect(() => {
    if (orderStatus !== 'ja') {
      setOrderAmount(null);
    }
  }, [orderStatus]);
  
  const handleToggleCategory = (category: SalesCategory) => {
    setSalesCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: sessionName,
      customerData: {
        customerName,
        address: customerAddress,
        email: customerEmail,
        phone: customerPhone,
        orderStatus: orderStatus as CustomerData['orderStatus'] || undefined,
        orderAmount: orderAmount,
        salesCategories: salesCategories,
        notes: session.customerData?.notes || '', // Notes are on session level, but can be part of customerData if needed
      },
      notes: notes,
    });
  };

  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF954F] transition-all";
  const glassInputClasses = "w-full p-3 rounded-xl border border-white/30 bg-white/30 backdrop-blur-xl focus:ring-2 focus:ring-[#FF954F] focus:border-[#FF954F] transition-all text-[#532418]";

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFFF5] rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-2xl font-bold text-[#532418]">Sitzung & Kundendaten speichern</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-bold">&times;</button>
        </div>
        <form onSubmit={handleSave} className="flex-grow overflow-y-auto pr-2 space-y-4">
            
            {session?.consentData?.timestamp && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-300 flex items-center justify-between">
                <div>
                  <p className="text-green-800 font-semibold">Einwilligung liegt vor</p>
                  <p className="text-green-700 text-sm">
                    {new Date(session.consentData.timestamp).toLocaleString("de-DE")}
                  </p>
                </div>

                {session.consentData.signature && (
                  <button
                    type="button"
                    onClick={() => setShowSignature(true)}
                    className="text-sm font-medium text-green-700 hover:text-green-900 underline"
                  >
                    Unterschrift anzeigen
                  </button>
                )}
              </div>
            )}

            <div>
                <label htmlFor="sessionName" className="block text-sm font-medium text-gray-700 mb-1">
                    Projekttitel (z.B. "Wohnzimmer Frau Müller")
                </label>
                <input id="sessionName" type="text" value={sessionName} onChange={(e) => setSessionName(e.target.value)} className={inputClasses} required />
            </div>
             <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">Kundenname</label>
                <input id="customerName" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClasses}/>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                    <input id="customerEmail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className={inputClasses} />
                </div>
                 <div>
                    <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                    <input id="customerPhone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={inputClasses} />
                </div>
            </div>
            <div>
                <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <textarea id="customerAddress" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className={`${inputClasses} resize-none`} rows={2} />
            </div>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notizen & Gesprächsprotokoll</label>
                <div className="relative">
                    <div className="flex items-start gap-3">
                        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClasses} resize-vertical min-h-[150px] flex-grow`} placeholder="Maße, Stoffnummern, Preisinfos, Gesprächsverlauf..."/>
                         {isSpeechRecognitionSupported && (
                          <SpeechButton
                            onStart={startSpeechToText}
                            onStop={stopSpeechToText}
                            isListening={isListening}
                          />
                        )}
                    </div>
                </div>
                 {isListening && (
                    <p className="text-sm text-gray-600 italic mt-2 h-5">
                        Zuhören aktiv...
                    </p>
                )}
                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>

            <div className={`${glassBase} p-4 mt-6`}>
                <h4 className="text-[#532418] font-semibold mb-3">Verkaufsabschluss</h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#532418] mb-2">Verkaufskategorien</label>
                        <div className="flex flex-wrap gap-2">
                            {salesCategoryOptions.map(cat => {
                                const isSelected = salesCategories.includes(cat);
                                return (
                                <button type="button" key={cat} onClick={() => handleToggleCategory(cat)}
                                    className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${isSelected ? 'bg-[#FF954F] text-white border-transparent shadow-md' : 'bg-white/50 border-white/30 text-[#532418] hover:bg-white/80'}`}>
                                    {cat}
                                </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#532418] mb-1">Auftragsstatus</label>
                            <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className={glassInputClasses}>
                                <option value="">Bitte auswählen…</option>
                                <option value="ja">Ja</option>
                                <option value="nein">Nein</option>
                                <option value="entscheidung">In Entscheidung</option>
                                <option value="folgeangebot">Folgeangebot erstellt</option>
                            </select>
                        </div>
                        {orderStatus === "ja" && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-medium text-[#532418] mb-1">Auftragshöhe (€)</label>
                                <input type="number" min="0" step="0.01" placeholder="z.B. 1250.50" className={glassInputClasses} value={orderAmount ?? ""} onChange={(e) => setOrderAmount(e.target.value === '' ? null : Number(e.target.value))} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">Abbrechen</button>
                <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-[#FF954F] rounded-md hover:bg-[#CC5200] transition-colors">Speichern</button>
            </div>
        </form>
      </div>
      
      {showSignature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4 text-[#532418]">Unterschrift</h2>

            <img
                src={session?.consentData?.signature || ''}
                alt="Unterschrift"
                className="w-full border rounded-lg"
            />

            <button
                type="button"
                onClick={() => setShowSignature(false)}
                className="mt-6 px-4 py-2 bg-[#FF954F] text-white rounded-lg shadow hover:bg-[#cc5200]"
            >
                Schließen
            </button>
            </div>
        </div>
     )}

    </div>
  );
};

export default SaveSessionModal;