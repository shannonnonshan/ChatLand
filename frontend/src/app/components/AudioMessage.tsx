"use client";
import React from "react";
import { Play, Pause, Languages } from "lucide-react";

interface AudioMessageProps {
  audioUrl: string;
}

const AudioMessage: React.FC<AudioMessageProps> = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [isConverting, setIsConverting] = React.useState(false);
  const [transcribedText, setTranscribedText] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState<string | null>(null);
  const [language, setLanguage] = React.useState<string>("auto");

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  const handleLoaded = () => {
    const audio = audioRef.current;
    if (audio) setDuration(Math.floor(audio.duration));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = (Number(e.target.value) / 100) * audio.duration;
    audio.currentTime = newTime;
    setProgress(Number(e.target.value));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ⚙️ detect model automatically (English vs Vietnamese)
  const detectModelPath = (textGuess: string | null): string => {
    if (!textGuess) return "vosk-model-small-en-us"; // default EN
    const vnRegex = /[àáạảãăắằẵẳặâầấậẩẫđèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]/i;
    return vnRegex.test(textGuess) ? "vosk-model-small-vn" : "vosk-model-small-en-us";
  };

  // 🧠 convert voice → text
  const handleConvertToText = async () => {
  try {
    setIsConverting(true);
    setSummary(null);

    const res = await fetch(audioUrl);
    const blob = await res.blob();
    const formData = new FormData();
    formData.append("file", blob, "audio.wav");

    const response = await fetch("http://localhost:3001/voice-to-text", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.text) {
      setTranscribedText(data.text);
      setSummary(data.summary);
    } else {
      alert("❌ Không thể nhận dạng hoặc tóm tắt âm thanh.");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Lỗi xử lý âm thanh.");
  } finally {
    setIsConverting(false);
  }
};

  return (
    <div className="flex flex-col gap-2 p-2 rounded-2xl bg-blue-50 border border-blue-100 w-full max-w-[280px] shadow-sm">
      {/* Custom audio player */}
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
            value={progress}
            onChange={handleSeek}
            className="w-full accent-blue-500 cursor-pointer"
          />
          <span className="text-xs text-gray-500 text-right">{formatTime(duration)}</span>
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
        <p className="text-sm text-gray-700 bg-white border rounded-lg p-2">
          🗣️ {transcribedText}
        </p>
      )}

      {summary && (
        <p className="text-sm text-blue-700 bg-blue-100 border rounded-lg p-2">
          💡 {summary}
        </p>
      )}
    </div>
  );
};

export default AudioMessage;
