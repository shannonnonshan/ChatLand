"use client";
import React, { useRef, useState } from "react";
import { Play, Pause, Languages } from "lucide-react";

interface AudioMessageProps {
  audioUrl: string; // blob hoặc public URL
}

const AudioMessage: React.FC<AudioMessageProps> = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Playback failed:", err);
        alert("⚠️ Không thể phát âm thanh.");
      }
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) setCurrentTime(audio.currentTime);
  };

  const handleLoaded = () => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const newTime = (Number(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleConvertToText = async () => {
    try {
      setIsConverting(true);
      setTranscribedText(null);
      setSummary(null);

      // fetch audioUrl
      const res = await fetch(audioUrl, { mode: "cors" });
      if (!res.ok) throw new Error("Cannot fetch audio URL");
      const blob = await res.blob();

      // detect type: nếu backend chỉ nhận wav thì convert name
      const fileExt = blob.type.includes("webm")
        ? "webm"
        : blob.type.includes("ogg")
        ? "ogg"
        : "wav";

      const formData = new FormData();
      formData.append("file", blob, `voice-message.${fileExt}`);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/speech/voice-to-text`,
        { method: "POST", body: formData }
      );

      const data = await response.json();
      if (data.text) setTranscribedText(data.text);
      if (data.summary) setSummary(data.summary);
      if (!data.text) alert("⚠️ Không thể nhận dạng âm thanh.");
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi chuyển giọng nói thành văn bản.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 rounded-2xl bg-blue-50 border border-blue-100 w-full max-w-[280px] shadow-sm">
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={togglePlay}
          className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white flex-shrink-0"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <div className="flex flex-col flex-1">
          <input
            type="range"
            min={0}
            max={100}
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className="w-full accent-blue-500 cursor-pointer"
          />
          <span className="text-xs text-gray-500 text-right">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <button
          onClick={handleConvertToText}
          disabled={isConverting}
          className={`p-2 rounded-lg border transition flex-shrink-0 ${
            isConverting ? "bg-gray-200 cursor-not-allowed" : "hover:bg-gray-200"
          }`}
          title="Convert to text"
        >
          <Languages className="w-5 h-5 text-black" />
        </button>

        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoaded}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>

      {isConverting && (
        <p className="text-sm text-gray-500">Detecting text...</p>
      )}
      {transcribedText && (
        <p className="text-sm text-gray-700 bg-white border rounded-lg p-2 whitespace-pre-wrap">
          {transcribedText}
        </p>
      )}
      {summary && (
        <p className="text-sm text-blue-700 bg-blue-100 border rounded-lg p-2 whitespace-pre-wrap">
          {summary}
        </p>
      )}
    </div>
  );
};

export default AudioMessage;
