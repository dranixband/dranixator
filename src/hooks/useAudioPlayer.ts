import { useState, useRef, useCallback, useEffect } from "react";
import { getCachedAudio } from "../lib/audioCache";

export interface AudioChip {
  id: number;
  audioSrc?: string;
}

export interface UseAudioPlayerReturn<T extends AudioChip> {
  playingChip: T | null;
  isAudioPlaying: boolean;
  audioProgress: number;
  audioDuration: number;
  audioVolume: number;
  isFragmentLocked: boolean;
  playAudio: (chip: T) => void;
  toggleAudioPlayback: () => void;
  seekAudio: (fraction: number) => void;
  changeVolume: (vol: number) => void;
  playFragment: (chip: T, startTime: number, endTime: number) => void;
  closeAudio: () => void;
}

const BASE = import.meta.env.BASE_URL as string;
const resolveAudioSrc = (src: string) =>
  src.startsWith("http") ? src : `${BASE}${src}`;

export function useAudioPlayer<
  T extends AudioChip,
>(): UseAudioPlayerReturn<T> {
  const [playingChip, setPlayingChip] = useState<T | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.7);
  const [isFragmentLocked, setIsFragmentLocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number>(0);
  const fragmentTimerRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      clearInterval(progressIntervalRef.current);
      clearInterval(fragmentTimerRef.current);
    };
  }, []);

  const toggleAudioPlayback = useCallback(() => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      if (audioRef.current.ended) {
        audioRef.current.currentTime = 0;
        setAudioProgress(0);
        progressIntervalRef.current = window.setInterval(() => {
          if (audioRef.current) setAudioProgress(audioRef.current.currentTime);
        }, 250);
      }
      audioRef.current.play();
      setIsAudioPlaying(true);
    }
  }, [isAudioPlaying]);

  const playAudio = useCallback(
    (chip: T) => {
      if (!chip.audioSrc) return;

      // Same chip → unified toggle (handles ended reset)
      if (playingChip?.id === chip.id && audioRef.current) {
        toggleAudioPlayback();
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        clearInterval(progressIntervalRef.current);
      }

      const audio = getCachedAudio(resolveAudioSrc(chip.audioSrc!));
      audioRef.current = audio;
      setPlayingChip(chip);
      setAudioProgress(0);
      setAudioDuration(0);

      audio.onloadedmetadata = () => setAudioDuration(audio.duration);
      audio.onended = () => {
        setIsAudioPlaying(false);
        setAudioProgress(audio.duration);
        clearInterval(progressIntervalRef.current);
      };

      audio.volume = audioVolume;
      audio.play();
      setIsAudioPlaying(true);

      progressIntervalRef.current = window.setInterval(() => {
        if (audio) setAudioProgress(audio.currentTime);
      }, 250);
    },
    [playingChip, audioVolume, toggleAudioPlayback],
  );

  const seekAudio = useCallback(
    (fraction: number) => {
      if (!audioRef.current || !audioDuration) return;
      audioRef.current.currentTime = fraction * audioDuration;
      setAudioProgress(audioRef.current.currentTime);
    },
    [audioDuration],
  );

  const changeVolume = useCallback((vol: number) => {
    setAudioVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  }, []);

  const playFragment = useCallback(
    (chip: T, startTime: number, endTime: number) => {
      if (!chip.audioSrc) return;

      if (audioRef.current) {
        audioRef.current.pause();
        clearInterval(progressIntervalRef.current);
      }
      clearInterval(fragmentTimerRef.current);

      const audio = getCachedAudio(resolveAudioSrc(chip.audioSrc!));
      audioRef.current = audio;
      setPlayingChip(chip);
      setAudioProgress(0);
      setAudioDuration(0);
      setIsFragmentLocked(true);

      const FADE = 0.5;
      const targetVol = audioVolume;

      audio.currentTime = startTime;
      audio.volume = 0;

      const unlockAndRestore = () => {
        setIsFragmentLocked(false);
        if (audioRef.current === audio) audio.volume = targetVol;
      };

      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration);
        setAudioProgress(audio.currentTime);
      };
      audio.onended = () => {
        setIsAudioPlaying(false);
        clearInterval(progressIntervalRef.current);
        clearInterval(fragmentTimerRef.current);
        unlockAndRestore();
      };

      audio.play().catch(() => {});
      setIsAudioPlaying(true);

      progressIntervalRef.current = window.setInterval(() => {
        if (audio) setAudioProgress(audio.currentTime);
      }, 250);

      fragmentTimerRef.current = window.setInterval(() => {
        if (!audioRef.current || audioRef.current !== audio) {
          clearInterval(fragmentTimerRef.current);
          return;
        }
        const elapsed = audio.currentTime - startTime;
        const remaining = endTime - audio.currentTime;

        if (remaining <= 0) {
          audio.volume = targetVol;
          audio.pause();
          setIsAudioPlaying(false);
          clearInterval(progressIntervalRef.current);
          clearInterval(fragmentTimerRef.current);
          unlockAndRestore();
          return;
        }

        if (elapsed < FADE) {
          audio.volume = Math.min(targetVol, (elapsed / FADE) * targetVol);
        } else if (remaining < FADE) {
          audio.volume = Math.max(0, (remaining / FADE) * targetVol);
        } else if (audio.volume !== targetVol) {
          audio.volume = targetVol;
        }
      }, 50);
    },
    [audioVolume],
  );

  const closeAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    clearInterval(progressIntervalRef.current);
    setPlayingChip(null);
    setIsAudioPlaying(false);
    setAudioProgress(0);
    setAudioDuration(0);
  }, []);

  return {
    playingChip,
    isAudioPlaying,
    audioProgress,
    audioDuration,
    audioVolume,
    isFragmentLocked,
    playAudio,
    toggleAudioPlayback,
    seekAudio,
    changeVolume,
    playFragment,
    closeAudio,
  };
}
