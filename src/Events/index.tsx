import {
  compareAsc,
  compareDesc,
  format,
  isPast,
  isToday,
  parseISO,
} from "date-fns";
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
        console.log(data);

        const sortedEvents = data.sort((a, b) => {
          // Check if either event doesn't have a date
          if (!a.date && !b.date) {
            return 0; // Both events have no date, keep original order
          } else if (!a.date) {
            return -1; // Only a has no date, sort a before b
          } else if (!b.date) {
            return 1; // Only b has no date, sort b before a
          }

          // Both have dates, compare normally
          return compareAsc(parseISO(a.date), parseISO(b.date));
        });

        console.log("sorted", sortedEvents);

        setEvents(sortedEvents);
      })
      .catch((error) => console.error("Failed to load events:", error));
  }, []); // Empty dependency array means this effect runs once on mount

  // // order events by date using datefns library
  // events.sort((a, b) => {
  //   return compareAsc(parseISO(a.date), parseISO(b.date));
  // });
  // console.log(events);

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
        <div className="flex flex-wrap items-center space-x-2">
          <div className="badge">{event.description}</div>
          <a
            href={event.url}
            target="_blank"
            rel="noreferrer"
            className="link-hover max-w-full"
          >
            <h3 className="font-semibold truncate">
              {event.venue} // {event.name}
            </h3>
          </a>
          <p>
            {event.date === ""
              ? event.recurs_on
              : format(parseISO(event.date), "eee d MMM ''yy")}
            {event.start_time !== "" && <span>, {event.start_time} </span>}
            {event.end_time !== "" && <span>– {event.end_time}</span>}
          </p>
        </div>
      </div>
    </li>
  );
}
