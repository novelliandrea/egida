/**
 * src/lib/voice/VoiceModuleProvider.tsx
 *
 * Piccolo Context React per rendere disponibile l'istanza di `VoiceModule`
 * (creata una sola volta) a qualsiasi schermata/componente, incluso il
 * Percorso Guidato esistente, senza prop-drilling.
 *
 * INTEGRAZIONE: avvolgi la radice dell'app (dentro `App.tsx`, dentro o
 * fuori gli altri provider che hai già) con `<VoiceModuleProvider>`.
 */

import React, { createContext, useContext, useEffect, useRef } from 'react';

import { createVoiceModule, VoiceModule } from './voiceModule';

const VoiceModuleContext = createContext<VoiceModule | null>(null);

export function VoiceModuleProvider({ children }: { children: React.ReactNode }) {
  const moduleRef = useRef<VoiceModule | null>(null);
  if (!moduleRef.current) {
    moduleRef.current = createVoiceModule();
  }

  useEffect(() => {
    const module = moduleRef.current;
    return () => {
      module?.dispose();
    };
  }, []);

  return (
    <VoiceModuleContext.Provider value={moduleRef.current}>
      {children}
    </VoiceModuleContext.Provider>
  );
}

/** Usa questo hook ovunque ti serva accedere al modulo voce, incluso dentro
 * il codice esistente del Percorso Guidato, per ottenere
 * `guidedRouteSpeechService`. */
export function useVoiceModule(): VoiceModule {
  const ctx = useContext(VoiceModuleContext);
  if (!ctx) {
    throw new Error('useVoiceModule deve essere usato dentro <VoiceModuleProvider>');
  }
  return ctx;
}
