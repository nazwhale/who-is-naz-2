import { compareDesc } from "date-fns";
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
    let [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        // Fetch the events on component mount
        fetch("/events.json")
            .then((response) => response.json())
            .then((data: Event[]) => {
                setEvents(data);
            })
            .catch((error) => console.error("Failed to load events:", error));
    }, []); // Empty dependency array means this effect runs once on mount

    // order events by date using datefns library
     events = events.sort((a, b) => {
        return compareDesc(new Date(a.date), new Date(b.date));

     })


    return (
                <div>
                    <ul>
                        {events.map((event, index) => (
                            <li key={index} className="mb-4">
                                <a href={event.url} target="_blank" rel="noreferrer" className="link-hover">
                                <h3 className="font-semibold">{event.venue} // {event.name}</h3>
                                </a>
                                <p>{event.description}</p>
                                <p>{event.date === "" ? event.recurs_on : event.date}</p>
                                <p>{event.start_time} – {event.end_time}</p>
                            </li>
                        ))}
                    </ul>
                </div>
    );
}

export default Events;