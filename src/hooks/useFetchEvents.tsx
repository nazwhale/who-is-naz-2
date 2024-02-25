import { useState, useEffect } from "react";
import { parseISO, compareAsc, isToday, isPast, format } from "date-fns";

export type Event = {
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

type EventsByDate = Record<string, Event[]>;

export const useFetchEvents = () => {
  const [eventsByDate, setEventsByDate] = useState<EventsByDate>({});

  useEffect(() => {
    fetch("/events.json")
      .then((response) => response.json())
      .then((data: Event[]) => {
        const eventsSortedAndGroupedByDate: Record<string, Event[]> = data
          // First, sort the events by date
          .sort((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return -1;
            if (!b.date) return 1;
            return compareAsc(parseISO(a.date), parseISO(b.date));
          })
          // Then, group them by date
          .reduce<EventsByDate>((acc, event) => {
            // Use the event's date as the key
            const eventDate = event.date
              ? format(parseISO(event.date), "yyyy-MM-dd")
              : "no-date";

            // Ignore if in past
            if (
              isPast(parseISO(event.date)) &&
              !isToday(parseISO(event.date))
            ) {
              return acc;
            }

            // If the key doesn't exist yet, initialize it with an empty array
            if (!acc[eventDate]) {
              acc[eventDate] = [];
            }

            // Push the current event into the corresponding array
            acc[eventDate].push(event);
            return acc;
          }, {}); // Initialize the accumulator as an empty object of type EventsByDate

        setEventsByDate(eventsSortedAndGroupedByDate);
      })
      .catch((error) => console.error("Failed to load events:", error));
  }, []);

  return { eventsByDate };
};
