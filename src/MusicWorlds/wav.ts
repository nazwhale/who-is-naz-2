/**
 * WAV encoding utilities for client-side audio processing
 */

const TARGET_PEAK_DBFS = -1; // Target peak level in dBFS
const TARGET_PEAK = Math.pow(10, TARGET_PEAK_DBFS / 20); // ≈ 0.8913
const FADE_DURATION_MS = 5; // Fade in/out duration to avoid clicks

/**
 * Decode an audio file to an AudioBuffer
 */
export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new AudioContext();
    try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
    } finally {
        await audioContext.close();
    }
}

/**
 * Extract exactly 1 second of audio from the buffer, starting at startTime.
 * - Converts to mono (averages channels)
 * - Pads with silence if needed
 * - Applies fade-in/fade-out to avoid clicks
 * - Peak normalizes to -1 dBFS
 */
export function extractOneSecondMono(
    audioBuffer: AudioBuffer,
    startTime: number
): Float32Array {
    const sampleRate = audioBuffer.sampleRate;
    const numChannels = audioBuffer.numberOfChannels;
    const outputLength = sampleRate; // Exactly 1 second worth of samples
    const fadeLength = Math.floor((FADE_DURATION_MS / 1000) * sampleRate);

    const startSample = Math.floor(startTime * sampleRate);

    // Create output buffer (mono)
    const output = new Float32Array(outputLength);

    // Extract and mix to mono
    for (let i = 0; i < outputLength; i++) {
        const sourceSample = startSample + i;
        if (sourceSample < audioBuffer.length) {
            // Average all channels
            let sum = 0;
            for (let ch = 0; ch < numChannels; ch++) {
                sum += audioBuffer.getChannelData(ch)[sourceSample];
            }
            output[i] = sum / numChannels;
        } else {
            // Pad with silence
            output[i] = 0;
        }
    }

    // Apply fade-in
    for (let i = 0; i < fadeLength && i < outputLength; i++) {
        const fade = i / fadeLength;
        output[i] *= fade;
    }

    // Apply fade-out
    for (let i = 0; i < fadeLength && i < outputLength; i++) {
        const idx = outputLength - 1 - i;
        const fade = i / fadeLength;
        output[idx] *= fade;
    }

    // Peak normalize to -1 dBFS
    let maxAbs = 0;
    for (let i = 0; i < outputLength; i++) {
        const abs = Math.abs(output[i]);
        if (abs > maxAbs) maxAbs = abs;
    }

    if (maxAbs > 0) {
        const gain = TARGET_PEAK / maxAbs;
        for (let i = 0; i < outputLength; i++) {
            output[i] *= gain;
        }
    }

    return output;
}

/**
 * Encode mono Float32Array samples to PCM 16-bit WAV
 * Returns a Blob with type audio/wav
 */
export function encodeWav(samples: Float32Array, sampleRate: number): Blob {
    const numChannels = 1; // Mono
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = samples.length * bytesPerSample;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);

    // Write WAV header
    let offset = 0;

    // "RIFF" chunk descriptor
    writeString(view, offset, "RIFF");
    offset += 4;
    view.setUint32(offset, totalSize - 8, true); // File size - 8
    offset += 4;
    writeString(view, offset, "WAVE");
    offset += 4;

    // "fmt " sub-chunk
    writeString(view, offset, "fmt ");
    offset += 4;
    view.setUint32(offset, 16, true); // Subchunk1Size (16 for PCM)
    offset += 4;
    view.setUint16(offset, 1, true); // AudioFormat (1 = PCM)
    offset += 2;
    view.setUint16(offset, numChannels, true);
    offset += 2;
    view.setUint32(offset, sampleRate, true);
    offset += 4;
    view.setUint32(offset, byteRate, true);
    offset += 4;
    view.setUint16(offset, blockAlign, true);
    offset += 2;
    view.setUint16(offset, bitsPerSample, true);
    offset += 2;

    // "data" sub-chunk
    writeString(view, offset, "data");
    offset += 4;
    view.setUint32(offset, dataSize, true);
    offset += 4;

    // Write PCM samples (16-bit signed)
    for (let i = 0; i < samples.length; i++) {
        // Clamp to [-1, 1] and convert to 16-bit signed integer
        const sample = Math.max(-1, Math.min(1, samples[i]));
        const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, int16, true);
        offset += 2;
    }

    return new Blob([buffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}

/**
 * Complete pipeline: decode file, extract 1s slice, encode to WAV
 */
export async function createOneSecondWav(
    file: File,
    startTime: number
): Promise<Blob> {
    const audioBuffer = await decodeAudioFile(file);
    const monoSamples = extractOneSecondMono(audioBuffer, startTime);
    return encodeWav(monoSamples, audioBuffer.sampleRate);
}
