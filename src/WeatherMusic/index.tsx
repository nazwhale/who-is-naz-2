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

    // ============================================================================
    // MUSIC GENERATION FUNCTIONS
    // ============================================================================

    /**
     * Normalizes temperature values to a 0-1 range based on the day's min and max
     * @param temperatures - Array of temperature values for the day
     * @returns Array of normalized values between 0 and 1
     */
    const normalizeTemperatures = (temperatures: number[]): number[] => {
        const minTemp = Math.min(...temperatures);
        const maxTemp = Math.max(...temperatures);
        const range = maxTemp - minTemp;

        // Handle edge case where all temperatures are the same
        if (range === 0) {
            return temperatures.map(() => 0.5);
        }

        return temperatures.map(temp => (temp - minTemp) / range);
    };

    /**
     * Maps a normalized value (0-1) to a note in C major pentatonic scale across 3 octaves
     * C major pentatonic: C, D, E, G, A
     * @param normalizedValue - Value between 0 and 1
     * @returns Musical note in scientific pitch notation (e.g., "C4")
     */
    const mapToScale = (normalizedValue: number): string => {
        // C major pentatonic scale across 3 octaves (C3 to C6)
        const scale = [
            "C3", "D3", "E3", "G3", "A3",  // Octave 3
            "C4", "D4", "E4", "G4", "A4",  // Octave 4
            "C5", "D5", "E5", "G5", "A5",  // Octave 5
        ];

        // Map 0-1 to scale index
        const scaleIndex = Math.floor(normalizedValue * (scale.length - 1));
        return scale[scaleIndex];
    };

    /**
     * Creates a synth with reverb for smoother, less "bleep-bloopy" sound
     * @returns Configured Tone.js synth connected to reverb
     */
    const createSynthWithReverb = () => {
        // Create a reverb effect for atmosphere
        const reverb = new Tone.Reverb({
            decay: 2.5,
            wet: 0.3,  // 30% reverb, 70% dry signal
        }).toDestination();

        // Create a synth with a smoother sound
        const synth = new Tone.Synth({
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
     * Each hour is represented by one note, with temperature mapped to pitch
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

            // Normalize temperatures to 0-1 range
            const normalizedTemps = normalizeTemperatures(temperatures);

            // Create synth with reverb
            const synth = createSynthWithReverb();

            // Schedule all notes
            const noteDuration = "8n";  // Eighth note duration
            const timeBetweenNotes = 0.5;  // Half second between notes

            // Use Tone.Part instead of Sequence for better control
            const events = temperatures.map((_, index) => {
                const normalizedTemp = normalizedTemps[index];
                const note = mapToScale(normalizedTemp);
                return {
                    time: index * timeBetweenNotes,
                    note: note,
                    index: index,
                };
            });

            const part = new Tone.Part((time, event) => {
                // Play the note
                synth.triggerAttackRelease(event.note, noteDuration, time);

                // Update UI to highlight current hour
                Tone.Draw.schedule(() => {
                    setCurrentHourIndex(event.index);
                    console.log(`Playing hour ${event.index}: ${event.note}`);
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

