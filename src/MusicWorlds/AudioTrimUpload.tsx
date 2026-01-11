import { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin, { Region } from "wavesurfer.js/dist/plugins/regions.js";
import { createOneSecondWav } from "./wav";

interface AudioTrimUploadProps {
  apiBase: string;
  worldId: string;
  blockIndex: number;
  onUploaded?: () => void;
  onClose?: () => void;
}

const REGION_DURATION = 1.0; // Exactly 1 second

export default function AudioTrimUpload({
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

    // Load the file
    ws.loadBlob(file);

    ws.on("ready", () => {
      const dur = ws.getDuration();
      setDuration(dur);
      setIsLoading(false);

      // Create the 1-second region (starting at 0)
      const initialStart = 0;

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
      ws.play();
    });

    ws.on("error", (err) => {
      setError(`Failed to load audio: ${err}`);
      setIsLoading(false);
    });

    // Handle region updates
    regions.on("region-updated", (region: Region) => {
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
      destroyWavesurfer();
    };
  }, [file, destroyWavesurfer]);

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

    // Play only the selected region (start to end)
    ws.setTime(region.start);
    ws.play();

    // Stop at region end
    const checkEnd = () => {
      if (ws.getCurrentTime() >= region.end) {
        ws.pause();
        ws.un("timeupdate", checkEnd);
      }
    };
    ws.on("timeupdate", checkEnd);
  };

  const handleUpload = async () => {
    if (!fileRef.current) return;

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
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      setUploadStatus("Upload complete!");
      onUploaded?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
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
        <h3 className="text-lg font-medium text-primary">
          Upload Audio to Block {blockIndex + 1}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-primary/60 hover:text-primary text-xl leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* File input */}
      <div className="mb-4">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="file-input file-input-bordered file-input-sm w-full max-w-xs"
        />
      </div>

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
              Drag the gold highlighted section to choose which 1 second of audio you want to use.
            </p>
          )}
        </div>
      )}

      {/* Time readout */}
      {file && !isLoading && duration > 0 && (
        <div className="mb-4 text-sm font-mono text-primary/80">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-primary/50">Start:</span> {formatTime(regionStart)}
            </div>
            <div>
              <span className="text-primary/50">End:</span> {formatTime(regionEnd)}
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

      {/* Action buttons */}
      {file && !isLoading && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={handlePreview}
            disabled={isUploading}
            className="btn btn-sm btn-outline"
          >
            Preview selection
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="btn btn-sm btn-primary"
          >
            {isUploading ? "Uploading..." : "Upload to this block"}
          </button>
        </div>
      )}

      {/* Status messages */}
      {uploadStatus && (
        <p className="text-success text-sm">{uploadStatus}</p>
      )}
      {error && (
        <p className="text-error text-sm">{error}</p>
      )}
    </div>
  );
}
