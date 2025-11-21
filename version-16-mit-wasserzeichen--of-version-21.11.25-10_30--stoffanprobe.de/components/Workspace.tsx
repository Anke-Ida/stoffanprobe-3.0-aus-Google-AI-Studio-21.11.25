import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Session, Variant, PresetType, CustomerData, ConsentData, RALColor, VisualizationMode } from '../types';
import { saveSession } from '../services/dbService';
import { generateVisualization } from '../services/geminiService';
import ImageUploader from './ImageUploader';
import Gallery from './Gallery';
import PresetButtons from './PresetButtons';
import LoadingOverlay from './LoadingOverlay';
import { SaveIcon, DiscardIcon, NextIcon, PencilIcon } from './Icon';
import ConsentModal from './ConsentModal';
import ExampleRooms from './ExampleRooms';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import VariantCard from './VariantCard';
import { glassBase, glassButton } from '../glass';
import SpeechButton from './SpeechButton';
import { useLiveTranscription } from '../hooks/useLiveTranscription';

interface WorkspaceProps {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  updateSession: (updater: (prev: Session) => Session) => void;
  setModalVariant: (variant: Variant | null) => void;
  setError: (error: string | null) => void;
  isSpeechRecognitionSupported: boolean;
  fetchSessions: (query?: string) => void;
  onShowSessions: () => void;
  onCreateSession: (params?: { wallColor?: RALColor; originalImage?: string; patternImage?: string; consentData?: any; customerData?: any }) => Session;
  onSelectWallColor: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({
  session,
  setSession,
  updateSession,
  setModalVariant,
  setError,
  isSpeechRecognitionSupported,
  fetchSessions,
  onShowSessions,
  onCreateSession,
  onSelectWallColor
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetType | null>(null);
  const [textHint, setTextHint] = useState('');
  const [pendingVariant, setPendingVariant] = useState<Variant | null>(null);
  const [showNextStep, setShowNextStep] = useState<boolean>(false);
  const [consentState, setConsentState] = useState<{ isOpen: boolean; tempImageDataUrl: string | null }>({ isOpen: false, tempImageDataUrl: null });
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode | null>(null);

  const handleTranscript = useCallback((text: string) => {
      setTextHint(prev => prev + text);
  }, []);

  const handleSpeechError = useCallback((err: string) => {
      setError(err);
  }, [setError]);

  const { isListening, start: startSpeechToText, stop: stopSpeechToText } = useLiveTranscription({
      onTranscript: handleTranscript,
      onError: handleSpeechError
  });

  useEffect(() => {
    if (session?.wallColor) {
        setVisualizationMode('creativeWallColor');
    }
  }, [session?.wallColor]);

  const handleRoomImageUpload = (imageDataUrl: string, consentData?: ConsentData, customerData?: CustomerData) => {
    setShowNextStep(false);
    setTextHint(''); // Hinweisfeld zurücksetzen
    setSession(prev => {
      if (prev) {
        const updatedSession = { 
            ...prev, 
            originalImage: imageDataUrl, 
            consentData: consentData || prev.consentData,
            customerData: customerData || prev.customerData,
         };
        saveSession(updatedSession);
        return updatedSession;
      }
      return onCreateSession({ originalImage: imageDataUrl, consentData, customerData });
    });
  };

  const handleRoomImageSelect = (imageDataUrl: string) => {
    if (!imageDataUrl) {
      if(session) updateSession(s => ({...s, originalImage: ''}));
      setTextHint(""); // Reset
      return;
    }
    setConsentState({ isOpen: true, tempImageDataUrl: imageDataUrl });
  };
  
  const handleConsentConfirm = (consentData: ConsentData, customerData: CustomerData) => {
    setConsentState({ isOpen: false, tempImageDataUrl: null });
    if (consentState.tempImageDataUrl) {
        handleRoomImageUpload(consentState.tempImageDataUrl, consentData, customerData);
    }
  };
  
  const handleExampleRoomSelect = (imageDataUrl: string) => {
    handleRoomImageUpload(imageDataUrl);
  };

  const handlePatternImageUpload = (imageDataUrl: string) => {
    setShowNextStep(false);
    setVisualizationMode('pattern');
    setSelectedPreset(null);
    setTextHint(""); // Auch hier löschen
    if(session) updateSession(s => ({...s, wallColor: undefined}));
    
    if (!imageDataUrl && session) {
      updateSession(s => ({...s, patternImage: ''}));
      return;
    }
    if (session) {
      updateSession(s => ({...s, patternImage: imageDataUrl}));
    } else {
      onCreateSession({ patternImage: imageDataUrl });
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!session) return;

    if (!session.originalImage) {
      setError("Bitte zuerst ein Raumfoto hochladen.");
      return;
    }

    if (!visualizationMode) {
      setError("Bitte zuerst einen Bereich (z.B. Gardine, Tapete…) auswählen.");
      return;
    }

    if (visualizationMode === "pattern" && (!session.patternImage || !selectedPreset)) {
      setError("Bitte Musterfoto UND gewünschten Bereich auswählen.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setPendingVariant(null);
    setShowNextStep(false);

    try {
        const newVariantImage = await generateVisualization({
            roomImage: session.originalImage,
            mode: visualizationMode,
            patternImage: session.patternImage,
            preset: selectedPreset,
            wallColor: session.wallColor,
            textHint: textHint
        });
        
        const presetForVariant: Variant['preset'] = visualizationMode === 'pattern' && selectedPreset ? selectedPreset : 'Wandfarbe';

        const newVariant: Variant = {
            id: uuidv4(),
            preset: presetForVariant,
            imageUrl: newVariantImage,
            createdAt: new Date(),
        };
        setPendingVariant(newVariant);
      
    } catch (err) {
      console.error('Error generating variant:', err);
      const errorMessage = (err instanceof Error) ? err.message : 'Ein unbekannter Fehler ist aufgetreten.';
      setError(`Fehler bei der Visualisierung: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [session, selectedPreset, textHint, setError, visualizationMode]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerationEnabled) {
      handleGenerate();
    }
  };
  
  const handleSaveVariant = () => {
    if (!pendingVariant) return;
    updateSession(prev => ({
        ...prev,
        variants: [...prev.variants, pendingVariant],
    }));
    setPendingVariant(null);
    setShowNextStep(true);
  };

  const handleDiscardVariant = () => {
    setPendingVariant(null);
    setShowNextStep(false);
  };

  const handleNextPattern = () => {
    if (!session) return;
    updateSession(prev => ({
        ...prev,
        patternImage: '',
    }));
    setShowNextStep(false);
  };

  const handleEmailGallery = () => {
    if (!session || session.variants.length === 0) return;
    const subject = `Ihre stoffanprobe.de Visualisierungen - Sitzung: ${session.name}`;
    const customerName = session.customerData?.customerName ? ` ${session.customerData.customerName}` : '';
    const body = `Hallo${customerName},\n\nanbei finden Sie die Visualisierungen aus unserer gemeinsamen Sitzung.\n\n(Um die Bilder zu senden, laden Sie bitte die Galerie herunter und fügen Sie die Bilder als Anhang Ihrer E-Mail hinzu.)\n\nMit freundlichen Grüßen,\nIhr Team von stoffanprobe.de`;
    const mailtoLink = `mailto:${session.customerData?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handleDownloadGallery = async () => {
      if (!session || session.variants.length === 0) return;

      setIsLoading(true);

      try {
          const zip = new JSZip();
          const folderName = `stoffanprobe-${session.name.replace(/\s/g, '_') || new Date().toISOString().split('T')[0]}`;
          const folder = zip.folder(folderName);
          if (!folder) throw new Error("Konnte keinen ZIP-Ordner erstellen.");

          for (const variant of session.variants) {
              const base64Data = variant.imageUrl.split(',')[1];
              const mimeType = variant.imageUrl.match(/:(.*?);/)?.[1] ?? 'image/png';
              const extension = mimeType.split('/')[1]?.split('+')[0] ?? 'png';
              const filename = `variante-${variant.preset}-${variant.id.substring(0, 4)}.${extension}`;
              folder.file(filename, base64Data, { base64: true });
          }
          
          const content = await zip.generateAsync({ type: 'blob' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = `${folderName}.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);

      } catch (error) {
          console.error("Fehler beim Erstellen der ZIP-Datei:", error);
          setError("Fehler beim Erstellen der ZIP-Datei. Bitte versuchen Sie es erneut.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleDeleteGallery = () => {
      if (!session || session.variants.length === 0) return;
      const isConfirmed = window.confirm('Möchten Sie wirklich alle gespeicherten Varianten in dieser Galerie löschen? Diese Aktion kann nicht rückgängig gemacht werden.');
      if (isConfirmed) {
          updateSession(prev => ({
              ...prev,
              variants: [],
          }));
      }
  };

  const handleSelectWallColor = () => {
      setVisualizationMode(null);
      if(session) updateSession(s => ({...s, patternImage: ''}));
      onSelectWallColor();
  }

  const showPatternControls = session?.originalImage && session.patternImage;

  const isGenerationEnabled = !!(session?.originalImage && (
    (visualizationMode === 'pattern' && session.patternImage && selectedPreset) ||
    (visualizationMode === 'creativeWallColor' && session.wallColor) ||
    (visualizationMode === 'exactRAL' && session.wallColor)
  ));
  const actionButtonClasses = "px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all flex items-center justify-center gap-2";

  return (
    <>
      {isLoading && <LoadingOverlay />}
      
      <ConsentModal 
        isOpen={consentState.isOpen}
        onClose={() => setConsentState({isOpen: false, tempImageDataUrl: null})}
        onConfirm={handleConsentConfirm}
      />
      
      <main className={`flex-grow container mx-auto p-4 md:p-6 lg:p-8 transition-opacity duration-300 ${isLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#532418] mb-2">KI Visualisierung</h1>
            <p className="text-lg text-[#67534F]">Beginnen Sie mit einem Beispielraum oder laden Sie Ihr eigenes Foto hoch.</p>
        </div>

        {!session && (
          <div className="text-center mb-8">
            <button
              onClick={onShowSessions}
              className={glassButton}
            >
              Sitzung fortsetzen
            </button>
          </div>
        )}

        {!session?.originalImage && <ExampleRooms onSelect={handleExampleRoomSelect} onSelectWallColor={handleSelectWallColor} />}

        <div className={`mb-8 p-6 ${glassBase}`}>
            <h3 className="text-lg font-semibold text-center text-[#532418] mb-4">Oder laden Sie Ihre eigenen Fotos hoch:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploader 
                  onImageSelect={handleRoomImageSelect} 
                  imageDataUrl={session?.originalImage}
                  title="1. Raumfoto"
                  description="Aufnehmen oder hochladen"
                  buttonText="Eigenes Raumfoto auswählen"
                />
                
                {session?.wallColor ? (
                   <div className="w-full flex flex-col gap-4 p-4 rounded-3xl bg-white/10">
                      <div className={`p-4 flex items-center gap-4 ${glassBase} rounded-xl`}>
                          <div
                            className="w-12 h-12 rounded-md border-2 border-white/50 shadow"
                            style={{ backgroundColor: session.wallColor.hex }}
                          />
                          <div className="flex-grow">
                            <p className="font-semibold text-[#532418]">{session.wallColor.code}</p>
                            <p className="text-sm text-gray-700">{session.wallColor.name}</p>
                          </div>
                      
                          <div className="flex items-center gap-4">
                             <button
                              className="text-sm font-medium text-[#532418] hover:text-[#FF954F] flex items-center gap-1 transition-colors"
                              onClick={handleSelectWallColor}
                              aria-label="Wandfarbe ändern"
                            >
                              <PencilIcon /> Ändern
                            </button>
                            <button
                              className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors"
                              onClick={() => {
                                  updateSession((prev) => ({ ...prev, wallColor: undefined }));
                                  setVisualizationMode(null);
                              }}
                              aria-label="Wandfarbe entfernen"
                            >
                              <DiscardIcon className="h-4 w-4" />
                            </button>
                          </div>
                      </div>

                      <p className="text-sm text-[#532418]/70 italic mt-2">
                        Optional: Hinweis zur Farbplatzierung
                        (z.B. „nur linke Wand“, „Fensterrahmen“)
                      </p>

                      <form onSubmit={handleFormSubmit} className="relative">
                          <div className="flex items-start gap-3">
                              <textarea
                                  id="hint-textarea"
                                  placeholder={isListening ? "🎙️ Aufnahme läuft..." : "Hinweis tippen oder sprechen..."}
                                  value={textHint}
                                  onChange={(e) => setTextHint(e.target.value)}
                                  onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          if (isGenerationEnabled) {
                                            handleGenerate();
                                          }
                                      }
                                  }}
                                  className="w-full h-24 rounded-xl border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-[#FF954F] focus:border-[#FF954F] transition-shadow resize-none flex-grow"
                              />
                              {isSpeechRecognitionSupported && (
                                <SpeechButton 
                                    onStart={startSpeechToText}
                                    onStop={stopSpeechToText}
                                    isListening={isListening}
                                />
                              )}
                          </div>
                          {isListening && (
                                <p className="text-sm text-gray-600 italic mt-2 h-5">
                                    Zuhören aktiv...
                                </p>
                          )}
                      </form>
                      
                      <button
                          onClick={handleGenerate} 
                          disabled={!isGenerationEnabled || isLoading}
                          className={`${actionButtonClasses} w-full text-lg bg-[#FF954F] hover:bg-[#CC5200] focus:ring-[#FF954F] disabled:bg-[#C8B6A6] disabled:cursor-not-allowed mt-4`}
                      >
                          Bild generieren
                      </button>
                   </div>
                ) : (
                  <ImageUploader 
                    onImageSelect={handlePatternImageUpload}
                    imageDataUrl={session?.patternImage}
                    title="2. Muster-/Objektfoto"
                    description="Aufnehmen oder hochladen"
                    buttonText="Musterfoto auswählen"
                  />
                )}
            </div>
        </div>

        {showPatternControls && (
            <section className="mt-12 animate-fade-in">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-[#532418]">3. Wähle, was du gestalten möchtest</h2>
                </div>
                
                <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
                    
                    <div className="w-full text-center">
                        <p className="text-md text-[#67534F]/90 mb-4">Wähle einen Bereich für das Muster aus:</p>
                        <div className="flex flex-wrap justify-center items-start gap-4 w-full">
                            <PresetButtons selectedPreset={selectedPreset} onPresetSelect={setSelectedPreset} />
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
                        <div className="w-full">
                            <form onSubmit={handleFormSubmit} className="relative">
                               <div className="flex items-start gap-3">
                                    <textarea
                                        id="hint-textarea"
                                        placeholder={isListening ? "🎙️ Aufnahme läuft..." : "Optional: Hinweis tippen oder sprechen... (z.B. 'Gardine nur halb hoch', 'Teppich rund')"}
                                        value={textHint}
                                        onChange={(e) => setTextHint(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (isGenerationEnabled) {
                                                  handleGenerate();
                                                }
                                            }
                                        }}
                                        className="w-full h-24 rounded-xl border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-[#FF954F] focus:border-[#FF954F] transition-shadow resize-none flex-grow"
                                    />
                                    {isSpeechRecognitionSupported && (
                                        <SpeechButton 
                                            onStart={startSpeechToText}
                                            onStop={stopSpeechToText}
                                            isListening={isListening}
                                        />
                                    )}
                               </div>
                               {isListening && (
                                    <p className="text-sm text-gray-600 italic mt-2 h-5">
                                        Zuhören aktiv...
                                    </p>
                               )}
                            </form>
                        </div>
                        <button 
                            onClick={handleGenerate} 
                            disabled={!isGenerationEnabled || isLoading}
                            className={`${actionButtonClasses} w-full max-w-sm mt-2 text-lg bg-[#FF954F] hover:bg-[#CC5200] focus:ring-[#FF954F] disabled:bg-[#C8B6A6] disabled:cursor-not-allowed`}
                        >
                            Bild generieren
                        </button>
                    </div>
                </div>
            </section>
        )}
        
        {pendingVariant && (
             <section className="mt-12 animate-fade-in">
                 <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-[#532418]">Neuer Vorschlag</h2>
                    <p className="text-md text-[#67534F]/90">Was möchten Sie mit dieser neuer Variante tun?</p>
                </div>
                 <div className="max-w-md mx-auto">
                    <VariantCard 
                        imageUrl={pendingVariant.imageUrl}
                        title={`Vorschlag für: ${pendingVariant.preset}`}
                        isLarge={true}
                    />
                 </div>
                 <div className="flex justify-center items-center gap-4 mt-6">
                     <button onClick={handleDiscardVariant} className={`${actionButtonClasses} bg-gray-500 hover:bg-gray-600 focus:ring-gray-400`}>
                        <DiscardIcon /> Verwerfen
                     </button>
                     <button onClick={handleSaveVariant} className={`${actionButtonClasses} bg-green-600 hover:bg-green-700 focus:ring-green-500`}>
                        <SaveIcon /> In Galerie speichern
                     </button>
                 </div>
             </section>
        )}

        {showNextStep && (
            <div className="mt-12 p-6 bg-green-50 border-2 border-dashed border-green-300 rounded-xl text-center animate-fade-in">
                <h3 className="text-xl font-semibold text-green-800">Variante gespeichert!</h3>
                <p className="text-green-700 mt-2">Sie können nun ein weiteres Musterfoto hochladen, um neue Ideen für denselben Raum zu visualisieren.</p>
                <button onClick={handleNextPattern} className="mt-4 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2 mx-auto">
                   Nächstes Musterfoto <NextIcon />
                </button>
            </div>
        )}

        {session && session.variants.length > 0 && (
          <section className="mt-12 animate-fade-in">
             <Gallery 
                variants={session.variants} 
                onVariantSelect={setModalVariant}
                onEmailAll={handleEmailGallery}
                onDownloadAll={handleDownloadGallery}
                onDeleteAll={handleDeleteGallery}
            />
          </section>
        )}
      </main>
    </>
  );
};

export default Workspace;