import { useState, useMemo, useCallback } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import Toolbar from "./CustomComponents/Toolbar";
import WeekHeader from "./CustomComponents/WeekHeader";
import EventCard from "./CustomComponents/Event";
import events from "./events";
import EventDialog from "./CustomComponents/EventDialog";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.scss";

dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  weekStart: 6,
});

const localizer = dayjsLocalizer(dayjs);

const BigCalendar = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);

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
        onSelectSlot={(slotInfo) => {
          // Handle timeslot single click
        }}
        components={components}
      />

      {selectedEvent && (
        <EventDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={(event) => console.log("Edit", event)}
          onDelete={(event) => console.log("Delete", event)}
        />
      )}
    </Box>
  );
};

export default BigCalendar;
