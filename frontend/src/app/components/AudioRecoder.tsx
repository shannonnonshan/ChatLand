"use client";
import React from "react";
import { Square, Mic } from "lucide-react";

interface IProps {
  onFinish: ({ id, audio }: { id: string; audio: Blob }) => void;
}

const AudioRecorder: React.FC<IProps> = ({ onFinish }) => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recorder, setRecorder] = React.useState<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const chunksRef = React.useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType =
      MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
        ? "audio/ogg;codecs=opus"
        : "";

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (audioBlob.size < 500) {
          console.warn("⚠️ Âm thanh bị trống hoặc quá ngắn");
        } else {
          onFinish({ id: stream.id, audio: audioBlob });
        }

        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setRecorder(null);
      };

      mediaRecorder.start();
      setRecorder(mediaRecorder);
      setIsRecording(true);
    } catch (err) {
      console.error("❌ Không thể truy cập micro:", err);
      alert("Không thể truy cập micro. Hãy cấp quyền microphone cho trang web.");
    }
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      className={`p-2 rounded-lg transition ${
        isRecording
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-gray-200 hover:bg-gray-300"
      }`}
      title={isRecording ? "Stop recording" : "Start recording"}
    >
      {isRecording ? (
        <Square className="w-5 h-5 text-black" />
      ) : (
        <Mic className="w-5 h-5 text-black" />
      )}
    </button>
  );
};

export default AudioRecorder;
