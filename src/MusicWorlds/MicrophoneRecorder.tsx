import { useEffect, useRef, useState } from "react";

interface MicrophoneRecorderProps {
  disabled: boolean;
  hasRecording: boolean;
  onRecorded: (file: File) => void;
  onRecordingChange: (recording: boolean) => void;
}

const MAX_SECONDS = 10;

export default function MicrophoneRecorder({
  disabled,
  hasRecording,
  onRecorded,
  onRecordingChange,
}: MicrophoneRecorderProps) {
  const [status, setStatus] = useState<
    "idle" | "requesting" | "recording" | "processing"
  >("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function stopRecording() {
    if (recorderRef.current?.state === "recording") {
      setStatus("processing");
      recorderRef.current.stop();
    }
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }

  async function startRecording() {
    setError(null);
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError(
        "Microphone recording isn't available here. Open this page over HTTPS in a browser that supports microphone recording.",
      );
      return;
    }
    setStatus("requesting");
    onRecordingChange(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!activeRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (timerRef.current !== null) window.clearInterval(timerRef.current);
        if (!activeRef.current) return;
        setStatus("idle");
        onRecordingChange(false);
        const recording = new Blob(chunks, { type: recorder.mimeType });
        if (!recording.size) {
          setError("No audio was captured. Please try recording again.");
          return;
        }
        onRecorded(
          new File([recording], "microphone-recording", {
            type: recording.type,
          }),
        );
      };
      recorder.onerror = () => {
        stopRecording();
        if (activeRef.current) setError("Recording failed. Please try again.");
      };
      recorder.start();
      setSeconds(0);
      setStatus("recording");
      const startedAt = performance.now();
      timerRef.current = window.setInterval(() => {
        const elapsed = (performance.now() - startedAt) / 1000;
        setSeconds(Math.min(MAX_SECONDS, Math.floor(elapsed)));
        if (elapsed >= MAX_SECONDS) stopRecording();
      }, 100);
    } catch (err) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (!activeRef.current) return;
      setStatus("idle");
      onRecordingChange(false);
      const name = err instanceof DOMException ? err.name : "";
      setError(
        name === "NotAllowedError"
          ? "Microphone access was denied. Allow microphone access in your browser's site settings, then try again."
          : name === "NotFoundError"
            ? "No microphone was found. Connect a microphone and try again."
            : "Couldn't start the microphone. Check that it is connected and available, then try again.",
      );
    }
  }

  const isRecording = status === "recording";
  const label = isRecording
    ? "Recording — make a sound"
    : status === "requesting"
      ? "Allow microphone access to start"
      : status === "processing"
        ? "Preparing your sound…"
        : hasRecording
          ? "Record again"
          : "Tap to record";

  return (
    <div className="microphone-recorder">
      <div className="microphone-controls">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!isRecording && (disabled || status !== "idle")}
          aria-label={
            isRecording
              ? "Stop recording"
              : hasRecording
                ? "Record again"
                : "Record a sound"
          }
          className={`microphone-record-button${
            isRecording ? " is-recording" : ""
          }`}
        >
          <span className="microphone-record-symbol" aria-hidden="true" />
        </button>
        <div>
          <p role="status" className="microphone-label">
            {label}
          </p>
          {isRecording ? (
            <p className="microphone-hint">Tap the square to stop</p>
          ) : status === "idle" && !hasRecording ? (
            <p className="microphone-hint">
              Up to 10 seconds.
            </p>
          ) : null}
        </div>
        {isRecording && (
          <span
            className="microphone-timer"
            aria-label={`${seconds} of ${MAX_SECONDS} seconds`}
          >
            {seconds}s <span>/ {MAX_SECONDS}s</span>
          </span>
        )}
      </div>
      {error && (
        <p role="alert" className="text-error text-sm mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
