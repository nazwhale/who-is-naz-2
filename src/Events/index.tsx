import {
  differenceInCalendarWeeks,
  format,
  isThisWeek,
  isToday,
  isTomorrow,
  parseISO,
  startOfToday,
} from "date-fns";
import { useFetchEvents, Event } from "../hooks/useFetchEvents";

function Events() {
  const { eventsByDate } = useFetchEvents();

  return (
    <div>
      <ul>
        {Object.entries(eventsByDate).map(([date, events]) => (
          <div key={date}>
            <div className="divider text-primary">
              {date === "no-date"
                ? "Recurring"
                : formatDateLabel(parseISO(date))}
            </div>
            {events.map((event, index) => (
              <Event event={event} key={index} />
            ))}
          </div>
        ))}
      </ul>
    </div>
  );
}

function formatDateLabel(eventDate: Date): string {
  const today = startOfToday();
  if (isToday(eventDate)) {
    return "Today";
  } else if (isTomorrow(eventDate)) {
    return "Tomorrow";
  } else if (isThisWeek(eventDate)) {
    return format(eventDate, "'On' EEEE");
  } else {
    const weeksDifference = differenceInCalendarWeeks(eventDate, today, {
      weekStartsOn: 1,
    });
    if (weeksDifference === 1) {
      // Next week
      return `Next ${format(eventDate, "EEEE")}`;
    } else {
      // More than a week away
      const formattedDate = format(eventDate, "EEEE");
      return `${weeksDifference} weeks on ${formattedDate}`;
    }
  }
}

export default Events;

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
