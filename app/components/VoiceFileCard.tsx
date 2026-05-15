"use client";

import { useEffect, useRef, useState } from "react";
import {
  RecordIcon,
  PlayIcon,
  PauseIcon,
  RewindIcon,
  FastForwardIcon,
} from "./icons";

// 초 단위를 m:ss 형식으로 변환
function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface VoiceFileCardProps {
  id: string;
  file: File;
  // 다른 카드 재생 시 자신을 멈추기 위한 pause 핸들러 등록
  registerPause: (id: string, pause: () => void) => () => void;
  // 재생 시작 시 다른 카드를 멈추도록 부모에 알림
  onPlayStart: (id: string) => void;
}

// 업로드한 음성/영상 파일을 재생·탐색하는 카드
export function VoiceFileCard({
  id,
  file,
  registerPause,
  onPlayStart,
}: VoiceFileCardProps) {
  const mediaRef = useRef<HTMLVideoElement | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 파일로부터 ObjectURL 생성 (언마운트 시 해제)
  // 렌더 중 생성하면 Strict Mode에서 URL이 누수되므로 effect에서 동기화한다
  useEffect(() => {
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMediaUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // URL이 바뀌면 미디어 메타데이터 다시 로드
  useEffect(() => {
    if (mediaUrl) mediaRef.current?.load();
  }, [mediaUrl]);

  // 부모에 pause 핸들러 등록
  useEffect(() => {
    return registerPause(id, () => {
      mediaRef.current?.pause();
    });
  }, [id, registerPause]);

  function togglePlay() {
    const media = mediaRef.current;
    if (!media) return;
    if (media.paused) {
      onPlayStart(id); // 다른 카드 정지 요청
      media
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          setIsPlaying(false);
          setError(err?.message ?? "재생할 수 없는 파일입니다.");
        });
    } else {
      media.pause();
    }
  }

  // 앞/뒤 탐색 (초 단위)
  function seekBy(seconds: number) {
    const media = mediaRef.current;
    if (!media) return;
    const max = duration || media.duration || 0;
    const next = Math.min(Math.max(media.currentTime + seconds, 0), max);
    media.currentTime = next;
    setCurrentTime(next);
  }

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="bg-surface-strong flex flex-col gap-2 items-start px-5 py-[22px] rounded-card w-full">
      <div className="bg-white flex items-center justify-center p-[6px] rounded-[4px] size-[40px]">
        <RecordIcon />
      </div>
      <div className="flex flex-col gap-1 pt-1">
        <p className="text-foreground text-[16px] font-semibold tracking-brand break-all">{file.name}</p>
        <p className="text-subtle text-[14px] font-medium">업로드 완료</p>
      </div>

      {/* 오디오/비디오 모두 재생 가능하도록 video 엘리먼트 사용 (화면 밖 배치) */}
      {mediaUrl && (
        <video
          ref={mediaRef}
          src={mediaUrl}
          style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration || 0);
            setError(null);
          }}
          onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={() => setError("이 파일은 브라우저에서 재생할 수 없어요.")}
          preload="metadata"
          playsInline
        />
      )}
      {error && (
        <p className="text-[#c44] text-[13px] font-medium w-full">{error}</p>
      )}

      <div className="flex flex-col gap-[10px] items-center py-[10px] w-full">
        <div className="relative bg-white h-[6px] rounded-[4px] w-full">
          <div
            className="absolute bg-accent h-[6px] left-0 rounded-l-[4px]"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex justify-between w-full text-subtle text-[12px] font-medium tracking-brand">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-[26px] w-full">
        <button onClick={() => seekBy(-10)} className="cursor-pointer" aria-label="10초 뒤로">
          <RewindIcon />
        </button>
        <button
          onClick={togglePlay}
          className="cursor-pointer"
          aria-label={isPlaying ? "일시정지" : "재생"}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button onClick={() => seekBy(10)} className="cursor-pointer" aria-label="10초 앞으로">
          <FastForwardIcon />
        </button>
      </div>
    </div>
  );
}
