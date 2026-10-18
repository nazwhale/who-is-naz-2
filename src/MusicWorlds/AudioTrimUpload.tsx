import { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin, { Region } from "wavesurfer.js/dist/plugins/regions.js";
import MicrophoneRecorder from "./MicrophoneRecorder";
import { createOneSecondWav, prepareMicrophoneRecording } from "./wav";

interface AudioTrimUploadProps {
  inputMode?: "upload" | "microphone";
  apiBase: string;
  worldId: string;
  blockIndex: number;
  onUploaded?: () => void | Promise<void>;
  onClose?: () => void;
}

const REGION_DURATION = 1.0; // Exactly 1 second

export default function AudioTrimUpload({
  inputMode = "upload",
  apiBase,
  worldId,
  blockIndex,
  onUploaded,
  onClose,
}: AudioTrimUploadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsPlugin | null>(null);
  const regionRef = useRef<Region | null>(null);
  const fileRef = useRef<File | null>(null);

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [regionStart, setRegionStart] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const regionEnd = regionStart + REGION_DURATION;

  // Cleanup wavesurfer on unmount or file change
  const destroyWavesurfer = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
      regionsRef.current = null;
      regionRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      destroyWavesurfer();
    };
  }, [destroyWavesurfer]);

  // Initialize wavesurfer when file changes
  useEffect(() => {
    if (!file || !containerRef.current) return;

    destroyWavesurfer();
    setIsLoading(true);
    setDuration(0);
    setIsPreviewing(false);
    setError(null);
    fileRef.current = file;

    const regions = RegionsPlugin.create();
    regionsRef.current = regions;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#6b7280",
      progressColor: "#3b82f6",
      cursorColor: "#1d4ed8",
      height: 128,
      normalize: true,
      plugins: [regions],
    });

    wavesurferRef.current = ws;

    const selectedFile = file;
    let cancelled = false;
    let suggestedStart = 0;
    async function loadAudio() {
      try {
        const recording =
          inputMode === "microphone"
            ? await prepareMicrophoneRecording(selectedFile)
            : { file: selectedFile, start: 0 };
        if (cancelled) return;
        fileRef.current = recording.file;
        suggestedStart = recording.start;
        await ws.loadBlob(recording.file);
      } catch (err) {
        if (cancelled) return;
        setError(
          `Failed to load audio: ${err instanceof Error ? err.message : err}`,
        );
        setIsLoading(false);
      }
    }
    void loadAudio();

    ws.on("ready", () => {
      const dur = ws.getDuration();
      setDuration(dur);
      setIsLoading(false);

      const initialStart = suggestedStart;

      const region = regions.addRegion({
        start: initialStart,
        end: initialStart + REGION_DURATION,
        color: "rgba(230, 181, 90, 0.5)",
        drag: true,
        resize: false, // Prevent resizing to keep fixed 1s length
      });

      regionRef.current = region;
      setRegionStart(initialStart);

      // Auto-play the full clip on load so user can hear it all
      if (inputMode === "upload") void ws.play().catch(() => {});
    });

    ws.on("play", () => setIsPreviewing(true));
    ws.on("pause", () => setIsPreviewing(false));
    ws.on("finish", () => setIsPreviewing(false));

    ws.on("error", (err) => {
      setError(`Failed to load audio: ${err}`);
      setIsLoading(false);
    });

    // Handle region updates
    regions.on("region-updated", (region: Region) => {
      ws.pause();
      const dur = ws.getDuration();

      // Clamp region to stay within bounds
      const maxStart = Math.max(0, dur - REGION_DURATION);
      const newStart = Math.max(0, Math.min(region.start, maxStart));

      // Update region to enforce exact 1s duration
      const newEnd = newStart + REGION_DURATION;

      if (region.start !== newStart || region.end !== newEnd) {
        region.setOptions({
          start: newStart,
          end: newEnd,
        });
      }

      setRegionStart(newStart);
    });

    return () => {
      cancelled = true;
      destroyWavesurfer();
    };
  }, [file, destroyWavesurfer, inputMode]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus(null);
    }
  };

  const handlePreview = () => {
    if (!wavesurferRef.current || !regionRef.current) return;

    const ws = wavesurferRef.current;
    const region = regionRef.current;

    if (ws.isPlaying()) {
      ws.pause();
      return;
    }
    // WaveSurfer stops at the end of the selected second and emits pause.
    void ws.play(region.start, region.end).catch(() => {
      setIsPreviewing(false);
      setError("Couldn’t play this selection. Please try again.");
    });
  };

  const handleUpload = async () => {
    if (!fileRef.current) return;

    wavesurferRef.current?.pause();
    setIsUploading(true);
    setError(null);
    setUploadStatus("Processing audio...");

    try {
      // Create the 1-second WAV
      const wavBlob = await createOneSecondWav(fileRef.current, regionStart);

      setUploadStatus("Uploading...");

      // Upload to API
      const response = await fetch(
        `${apiBase}/api/worlds/${worldId}/blocks/${blockIndex}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "audio/wav",
          },
          body: await wavBlob.arrayBuffer(),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`,
        );
      }

      setUploadStatus("Upload complete!");
      await onUploaded?.();
    } catch (err) {
      const message =
        err instanceof TypeError
          ? "Couldn’t connect to the audio service. Your recording is still here — check your connection and try again."
          : err instanceof Error
            ? err.message
            : "Upload failed";
      setError(message);
      setUploadStatus(null);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const ms = Math.round(seconds * 1000);
    return `${ms} ms`;
  };

  return (
    <div className="p-4 bg-base-200 rounded-lg border border-base-300">
      <div className="flex items-center justify-between mb-4">
        {inputMode === "upload" && (
          <h3 className="text-lg font-medium text-primary">
            Upload Audio to Block {blockIndex + 1}
          </h3>
        )}
        {onClose && (
          <button
            aria-label="Close audio editor"
            onClick={onClose}
            className="ml-auto text-primary/60 hover:text-primary text-xl leading-none"
          >
            ×
          </button>
        )}
      </div>

      {inputMode === "upload" && (
        <div className="mb-4">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            disabled={isUploading || isRecording}
            className="file-input file-input-bordered file-input-sm w-full max-w-xs"
          />
        </div>
      )}

      {/* Waveform container */}
      {file && (
        <div className="mb-4">
          <div
            ref={containerRef}
            className="bg-base-100 rounded border border-base-300"
          />
          {isLoading && (
            <p className="text-primary/60 text-sm mt-2">Loading waveform...</p>
          )}
          {!isLoading && duration > 0 && (
            <p className="text-primary/60 text-sm mt-2">
              {inputMode === "microphone"
                ? "Drag the selection if you’d like a different second."
                : "Drag the gold highlighted section to choose which 1 second of audio you want to use."}
            </p>
          )}
        </div>
      )}

      {/* Original upload editor time readout */}
      {inputMode === "upload" && file && !isLoading && duration > 0 && (
        <div className="mb-4 text-sm font-mono text-primary/80">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-primary/50">Start:</span>{" "}
              {formatTime(regionStart)}
            </div>
            <div>
              <span className="text-primary/50">End:</span>{" "}
              {formatTime(regionEnd)}
            </div>
            <div>
              <span className="text-primary/50">Duration:</span> 1000 ms
            </div>
          </div>
          {duration < REGION_DURATION && (
            <p className="text-warning mt-2 text-xs">
              ⚠ File is shorter than 1s. Silence will be added to reach 1s.
            </p>
          )}
        </div>
      )}

      {inputMode === "microphone" && (
        <MicrophoneRecorder
          disabled={isUploading || isRecording}
          hasRecording={!!file}
          onRecordingChange={(recording) => {
            setIsRecording(recording);
            if (recording) wavesurferRef.current?.pause();
          }}
          onRecorded={(recording) => {
            setFile(recording);
            setUploadStatus(null);
          }}
        />
      )}

      {/* Action buttons */}
      {file &&
        !isLoading &&
        duration > 0 &&
        (inputMode === "microphone" ? (
          <div className="audio-actions">
            <div className="audio-action-row">
              <button
                type="button"
                onClick={handlePreview}
                disabled={isUploading || isRecording}
                aria-label={isPreviewing ? "Pause selection" : "Play selection"}
                className="audio-action-button audio-preview-button"
              >
                <svg
                  viewBox="0 0 32 32"
                  width="32"
                  height="32"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  {isPreviewing ? (
                    <path d="M8 6h6v20H8zM18 6h6v20h-6z" />
                  ) : (
                    <path d="M11 5 28 16 11 27Z" />
                  )}
                </svg>
              </button>
              <p className="microphone-label">
                {isPreviewing ? "Pause selection" : "Play selection"}
              </p>
            </div>
            <div className="audio-action-row">
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || isRecording}
                aria-label={isUploading ? "Adding sound" : "Add sound"}
                aria-busy={isUploading}
                className="audio-action-button"
              >
                {isUploading ? (
                  <span
                    className="loading loading-spinner loading-md"
                    aria-hidden="true"
                  />
                ) : (
                  <svg
                    viewBox="0 0 32 32"
                    width="32"
                    height="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M16 6v20M6 16h20" />
                  </svg>
                )}
              </button>
              <p className="microphone-label">
                {isUploading ? "Adding sound…" : "Add sound"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 mb-4">
            <button
              onClick={handlePreview}
              disabled={isUploading}
              className="btn btn-sm btn-outline"
            >
              {isPreviewing ? "Pause selection" : "Preview selection"}
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="btn btn-sm btn-primary"
            >
              {isUploading ? "Uploading..." : "Upload to this block"}
            </button>
          </div>
        ))}

      {/* Status messages */}
      {uploadStatus && (
        <p role="status" className="text-success text-sm">
          {uploadStatus}
        </p>
      )}
      {error && (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
