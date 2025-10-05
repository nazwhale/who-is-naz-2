import React, { useEffect, useState } from "react";
import * as Tone from "tone";

interface WeatherData {
    hourly: {
        time: string[];
        temperature_2m: number[];
        precipitation: number[];
        weathercode: number[];
    };
}

const WeatherMusic: React.FC = () => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentHourIndex, setCurrentHourIndex] = useState<number | null>(null);

    // Edinburgh coordinates
    const EDINBURGH_LATITUDE = 55.9533;
    const EDINBURGH_LONGITUDE = -3.1883;
    const TIMEZONE = "Europe/London";

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${EDINBURGH_LATITUDE}&longitude=${EDINBURGH_LONGITUDE}&hourly=temperature_2m,precipitation,weathercode&timezone=${TIMEZONE}`;

                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error("Failed to fetch weather data");
                }

                const data = await response.json();
                setWeatherData(data);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    if (loading) {
        return <div className="p-4">Loading weather data...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    if (!weatherData) {
        return <div className="p-4">No weather data available</div>;
    }

    const hourlyTimes = weatherData.hourly.time;
    const hourlyTemperatures = weatherData.hourly.temperature_2m;
    const hourlyPrecipitation = weatherData.hourly.precipitation;
    const hourlyWeatherCodes = weatherData.hourly.weathercode;

    // Get current time and the next 24 hours of data
    const now = new Date();
    const HOURS_TO_DISPLAY = 24;
    const next24Hours = hourlyTimes.slice(0, HOURS_TO_DISPLAY);

    const firstHourTime = next24Hours.length > 0 ? new Date(next24Hours[0]) : now;
    const lastHourTime = next24Hours.length > 0 ? new Date(next24Hours[next24Hours.length - 1]) : now;

    // ============================================================================
    // WEATHER CODE TRANSLATION
    // ============================================================================

    /**
     * Translates WMO weather codes to human-readable descriptions
     * @param code - WMO weather code from Open-Meteo API
     * @returns Human-readable weather description
     */
    const getWeatherDescription = (code: number): string => {
        const weatherDescriptions: { [key: number]: string } = {
            0: "Clear sky ☀️",
            1: "Mainly clear 🌤️",
            2: "Partly cloudy ⛅",
            3: "Overcast ☁️",
            45: "Fog 🌫️",
            48: "Depositing rime fog 🌫️",
            51: "Light drizzle 🌦️",
            53: "Moderate drizzle 🌧️",
            55: "Dense drizzle 🌧️",
            61: "Slight rain 🌧️",
            63: "Moderate rain 🌧️",
            65: "Heavy rain 🌧️",
            71: "Slight snow ❄️",
            73: "Moderate snow ❄️",
            75: "Heavy snow ❄️",
            80: "Slight rain showers 🌦️",
            81: "Moderate rain showers 🌧️",
            82: "Violent rain showers ⛈️",
            95: "Thunderstorm ⛈️",
            96: "Thunderstorm with slight hail ⛈️",
            99: "Thunderstorm with heavy hail ⛈️",
        };

        return weatherDescriptions[code] || `Unknown (code ${code})`;
    };

    /**
     * Determines if a weather code represents "good" weather
     * Good weather = clear, mainly clear, partly cloudy
     * @param code - WMO weather code
     * @returns true if weather is good (use major third), false if bad (use minor third)
     */
    const isGoodWeather = (code: number): boolean => {
        // Good weather codes: 0, 1, 2
        // Bad weather codes: everything else (3+)
        return code >= 0 && code <= 2;
    };

    // ============================================================================
    // MUSIC GENERATION FUNCTIONS
    // ============================================================================

    /**
     * Maps an absolute temperature value to a note in C major pentatonic scale
     * Uses absolute temperature so you can hear if it's a hot or cold day
     * C major pentatonic: C, D, E, G, A
     * @param temperature - Temperature in Celsius
     * @returns Musical note in scientific pitch notation (e.g., "C4")
     */
    const mapTemperatureToNote = (temperature: number): string => {
        // C major pentatonic scale across 3 octaves (C3 to A5)
        const scale = [
            "C3", "D3", "E3", "G3", "A3",  // Octave 3 - cold temps
            "C4", "D4", "E4", "G4", "A4",  // Octave 4 - mild temps
            "C5", "D5", "E5", "G5", "A5",  // Octave 5 - warm temps
        ];

        // Map temperature to scale index
        // Typical Edinburgh range: -5°C (freezing cold) to 25°C (hot summer day)
        const MIN_TEMP = -5;  // Below this = lowest note
        const MAX_TEMP = 25;  // Above this = highest note

        // Clamp temperature to range
        const clampedTemp = Math.max(MIN_TEMP, Math.min(MAX_TEMP, temperature));

        // Map to 0-1 range based on absolute temperature
        const normalized = (clampedTemp - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);

        // Map to scale index
        const scaleIndex = Math.floor(normalized * (scale.length - 1));
        return scale[scaleIndex];
    };

    /**
     * Calculates the third (harmony note) for a given root note
     * @param rootNote - The base note (e.g., "C4")
     * @param isMajor - true for major third, false for minor third
     * @returns The third note in scientific pitch notation
     */
    const getThird = (rootNote: string, isMajor: boolean): string => {
        // Parse the note and octave
        const noteName = rootNote.slice(0, -1);
        const octave = parseInt(rootNote.slice(-1));

        // Chromatic scale for reference
        const chromaticScale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

        // Find the root note index
        const rootIndex = chromaticScale.indexOf(noteName);

        // Major third = 4 semitones up, Minor third = 3 semitones up
        const semitones = isMajor ? 4 : 3;
        let thirdIndex = (rootIndex + semitones) % 12;
        let thirdOctave = octave;

        // If we wrapped around, increment octave
        if (rootIndex + semitones >= 12) {
            thirdOctave++;
        }

        return chromaticScale[thirdIndex] + thirdOctave;
    };

    /**
     * Creates a polyphonic synth with reverb for playing chords
     * @returns Configured Tone.js polyphonic synth connected to reverb
     */
    const createSynthWithReverb = () => {
        // Create a reverb effect for atmosphere
        const reverb = new Tone.Reverb({
            decay: 2.5,
            wet: 0.3,  // 30% reverb, 70% dry signal
        }).toDestination();

        // Create a polyphonic synth (can play multiple notes at once)
        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: "sine",  // Smooth sine wave
            },
            envelope: {
                attack: 0.1,
                decay: 0.2,
                sustain: 0.5,
                release: 1.0,
            },
        }).connect(reverb);

        return synth;
    };

    /**
     * Plays the 24-hour temperature sequence as music
     * Each hour is represented by a chord (root + third), with temperature mapped to pitch
     * Good weather = major third (happy), bad weather = minor third (sad)
     */
    const playTemperatureSequence = async () => {
        try {
            // Start Tone.js audio context (required for browser audio)
            await Tone.start();
            console.log("Audio context started");

            setIsPlaying(true);
            setCurrentHourIndex(0);

            // Get the first 24 hours of temperature data
            const temperatures = hourlyTemperatures.slice(0, HOURS_TO_DISPLAY);
            const weatherCodes = hourlyWeatherCodes.slice(0, HOURS_TO_DISPLAY);

            // Create synth with reverb
            const synth = createSynthWithReverb();

            // Schedule all notes
            const noteDuration = "8n";  // Eighth note duration
            const timeBetweenNotes = 0.5;  // Half second between notes

            // Use Tone.Part instead of Sequence for better control
            // Map each temperature directly to a note (no normalization!)
            const events = temperatures.map((temp, index) => {
                const rootNote = mapTemperatureToNote(temp);
                const weatherCode = weatherCodes[index];
                const isMajor = isGoodWeather(weatherCode);
                const thirdNote = getThird(rootNote, isMajor);

                return {
                    time: index * timeBetweenNotes,
                    notes: [rootNote, thirdNote],  // Play both notes as a chord
                    index: index,
                    isMajor: isMajor,
                };
            });

            const part = new Tone.Part((time, event) => {
                // Play the chord (root + third)
                synth.triggerAttackRelease(event.notes, noteDuration, time);

                // Update UI to highlight current hour
                Tone.Draw.schedule(() => {
                    setCurrentHourIndex(event.index);
                    const chordType = event.isMajor ? "major" : "minor";
                    console.log(`Playing hour ${event.index}: ${event.notes.join("+")} (${chordType}) - ${temperatures[event.index]}°C`);
                }, time);
            }, events);

            // Schedule the end of playback
            Tone.Transport.schedule(() => {
                Tone.Transport.stop();
                part.dispose();
                synth.dispose();
                setIsPlaying(false);
                setCurrentHourIndex(null);
                console.log("Playback finished");
            }, (temperatures.length * timeBetweenNotes) + 1);

            part.start(0);
            Tone.Transport.start();
            console.log("Transport started");
        } catch (error) {
            console.error("Error playing sequence:", error);
            setIsPlaying(false);
            setCurrentHourIndex(null);
        }
    };

    /**
     * Stops the currently playing sequence
     */
    const stopPlayback = () => {
        Tone.Transport.stop();
        Tone.Transport.cancel(0);
        setIsPlaying(false);
        setCurrentHourIndex(null);
        console.log("Playback stopped");
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">Edinburgh Weather Music</h2>

            <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-6">
                    <p>Weather forecast for Edinburgh, Scotland</p>
                    <p className="font-semibold mt-2">
                        Showing: {firstHourTime.toLocaleDateString()} {firstHourTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' → '}
                        {lastHourTime.toLocaleDateString()} {lastHourTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <div className="mb-6">
                    <button
                        onClick={isPlaying ? stopPlayback : playTemperatureSequence}
                        className="bg-black text-yellow-500 px-6 py-3 rounded font-semibold hover:bg-gray-900 transition-colors"
                    >
                        {isPlaying ? "⏹ Stop" : "▶ Play the Day"}
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                        Listen to the temperature changes throughout the day as music
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Time</th>
                                <th className="text-left p-2">Temperature (°C)</th>
                                <th className="text-left p-2">Precipitation (mm)</th>
                                <th className="text-left p-2">Weather Condition</th>
                            </tr>
                        </thead>
                        <tbody>
                            {next24Hours.map((timeString, index) => {
                                const hour = new Date(timeString);
                                const temperature = hourlyTemperatures[index];
                                const precipitation = hourlyPrecipitation[index];
                                const weatherCode = hourlyWeatherCodes[index];
                                const weatherDescription = getWeatherDescription(weatherCode);
                                const isCurrentlyPlaying = currentHourIndex === index;

                                return (
                                    <tr
                                        key={index}
                                        className={`border-b transition-colors ${isCurrentlyPlaying
                                            ? "bg-blue-200 font-semibold"
                                            : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <td className="p-2">
                                            {isCurrentlyPlaying && "♪ "}
                                            {hour.toLocaleString()}
                                        </td>
                                        <td className="p-2">{temperature}°C</td>
                                        <td className="p-2">{precipitation} mm</td>
                                        <td className="p-2">{weatherDescription}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 p-4 bg-gray-100 rounded">
                    <p className="text-sm">
                        Data includes forecast starting from the current hour and extending 24 hours forward.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WeatherMusic;
