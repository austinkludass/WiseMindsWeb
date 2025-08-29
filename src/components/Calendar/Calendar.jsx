import { useState } from "react";
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
  const handleClose = () => setSelectedEvent(null);

  return (
    <Box>
      <Calendar
        localizer={localizer}
        events={events}
        defaultDate={new Date()}
        views={["month", "week", "day"]}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        style={{ height: "200vh" }}
        showAllEvents
        min={new Date(2025, 0, 1, 6, 0)}
        max={new Date(2025, 0, 1, 22, 0)}
        onSelectEvent={(event) => setSelectedEvent(event)}
        selectable={true}
        onSelectSlot={(slotInfo) => {
          // Handle timeslot single click
        }}
        components={{
          toolbar: Toolbar,
          event: EventCard,
          week: {
            header: WeekHeader,
          },
        }}
      />

      <EventDialog
        event={selectedEvent}
        onClose={handleClose}
        onEdit={(event) => console.log("Edit", event)}
        onDelete={(event) => console.log("Delete", event)}
      />
    </Box>
  );
};

export default BigCalendar;
