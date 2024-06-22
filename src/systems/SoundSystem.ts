// src/systems/SoundSystem.ts
type SoundEffect = "hit" | "block" | "move" | "attack" | "gameover" | "combo";

export class SoundSystem {
  private sounds: Map<SoundEffect, HTMLAudioElement> = new Map();
  private musicTrack: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private volume: number = 1.0;

  constructor() {
    this.loadSounds();
    this.loadMusic();
  }

  private loadSounds(): void {
    const soundEffects: SoundEffect[] = [
      "hit",
      "block",
      "move",
      "attack",
      "gameover",
      "combo",
    ];
    soundEffects.forEach((effect) => {
      const audio = new Audio(`/assets/sounds/${effect}.mp3`);
      audio.preload = "auto";
      this.sounds.set(effect, audio);
    });
  }

  private loadMusic(): void {
    this.musicTrack = new Audio("/assets/music/background.mp3");
    this.musicTrack.loop = true;
    this.musicTrack.volume = 0.5 * this.volume;
  }

  public playSound(effect: SoundEffect): void {
    if (this.isMuted) return;

    const sound = this.sounds.get(effect);
    if (sound) {
      sound.currentTime = 0;
      sound.volume = this.volume;
      sound
        .play()
        .catch((error) => console.error("Error playing sound:", error));
    } else {
      console.warn(`Sound effect "${effect}" not found.`);
    }
  }

  public playSoundWithVariation(
    effect: SoundEffect,
    pitchVariation: number = 0.1,
    pitch: number = 1
  ): void {
    if (this.isMuted) return;

    const sound = this.sounds.get(effect);
    if (sound) {
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.preservesPitch = false;

      // Clamp the playback rate to a valid range (e.g., 0.5 to 4.0)
      const minRate = 0.5;
      const maxRate = 4.0;
      const baseRate = pitch;
      const variationRange = Math.min(
        baseRate * pitchVariation,
        maxRate - minRate
      );

      const randomVariation = (Math.random() * 2 - 1) * variationRange;
      const newRate = Math.max(
        minRate,
        Math.min(maxRate, baseRate + randomVariation)
      );

      clone.playbackRate = newRate;
      clone.volume = this.volume;
      clone
        .play()
        .catch((error) =>
          console.error("Error playing sound with variation:", error)
        );
    } else {
      console.warn(`Sound effect "${effect}" not found.`);
    }
  }

  public playHitSound(intensity: number): void {
    const hitSounds = ["hit_light", "hit_medium", "hit_heavy"];
    const soundIndex = Math.min(
      Math.floor(intensity * hitSounds.length),
      hitSounds.length - 1
    );
    this.playSoundWithVariation(hitSounds[soundIndex] as SoundEffect, 0.1);
  }

  public playComboSound(comboCount: number): void {
    if (comboCount > 1) {
      const pitch = 1 + (comboCount - 2) * 0.1; // Increase pitch for higher combos
      this.playSoundWithVariation("combo", 0, pitch);
    }
  }

  public startMusic(): void {
    if (this.isMuted || !this.musicTrack) return;
    this.musicTrack
      .play()
      .catch((error) => console.error("Error playing music:", error));
  }

  public stopMusic(): void {
    if (this.musicTrack) {
      this.musicTrack.pause();
      this.musicTrack.currentTime = 0;
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((sound) => {
      sound.volume = this.volume;
    });
    if (this.musicTrack) {
      this.musicTrack.volume = 0.5 * this.volume;
    }
  }

  public mute(): void {
    this.isMuted = true;
    this.sounds.forEach((sound) => {
      sound.muted = true;
    });
    if (this.musicTrack) {
      this.musicTrack.muted = true;
    }
  }

  public unmute(): void {
    this.isMuted = false;
    this.sounds.forEach((sound) => {
      sound.muted = false;
    });
    if (this.musicTrack) {
      this.musicTrack.muted = false;
    }
  }

  public toggleMute(): void {
    this.isMuted ? this.unmute() : this.mute();
  }

  public update(): void {
    // This method can be used for any per-frame audio updates if needed
    // For example, adjusting volume based on distance from listener
  }

  public cleanup(): void {
    this.stopMusic();
    this.sounds.clear();
    this.musicTrack = null;
  }
}
