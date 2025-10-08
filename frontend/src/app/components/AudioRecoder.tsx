"use client";
import React from "react";

interface IProps {
  onFinish: ({ id, audio }: { id: string; audio: Blob }) => void;
}

const AudioRecorder: React.FC<IProps> = ({ onFinish }) => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [recorder, setRecorder] = React.useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = React.useState<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(audioStream);

      setStream(audioStream);
      setRecorder(mediaRecorder);
      setIsRecording(true);

      const localChunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => localChunks.push(e.data);

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(localChunks, { type: "audio/webm" });
        onFinish({ id: audioStream.id, audio: audioBlob });
        setStream(null);
        setRecorder(null);
        setChunks([]);
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Không thể truy cập micro:", err);
    }
  };

  const stopRecording = () => {
    if (!recorder || !stream) return;
    recorder.stop();
    stream.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
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
      {isRecording ? "⏹️" : "🎙️"}
    </button>
  );
};

export default AudioRecorder;
