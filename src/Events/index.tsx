import { compareDesc, format, isPast, isToday, parseISO } from "date-fns";
import { useEffect, useState } from "react";

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
};

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
  });

  const todayEvents = events.filter((event) => {
    return isToday(new Date(event.date));
  });

  const futureEvents = events.filter((event) => {
    // today, true
    if (isToday(new Date(event.date))) {
      return false;
    }

    return !isPast(new Date(event.date));
  });

  const pastEvents = events.filter((event) => {
    if (isToday(new Date(event.date))) {
      return false;
    }
    return isPast(new Date(event.date));
  });

  return (
    <div>
      <ul>
        <div className="divider text-primary">today</div>

        {todayEvents.map((event, index) => (
          <Event event={event} key={index} />
        ))}

        <div className="divider text-primary">future</div>

        {futureEvents.map((event, index) => (
          <Event event={event} key={index} />
        ))}

        <div className="divider text-primary">past</div>

        {pastEvents.map((event, index) => (
          <Event event={event} key={index} />
        ))}
      </ul>
    </div>
  );
}

export default Events;

// event component

function Event({ event }: { event: Event }) {
  return (
    <li className="mb-4">
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div className="badge">{event.description}</div>
          <a
            href={event.url}
            target="_blank"
            rel="noreferrer"
            className="link-hover"
          >
            <h3 className="font-semibold">
              {event.venue} // {event.name}
            </h3>
          </a>
          <p>
            {event.date === ""
              ? event.recurs_on
              : format(parseISO(event.date), "eee d MMM ''yy")}
          </p>
          {event.start_time !== "" && (
            <p>
              , {event.start_time}{" "}
              {event.end_time !== "" && <span>– {event.end_time}</span>}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
