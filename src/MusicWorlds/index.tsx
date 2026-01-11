import { useEffect, useMemo, useRef, useState } from "react";
import AudioTrimUpload from "./AudioTrimUpload";

const API_BASE = import.meta.env.VITE_MUSIC_WORLDS_API_BASE as string;
const WORLD_ID = import.meta.env.VITE_MUSIC_WORLDS_WORLD_ID as string;

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

export default function MusicWorlds() {
    const [blocks, setBlocks] = useState<Map<number, AudioBlock>>(new Map());
    const [editingBlock, setEditingBlock] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const silenceTimeoutRef = useRef<number | null>(null);
    const isPlayingRef = useRef(false);

    const indices = useMemo(() => Array.from({ length: 180 }, (_, i) => i), []);
    const TOTAL_BLOCKS = 180;

    async function loadBlocks() {
        const res = await fetch(`${API_BASE}/api/worlds/${WORLD_ID}/audio-bundle`);
        if (!res.ok) throw new Error(await res.text());
        const { blocks: audioBlocks }: { blocks: AudioBlock[] } = await res.json();
        console.log("Audio blocks with content:", audioBlocks.length);
        const m = new Map<number, AudioBlock>();
        for (const block of audioBlocks) m.set(block.block_index, block);
        setBlocks(m);
    }

    useEffect(() => {
        loadBlocks().catch(console.error);
    }, []);

    function handleBlockClick(index: number) {
        // Click always opens the upload modal (for adding or replacing audio)
        setEditingBlock(index);
    }

    function handleBlockRightClick(e: React.MouseEvent, index: number) {
        e.preventDefault();
        // Right-click opens edit modal for any block
        setEditingBlock(index);
    }

    async function handleAudioUploaded() {
        // Refresh block list
        await loadBlocks();

        if (editingBlock !== null) {
            // Play back the uploaded audio with cache-bust
            const url = `${API_BASE}/api/worlds/${WORLD_ID}/blocks/${editingBlock}?v=${Date.now()}`;
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

        if (index >= TOTAL_BLOCKS) {
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
        <div className="p-6 font-sans min-h-screen bg-base-100">
            <h1 className="text-2xl font-bold text-primary m-0">Music Worlds</h1>
            <p className="text-secondary/80 mt-2 mb-4 max-w-2xl">
                A collaborative 3-minute piece of music. Anyone in the world can upload a 1-second audio clip to any slot below. Click a block to add or replace its audio—together we create something new and ever changing.
            </p>

            <div className="my-4 flex items-center gap-3">
                {!isPlaying ? (
                    <button
                        onClick={startPlayback}
                        className="px-5 py-2.5 bg-primary text-primary-content rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        ▶ Play
                    </button>
                ) : (
                    <button
                        onClick={stopPlayback}
                        className="px-5 py-2.5 bg-error text-neutral-content rounded-lg hover:opacity-80 transition-colors font-medium"
                    >
                        ■ Stop
                    </button>
                )}
                <button
                    disabled={isPlaying}
                    onClick={() => loadBlocks()}
                    className="px-4 py-2 bg-neutral text-primary rounded-lg hover:bg-neutral/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Refresh
                </button>
                {currentBlockIndex !== null && (
                    <span className="text-primary font-mono text-lg">
                        {fmt(currentBlockIndex)} / {fmt(TOTAL_BLOCKS - 1)}
                    </span>
                )}
            </div>
            <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />


            <div className="grid grid-cols-12 gap-1.5 mt-6">
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
                                py-2.5 px-1.5 rounded-lg text-xs font-medium transition-all duration-200
                                disabled:cursor-not-allowed
                                ${isCurrent
                                    ? "bg-accent text-accent-content border-2 border-accent shadow-lg scale-110 ring-2 ring-accent ring-offset-2 ring-offset-base-100"
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

            {/* Audio Trim/Upload Modal */}
            {editingBlock !== null && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="max-w-2xl w-full">
                        <AudioTrimUpload
                            apiBase={API_BASE}
                            worldId={WORLD_ID}
                            blockIndex={editingBlock}
                            onUploaded={handleAudioUploaded}
                            onClose={() => setEditingBlock(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
