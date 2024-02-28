import {
  differenceInCalendarWeeks,
  format,
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
  const dateOfMonth = format(eventDate, "d/M");

  const today = startOfToday();
  if (isToday(eventDate)) {
    return "Today";
  } else if (isTomorrow(eventDate)) {
    return "Tomorrow";
  } else {
    const weeksDifference = differenceInCalendarWeeks(eventDate, today, {
      weekStartsOn: 1,
    });

    switch (weeksDifference) {
      case 0:
        // This week
        return `${format(eventDate, "EEEE")}, ${dateOfMonth}`;
      case 1:
        // Next week
        return `Next ${format(eventDate, "EEEE")}, ${dateOfMonth}`;
      default:
        // More than a week away
        return `${weeksDifference} weeks on ${format(
          eventDate,
          "EEEE",
        )}, ${dateOfMonth}`;
    }
  }
}

export default Events;

function Event({ event }: { event: Event }) {
  return (
    <li className="mb-4">
      <div className="mb-4">
        <div className="flex flex-wrap items-center space-x-2">
          <a
            href={event.url}
            target="_blank"
            rel="noreferrer"
            className="link-hover max-w-full"
          >
            <div className="badge badge-info">{event.venue}</div>
          </a>
          <div className="badge badge-secondary">{event.description}</div>
          <a
            href={event.url}
            target="_blank"
            rel="noreferrer"
            className="link-hover max-w-full"
          >
            <h3 className="font-semibold truncate">{event.name}</h3>
          </a>
          <span>{event.date === "" && event.recurs_on + ", "}</span>
          <span>
            {event.start_time !== "" && <span>{event.start_time} </span>}
            {event.end_time !== "" && <span>– {event.end_time}</span>}
          </span>
        </div>
      </div>
    </li>
  );
}
