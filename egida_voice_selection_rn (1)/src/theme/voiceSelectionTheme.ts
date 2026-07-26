/**
 * src/theme/voiceSelectionTheme.ts
 *
 * Token di design locali per la schermata di selezione voce. Se Egida ha
 * già un tema condiviso in `src/theme/`, questo file dovrebbe essere
 * ELIMINATO e i componenti in `src/components/voice/` e
 * `src/screens/VoiceSelectionScreen.tsx` dovrebbero puntare invece alle
 * costanti di tema già esistenti. Tenuto isolato qui solo per far
 * funzionare il modulo da subito, prima del merge.
 */

export const voiceTheme = {
  color: {
    background: '#0B0F14',
    surface: '#11161D',
    surfaceRaised: '#161C25',
    border: '#232B36',
    accent: '#00E5A0',
    accentDim: 'rgba(0, 229, 160, 0.16)',
    danger: '#FF5470',
    warning: '#FFB020',
    textPrimary: '#EAF1F5',
    textSecondary: '#8A97A6',
    textMuted: '#56636F',
  },
  radius: {
    lg: 16,
    md: 10,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 32,
  },
  font: {
    title: { fontSize: 20, fontWeight: '600' as const, letterSpacing: -0.2 },
    name: { fontSize: 16, fontWeight: '600' as const },
    meta: { fontSize: 13, fontWeight: '400' as const },
    muted: { fontSize: 12, fontWeight: '400' as const },
  },
};
