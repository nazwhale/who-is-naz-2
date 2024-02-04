import {useEffect, useState} from "react";

type Event = {
    name: string;
    recurs_on?: string;
    date: string;
    start_time?: string;
    end_time?: string;
    description: string;
    price?: number;
    url: string;
    venue: string;
}

function Events() {
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        // Fetch the events on component mount
        fetch("/events.json")
            .then((response) => response.json())
            .then((data: Event[]) => {
                setEvents(data);
            })
            .catch((error) => console.error("Failed to load events:", error));
    }, []); // Empty dependency array means this effect runs once on mount

    return (
                <div>
                    <ul>
                        {events.map((event, index) => (
                            <li key={index} className="mb-4">
                                <h3 className="font-semibold">{event.venue} // {event.name}</h3>
                                <p>{event.description}</p>
                                <p>{event.date === "" ? event.recurs_on : event.date}</p>
                                <p>{event.start_time} – {event.end_time}</p>
                                {/*// target blank*/}
                                <a href={event.url} target="_blank" rel="noreferrer" className="link">More info</a>
                            </li>
                        ))}
                    </ul>
                </div>
    );
}

export default Events;