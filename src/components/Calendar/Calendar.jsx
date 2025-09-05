import { useState, useMemo, useCallback, useEffect } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import { Box } from "@mui/material";
import { getLessonsForWeek } from "../../data/firebaseHelpers";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import Toolbar from "./CustomComponents/Toolbar";
import WeekHeader from "./CustomComponents/WeekHeader";
import EventCard from "./CustomComponents/Event";
import EventDialog from "./CustomComponents/EventDialog";
import NewEventDialog from "./CustomComponents/NewEventDialog";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.scss";

dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  weekStart: 6,
});

const localizer = dayjsLocalizer(dayjs);

const BigCalendar = () => {
  const [events, setEvents] = useState([]);
  const [cache, setCache] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newLessonSlot, setNewLessonSlot] = useState(null);

  const components = useMemo(
    () => ({
      toolbar: Toolbar,
      event: EventCard,
      week: {
        header: WeekHeader,
      },
    }),
    []
  );

  const handleSelectEvent = useCallback((event) => setSelectedEvent(event), []);

  const fetchWeek = useCallback(
    async (weekStart, weekEnd, setActive = false) => {
      const cacheKey = weekStart.format("YYYY-MM-DD");

      if (cache[cacheKey]) {
        if (setActive) setEvents(cache[cacheKey]);
        return;
      }

      const lessons = await getLessonsForWeek(weekStart, weekEnd);

      setCache((prev) => {
        const updated = { ...prev, [cacheKey]: lessons };
        if (setActive) setEvents(lessons);
        return updated;
      });
    },
    [cache]
  );

  const handleRangeChange = async (range) => {
    const startDate = dayjs(range[0]).startOf("week");
    const endDate = dayjs(range[range.length - 1]).endOf("week");

    await fetchWeek(startDate, endDate, true);

    const prevStart = startDate.subtract(1, "week");
    const prevEnd = endDate.subtract(1, "week");
    fetchWeek(prevStart, prevEnd);

    const nextStart = startDate.add(1, "week");
    const nextEnd = endDate.add(1, "week");
    fetchWeek(nextStart, nextEnd);
  };

  const invalidateWeek = (date) => {
    const key = dayjs(date).startOf("week").format("YYYY-MM-DD");
    setCache((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  useEffect(() => {
    const startOfWeek = dayjs().startOf("week").toDate();
    const endOfWeek = dayjs().endOf("week").toDate();
    handleRangeChange([startOfWeek, endOfWeek]);
  }, []);

  return (
    <Box>
      <Calendar
        localizer={localizer}
        events={events}
        defaultDate={new Date()}
        views={["week", "day"]}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        style={{ height: "200vh" }}
        min={new Date(2025, 0, 1, 6, 0)}
        max={new Date(2025, 0, 1, 22, 0)}
        selectable
        onSelectEvent={handleSelectEvent}
        onRangeChange={handleRangeChange}
        onSelectSlot={(slotInfo) => {
          setNewLessonSlot(slotInfo);
        }}
        components={components}
      />

      {selectedEvent && (
        <EventDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={(event) => {
            console.log("Edit", event);
            invalidateWeek(event.start);
          }}
          onDelete={(event) => {
            console.log("Delete", event);
            invalidateWeek(event.start);
          }}
        />
      )}

      {newLessonSlot && (
        <NewEventDialog
          slot={newLessonSlot}
          onClose={() => setNewLessonSlot(null)}
          invalidateWeek={invalidateWeek}
        />
      )}
    </Box>
  );
};

export default BigCalendar;
