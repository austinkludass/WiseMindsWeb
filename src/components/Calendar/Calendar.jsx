import { Calendar, dayjsLocalizer } from "react-big-calendar";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import Toolbar from "./CustomComponents/Toolbar";
import WeekHeader from "./CustomComponents/WeekHeader";
import EventCard from "./CustomComponents/Event";
import events from "./events";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.scss";

dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  weekStart: 6,
});

const localizer = dayjsLocalizer(dayjs);

const BigCalendar = () => {
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
        onDoubleClickEvent={(event) => {
          // Handle event double click
        }}
        selectable
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
    </Box>
  );
};

export default BigCalendar;
