import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AudioTrimUpload from "./AudioTrimUpload";
import "./style.css";

const API_BASE = import.meta.env.DEV
    ? "/music-worlds-api"
    : import.meta.env.VITE_MUSIC_WORLDS_API_BASE as string;
const LEGACY_WORLD_ID = import.meta.env.VITE_MUSIC_WORLDS_WORLD_ID as string;
const MICROPHONE_WORLD_ID = "a-second-of-your-time-v1";

type AudioBlock = {
    block_index: number;
    audio: string;  // base64 encoded
    content_type: string;
    size: number;
};

function fmt(i: number) {
    const m = Math.floor(i / 60);
    const s = i % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MusicWorlds({ inputMode = "microphone" }: { inputMode?: "upload" | "microphone" }) {
    const worldId = inputMode === "microphone" ? MICROPHONE_WORLD_ID : LEGACY_WORLD_ID;
    const totalBlocks = inputMode === "microphone" ? 20 : 180;
    const [blocks, setBlocks] = useState<Map<number, AudioBlock>>(new Map());
    const [editingBlock, setEditingBlock] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const silenceTimeoutRef = useRef<number | null>(null);
    const isPlayingRef = useRef(false);

    const indices = useMemo(() => Array.from({ length: totalBlocks }, (_, i) => i), [totalBlocks]);

    const loadBlocks = useCallback(async () => {
        const res = await fetch(`${API_BASE}/api/worlds/${worldId}/audio-bundle`);
        if (!res.ok) throw new Error(`Audio service returned ${res.status}`);
        const { blocks: audioBlocks }: { blocks: AudioBlock[] } = await res.json();
        console.log("Audio blocks with content:", audioBlocks.length);
        const m = new Map<number, AudioBlock>();
        for (const block of audioBlocks) m.set(block.block_index, block);
        setBlocks(m);
        setLoadError(null);
    }, [worldId]);

    useEffect(() => {
        loadBlocks()
            .catch(() => setLoadError("Couldn’t connect to the audio service. Your slots haven’t loaded. Please try Refresh."))
            .finally(() => setIsLoading(false));
    }, [loadBlocks]);

    useEffect(() => () => {
        isPlayingRef.current = false;
        if (silenceTimeoutRef.current !== null) clearTimeout(silenceTimeoutRef.current);
    }, []);

    function handleBlockClick(index: number) {
        if (inputMode === "upload") {
            isPlayingRef.current = true;
            setIsPlaying(true);
            playFromIndex(index);
        } else {
            stopPlayback();
        }
        // Also open the upload modal
        setEditingBlock(index);
    }

    function handleBlockRightClick(e: React.MouseEvent, index: number) {
        e.preventDefault();
        if (inputMode === "microphone") stopPlayback();
        setEditingBlock(index);
    }

    async function handleAudioUploaded() {
        // Stop the background playback
        stopPlayback();

        // Refresh block list
        await loadBlocks();

        if (editingBlock !== null) {
            // Play back the uploaded audio with cache-bust
            const url = `${API_BASE}/api/worlds/${worldId}/blocks/${editingBlock}?v=${Date.now()}`;
            if (audioRef.current) {
                audioRef.current.src = url;
                await audioRef.current.play().catch(() => { });
            }
        }

        setEditingBlock(null);
    }

    // Sequential playback controls
    function startPlayback() {
        isPlayingRef.current = true;
        setIsPlaying(true);
        playFromIndex(0);
    }

    function stopPlayback() {
        isPlayingRef.current = false;
        setIsPlaying(false);
        setCurrentBlockIndex(null);
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
    }

    function playFromIndex(index: number) {
        if (!isPlayingRef.current) return;

        if (index >= totalBlocks) {
            // Reached the end
            stopPlayback();
            return;
        }

        setCurrentBlockIndex(index);
        const block = blocks.get(index);

        if (block) {
            // Has audio - play it
            if (audioRef.current) {
                const dataUrl = `data:${block.content_type};base64,${block.audio}`;
                audioRef.current.src = dataUrl;
                audioRef.current.play().catch(() => {
                    // If play fails, move to next
                    if (isPlayingRef.current) playFromIndex(index + 1);
                });
            }
        } else {
            // No audio - wait 1 second (each block = 1 second of timeline)
            silenceTimeoutRef.current = window.setTimeout(() => {
                if (isPlayingRef.current) playFromIndex(index + 1);
            }, 1000);
        }
    }

    function handleAudioEnded() {
        if (isPlayingRef.current && currentBlockIndex !== null) {
            playFromIndex(currentBlockIndex + 1);
        }
    }


    return (
        <div className="music-worlds p-6 font-sans min-h-screen">
            <h1 className="text-2xl font-bold text-primary m-0">A Second of Your Time</h1>
            <p className="text-secondary/80 mt-2 mb-4 max-w-2xl">
                A collaborative {inputMode === "microphone" ? "20-second" : "3-minute"} piece of music. Anyone can {inputMode === "microphone" ? "record a sound with their microphone and add one second" : "upload a 1-second audio clip"} to any slot below. Click a block to add or replace its audio. Check back to hear how things have evolved.
            </p>

            <p className="text-sm text-primary/60 mb-4">
                <Link className="underline" to={inputMode === "microphone" ? "/v0/a-second-of-your-time" : "/a-second-of-your-time"}>
                    {inputMode === "microphone" ? "Original file upload version (v0)" : "Try the microphone version"}
                </Link>
            </p>

            <p className="text-sm mb-4"><Link className="underline" to="/v2/a-second-of-your-time">Try the shared note grid (v2)</Link></p>

            <div className="my-4 flex items-center gap-3">
                {!isPlaying ? (
                    <button
                        onClick={startPlayback}
                        disabled={isLoading}
                        className="px-5 py-2.5 bg-primary text-primary-content rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {isLoading ? "Loading..." : "▶ Play"}
                    </button>
                ) : (
                    <button
                        onClick={stopPlayback}
                        className="px-5 py-2.5 bg-primary text-primary-content rounded-lg hover:opacity-80 transition-colors font-medium"
                    >
                        ■ Stop
                    </button>
                )}
                <button
                    disabled={isPlaying}
                    onClick={() => {
                        void loadBlocks().catch(() => setLoadError("Couldn’t connect to the audio service. Please try Refresh."));
                    }}
                    className="px-4 py-2 bg-base-200 text-primary rounded-lg hover:bg-base-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Refresh
                </button>
                {currentBlockIndex !== null && (
                    <span className="text-primary font-mono text-lg">
                        {fmt(currentBlockIndex)} / {fmt(totalBlocks)}
                    </span>
                )}
            </div>
            {loadError && <p role="alert">{loadError}</p>}
            <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />

            {isLoading ? (
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 sm:gap-1.5 mt-6">
                    {indices.slice(0, 60).map((i) => (
                        <div
                            key={i}
                            className="py-2 px-1 sm:py-2.5 sm:px-1.5 rounded-md sm:rounded-lg aspect-[1.5/1] bg-base-300/30 animate-pulse"
                            style={{ animationDelay: `${(i % 12) * 50}ms` }}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 sm:gap-1.5 mt-6">
                    {indices.map((i) => {
                        const row = blocks.get(i);
                        const hasAudio = !!row;
                        const isCurrent = currentBlockIndex === i;
                        const label = fmt(i);

                        return (
                            <button
                                key={i}
                                disabled={isPlaying || editingBlock !== null}
                                onClick={() => handleBlockClick(i)}
                                onContextMenu={(e) => handleBlockRightClick(e, i)}
                                title={row ? `Audio: ${Math.round(row.size / 1024)}KB - Click to replace` : "Click to add audio"}
                                className={`
                                py-2 px-1 sm:py-2.5 sm:px-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200
                                disabled:cursor-not-allowed aspect-[1.5/1] flex items-center justify-center
                                ${isCurrent
                                        ? "bg-accent text-accent-content border-2 border-accent shadow-lg scale-110 ring-2 ring-accent ring-offset-2 ring-offset-neutral"
                                        : hasAudio
                                            ? "bg-primary text-primary-content border-2 border-primary shadow-md hover:bg-accent hover:scale-105"
                                            : "bg-base-300/50 text-primary/40 border border-base-200 hover:bg-base-200 hover:text-primary/70 hover:border-primary/30"
                                    }
                            `}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Audio Trim/Upload Modal */}
            {editingBlock !== null && (
                <div role="dialog" aria-modal="true" aria-label="Add a second of audio" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="max-w-2xl w-full">
                        <AudioTrimUpload
                            key={`${inputMode}-${editingBlock}`}
                            inputMode={inputMode}
                            apiBase={API_BASE}
                            worldId={worldId}
                            blockIndex={editingBlock}
                            onUploaded={handleAudioUploaded}
                            onClose={() => {
                                setEditingBlock(null);
                                stopPlayback();
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
