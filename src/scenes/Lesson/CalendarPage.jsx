import { Box, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Header from "../../components/Global/Header";

const CalendarPage = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box display="flex" m="20px">
        <Header title="Calendar" subtitle="Lessons Calendar" />
      </Box>

      
    </LocalizationProvider>
  );
};

export default CalendarPage;
