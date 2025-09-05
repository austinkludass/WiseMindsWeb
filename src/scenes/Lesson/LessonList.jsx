import {
  Box,
  Typography,
  Paper,
  AccordionSummary,
  AccordionDetails,
  Accordion,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Header from "../../components/Global/Header";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ToastContainer } from "react-toastify";
import LessonForm from "../../components/Lesson/LessonForm";

const initialState = {
  date: dayjs(),
  tutor: null,
  selectedStudents: [],
  subjectGroup: null,
  location: null,
  type: "Normal",
  repeat: false,
  frequency: "weekly",
  notes: "",
  startTime: dayjs().hour(12).minute(0),
  endTime: dayjs().hour(13).minute(0),
};

const LessonList = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box display="flex" m="20px">
        <Header title="LESSONS" subtitle="Manage all lessons" />
      </Box>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h4">Create Lesson</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <LessonForm initialValues={initialState} />
          </AccordionDetails>
        </Accordion>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Typography variant="h5" gutterBottom>
          Lessons
        </Typography>
      </Paper>
      <ToastContainer position="top-right" autoClose={3000} />
    </LocalizationProvider>
  );
};

export default LessonList;
