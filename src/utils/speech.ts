/**
 * SpeechSynthesis utility for reading recipe instructions aloud to seniors.
 * Includes play, pause, resume, step-by-step reading, and speech rate customization.
 */

export class RecipeSpeaker {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static isSpeakingCallback: ((speaking: boolean, stepIdx: number | null) => void) | null = null;
  private static currentStepIndex: number | null = null;

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  public static stop(): void {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.warn('Speech cancellation error', e);
      }
    }
    this.currentUtterance = null;
    this.currentStepIndex = null;
    if (this.isSpeakingCallback) {
      this.isSpeakingCallback(false, null);
    }
  }

  public static pause(): void {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      if (this.isSpeakingCallback) {
        this.isSpeakingCallback(false, this.currentStepIndex);
      }
    }
  }

  public static resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      if (this.isSpeakingCallback) {
        this.isSpeakingCallback(true, this.currentStepIndex);
      }
    }
  }

  public static speakStep(
    text: string, 
    stepIndex: number, 
    onStatusChange?: (speaking: boolean, stepIdx: number | null) => void,
    rate = 0.9
  ): void {
    if (!this.isSupported() || !this.synth) {
      console.warn("Text-to-speech is not supported by your browser.");
      return;
    }

    this.stop();
    this.isSpeakingCallback = onStatusChange || null;
    this.currentStepIndex = stepIndex;

    const utterance = new SpeechSynthesisUtterance(text);
    // 0.9x is optimal for seniors for clear, steady comprehension
    utterance.rate = Math.max(0.7, Math.min(1.2, rate));
    utterance.pitch = 1.0;

    // Pick an English voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Daniel')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      if (this.isSpeakingCallback) {
        this.isSpeakingCallback(true, stepIndex);
      }
    };

    utterance.onend = () => {
      if (this.isSpeakingCallback) {
        this.isSpeakingCallback(false, null);
      }
      this.currentStepIndex = null;
    };

    utterance.onerror = (e) => {
      console.warn('Speech error', e);
      if (this.isSpeakingCallback) {
        this.isSpeakingCallback(false, null);
      }
      this.currentStepIndex = null;
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public static speakAllSteps(
    steps: string[],
    recipeTitle: string,
    onStatusChange?: (speaking: boolean, stepIdx: number | null) => void,
    rate = 0.9
  ): void {
    if (!steps || !steps.length) return;
    this.stop();

    let currentIndex = 0;
    const playNext = () => {
      if (currentIndex >= steps.length) {
        if (onStatusChange) onStatusChange(false, null);
        return;
      }

      const stepText = `Step ${currentIndex + 1}: ${steps[currentIndex]}`;
      this.speakStep(stepText, currentIndex, (isSpeaking, activeIdx) => {
        if (onStatusChange) onStatusChange(isSpeaking, activeIdx);
        if (!isSpeaking && activeIdx === null) {
          // Finished this step, advance to next
          currentIndex++;
          if (currentIndex < steps.length) {
            setTimeout(playNext, 600); // 600ms natural breathing pause between steps
          }
        }
      }, rate);
    };

    // Intro message before starting
    const intro = `Reading cooking steps for ${recipeTitle}. Let's begin.`;
    this.speakStep(intro, -1, (isSpeaking) => {
      if (!isSpeaking) {
        setTimeout(playNext, 500);
      }
    }, rate);
  }
}
