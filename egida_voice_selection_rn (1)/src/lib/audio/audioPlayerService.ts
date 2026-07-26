/**
 * src/lib/audio/audioPlayerService.ts
 *
 * DOVE SI INSERISCE IN EGIDA
 * ---------------------------------------------------------------------------
 * Wrapper sottile attorno a `expo-av` (da installare, vedi guida). Tenuto
 * dietro un'interfaccia in modo che i test possano usare un player finto e
 * per non legare tutto il modulo a una libreria audio specifica: se in
 * futuro Egida standardizza su `expo-audio` (la nuova API di Expo) o su un
 * altro player, basta scrivere una nuova classe che implementa
 * `AudioPlayerService`.
 *
 * Se Egida ha già un player audio per altri suoni dell'app (notifiche,
 * allarmi), è preferibile implementare `AudioPlayerService` come un
 * adattatore sottile attorno a quello, invece di aggiungere un secondo
 * motore audio.
 */

export interface AudioPlayerService {
  /** Riproduce audio a partire da una stringa base64 (es. mp3 restituito da
   * ElevenLabs). Si risolve quando la riproduzione termina. */
  playBase64(base64Audio: string): Promise<void>;
  /** Interrompe subito qualsiasi riproduzione in corso. */
  stop(): Promise<void>;
  isPlaying(): boolean;
  dispose(): Promise<void>;
}

export class ExpoAvAudioPlayerService implements AudioPlayerService {
  private sound: any | null = null;
  private playing = false;

  async playBase64(base64Audio: string): Promise<void> {
    // Import dinamico per evitare che questo file rompa la build prima che
    // `expo-av` sia installato nel progetto (vedi guida integrazione).
    const { Audio } = await import('expo-av');

    await this.stop();

    this.playing = true;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mpeg;base64,${base64Audio}` },
        { shouldPlay: true },
      );
      this.sound = sound;

      await new Promise<void>((resolve) => {
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded && status.didJustFinish) {
            resolve();
          }
        });
      });
    } finally {
      this.playing = false;
      if (this.sound) {
        await this.sound.unloadAsync().catch(() => {});
        this.sound = null;
      }
    }
  }

  async stop(): Promise<void> {
    this.playing = false;
    if (this.sound) {
      await this.sound.stopAsync().catch(() => {});
      await this.sound.unloadAsync().catch(() => {});
      this.sound = null;
    }
  }

  isPlaying(): boolean {
    return this.playing;
  }

  async dispose(): Promise<void> {
    await this.stop();
  }
}
