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
