"use client";
import React from "react";
import { Play, Pause, Languages } from "lucide-react";

interface AudioMessageProps {
  audioUrl: string;
}

const AudioMessage: React.FC<AudioMessageProps> = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isConverting, setIsConverting] = React.useState(false);
  const [transcribedText, setTranscribedText] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState<string | null>(null);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // 🔊 Play / Pause
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
        alert("⚠️ Không thể phát âm thanh. Có thể file bị lỗi hoặc định dạng không đúng.");
      }
    }
  };

  // 🎵 Update progress bar
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) setCurrentTime(audio.currentTime);
  };

  // ⏱️ When loaded
  const handleLoaded = () => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration || 0);
  };

  // 🧭 Seek manually
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const newTime = (Number(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (s: number) => {
    if (!s) return "00:00";
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  };

  // 🧠 Convert voice → text
  const handleConvertToText = async () => {
    try {
      setIsConverting(true);
      setTranscribedText(null);
      setSummary(null);

      const res = await fetch(audioUrl);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", blob, "voice-message.wav");

      const response = await fetch("http://localhost:3001/voice-to-text", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.text) {
        setTranscribedText(data.text);
        setSummary(data.summary || null);
      } else {
        alert("❌ Không thể nhận dạng âm thanh.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi chuyển giọng nói thành văn bản.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 rounded-2xl bg-blue-50 border border-blue-100 w-full max-w-[280px] shadow-sm">
      {/* Player row */}
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
            min="0"
            max="100"
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

      {transcribedText && (
        <p className="text-sm text-gray-700 bg-white border rounded-lg p-2 whitespace-pre-wrap">
          🗣️ {transcribedText}
        </p>
      )}

      {summary && (
        <p className="text-sm text-blue-700 bg-blue-100 border rounded-lg p-2 whitespace-pre-wrap">
          💡 {summary}
        </p>
      )}
    </div>
  );
};

export default AudioMessage;
